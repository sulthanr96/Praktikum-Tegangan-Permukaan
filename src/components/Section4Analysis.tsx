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

        {/* Dual/Triple Path Analysis Toggle */}
        <div className="flex flex-col gap-1.5">
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
              Alur B: Beda Hingga
            </button>
            <button
              onClick={() => onAnalysisModeChange('alurC')}
              className={`px-3 py-1.5 rounded-md font-['JetBrains_Mono'] text-xs font-bold transition-all ${
                analysisMode === 'alurC'
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'text-[#42474f] hover:bg-[#dce9ff]'
              }`}
            >
              Alur C: Semi-Logaritmik
            </button>
          </div>
          {analysisMode === 'alurC' && (
            <div className="font-['Inter'] text-[11px] text-[#7C3AED] bg-[#f5f3ff] border border-[#7C3AED]/20 px-3 py-1.5 rounded-lg leading-relaxed">
              <strong>ℹ Alur C:</strong> Menggunakan regresi semi-logaritmik γ = A + B·ln(C), sehingga dγ/dC = B/C pada tiap titik. Lebih akurat untuk surfaktan (SDS, Deterjen) karena kurva γ vs C aslinya bersifat logaritmik. Nilai Γ yang dihasilkan lebih konsisten dengan teori Gibbs sesungguhnya.
            </div>
          )}
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
              <span className={`font-bold ${analysisMode === 'alurC' ? 'text-[#7C3AED]' : 'text-[#003159]'}`}>
                {analysisMode === 'alurA'
                  ? 'Regresi Linier (A)'
                  : analysisMode === 'alurB'
                  ? 'Beda Hingga Numerik (B)'
                  : 'Semi-Logaritmik (C)'}
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
            const slopePositive = regression.slope > 0;
            // Use regression slope sign as the authoritative trend indicator,
            // NOT the naive first-vs-last comparison (which is noise-sensitive)
            const trenBySlope = slopePositive ? 'meningkat' : 'menurun';
            const delta = Math.abs(gLast - gFirst).toFixed(2);
            const deltaSign = gLast > gFirst ? '+' : '−';

            if (currentSubstance.type === 'electrolyte') {
              const adsorpsiLabel = keyExcess < 0 ? 'negatif (Γ < 0)' : 'positif (Γ > 0)';
              return (
                <>
                  <p className="mb-2">
                    <strong className="text-[#D97706]">Karakteristik Elektrolit Kuat (MgCl₂):</strong>{' '}
                    Berdasarkan garis regresi linier, tegangan permukaan larutan secara keseluruhan{' '}
                    cenderung <em>{trenBySlope}</em> seiring penambahan konsentrasi (dari {gFirst.toFixed(2)} mN/m ke{' '}
                    {gLast.toFixed(2)} mN/m, Δ titik ujung = {deltaSign}{delta} mN/m).{' '}
                    Gradien regresi{' '}
                    <span className="font-['JetBrains_Mono'] text-xs font-bold">
                      dγ/dC {slopePositive ? '> 0' : '< 0'} ({regression.slope.toFixed(2)})
                    </span>
                    {' '}menghasilkan surface excess bertanda <strong>{adsorpsiLabel}</strong>{' '}
                    dengan Γ<sub>min</sub> = {keyExcess.toFixed(3)} μmol/m².
                  </p>
                  <p className="text-xs text-[#42474f]">
                    <strong>Catatan:</strong>{' '}
                    {slopePositive
                      ? 'Ion hidrasi Mg²⁺ dan Cl⁻ memiliki energi solvasi tinggi di fasa ruah air. Kekurangan ion di antarmuka dikenal sebagai negative adsorption (Efek Jones-Ray). Fluktuasi antar titik data adalah hal wajar dalam praktikum.'
                      : 'Gradien regresi negatif tidak tipikal untuk elektrolit kuat. Kemungkinan ada error sistematis pada pengukuran tinggi kapiler (h) atau kontaminasi surfaktan. R² = ' + regression.r2.toFixed(3) + ' — semakin rendah R², semakin besar pengaruh noise data.'}
                  </p>
                </>
              );
            } else if (currentSubstance.type === 'anionic_surfactant') {
              return (
                <>
                  <p className="mb-2">
                    <strong className="text-[#7C3AED]">Karakteristik Surfaktan Anionik Murni (SDS):</strong>{' '}
                    Berdasarkan garis regresi, tegangan permukaan{' '}
                    {!slopePositive ? 'menurun' : 'meningkat (tidak tipikal)'}{' '}
                    dari {gFirst.toFixed(2)} mN/m menjadi {gLast.toFixed(2)} mN/m{' '}
                    (Δ titik ujung = {gLast < gFirst ? '−' : '+'}{delta} mN/m) dengan gradien regresi{' '}
                    <span className="font-['JetBrains_Mono'] text-xs font-bold">
                      dγ/dC = {regression.slope.toFixed(2)} ({slopePositive ? '> 0' : '< 0'})
                    </span>
                    {', '}menghasilkan surface excess{' '}
                    <strong>{keyExcess > 0 ? 'positif (Γ > 0)' : 'negatif (Γ < 0)'}</strong>{' '}
                    hingga mencapai Γ<sub>maks</sub> = {keyExcess.toFixed(3)} μmol/m².
                  </p>
                  <p className="text-xs text-[#42474f]">
                    <strong>Penjelasan Mikroskopis:</strong>{' '}
                    {!slopePositive
                      ? 'Gugus hidrofobik ekor dodesil terdorong keluar menuju fasa udara, sedangkan kepala sulfat polar tetap terhidrasi di air. Hal ini membuktikan pembentukan monolayer rapat pada antarmuka.'
                      : 'Gradien regresi positif tidak tipikal untuk SDS. Periksa kembali data input — kemungkinan ada kesalahan pencatatan h kapiler atau massa piknometer.'}
                  </p>
                </>
              );
            } else {
              return (
                <>
                  <p className="mb-2">
                    <strong className="text-[#0D9488]">Karakteristik Surfaktan Formulasi Komersial (Deterjen):</strong>{' '}
                    Berdasarkan garis regresi, tegangan permukaan{' '}
                    {!slopePositive ? 'menurun' : 'meningkat (tidak tipikal)'}{' '}
                    dari {gFirst.toFixed(2)} mN/m ke {gLast.toFixed(2)} mN/m{' '}
                    (Δ titik ujung = {gLast < gFirst ? '−' : '+'}{delta} mN/m) dengan dγ/dC ={' '}
                    <span className="font-['JetBrains_Mono'] text-xs font-bold">
                      {regression.slope.toFixed(2)} ({slopePositive ? '> 0' : '< 0'})
                    </span>
                    . Deterjen mengandung campuran surfaktan kompleks (LAS + builder). Γ<sub>maks</sub> = {keyExcess.toFixed(3)} μmol/m².
                  </p>
                  <p className="text-xs text-[#42474f]">
                    <strong>Penjelasan Mikroskopis:</strong>{' '}
                    {!slopePositive
                      ? 'Molekul deterjen terakumulasi di antarmuka udara-air. Pada konsentrasi tinggi, permukaan dapat mendekati kejenuhan monolayer (CMC range).'
                      : 'Tren regresi positif tidak tipikal untuk surfaktan komersial. Periksa kembali data pengukuran.'}
                  </p>
                </>
              );
            }
          })()}
        </div>

        {/* Dynamic validation cards */}
        {(() => {
          const hValues = calculatedRows.map(r => r.hCapillary).filter(h => h > 0);
          const rhoValues = calculatedRows.map(r => r.rho).filter(r => r > 0);
          const gammaVals = calculatedRows.map(r => r.gamma).filter(g => g > 0);

          // Card 1: Konsistensi h (check all h > 0 and span is reasonable)
          const hOk = hValues.length === 5 && hValues.every(h => h >= 0.1 && h <= 15);
          const hMonotone = hValues.length === 5 && (
            hValues.every((v, i, a) => i === 0 || v >= a[i-1]) ||
            hValues.every((v, i, a) => i === 0 || v <= a[i-1])
          );
          const hCard = hValues.length === 0
            ? { icon: 'info', color: '#64748b', label: 'Kenaikan Kapiler: Data Belum Diinput', bg: 'bg-[#eff4ff]' }
            : !hOk
            ? { icon: 'warning', color: '#D97706', label: `Kenaikan Kapiler: ⚠ ${hValues.filter(h => h < 0.1 || h > 15).length} nilai di luar wajar (0.1–15 cm)`, bg: 'bg-amber-50' }
            : hMonotone
            ? { icon: 'check', color: '#059669', label: `Kenaikan Kapiler: Monoton (${Math.min(...hValues).toFixed(2)}–${Math.max(...hValues).toFixed(2)} cm)`, bg: 'bg-[#eff4ff]' }
            : { icon: 'check_circle', color: '#0D9488', label: `Kenaikan Kapiler: Terisi (${Math.min(...hValues).toFixed(2)}–${Math.max(...hValues).toFixed(2)} cm)`, bg: 'bg-[#eff4ff]' };

          // Card 2: Kewajaran densitas (0.85 - 1.15 g/cm³)
          const rhoInRange = rhoValues.filter(r => r >= 0.85 && r <= 1.15);
          const rhoCard = rhoValues.length === 0
            ? { icon: 'info', color: '#64748b', label: 'Densitas Pikno: Data Belum Diinput', bg: 'bg-[#eff4ff]' }
            : rhoInRange.length === rhoValues.length
            ? { icon: 'check', color: '#059669', label: `Densitas Pikno: Wajar (${Math.min(...rhoValues).toFixed(4)}–${Math.max(...rhoValues).toFixed(4)} g/cm³)`, bg: 'bg-[#eff4ff]' }
            : { icon: 'warning', color: '#D97706', label: `Densitas Pikno: ⚠ ${rhoValues.length - rhoInRange.length} nilai di luar 0.85–1.15 g/cm³`, bg: 'bg-amber-50' };

          // Card 3: Tren γ — use regression slope sign, not noisy first-vs-last comparison
          // electrolyte should have slope > 0, surfactants should have slope < 0
          const slopeSign = regression.slope > 0;
          const expectedTrend = currentSubstance.type === 'electrolyte' ? 'naik (slope > 0)' : 'turun (slope < 0)';
          const trendOkBySlope = gammaVals.length >= 5 && (
            (currentSubstance.type === 'electrolyte' && slopeSign) ||
            (currentSubstance.type !== 'electrolyte' && !slopeSign)
          );
          const slopeLabel = `slope = ${regression.slope.toFixed(2)}, R² = ${regression.r2.toFixed(3)}`;
          const gammaCard = gammaVals.length === 0
            ? { icon: 'info', color: '#64748b', label: 'Tren γ: Data Belum Diinput', bg: 'bg-[#eff4ff]' }
            : gammaVals.length < 5
            ? { icon: 'info', color: '#64748b', label: 'Tren γ: Data Tidak Lengkap', bg: 'bg-[#eff4ff]' }
            : trendOkBySlope
            ? { icon: 'verified_user', color: '#003159', label: `Tren γ (regresi): ✓ Sesuai teori — ${slopeLabel}`, bg: 'bg-[#eff4ff]' }
            : { icon: 'warning', color: '#D97706', label: `Tren γ (regresi): ⚠ Tidak sesuai (harusnya ${expectedTrend}) — ${slopeLabel}`, bg: 'bg-amber-50' };

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-['JetBrains_Mono'] text-xs">
              {[hCard, rhoCard, gammaCard].map((card, idx) => (
                <div key={idx} className={`p-2.5 rounded-lg ${card.bg} flex items-center gap-2 border border-[#cbd5e1]/40`}>
                  <span className="material-symbols-outlined text-sm shrink-0" style={{ color: card.color }}>{card.icon}</span>
                  <span>{card.label}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
    </section>
  );
};
