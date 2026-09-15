import { GlobalCalibration, SubstanceInfo, CalculatedDataRow, RegressionStats, DilutionRow } from '../types';

/**
 * Standard pure water surface tension interpolation (IAPWS formulation approximation)
 * gamma_air in mN/m (or dyn/cm)
 */
export function getStandardWaterGamma(tKelvin: number): number {
  const tCelsius = tKelvin - 273.15;
  // Standard polynomial: 75.83 - 0.1477*T + 0.000214*T^2 mN/m
  const val = 75.83 - 0.1477 * tCelsius + 0.000214 * Math.pow(tCelsius, 2);
  return Math.max(50, Math.min(80, val));
}

/**
 * Calculate density of pure water from calibration parameters
 */
export function calculateRhoAir(cal: GlobalCalibration): number {
  const massWater = cal.mAir - cal.mKosong;
  if (cal.vPikno <= 0) return 0.997;
  return massWater / cal.vPikno;
}

/**
 * Calculate solution dilution preparation rows
 */
export function calculateDilution(
  molarMass: number,
  flaskVolMl: number,
  stockMolarity: number = 0.10,
  concentrations: number[] = [0.02, 0.04, 0.06, 0.08, 0.10]
): DilutionRow[] {
  const flaskVolL = flaskVolMl / 1000;
  return concentrations.map((conc) => {
    const directMass = conc * flaskVolL * molarMass;
    const aliquotMl = (conc * flaskVolMl) / stockMolarity;
    return {
      concentration: conc,
      directMass,
      aliquotMl,
      status: 'Larut Sempurna',
    };
  });
}

/**
 * Compute full analysis rows for a substance given calibration and mode
 */
export function computeAnalysis(
  sub: SubstanceInfo,
  cal: GlobalCalibration,
  mode: 'alurA' | 'alurB'
): {
  rows: CalculatedDataRow[];
  regression: RegressionStats;
  maxExcess: number;
} {
  const rhoAir = calculateRhoAir(cal);
  const gammaAir = (cal.gammaAir !== undefined && cal.gammaAir > 0)
    ? cal.gammaAir
    : getStandardWaterGamma(cal.tKelvin);
  const R = 8.314; // J/(mol*K)
  const T = cal.tKelvin;
  const n = sub.concentrations.length;

  // 1. Density and Gamma for each concentration
  const rhos: number[] = [];
  const gammas: number[] = [];

  for (let i = 0; i < n; i++) {
    const mPik = sub.mPikno[i] ?? cal.mKosong + 5.0;
    const h = sub.hCapillary[i] ?? 2.5;
    const rho = cal.vPikno > 0 ? (mPik - cal.mKosong) / cal.vPikno : 1.0;
    rhos.push(rho);

    const denom = rhoAir * cal.hAir;
    const gamma = denom > 0 ? (rho * h / denom) * gammaAir : gammaAir;
    gammas.push(gamma);
  }

  // 2. Dual-path dGamma/dC
  const dGammaDC: number[] = [];
  let regression: RegressionStats = { slope: 0, intercept: 0, r2: 0 };

  // Calculate linear regression stats regardless for reporting
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    const x = sub.concentrations[i];
    const y = gammas[i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }
  const denomSlope = n * sumX2 - sumX * sumX;
  const slope = denomSlope !== 0 ? (n * sumXY - sumX * sumY) / denomSlope : 0;
  const intercept = (sumY - slope * sumX) / n;

  const numR = n * sumXY - sumX * sumY;
  const denR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  const r2 = denR > 0 ? Math.pow(numR / denR, 2) : 0.999;
  regression = { slope, intercept, r2: Math.min(1.0, Math.max(0, r2)) };

  if (mode === 'alurA') {
    for (let i = 0; i < n; i++) {
      dGammaDC.push(slope);
    }
  } else {
    // Alur B: Central & endpoint finite difference
    for (let i = 0; i < n; i++) {
      if (i === 0) {
        const diff = (gammas[1] - gammas[0]) / (sub.concentrations[1] - sub.concentrations[0]);
        dGammaDC.push(diff);
      } else if (i === n - 1) {
        const diff = (gammas[n - 1] - gammas[n - 2]) / (sub.concentrations[n - 1] - sub.concentrations[n - 2]);
        dGammaDC.push(diff);
      } else {
        const diff = (gammas[i + 1] - gammas[i - 1]) / (sub.concentrations[i + 1] - sub.concentrations[i - 1]);
        dGammaDC.push(diff);
      }
    }
  }

  // 3. Gibbs Surface Excess Gamma
  // Formula: Gamma = - (C / RT) * (dgamma/dC)
  // C in mol/m^3 -> conc * 1000
  // dgamma/dC in (mN/m)/(mol/L) -> in SI units, (mN/m * 1e-3) / (mol/L * 1000 mol/m³) = dgamma/dC * 1e-6
  // Surface Excess in mol/m² = - (conc * 1000 / (R * T)) * (dG * 1e-6)
  // In μmol/m² (× 10⁻⁶ mol/m²), multiply by 1e6:
  // surfaceExcessMicro = - (conc * 1000 / (R * T)) * dG
  const rows: CalculatedDataRow[] = [];
  let maxExcess = -Infinity;

  for (let i = 0; i < n; i++) {
    const conc = sub.concentrations[i];
    const concMolM3 = conc * 1000;
    const dG = dGammaDC[i];
    const surfaceExcessMicro = - (concMolM3 / (R * T)) * dG;

    if (surfaceExcessMicro > maxExcess) {
      maxExcess = surfaceExcessMicro;
    }

    rows.push({
      concentration: conc,
      concentrationMolM3: concMolM3,
      mPikno: sub.mPikno[i],
      hCapillary: sub.hCapillary[i],
      rho: rhos[i],
      gamma: gammas[i],
      dGammaDC: dG,
      surfaceExcessMicro,
      status: 'valid',
    });
  }

  return { rows, regression, maxExcess };
}

