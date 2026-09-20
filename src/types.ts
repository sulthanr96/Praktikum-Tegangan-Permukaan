export type SubstanceKey = 'mgcl2' | 'detergen' | 'sds';

export type AnalysisMode = 'alurA' | 'alurB' | 'alurC';

export interface GlobalCalibration {
  vPikno: number;     // mL
  mKosong: number;    // g
  mAir: number;       // g
  hAir: number;       // cm
  tKelvin: number;    // K
  gammaAir: number;   // mN/m (Tegangan permukaan air baku referensi yang dapat diatur pengguna, default ~71.97 mN/m pada 298.15 K)
}

export interface SubstanceInfo {
  id: SubstanceKey;
  name: string;
  badgeLabel: string;
  badgeClass: string;
  icon: string;
  type: 'electrolyte' | 'commercial_surfactant' | 'anionic_surfactant';
  molarMass: number;
  concentrations: number[];
  mPikno: number[];
  hCapillary: number[];
  description: string;
}

export interface CalculatedDataRow {
  concentration: number;     // M (mol/L)
  concentrationMolM3: number;// mol/m³
  mPikno: number;            // g
  hCapillary: number;        // cm
  rho: number;               // g/cm³
  gamma: number;             // mN/m
  dGammaDC: number;          // mN·L / (m·mol)
  surfaceExcessMicro: number;// × 10⁻⁶ mol/m² (μmol/m²)
  status: 'valid' | 'warning' | 'anomaly';
}

export interface DilutionRow {
  concentration: number;
  directMass: number;
  aliquotMl: number;
  status: string;
}

export interface RegressionStats {
  slope: number;
  intercept: number;
  r2: number;
}
