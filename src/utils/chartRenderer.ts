import { SubstanceInfo, CalculatedDataRow, RegressionStats } from '../types';

export function generateChart1Svg(
  substance: SubstanceInfo,
  concs: number[],
  gammas: number[],
  regression: RegressionStats
): string {
  const mapX = (c: number) => 60 + ((c - 0.02) / 0.08) * 360;
  
  const minG = Math.min(...gammas, 20);
  const maxG = Math.max(...gammas, 80);
  const rangeG = maxG - minG || 1;
  const paddedMinG = minG - rangeG * 0.1;
  const paddedMaxG = maxG + rangeG * 0.2;
  const mapY1 = (g: number) => {
    const pRange = paddedMaxG - paddedMinG;
    return 270 - ((g - paddedMinG) / pRange) * 160;
  };

  const chart1Path = concs
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${mapX(c)} ${mapY1(gammas[i])}`)
    .join(' ');

  const points = concs.map((c, i) => {
    const cx = mapX(c);
    const cy = mapY1(gammas[i]);
    return `
      <g>
        <circle cx="${cx}" cy="${cy}" fill="#00687a" r="5" stroke="#ffffff" stroke-width="1.5" />
        <text fill="#003159" font-family="JetBrains Mono" font-size="10" font-weight="bold" text-anchor="middle" x="${cx}" y="${cy - 10}">
          ${gammas[i].toFixed(1)}
        </text>
      </g>
    `;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 330" style="background-color: white;">
      <rect x="0" y="0" width="450" height="330" fill="none" stroke="#0f172a" stroke-width="3" />
      <text x="240" y="25" text-anchor="middle" fill="#003159" font-family="Space Grotesk, sans-serif" font-size="14" font-weight="bold">
        Profil Tegangan Permukaan (γ) vs Konsentrasi
      </text>
      <text x="240" y="42" text-anchor="middle" fill="#64748b" font-family="Inter, sans-serif" font-size="11">
        ${substance.name}
      </text>

      <rect x="120" y="55" width="240" height="36" fill="#f8fafc" stroke="#cbd5e1" rx="4" />
      <text x="240" y="70" text-anchor="middle" fill="#334155" font-family="JetBrains Mono" font-size="10" font-weight="bold">
        Linear Fit
      </text>
      <text x="240" y="84" text-anchor="middle" fill="#475569" font-family="JetBrains Mono" font-size="10">
        γ = ${regression.slope >= 0 ? '+' : ''}${regression.slope.toFixed(2)}x + ${regression.intercept.toFixed(2)} (R² = ${regression.r2.toFixed(3)})
      </text>

      <g stroke="#cbd5e1" stroke-dasharray="3 3" stroke-width="0.8">
        <line x1="60" x2="60" y1="110" y2="270" />
        <line x1="150" x2="150" y1="110" y2="270" />
        <line x1="240" x2="240" y1="110" y2="270" />
        <line x1="330" x2="330" y1="110" y2="270" />
        <line x1="420" x2="420" y1="110" y2="270" />
        <line x1="50" x2="430" y1="110" y2="110" />
        <line x1="50" x2="430" y1="150" y2="150" />
        <line x1="50" x2="430" y1="190" y2="190" />
        <line x1="50" x2="430" y1="230" y2="230" />
        <line x1="50" x2="430" y1="270" y2="270" />
      </g>

      <g fill="#42474f" font-family="JetBrains Mono" font-size="10" text-anchor="middle">
        <text x="60" y="288">0.02</text>
        <text x="150" y="288">0.04</text>
        <text x="240" y="288">0.06</text>
        <text x="330" y="288">0.08</text>
        <text x="420" y="288">0.10</text>
      </g>

      <text fill="#0f172a" font-family="JetBrains Mono" font-size="12" font-weight="bold" text-anchor="middle" x="240" y="315">
        Konsentrasi C (Molar)
      </text>
      <text fill="#0f172a" font-family="JetBrains Mono" font-size="12" font-weight="bold" text-anchor="middle" transform="rotate(-90 15 190)" x="15" y="190">
        γ (mN/m)
      </text>

      <line stroke="#727780" stroke-dasharray="4 2" stroke-width="1" x1="50" x2="430" y1="${mapY1(71.97)}" y2="${mapY1(71.97)}" />
      <text fill="#727780" font-family="JetBrains Mono" font-size="9" x="375" y="${mapY1(71.97) - 4}">
        γ_air baku
      </text>

      <path d="${chart1Path}" fill="none" stroke="#00687a" stroke-width="2.5" />
      ${points}
    </svg>
  `;
}

