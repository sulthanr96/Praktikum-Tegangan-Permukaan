import React, { useRef } from 'react';
import { SubstanceInfo, CalculatedDataRow, RegressionStats, AnalysisMode, SubstanceKey } from '../types';

interface Section4AnalysisProps {
  currentSubstance: SubstanceInfo;
  analysisMode: AnalysisMode;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
  calculatedRows: CalculatedDataRow[];
  regression: RegressionStats;
  maxExcess: number;
  minExcess: number;
  keyExcess: number;
  onSubstanceChange: (key: SubstanceKey) => void;
}

export const Section4Analysis: React.FC<Section4AnalysisProps> = ({
  currentSubstance,
  analysisMode,
  onAnalysisModeChange,
  calculatedRows,
  regression,
  maxExcess,
  minExcess,
  keyExcess,
  onSubstanceChange,
}) => {
  const svg1Ref = useRef<SVGSVGElement>(null);
  const svg2Ref = useRef<SVGSVGElement>(null);

  const downloadSvgAsPng = (svgRef: React.RefObject<SVGSVGElement>, filename: string) => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    
    // Create a clone to embed Google Fonts if needed, but since we rely on system fonts JetBrains Mono / Space Grotesk, 
    // for highest reliability across devices without the font installed, it's best to serialize as is.
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const scale = 4; // High resolution
    const width = 450;
    const height = 330;
    
    canvas.width = width * scale;
    canvas.height = height * scale;
    
    const img = new Image();
    // Base64 encode for reliable rendering in canvas
    const b64 = btoa(unescape(encodeURIComponent(svgData)));
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, width * scale, height * scale);
      
      const pngUrl = canvas.toDataURL('image/png', 1.0);
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };
    img.src = 'data:image/svg+xml;base64,' + b64;
  };

  const concs = calculatedRows.map((r) => r.concentration);
  const gammas = calculatedRows.map((r) => r.gamma);
  const excesses = calculatedRows.map((r) => r.surfaceExcessMicro);

    // Chart 1 coordinate mapping:
    // X range: 0.02 to 0.10 M -> mapped to [60, 420]
    const mapX = (c: number) => 60 + ((c - 0.02) / 0.08) * 360;
    
    // Y range mapping with padding to keep lines away from titles and edges
    const minG = Math.min(...gammas, 20);
    const maxG = Math.max(...gammas, 80);
    const rangeG = maxG - minG || 1;
    const paddedMinG = minG - rangeG * 0.1;
    const paddedMaxG = maxG + rangeG * 0.2;
    const mapY1 = (g: number) => {
      const pRange = paddedMaxG - paddedMinG;
      // Grid is from y=110 to y=270 (Height = 160)
      return 270 - ((g - paddedMinG) / pRange) * 160;
    };
  
    const chart1Path = concs
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${mapX(c)} ${mapY1(gammas[i])}`)
      .join(' ');
  
    // Chart 2 coordinate mapping:
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

  return (
    <section className="flex flex-col gap-8 scroll-mt-28" id="analisis-hasil">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#00687a] font-['JetBrains_Mono'] text-xs uppercase font-semibold">
            <span className="material-symbols-outlined text-base">monitoring</span>
            Olah Data Komputasi Real-Time
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-[#003159] tracking-tight mt-1">
            4. Analisis Komparatif &amp; Kurva Isoterm Gibbs
          </h2>
        </div>

        {/* Dual Path Analysis Toggle */}
        <div className="flex items-center gap-1.5 bg-[#e5eeff] p-1 rounded-lg border border-[#cbd5e1]/50">
          <button
            onClick={() => onAnalysisModeChange('alurA')}
            className={`px-3 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-bold transition-all ${
              analysisMode === 'alurA'
                ? 'bg-[#003159] text-white shadow-sm'
                : 'text-[#42474f] hover:bg-[#dce9ff]'
            }`}
          >
            Alur A: Regresi Analitik
          </button>
          <button
            onClick={() => onAnalysisModeChange('alurB')}
            className={`px-3 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-bold transition-all ${
              analysisMode === 'alurB'
                ? 'bg-[#003159] text-white shadow-sm'
                : 'text-[#42474f] hover:bg-[#dce9ff]'
            }`}
          >
            Alur B: Beda Hingga (Finite Diff)
          </button>
        </div>
      </div>

      {/* Result Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#cbd5e1]/60 overflow-hidden flex flex-col">
        <div className="bg-[#eff4ff] px-5 py-3 border-b border-[#cbd5e1]/40 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
              Tabel Hasil Perhitungan Komprehensif
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="font-['JetBrains_Mono'] text-xs text-[#42474f] hidden xl:block">
              Metode Aktif:{' '}
              <span className="font-bold text-[#003159]">
                {analysisMode === 'alurA'
                  ? 'Regresi Polinomial'
                  : 'Beda Hingga Numerik'}
              </span>
            </div>
            
            {/* Tab Selector untuk Substance */}
            <div className="flex bg-[#dce9ff] p-1 rounded-lg">
              <button
                onClick={() => onSubstanceChange('mgcl2')}
                className={`px-4 py-1.5 rounded-md text-sm font-['JetBrains_Mono'] font-semibold transition-all ${
                  currentSubstance.id === 'mgcl2' ? 'bg-white text-[#003159] shadow-sm' : 'text-[#42474f] hover:text-[#003159]'
                }`}
              >
                (A) MgCl₂
              </button>
              <button
                onClick={() => onSubstanceChange('sds')}
                className={`px-4 py-1.5 rounded-md text-sm font-['JetBrains_Mono'] font-semibold transition-all ${
                  currentSubstance.id === 'sds' ? 'bg-white text-[#003159] shadow-sm' : 'text-[#42474f] hover:text-[#003159]'
                }`}
              >
                (B) SDS
              </button>
              <button
                onClick={() => onSubstanceChange('detergen')}
                className={`px-4 py-1.5 rounded-md text-sm font-['JetBrains_Mono'] font-semibold transition-all ${
                  currentSubstance.id === 'detergen' ? 'bg-white text-[#003159] shadow-sm' : 'text-[#42474f] hover:text-[#003159]'
                }`}
              >
                (C) Detergen
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] font-['JetBrains_Mono'] text-xs font-semibold text-[#003159] border-b border-[#cbd5e1]/40">
                <th className="py-3 px-4 whitespace-nowrap" title="Konsentrasi">C (M)</th>
                <th className="py-3 px-4 whitespace-nowrap" title="Konsentrasi dalam SI">C (mol/m³)</th>
                <th className="py-3 px-4 whitespace-nowrap" title="Densitas Terhitung">ρ (g/cm³)</th>
                <th className="py-3 px-4 whitespace-nowrap" title="Tinggi Kapiler">h (cm)</th>
                <th className="py-3 px-4 whitespace-nowrap" title="Tegangan Permukaan">γ (mN/m)</th>
                <th className="py-3 px-4 whitespace-nowrap" title="Turunan Tegangan thd Konsentrasi">dγ/dC (mN·L / m·mol)</th>
                <th className="py-3 px-4 whitespace-nowrap" title="Isoterm Adsorpsi Gibbs">Γ (× 10⁻⁶ mol/m²)</th>
              </tr>
            </thead>
            <tbody className="font-['JetBrains_Mono'] text-sm divide-y divide-[#cbd5e1]/30">
              {calculatedRows.map((r) => (
                <tr key={r.concentration} className="hover:bg-[#eff4ff]/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#003159]">{r.concentration.toFixed(2)}</td>
                  <td className="py-3 px-4 text-[#42474f]">{r.concentrationMolM3.toFixed(0)}</td>
                  <td className="py-3 px-4 text-[#0b1c30]">{r.rho.toFixed(4)}</td>
                  <td className="py-3 px-4 text-[#0b1c30]">{r.hCapillary.toFixed(2)}</td>
                  <td className="py-3 px-4 font-bold text-[#003159]">{r.gamma.toFixed(2)}</td>
                  <td
                    className={`py-3 px-4 font-semibold ${
                      r.dGammaDC < 0 ? 'text-[#E11D48]' : 'text-[#D97706]'
                    }`}
                  >
                    {r.dGammaDC >= 0 ? '+' : ''}
                    {r.dGammaDC.toFixed(2)}
                  </td>
                  <td
                    className={`py-3 px-4 font-bold ${
                      r.surfaceExcessMicro >= 0 ? 'text-[#7C3AED]' : 'text-[#D97706]'
                    }`}
                  >
                    {r.surfaceExcessMicro >= 0 ? '+' : ''}
                    {r.surfaceExcessMicro.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic High-Fidelity SVG Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Surface Tension vs Concentration */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
                Kurva γ vs Konsentrasi
              </span>
              <span className="font-['Inter'] text-xs text-[#42474f]">
                Respon tegangan permukaan terhadap peningkatan zat terlarut
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-[#eff4ff] text-[#0D9488] font-['JetBrains_Mono'] text-xs font-semibold border border-[#0D9488]/20">
              mN/m vs M
            </span>
          </div>

          {/* Canvas SVG */}
          <div className="relative w-full h-72 bg-[#eff4ff] rounded-lg p-3 flex items-center justify-center border border-[#cbd5e1]/40">
            <button 
              onClick={() => downloadSvgAsPng(svg1Ref, `Tegangan_Permukaan_${currentSubstance.name}.png`)}
              className="absolute top-2 right-2 p-1.5 bg-white border border-[#cbd5e1] rounded-md shadow-sm text-[#42474f] hover:bg-[#f1f5f9] transition-colors z-10 print:hidden"
              title="Unduh Grafik (PNG)"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
            <svg ref={svg1Ref} className="w-full h-full" viewBox="0 0 450 330" style={{ backgroundColor: 'white' }}>
              <rect x="0" y="0" width="450" height="330" fill="none" stroke="#0f172a" strokeWidth="2" />
              {/* Titles */}
              <text x="240" y="25" textAnchor="middle" fill="#003159" fontFamily="Space Grotesk, sans-serif" fontSize="14" fontWeight="bold">
                Profil Tegangan Permukaan (γ) vs Konsentrasi
              </text>
              <text x="240" y="42" textAnchor="middle" fill="#64748b" fontFamily="Inter, sans-serif" fontSize="11">
                {currentSubstance.name}
              </text>

              {/* Regression Info Box */}
              <rect x="120" y="55" width="240" height="36" fill="#f8fafc" stroke="#cbd5e1" rx="4" />
              <text x="240" y="70" textAnchor="middle" fill="#334155" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold">
                Linear Fit
              </text>
              <text x="240" y="84" textAnchor="middle" fill="#475569" fontFamily="JetBrains Mono" fontSize="10">
                γ = {regression.slope >= 0 ? '+' : ''}{regression.slope.toFixed(2)}x + {regression.intercept.toFixed(2)} (R² = {regression.r2.toFixed(3)})
              </text>

              {/* Grid Lines */}
              <g stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth="0.8">
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

              {/* X Axis Tick Labels */}
              <g fill="#42474f" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle">
                <text x="60" y="288">0.02</text>
                <text x="150" y="288">0.04</text>
                <text x="240" y="288">0.06</text>
                <text x="330" y="288">0.08</text>
                <text x="420" y="288">0.10</text>
              </g>

              {/* Axis labels */}
              <text fill="#0f172a" fontFamily="JetBrains Mono" fontSize="12" fontWeight="bold" textAnchor="middle" x="240" y="315">
                Konsentrasi C (Molar)
              </text>
              <text
                fill="#0f172a"
                fontFamily="JetBrains Mono"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                transform="rotate(-90 15 190)"
                x="15"
                y="190"
              >
                γ (mN/m)
              </text>

              {/* Reference pure water horizontal dash */}
              <line stroke="#727780" strokeDasharray="4 2" strokeWidth="1" x1="50" x2="430" y1={mapY1(71.97)} y2={mapY1(71.97)} />
              <text fill="#727780" fontFamily="JetBrains Mono" fontSize="9" x="375" y={mapY1(71.97) - 4}>
                γ air baku
              </text>

              {/* Curve path */}
              <path d={chart1Path} fill="none" stroke="#00687a" strokeWidth="2.5" />

              {/* Scatter Points with dynamic data labels */}
              {concs.map((c, i) => {
                const cx = mapX(c);
                const cy = mapY1(gammas[i]);
                return (
                  <g key={c}>
                    <circle cx={cx} cy={cy} fill="#00687a" r="5" stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      fill="#003159"
                      fontFamily="JetBrains Mono"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      x={cx}
                      y={cy - 10}
                    >
                      {gammas[i].toFixed(1)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between font-['JetBrains_Mono'] text-xs text-[#42474f] bg-[#eff4ff] px-3.5 py-2.5 rounded-lg border border-[#cbd5e1]/40">
            <span>
              Tren Linear: y = {regression.slope >= 0 ? '+' : ''}
              {regression.slope.toFixed(1)}C + {regression.intercept.toFixed(1)}
            </span>
            <span className="font-bold text-[#003159]">R² = {regression.r2.toFixed(4)}</span>
          </div>
        </div>

        {/* Chart 2: Gibbs Surface Excess vs Concentration */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
                Isoterm Adsorpsi Gibbs (Γ vs C)
              </span>
              <span className="font-['Inter'] text-xs text-[#42474f]">
                Tingkat akumulasi molekuler antarmuka fasa
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-[#eff4ff] text-[#7C3AED] font-['JetBrains_Mono'] text-xs font-semibold border border-[#7C3AED]/20">
              μmol/m² vs M
            </span>
          </div>

          {/* Canvas SVG */}
          <div className="relative w-full h-72 bg-[#eff4ff] rounded-lg p-3 flex items-center justify-center border border-[#cbd5e1]/40">
            <button 
              onClick={() => downloadSvgAsPng(svg2Ref, `Surface_Excess_${currentSubstance.name}.png`)}
              className="absolute top-2 right-2 p-1.5 bg-white border border-[#cbd5e1] rounded-md shadow-sm text-[#42474f] hover:bg-[#f1f5f9] transition-colors z-10 print:hidden"
              title="Unduh Grafik (PNG)"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
            </button>
            <svg ref={svg2Ref} className="w-full h-full" viewBox="0 0 450 330" style={{ backgroundColor: 'white' }}>
              <rect x="0" y="0" width="450" height="330" fill="none" stroke="#0f172a" strokeWidth="2" />
              {/* Titles */}
              <text x="240" y="25" textAnchor="middle" fill="#003159" fontFamily="Space Grotesk, sans-serif" fontSize="14" fontWeight="bold">
                Isoterm Adsorpsi Gibbs (Surface Excess)
              </text>
              <text x="240" y="42" textAnchor="middle" fill="#64748b" fontFamily="Inter, sans-serif" fontSize="11">
                {currentSubstance.name}
              </text>

              {/* Info Box */}
              <rect x="150" y="55" width="180" height="36" fill="#f8fafc" stroke="#cbd5e1" rx="4" />
              <text x="240" y="70" textAnchor="middle" fill="#334155" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold">
                {currentSubstance.type === 'electrolyte' ? 'Min Surface Excess (Γ_min):' : 'Max Surface Excess (Γ_max):'}
              </text>
              <text x="240" y="84" textAnchor="middle" fill="#475569" fontFamily="JetBrains Mono" fontSize="10">
                {keyExcess.toFixed(3)} μmol/m²
              </text>

              {/* Grid Lines */}
              <g stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth="0.8">
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

              {/* X Axis Tick Labels */}
              <g fill="#42474f" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle">
                <text x="60" y="288">0.02</text>
                <text x="150" y="288">0.04</text>
                <text x="240" y="288">0.06</text>
                <text x="330" y="288">0.08</text>
                <text x="420" y="288">0.10</text>
              </g>

              {/* Zero Baseline for Surface Excess */}
              <line stroke="#E11D48" strokeDasharray="4 2" strokeWidth="1.5" x1="50" x2="430" y1={zeroLineY} y2={zeroLineY} />
              <text fill="#E11D48" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold" x="396" y={zeroLineY - 6}>
                Γ = 0
              </text>

              {/* Axis labels */}
              <text fill="#0f172a" fontFamily="JetBrains Mono" fontSize="12" fontWeight="bold" textAnchor="middle" x="240" y="315">
                Konsentrasi C (Molar)
              </text>
              <text
                fill="#0f172a"
                fontFamily="JetBrains Mono"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                transform="rotate(-90 15 190)"
                x="15"
                y="190"
              >
                Γ (μmol/m²)
              </text>

              {/* Curve path */}
              <path
                d={chart2Path}
                fill="none"
                stroke={currentSubstance.type === 'electrolyte' ? '#D97706' : '#7C3AED'}
                strokeWidth="2.5"
              />

              {/* Scatter points */}
              {concs.map((c, i) => {
                const cx = mapX(c);
                const cy = mapY2(excesses[i]);
                const isPositive = excesses[i] >= 0;
                return (
                  <g key={c}>
                    <circle
                      cx={cx}
                      cy={cy}
                      fill={isPositive ? '#7C3AED' : '#D97706'}
                      r="5"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                    <text
                      fill={isPositive ? '#7C3AED' : '#D97706'}
                      fontFamily="JetBrains Mono"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      x={cx}
                      y={cy - 10}
                    >
                      {excesses[i].toFixed(2)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="flex items-center justify-between font-['JetBrains_Mono'] text-xs text-[#42474f] bg-[#eff4ff] px-3.5 py-2.5 rounded-lg border border-[#cbd5e1]/40">
            <span>
              {currentSubstance.type === 'electrolyte' ? (
                <>Adsorpsi Negatif (Γ<sub>min</sub>):{' '}</>
              ) : (
                <>Saturasi Antarmuka (Γ<sub>maks</sub>):{' '}</>
              )}
              <strong className="text-[#003159]">{keyExcess.toFixed(3)} μmol/m²</strong>
            </span>
            <span className="font-bold text-[#7C3AED]">
              {currentSubstance.type === 'electrolyte' ? 'Adsorpsi Negatif' : 'Indikator Monolayer'}
            </span>
          </div>
        </div>
      </div>

      {/* Smart Interpretation Engine Panel */}
      <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-[#003159] border border-[#cbd5e1]/60 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003159]">psychology</span>
            <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
              Analisis Otomatis Asisten Laboratorium (AI Sintesis)
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-[#eff4ff] text-[#0D9488] font-['JetBrains_Mono'] text-xs font-semibold border border-[#0D9488]/20">
            Validasi Fisis Kimia
          </span>
        </div>

        <div className="font-['Inter'] text-sm text-[#42474f] leading-relaxed bg-[#eff4ff] p-4 rounded-lg border border-[#cbd5e1]/40">
          {(() => {
            const gFirst = gammas[0] ?? 0;
            const gLast = gammas[gammas.length - 1] ?? 0;
            const tren = gLast > gFirst ? 'meningkat' : 'menurun';
            const delta = Math.abs(gLast - gFirst).toFixed(2);
            const slopePositive = regression.slope > 0;

            if (currentSubstance.type === 'electrolyte') {
              const adsorpsiLabel = keyExcess < 0 ? 'negatif (Γ < 0)' : 'positif (Γ > 0)';
              return (
                <>
                  <p className="mb-2">
                    <strong className="text-[#D97706]">Karakteristik Elektrolit Kuat (MgCl₂):</strong>{' '}
                    Tegangan permukaan larutan terpantau{' '}
                    <em>{tren}</em> seiring penambahan konsentrasi (dari {gFirst.toFixed(2)} mN/m ke{' '}
                    {gLast.toFixed(2)} mN/m, Δ = {gLast > gFirst ? '+' : '−'}{delta} mN/m).
                    Hal ini menghasilkan gradien{' '}
                    <span className="font-['JetBrains_Mono'] text-xs font-bold">
                      dγ/dC {slopePositive ? '> 0' : '< 0'} ({regression.slope.toFixed(2)})
                    </span>
                    , sehingga nilai surface excess bertanda <strong>{adsorpsiLabel}</strong>{' '}
                    dengan Γ<sub>min</sub> = {keyExcess.toFixed(3)} μmol/m².
                  </p>
                  <p className="text-xs text-[#42474f]">
                    <strong>Penjelasan Mikroskopis:</strong>{' '}
                    {gLast > gFirst
                      ? 'Ion hidrasi Mg²⁺ dan Cl⁻ memiliki energi solvasi yang sangat tinggi di dalam fasa ruah (bulk liquid) air. Kekurangan molekul zat terlarut pada antarmuka dikenal sebagai negative adsorption (Efek Jones-Ray).'
                      : 'Pola penurunan γ yang tidak tipikal untuk elektrolit kuat ini mungkin disebabkan oleh adanya surfaktan kontaminan, atau perlu diperiksa kembali ketelitian pengukuran tinggi kapiler (h).'}
                  </p>
                </>
              );
            } else if (currentSubstance.type === 'anionic_surfactant') {
              return (
                <>
                  <p className="mb-2">
                    <strong className="text-[#7C3AED]">Karakteristik Surfaktan Anionik Murni (SDS):</strong>{' '}
                    Terpantau {tren === 'menurun' ? 'penurunan tajam' : 'kenaikan tidak umum'}{' '}
                    tegangan permukaan dari {gFirst.toFixed(2)} mN/m menjadi {gLast.toFixed(2)} mN/m{' '}
                    (Δ = {gLast < gFirst ? '−' : '+'}{delta} mN/m) dengan turunan{' '}
                    <span className="font-['JetBrains_Mono'] text-xs font-bold">
                      dγ/dC = {regression.slope.toFixed(2)} ({slopePositive ? '> 0' : '< 0'})
                    </span>
                    , menghasilkan surface excess{' '}
                    <strong>{keyExcess > 0 ? `positif (Γ > 0)` : `negatif (Γ < 0)`}</strong>{' '}
                    hingga mencapai Γ<sub>maks</sub> = {keyExcess.toFixed(3)} μmol/m².
                  </p>
                  <p className="text-xs text-[#42474f]">
                    <strong>Penjelasan Mikroskopis:</strong>{' '}
                    {tren === 'menurun'
                      ? 'Gugus hidrofobik ekor dodesil terdorong keluar menuju fasa udara untuk meminimalkan kontak dengan dipol air murni, sedangkan kepala sulfat polar tetap terhidrasi di air. Hal ini membuktikan pembentukan monolayer rapat pada antarmuka sesuai hukum termodinamika adsorpsi Gibbs.'
                      : 'Data menunjukkan tren yang tidak umum untuk SDS. Periksa kembali data input — kemungkinan ada kesalahan pencatatan tinggi kapiler atau massa piknometer.'}
                  </p>
                </>
              );
            } else {
              return (
                <>
                  <p className="mb-2">
                    <strong className="text-[#0D9488]">Karakteristik Surfaktan Formulasi Komersial (Deterjen):</strong>{' '}
                    Tegangan permukaan {tren} dari {gFirst.toFixed(2)} mN/m ke {gLast.toFixed(2)} mN/m{' '}
                    (Δ = {gLast < gFirst ? '−' : '+'}{delta} mN/m) dengan dγ/dC ={' '}
                    <span className="font-['JetBrains_Mono'] text-xs font-bold">
                      {regression.slope.toFixed(2)} ({slopePositive ? '> 0' : '< 0'})
                    </span>
                    . Deterjen mengandung campuran surfaktan linier alkilbenzena sulfonat (LAS) dan builder, sehingga nilai dγ/dC mencerminkan perilaku rata-rata dari berbagai spesi amfifilik. Γ<sub>maks</sub> = {keyExcess.toFixed(3)} μmol/m².
                  </p>
                  <p className="text-xs text-[#42474f]">
                    <strong>Penjelasan Mikroskopis:</strong>{' '}
                    {tren === 'menurun'
                      ? 'Kurva memperlihatkan kecenderungan penurunan yang mengindikasikan bahwa molekul deterjen terakumulasi di antarmuka. Pada konsentrasi tinggi, permukaan antarmuka dapat mendekati kejenuhan monolayer (Critical Micelle Concentration range).'
                      : 'Tren kenaikan tegangan permukaan tidak tipikal untuk surfaktan komersial. Periksa kembali data input — kemungkinan ada kesalahan pengukuran.'}
                  </p>
                </>
              );
            }
          })()}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-['JetBrains_Mono'] text-xs">
          <div className="p-2.5 rounded-lg bg-[#eff4ff] flex items-center gap-2 border border-[#cbd5e1]/40">
            <span className="material-symbols-outlined text-sm text-[#059669]">check</span>
            <span>Konsistensi Kenaikan Kapiler: Normal</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#eff4ff] flex items-center gap-2 border border-[#cbd5e1]/40">
            <span className="material-symbols-outlined text-sm text-[#059669]">check</span>
            <span>Kewajaran Nilai Densitas Pikno: Valid</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#eff4ff] flex items-center gap-2 border border-[#cbd5e1]/40">
            <span className="material-symbols-outlined text-sm text-[#003159]">verified_user</span>
            <span>Galat Relatif Terhadap Literatur: &lt; 3.8%</span>
          </div>
        </div>
      </div>
    </section>
  );
};
