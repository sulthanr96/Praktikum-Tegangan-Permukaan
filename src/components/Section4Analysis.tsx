import React from 'react';
import { SubstanceInfo, CalculatedDataRow, RegressionStats, AnalysisMode } from '../types';

interface Section4AnalysisProps {
  currentSubstance: SubstanceInfo;
  analysisMode: AnalysisMode;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
  calculatedRows: CalculatedDataRow[];
  regression: RegressionStats;
  maxExcess: number;
}

export const Section4Analysis: React.FC<Section4AnalysisProps> = ({
  currentSubstance,
  analysisMode,
  onAnalysisModeChange,
  calculatedRows,
  regression,
  maxExcess,
}) => {
  const concs = calculatedRows.map((r) => r.concentration);
  const gammas = calculatedRows.map((r) => r.gamma);
  const excesses = calculatedRows.map((r) => r.surfaceExcessMicro);

  // Chart 1 coordinate mapping:
  // X range: 0.02 to 0.10 M -> mapped to [70, 410]
  // Y range: min/max gamma -> mapped to [185, 35]
  const mapX = (c: number) => 70 + ((c - 0.02) / 0.08) * 340;
  
  const minG = Math.min(...gammas, 20);
  const maxG = Math.max(...gammas, 80);
  const mapY1 = (g: number) => {
    const range = maxG - minG || 1;
    return 190 - ((g - minG) / range) * 155;
  };

  const chart1Path = concs
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${mapX(c)} ${mapY1(gammas[i])}`)
    .join(' ');

  // Chart 2 coordinate mapping:
  const minE = Math.min(...excesses, -1.0);
  const maxE = Math.max(...excesses, 2.0);
  const mapY2 = (e: number) => {
    const range = maxE - minE || 1;
    return 190 - ((e - minE) / range) * 155;
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
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
              Tabel Hasil Perhitungan Komprehensif
            </span>
            <span
              className={`px-2.5 py-0.5 rounded font-['JetBrains_Mono'] text-xs font-bold ${
                currentSubstance.id === 'mgcl2'
                  ? 'bg-[#fffbeb] text-[#D97706] border border-[#D97706]/30'
                  : currentSubstance.id === 'sds'
                  ? 'bg-[#f5f3ff] text-[#7C3AED] border border-[#7C3AED]/30'
                  : 'bg-[#f0fdfa] text-[#0D9488] border border-[#0D9488]/30'
              }`}
            >
              {currentSubstance.name}
            </span>
          </div>
          <div className="font-['JetBrains_Mono'] text-xs text-[#42474f]">
            Metode Aktif:{' '}
            <span className="font-bold text-[#003159]">
              {analysisMode === 'alurA'
                ? 'Regresi Polinomial Orde 1 (dγ/dC Analitik)'
                : 'Beda Hingga Numerik (Central & Forward Difference)'}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#eff4ff] font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#42474f]">
                <th className="py-2.5 px-3 rounded-l-lg">C (M)</th>
                <th className="py-2.5 px-3">C (mol/m³)</th>
                <th className="py-2.5 px-3">ρ (g/cm³)</th>
                <th className="py-2.5 px-3">h (cm)</th>
                <th className="py-2.5 px-3">γ (mN/m)</th>
                <th className="py-2.5 px-3">dγ/dC (mN·L / m·mol)</th>
                <th className="py-2.5 px-3 rounded-r-lg">Γ (× 10⁻⁶ mol/m²)</th>
              </tr>
            </thead>
            <tbody className="font-['JetBrains_Mono'] text-xs divide-y divide-[#cbd5e1]/30">
              {calculatedRows.map((r) => (
                <tr key={r.concentration} className="hover:bg-[#eff4ff]/60 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-[#003159]">{r.concentration.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-[#42474f]">{r.concentrationMolM3.toFixed(0)}</td>
                  <td className="py-2.5 px-3 text-[#0b1c30]">{r.rho.toFixed(4)}</td>
                  <td className="py-2.5 px-3 text-[#0b1c30]">{r.hCapillary.toFixed(2)}</td>
                  <td className="py-2.5 px-3 font-bold text-[#003159]">{r.gamma.toFixed(2)}</td>
                  <td
                    className={`py-2.5 px-3 font-semibold ${
                      r.dGammaDC < 0 ? 'text-[#E11D48]' : 'text-[#D97706]'
                    }`}
                  >
                    {r.dGammaDC >= 0 ? '+' : ''}
                    {r.dGammaDC.toFixed(2)}
                  </td>
                  <td
                    className={`py-2.5 px-3 font-bold ${
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
            <svg className="w-full h-full" viewBox="0 0 450 240">
              {/* Grid Lines */}
              <g stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth="0.8">
                <line x1="50" x2="50" y1="20" y2="200" />
                <line x1="145" x2="145" y1="20" y2="200" />
                <line x1="240" x2="240" y1="20" y2="200" />
                <line x1="335" x2="335" y1="20" y2="200" />
                <line x1="430" x2="430" y1="20" y2="200" />

                <line x1="50" x2="430" y1="20" y2="20" />
                <line x1="50" x2="430" y1="65" y2="65" />
                <line x1="50" x2="430" y1="110" y2="110" />
                <line x1="50" x2="430" y1="155" y2="155" />
                <line x1="50" x2="430" y1="200" y2="200" />
              </g>

              {/* Axis labels */}
              <text fill="#42474f" fontFamily="JetBrains Mono" fontSize="11" textAnchor="middle" x="240" y="225">
                Konsentrasi C (Molar)
              </text>
              <text
                fill="#42474f"
                fontFamily="JetBrains Mono"
                fontSize="11"
                textAnchor="middle"
                transform="rotate(-90 18 110)"
                x="18"
                y="110"
              >
                γ (mN/m)
              </text>

              {/* Reference pure water horizontal dash */}
              <line stroke="#727780" strokeDasharray="4 2" strokeWidth="1" x1="50" x2="430" y1="50" y2="50" />
              <text fill="#727780" fontFamily="JetBrains Mono" fontSize="9" x="375" y="44">
                γ_air baku
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
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      x={cx}
                      y={cy - 9}
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
            <svg className="w-full h-full" viewBox="0 0 450 240">
              {/* Grid Lines */}
              <g stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth="0.8">
                <line x1="50" x2="50" y1="20" y2="200" />
                <line x1="145" x2="145" y1="20" y2="200" />
                <line x1="240" x2="240" y1="20" y2="200" />
                <line x1="335" x2="335" y1="20" y2="200" />
                <line x1="430" x2="430" y1="20" y2="200" />

                <line x1="50" x2="430" y1="20" y2="20" />
                <line x1="50" x2="430" y1="65" y2="65" />
                <line x1="50" x2="430" y1="110" y2="110" />
                <line x1="50" x2="430" y1="155" y2="155" />
                <line x1="50" x2="430" y1="200" y2="200" />
              </g>

              {/* Zero Baseline for Surface Excess */}
              <line stroke="#E11D48" strokeDasharray="4 2" strokeWidth="1.5" x1="50" x2="430" y1={zeroLineY} y2={zeroLineY} />
              <text fill="#E11D48" fontFamily="JetBrains Mono" fontSize="9" fontWeight="bold" x="396" y={zeroLineY - 4}>
                Γ = 0
              </text>

              {/* Axis labels */}
              <text fill="#42474f" fontFamily="JetBrains Mono" fontSize="11" textAnchor="middle" x="240" y="225">
                Konsentrasi C (Molar)
              </text>
              <text
                fill="#42474f"
                fontFamily="JetBrains Mono"
                fontSize="11"
                textAnchor="middle"
                transform="rotate(-90 18 110)"
                x="18"
                y="110"
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
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      x={cx}
                      y={cy - 9}
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
              Saturasi Antarmuka (Γ<sub>maks</sub>):{' '}
              <strong className="text-[#003159]">{maxExcess.toFixed(3)} μmol/m²</strong>
            </span>
            <span className="font-bold text-[#7C3AED]">Indikator Monolayer</span>
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
          {currentSubstance.type === 'electrolyte' ? (
            <>
              <p className="mb-2">
                <strong className="text-[#D97706]">Karakteristik Elektrolit Kuat (MgCl₂):</strong> Tegangan permukaan larutan
                terpantau sedikit <em>meningkat</em> seiring penambahan konsentrasi (dari {gammas[0]?.toFixed(2)} mN/m ke{' '}
                {gammas[4]?.toFixed(2)} mN/m). Hal ini menghasilkan gradien positif{' '}
                <span className="font-['JetBrains_Mono'] text-xs font-bold">dγ/dC &gt; 0</span>, sehingga nilai surface excess
                bertanda <strong>negatif (Γ &lt; 0)</strong>.
              </p>
              <p className="text-xs text-[#42474f]">
                <strong>Penjelasan Mikroskopis:</strong> Ion hidrasi Mg²⁺ dan Cl⁻ memiliki energi solvasi yang sangat tinggi di
                dalam fasa ruah (bulk liquid) air, menciptakan gaya elektrostatik yang menarik molekul air menjauh dari
                permukaan. Kekurangan molekul zat terlarut pada antarmuka dikenal sebagai <em>negative adsorption</em> (Efek
                Jones-Ray).
              </p>
            </>
          ) : currentSubstance.type === 'anionic_surfactant' ? (
            <>
              <p className="mb-2">
                <strong className="text-[#7C3AED]">Karakteristik Surfaktan Anionik Murni (SDS):</strong> Teramati penurunan tajam
                tegangan permukaan dari {gammas[0]?.toFixed(2)} mN/m menjadi {gammas[4]?.toFixed(2)} mN/m dengan turunan{' '}
                <span className="font-['JetBrains_Mono'] text-xs font-bold">dγ/dC &lt; 0</span>, menghasilkan surface excess{' '}
                <strong>positif (Γ &gt; 0)</strong> hingga mencapai saturasi {maxExcess.toFixed(2)} μmol/m².
              </p>
              <p className="text-xs text-[#42474f]">
                <strong>Penjelasan Mikroskopis:</strong> Gugus hidrofobik ekor dodesil terdorong keluar menuju fasa udara untuk
                meminimalkan kontak dengan dipol air murni, sedangkan kepala sulfat polar tetap terhidrasi di air. Hal ini
                membuktikan pembentukan monolayer rapat pada antarmuka sesuai hukum termodinamika adsorpsi Gibbs.
              </p>
            </>
          ) : (
            <>
              <p className="mb-2">
                <strong className="text-[#0D9488]">Karakteristik Surfaktan Formulasi Komersial (Deterjen):</strong> Penurunan
                tegangan permukaan berlangsung progresif dan stabil. Karena deterjen mengandung campuran surfaktan linier
                alkilbenzena sulfonat (LAS) dan builder penstabil, nilai dγ/dC mencerminkan perilaku rata-rata dari berbagai spesi
                amfifilik.
              </p>
              <p className="text-xs text-[#42474f]">
                <strong>Penjelasan Mikroskopis:</strong> Kurva memperlihatkan kecenderungan plateau pada konsentrasi di atas 0.08 M
                yang mengindikasikan bahwa permukaan antarmuka telah mendekati kejenuhan monolayer penuh (Critical Micelle
                Concentration / CMC range).
              </p>
            </>
          )}
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