export function generateChart2Svg(
  substance: SubstanceInfo,
  concs: number[],
  excesses: number[],
  keyExcess: number
): string {
  const mapX = (c: number) => 60 + ((c - 0.02) / 0.08) * 360;
  
  const minE = Math.min(...excesses, -1.0);
  const maxE = Math.max(...excesses, 2.0);
  const rangeE = maxE - minE || 1;
  const paddedMinE = minE - rangeE * 0.1;
  const paddedMaxE = maxE + rangeE * 0.2;
  const mapY2 = (e: number) => {
    const pRange = paddedMaxE - paddedMinE;
    return 270 - ((e - paddedMinE) / pRange) * 160;
  };

  const zeroLineY = mapY2(0);

  const chart2Path = concs
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${mapX(c)} ${mapY2(excesses[i])}`)
    .join(' ');

  const points = concs.map((c, i) => {
    const cx = mapX(c);
    const cy = mapY2(excesses[i]);
    const isPositive = excesses[i] >= 0;
    const color = isPositive ? '#7C3AED' : '#D97706';
    return `
      <g>
        <circle cx="${cx}" cy="${cy}" fill="${color}" r="5" stroke="#ffffff" stroke-width="1.5" />
        <text fill="${color}" font-family="JetBrains Mono" font-size="10" font-weight="bold" text-anchor="middle" x="${cx}" y="${cy - 10}">
          ${excesses[i].toFixed(2)}
        </text>
      </g>
    `;
  }).join('');

  const pathColor = substance.type === 'electrolyte' ? '#D97706' : '#7C3AED';
  const labelExtreme = substance.type === 'electrolyte' ? 'Min Surface Excess (Γ_min):' : 'Max Surface Excess (Γ_maks):';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 450 330" style="background-color: white;">
      <rect x="0" y="0" width="450" height="330" fill="none" stroke="#0f172a" stroke-width="3" />
      <text x="240" y="25" text-anchor="middle" fill="#003159" font-family="Space Grotesk, sans-serif" font-size="14" font-weight="bold">
        Isoterm Adsorpsi Gibbs (Surface Excess)
      </text>
      <text x="240" y="42" text-anchor="middle" fill="#64748b" font-family="Inter, sans-serif" font-size="11">
        ${substance.name}
      </text>

      <rect x="150" y="55" width="180" height="36" fill="#f8fafc" stroke="#cbd5e1" rx="4" />
      <text x="240" y="70" text-anchor="middle" fill="#334155" font-family="JetBrains Mono" font-size="10" font-weight="bold">
        ${labelExtreme}
      </text>
      <text x="240" y="84" text-anchor="middle" fill="#475569" font-family="JetBrains Mono" font-size="10">
        ${keyExcess.toFixed(3)} μmol/m²
      </text>

      <g stroke="#cbd5e1" stroke-dasharray="3 3" stroke-width="0.8">
        <line x1="60" x2="60" y1="110" y2="270" />
        <line x1="150" x2="150" y1="110" y2="270" />
        <line x1="240" x2="240" y1="110" y2="270" />
        <line x1="330" x2="330" y1="110" y2="270" />
        <line x1="420" x2="420" y1="110" y2="270" />
        <line x1="50" x2="430" y1="110" y2="110" />
        <line x1="50" x2="430" y1="150" y2="150" />
        <line x1="50" x2="430" y1="190" y2="190" />
        <line x1="50" x2="430" y1="230" y2="230" />
        <line x1="50" x2="430" y1="270" y2="270" />
      </g>

      <g fill="#42474f" font-family="JetBrains Mono" font-size="10" text-anchor="middle">
        <text x="60" y="288">0.02</text>
        <text x="150" y="288">0.04</text>
        <text x="240" y="288">0.06</text>
        <text x="330" y="288">0.08</text>
        <text x="420" y="288">0.10</text>
      </g>

      <line stroke="#E11D48" stroke-dasharray="4 2" stroke-width="1.5" x1="50" x2="430" y1="${zeroLineY}" y2="${zeroLineY}" />
      <text fill="#E11D48" font-family="JetBrains Mono" font-size="10" font-weight="bold" x="396" y="${zeroLineY - 6}">
        Γ = 0
      </text>

      <text fill="#0f172a" font-family="JetBrains Mono" font-size="12" font-weight="bold" text-anchor="middle" x="240" y="315">
        Konsentrasi C (Molar)
      </text>
      <text fill="#0f172a" font-family="JetBrains Mono" font-size="12" font-weight="bold" text-anchor="middle" transform="rotate(-90 15 190)" x="15" y="190">
        Γ (μmol/m²)
      </text>

      <path d="${chart2Path}" fill="none" stroke="${pathColor}" stroke-width="2.5" />
      ${points}
    </svg>
  `;
}

export function svgToPngBase64(svgString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject('No canvas context');

    const scale = 3;
    const width = 450;
    const height = 330;
    canvas.width = width * scale;
    canvas.height = height * scale;

    const img = new Image();
    const b64 = btoa(unescape(encodeURIComponent(svgString)));
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, width * scale, height * scale);
      // Get base64 (without the data:image/png;base64, prefix for exceljs, but we'll include it and let caller split)
      resolve(canvas.toDataURL('image/png', 1.0));
    };
    img.onerror = reject;
    img.src = 'data:image/svg+xml;base64,' + b64;
  });
}