/**
 * Generate CSV dataset string
 */
export function generateCSV(
  sub: SubstanceInfo,
  cal: GlobalCalibration,
  rows: CalculatedDataRow[]
): string {
  const gammaAir = (cal.gammaAir !== undefined && cal.gammaAir > 0)
    ? cal.gammaAir
    : getStandardWaterGamma(cal.tKelvin);
  let csv = 'Praktikum Tegangan Permukaan Cairan & Adsorpsi Gibbs\n';
  csv += `Zat Uji,${sub.name}\n`;
  csv += `Suhu (K),${cal.tKelvin},V Piknometer (mL),${cal.vPikno}\n`;
  csv += `Massa Pikno Kosong (g),${cal.mKosong},h Air (cm),${cal.hAir},Gamma Air Baku (mN/m),${gammaAir.toFixed(2)}\n\n`;
  csv += 'C (M),C (mol/m3),Massa Pikno + Larutan (g),h Kapiler (cm),Densitas (g/cm3),Tegangan Permukaan gamma (mN/m),dgamma/dC,Surface Excess Gamma (umol/m2)\n';

  rows.forEach((r) => {
    csv += `${r.concentration.toFixed(2)},${r.concentrationMolM3.toFixed(0)},${r.mPikno.toFixed(4)},${r.hCapillary.toFixed(2)},${r.rho.toFixed(4)},${r.gamma.toFixed(2)},${r.dGammaDC.toFixed(2)},${r.surfaceExcessMicro.toFixed(3)}\n`;
  });

  return csv;
}

/**
 * Generate Markdown tabular representation
 */
export function generateMarkdown(
  sub: SubstanceInfo,
  rows: CalculatedDataRow[]
): string {
  let md = `### Data Pengamatan & Olah Tegangan Permukaan - ${sub.name}\n\n`;
  md += `| Konsentrasi (M) | Massa Pikno + Larutan (g) | $h$ (cm) | $\\rho$ (g/cm³) | $\\gamma$ (mN/m) | $d\\gamma/dC$ | $\\Gamma$ ($\\mu$mol/m²) |\n`;
  md += `| :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n`;

  rows.forEach((r) => {
    md += `| ${r.concentration.toFixed(2)} | ${r.mPikno.toFixed(4)} | ${r.hCapillary.toFixed(2)} | ${r.rho.toFixed(4)} | ${r.gamma.toFixed(2)} | ${r.dGammaDC >= 0 ? '+' : ''}${r.dGammaDC.toFixed(2)} | ${r.surfaceExcessMicro >= 0 ? '+' : ''}${r.surfaceExcessMicro.toFixed(3)} |\n`;
  });

  return md;
}

export const INITIAL_CALIBRATION: GlobalCalibration = {
  vPikno: 5.000,
  mKosong: 0,
  mAir: 0,
  hAir: 0,
  tKelvin: 298.15,
  gammaAir: 71.97,
};

export const INITIAL_SUBSTANCES: Record<string, SubstanceInfo> = {
  mgcl2: {
    id: 'mgcl2',
    name: 'Magnesium Klorida (MgCl₂)',
    badgeLabel: '1. Magnesium Klorida (MgCl₂)',
    badgeClass: 'text-electrolyte-amber',
    icon: 'bolt',
    type: 'electrolyte',
    molarMass: 95.21,
    concentrations: [0.02, 0.04, 0.06, 0.08, 0.10],
    mPikno: [0, 0, 0, 0, 0],
    hCapillary: [0, 0, 0, 0, 0],
    description: 'Elektrolit anorganik pekat. Menunjukkan fenomena adsorpsi negatif terhadap antarmuka udara-air.',
  },
  detergen: {
    id: 'detergen',
    name: 'Deterjen Komersial',
    badgeLabel: '2. Deterjen Komersial',
    badgeClass: 'text-fluid-teal',
    icon: 'bubble_chart',
    type: 'commercial_surfactant',
    molarMass: 288.38,
    concentrations: [0.02, 0.04, 0.06, 0.08, 0.10],
    mPikno: [0, 0, 0, 0, 0],
    hCapillary: [0, 0, 0, 0, 0],
    description: 'Campuran surfaktan kompleks. Umumnya membentuk misel dan mendominasi antarmuka secara ekstensif.',
  },
  sds: {
    id: 'sds',
    name: 'Sodium Dodecyl Sulfate (SDS)',
    badgeLabel: '3. SDS (Sodium Dodecyl Sulfate)',
    badgeClass: 'text-surfactant-purple',
    icon: 'science',
    type: 'anionic_surfactant',
    molarMass: 288.38,
    concentrations: [0.02, 0.04, 0.06, 0.08, 0.10],
    mPikno: [0, 0, 0, 0, 0],
    hCapillary: [0, 0, 0, 0, 0],
    description: 'Surfaktan anionik murni standar. Memiliki kurva tegangan permukaan yang tajam pada konsentrasi rendah.',
  },
};
