import React, { useState } from 'react';

interface Section1TheoryProps {
  temperatureKelvin: number;
}

export const Section1Theory: React.FC<Section1TheoryProps> = ({ temperatureKelvin }) => {
  const [simGamma, setSimGamma] = useState<number>(71.97);
  const [activePreset, setActivePreset] = useState<'water' | 'sds' | 'mgcl2'>('water');

  const handlePreset = (preset: 'water' | 'sds' | 'mgcl2') => {
    setActivePreset(preset);
    if (preset === 'water') setSimGamma(71.97);
    else if (preset === 'sds') setSimGamma(32.40);
    else if (preset === 'mgcl2') setSimGamma(74.24);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSimGamma(val);
    if (Math.abs(val - 71.97) < 0.5) setActivePreset('water');
    else if (Math.abs(val - 32.4) < 1.0) setActivePreset('sds');
    else if (Math.abs(val - 74.24) < 0.5) setActivePreset('mgcl2');
    else setActivePreset('water'); // custom
  };

  // Visual simulation calculation
  // Base reservoir fluid level at y = 210
  // Normalized gamma [25, 85]
  const minGamma = 25;
  const maxGamma = 85;
  const clampedGamma = Math.max(minGamma, Math.min(maxGamma, simGamma));
  const norm = (clampedGamma - minGamma) / (maxGamma - minGamma);
  const topY = 195 - norm * 140; // when gamma=85, topY ~ 55; when gamma=25, topY ~ 195
  const simulatedHeightCm = (0.5 + norm * 3.5).toFixed(2);
  const textMidY = Math.max(70, (topY + 210) / 2);

  return (
    <section className="flex flex-col gap-8 scroll-mt-28" id="pendahuluan">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#0D9488] font-['JetBrains_Mono'] text-xs uppercase font-semibold">
            <span className="material-symbols-outlined text-base">waves</span>
            Fisika Antarmuka &amp; Fenomena Kenaikan Kapiler
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-[#003159] tracking-tight mt-1">
            1. Teori &amp; Dasar Meniskus Kapiler
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[#42474f] font-['JetBrains_Mono'] text-xs bg-[#e5eeff] px-3 py-1.5 rounded-lg border border-[#cbd5e1]/40">
          <span className="material-symbols-outlined text-sm text-[#003159]">verified</span>
          <span>Departemen Kimia Fisik FMIPA UI · 2025</span>
        </div>
      </div>

      {/* Main Interactive Workbench Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Meniscus Simulator */}
        <div className="lg:col-span-5 bg-white rounded-xl p-6 shadow-sm border border-[#cbd5e1]/60 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
                Simulasi Meniskus Kapiler
              </span>
              <span className="font-['Inter'] text-xs text-[#42474f]">
                Model kenaikan cairan relatif terhadap kesetimbangan Young-Laplace
              </span>
            </div>
            <span className="p-2 rounded-lg bg-[#e5eeff] text-[#0D9488] material-symbols-outlined">
              fluid_med
            </span>
          </div>

          {/* Fluid SVG Canvas */}
          <div className="relative w-full h-80 my-4 bg-[#eff4ff] rounded-lg p-4 flex items-center justify-center overflow-hidden border border-[#cbd5e1]/40">
            {/* Metric Grid lines */}
            <div className="absolute inset-0 opacity-20 flex flex-col justify-between pointer-events-none p-2 font-['JetBrains_Mono'] text-[10px] text-[#003159]">
              <div className="w-full flex justify-between items-center">
                <span>4.0 cm</span>
                <div className="w-full h-px bg-[#003159] opacity-40 mx-2"></div>
              </div>
              <div className="w-full flex justify-between items-center">
                <span>3.0 cm</span>
                <div className="w-full h-px bg-[#003159] opacity-40 mx-2"></div>
              </div>
              <div className="w-full flex justify-between items-center">
                <span>2.0 cm</span>
                <div className="w-full h-px bg-[#003159] opacity-40 mx-2"></div>
              </div>
              <div className="w-full flex justify-between items-center">
                <span>1.0 cm</span>
                <div className="w-full h-px bg-[#003159] opacity-40 mx-2"></div>
              </div>
              <div className="w-full flex justify-between items-center">
                <span>0.0 cm</span>
                <div className="w-full h-px bg-[#003159] opacity-40 mx-2"></div>
              </div>
            </div>

            {/* SVG Visualizer */}
            <svg className="w-full h-full max-w-[280px]" viewBox="0 0 280 260">
              {/* Outer Beaker Base */}
              <rect fill="#e2e8f0" fillOpacity="0.5" height="60" rx="8" width="210" x="35" y="190" />
              {/* Outer Fluid Reservoir Level */}
              <path
                d="M 36 210 Q 70 212 140 210 T 244 210 L 244 248 Q 244 250 240 250 L 40 250 Q 36 250 36 248 Z"
                fill="#0D9488"
                fillOpacity="0.45"
              />
              {/* Capillary Glass Tube Walls */}
              <rect
                fill="none"
                height="210"
                opacity="0.75"
                rx="2"
                stroke="#727780"
                strokeDasharray="2 1"
                strokeWidth="2.5"
                width="48"
                x="116"
                y="25"
              />
              <rect fill="#ffffff" fillOpacity="0.3" height="215" rx="0" width="36" x="122" y="20" />

              {/* Dynamic fluid inside capillary */}
              <path
                className="transition-all duration-300 ease-out"
                d={`M 122 ${topY} L 158 ${topY} L 158 245 L 122 245 Z`}
                fill="#0D9488"
                fillOpacity="0.7"
              />
              {/* Concave Meniscus Curve */}
              <path
                className="transition-all duration-300 ease-out"
                d={`M 122 ${topY} Q 140 ${topY + 9} 158 ${topY}`}
                fill="none"
                stroke="#003159"
                strokeLinecap="round"
                strokeWidth="3"
              />

              {/* Vectors: gamma cos theta */}
              <g className="transition-all duration-300">
                <line stroke="#E11D48" strokeLinecap="round" strokeWidth="2" x1="122" x2="114" y1={topY} y2={topY - 25} />
                <polygon fill="#E11D48" points={`114,${topY - 25} 112,${topY - 17} 119,${topY - 21}`} />
                <line stroke="#E11D48" strokeLinecap="round" strokeWidth="2" x1="158" x2="166" y1={topY} y2={topY - 25} />
                <polygon fill="#E11D48" points={`166,${topY - 25} 161,${topY - 21} 168,${topY - 17}`} />
                <text fill="#E11D48" fontFamily="JetBrains Mono" fontSize="11" fontWeight="600" x="90" y={topY - 30}>
                  γ cos θ
                </text>
              </g>

              {/* Height Dimension Line */}
              <g className="transition-all duration-300">
                <line stroke="#003159" strokeDasharray="3 2" strokeWidth="1.5" x1="178" x2="178" y1="210" y2={topY} />
                <line stroke="#003159" strokeWidth="1.5" x1="172" x2="184" y1="210" y2="210" />
                <line stroke="#003159" strokeWidth="1.5" x1="172" x2="184" y1={topY} y2={topY} />
                <text fill="#003159" fontFamily="JetBrains Mono" fontSize="12" fontWeight="600" x="186" y={textMidY}>
                  h = {simulatedHeightCm} cm
                </text>
              </g>

              {/* Capillary diameter marker */}
              <line stroke="#727780" strokeWidth="1.2" x1="122" x2="158" y1="50" y2="50" />
              <text fill="#42474f" fontFamily="JetBrains Mono" fontSize="10" x="136" y="44">
                2r
              </text>
            </svg>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-3 bg-[#e5eeff] p-3.5 rounded-lg border border-[#cbd5e1]/40">
            <div className="flex items-center justify-between font-['JetBrains_Mono'] text-xs text-[#0b1c30]">
              <span className="font-semibold">Preset Larutan Uji:</span>
              <span className="px-2 py-0.5 rounded bg-[#d3e4fe] text-[#003159] font-bold">
                {simGamma.toFixed(2)} mN/m
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handlePreset('water')}
                className={`px-2 py-1.5 rounded text-center font-['JetBrains_Mono'] text-xs transition-all ${
                  activePreset === 'water'
                    ? 'bg-[#003159] text-white font-bold shadow-sm'
                    : 'bg-[#d3e4fe] text-[#0b1c30] hover:bg-[#a0c9ff]'
                }`}
              >
                Air Murni
              </button>
              <button
                onClick={() => handlePreset('sds')}
                className={`px-2 py-1.5 rounded text-center font-['JetBrains_Mono'] text-xs transition-all ${
                  activePreset === 'sds'
                    ? 'bg-[#003159] text-white font-bold shadow-sm'
                    : 'bg-[#d3e4fe] text-[#0b1c30] hover:bg-[#a0c9ff]'
                }`}
              >
                SDS 0.1M
              </button>
              <button
                onClick={() => handlePreset('mgcl2')}
                className={`px-2 py-1.5 rounded text-center font-['JetBrains_Mono'] text-xs transition-all ${
                  activePreset === 'mgcl2'
                    ? 'bg-[#003159] text-white font-bold shadow-sm'
                    : 'bg-[#d3e4fe] text-[#0b1c30] hover:bg-[#a0c9ff]'
                }`}
              >
                MgCl₂ 0.1M
              </button>
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between font-['JetBrains_Mono'] text-[11px] text-[#42474f]">
                <span>Sesuaikan Nilai Tegangan Permukaan (γ):</span>
                <span>{simGamma.toFixed(2)} mN/m</span>
              </div>
              <input
                className="w-full accent-[#003159] cursor-pointer h-2 bg-[#d3e4fe] rounded-lg"
                max="85"
                min="25"
                onChange={handleSliderChange}
                step="0.5"
                type="range"
                value={simGamma}
              />
            </div>
          </div>
        </div>

        {/* Right: Mathematical Framework */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          {/* Relative Capillary Rise Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0D9488]"></span>
                <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
                  Penurunan Rumus Kenaikan Kapiler Relatif
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#0D9488] font-['JetBrains_Mono'] text-xs font-semibold">
                Eliminasi Radius (r)
              </span>
            </div>

            <p className="font-['Inter'] text-sm text-[#42474f] leading-relaxed">
              Tegangan permukaan mutlak dinyatakan sebagai{' '}
              <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#003159]">
                γ = ½ ρ g r h
              </span>{' '}
              jika diasumsikan sudut kontak sempurna (θ ≈ 0°). Dalam metode praktikum relatif, penggunaan
              tabung kapiler yang identik mengeliminasi keharusan mengukur radius kapiler{' '}
              <span className="font-['JetBrains_Mono'] text-xs font-semibold">r</span> dan percepatan gravitasi{' '}
              <span className="font-['JetBrains_Mono'] text-xs font-semibold">g</span>:
            </p>

            <div className="bg-[#eff4ff] p-4 rounded-lg flex items-center justify-center border border-[#cbd5e1]/30">
              <div className="font-['JetBrains_Mono'] text-base md:text-lg text-[#003159] flex items-center gap-3 tracking-wide">
                <span>γ<sub>x</sub> = </span>
                <span className="flex flex-col items-center">
                  <span className="pb-1 border-b border-[#003159]/40 font-semibold">ρ<sub>x</sub> · h<sub>x</sub></span>
                  <span className="pt-1 font-semibold">ρ<sub>air</sub> · h<sub>air</sub></span>
                </span>
                <span>× γ<sub>air</sub>(T)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[#42474f] font-['Inter'] text-xs">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-[#0D9488] shrink-0 mt-0.5">check_circle</span>
                <span>
                  <strong>γ<sub>air</sub>(T) rujukan:</strong> Diperoleh via interpolasi tabel baku IAPWS pada suhu ruang terkalibrasi ({temperatureKelvin.toFixed(1)} K).
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-[#0D9488] shrink-0 mt-0.5">check_circle</span>
                <span>
                  <strong>Densitas (ρ):</strong> Ditentukan secara presisi melalui piknometer 5.000 mL tertimbang neraca 4 desimal.
                </span>
              </div>
            </div>
          </div>

          {/* Gibbs Adsorption Isotherm Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#7C3AED]"></span>
                <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
                  Persamaan Isoterm Adsorpsi Gibbs
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#7C3AED] font-['JetBrains_Mono'] text-xs font-semibold">
                Surface Excess (Γ)
              </span>
            </div>

            <p className="font-['Inter'] text-sm text-[#42474f]">
              Kerapatan kelebihan zat terlarut pada lapisan antarmuka larutan-udara dirumuskan oleh J. Willard Gibbs:
            </p>

            <div className="bg-[#eff4ff] p-4 rounded-lg flex flex-col md:flex-row items-center justify-around gap-4 border border-[#cbd5e1]/30">
              <div className="font-['JetBrains_Mono'] text-base md:text-lg text-[#7C3AED] font-bold tracking-wider">
                Γ = − <span className="inline-flex flex-col items-center align-middle mx-1">
                  <span className="border-b border-[#7C3AED]/40 pb-0.5">C</span>
                  <span className="pt-0.5">R · T</span>
                </span> · <span className="inline-flex flex-col items-center align-middle mx-1">
                  <span className="border-b border-[#7C3AED]/40 pb-0.5">dγ</span>
                  <span className="pt-0.5">dC</span>
                </span>
              </div>
              <div className="text-[#42474f] font-['JetBrains_Mono'] text-xs flex flex-col gap-1">
                <div><span className="text-[#003159] font-bold">R</span> = 8.314 J/(mol·K)</div>
                <div><span className="text-[#003159] font-bold">C</span> = Konsentrasi terlarut (mol/m³)</div>
                <div><span className="text-[#003159] font-bold">dγ/dC</span> = Gradien respon kurva tegangan</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-[#eff4ff] flex flex-col gap-1 border border-[#cbd5e1]/30">
                <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-xs text-[#7C3AED] font-bold">
                  <span className="material-symbols-outlined text-base">bubble_chart</span>
                  <span>Surfaktan (SDS &amp; Deterjen)</span>
                </div>
                <p className="font-['Inter'] text-xs text-[#42474f] leading-relaxed">
                  <strong>dγ/dC &lt; 0 → Γ &gt; 0 (Adsorpsi Positif).</strong> Molekul amfifilik bermigrasi ke permukaan membentuk monolayer teratur, menurunkan energi kohesi air.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#eff4ff] flex flex-col gap-1 border border-[#cbd5e1]/30">
                <div className="flex items-center gap-1.5 font-['JetBrains_Mono'] text-xs text-[#D97706] font-bold">
                  <span className="material-symbols-outlined text-base">bolt</span>
                  <span>Elektrolit Kuat (MgCl₂)</span>
                </div>
                <p className="font-['Inter'] text-xs text-[#42474f] leading-relaxed">
                  <strong>dγ/dC ≥ 0 → Γ ≤ 0 (Adsorpsi Negatif).</strong> Hidrasi kuat ion Mg<sup>2+</sup> &amp; Cl<sup>−</sup> menarik air ke bulk solution, menjauhkannya dari antarmuka (Efek Jones–Ray).
                </p>
              </div>
            </div>
          </div>

          {/* Assumption Banner */}
          <div className="bg-[#e5eeff] px-4 py-2.5 rounded-lg flex items-center justify-between text-[#42474f] font-['JetBrains_Mono'] text-xs border border-[#cbd5e1]/40">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[#EAB308]">info</span>
              <span><strong>Asumsi Utama:</strong> Kapiler borosilikat bersih sempurna (θ = 0°), suhu larutan isotermal {temperatureKelvin.toFixed(2)} K.</span>
            </div>
            <span className="text-[#003159] font-bold hidden sm:inline">Modul Kimia Fisik UI</span>
          </div>
        </div>
      </div>
    </section>
  );
};
