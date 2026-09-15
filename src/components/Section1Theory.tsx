import React, { useState } from 'react';

interface Section1TheoryProps {
  temperatureKelvin: number;
}

export const Section1Theory: React.FC<Section1TheoryProps> = ({ temperatureKelvin }) => {
  const [activeTab, setActiveTab] = useState<'tujuan' | 'kapiler' | 'gibbs'>('tujuan');
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

  const minGamma = 25;
  const maxGamma = 85;
  const clampedGamma = Math.max(minGamma, Math.min(maxGamma, simGamma));
  const norm = (clampedGamma - minGamma) / (maxGamma - minGamma);

  return (
    <section className="flex flex-col gap-6 scroll-mt-28" id="pendahuluan">
      {/* Section Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[#0D9488] font-['JetBrains_Mono'] text-xs uppercase font-semibold">
          <span className="material-symbols-outlined text-base">book</span>
          Referensi Diktat Modul
        </div>
        <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-[#003159] tracking-tight">
          1. Tujuan & Latar Belakang Teori
        </h2>
        <p className="font-['Inter'] text-sm text-[#64748b] max-w-3xl">
          Dasar teori tegangan permukaan, metode kapiler, dan isoterm adsorpsi Gibbs berdasarkan Modul Praktikum Kimia Fisika.
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-1 bg-[#f1f5f9] rounded-xl p-1 w-full md:w-fit">
        <button
          onClick={() => setActiveTab('tujuan')}
          className={`flex items-center justify-center flex-1 sm:flex-none gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-['JetBrains_Mono'] text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'tujuan'
              ? 'bg-white text-[#D97706] shadow-sm'
              : 'text-[#64748b] hover:text-[#D97706]'
          }`}
        >
          <span className="material-symbols-outlined text-sm sm:text-base">target</span>
          Tujuan & Teori
        </button>
        <button
          onClick={() => setActiveTab('kapiler')}
          className={`flex items-center justify-center flex-1 sm:flex-none gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-['JetBrains_Mono'] text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'kapiler'
              ? 'bg-white text-[#003159] shadow-sm'
              : 'text-[#64748b] hover:text-[#003159]'
          }`}
        >
          <span className="material-symbols-outlined text-sm sm:text-base">water_drop</span>
          Metode Kapiler
        </button>
        <button
          onClick={() => setActiveTab('gibbs')}
          className={`flex items-center justify-center flex-1 sm:flex-none gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-['JetBrains_Mono'] text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'gibbs'
              ? 'bg-white text-[#0D9488] shadow-sm'
              : 'text-[#64748b] hover:text-[#0D9488]'
          }`}
        >
          <span className="material-symbols-outlined text-sm sm:text-base">scatter_plot</span>
          Adsorpsi Gibbs
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'tujuan' && (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Text Content */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#cbd5e1]/60">
              <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#003159] mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D97706]">emoji_objects</span>
                Tujuan Praktikum
              </h3>
              <ul className="list-disc pl-5 font-['Inter'] text-sm text-[#42474f] space-y-2">
                <li>Menentukan tegangan permukaan cairan dengan menggunakan metoda kapiler.</li>
                <li>Menentukan harga konsentrasi berlebih (<i>Surface Excess</i>, Γ) dengan menggunakan persamaan adsorpsi Gibbs.</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#cbd5e1]/60">
              <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#003159] mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0D9488]">science</span>
                Latar Belakang Teori
              </h3>
              <div className="font-['Inter'] text-sm text-[#42474f] space-y-3 leading-relaxed">
                <p>
                  Molekul pada permukaan cairan mengalami resultan gaya yang mengarah ke dalam rongga cairan. 
                  Hal ini disebabkan karena <strong>gaya kohesi</strong> (tarik-menarik antar molekul cairan) 
                  jauh lebih besar dibandingkan <strong>gaya adhesi</strong> dengan molekul uap/udara di atasnya.
                </p>
                <p>
                  Akibatnya, permukaan cairan cenderung mengerut untuk mencapai luas permukaan sekecil mungkin. 
                  Fenomena inilah yang disebut dengan <strong>tegangan permukaan (γ)</strong>.
                </p>
                <div className="bg-[#eff4ff] p-4 rounded-lg my-4 text-center border border-[#cbd5e1]/40">
                  <p className="font-semibold text-[#003159]">
                    Tegangan permukaan didefinisikan sebagai gaya per satuan panjang (f/l) yang bekerja secara tangensial.
                  </p>
                  <p className="font-['JetBrains_Mono'] mt-2 text-[#0D9488] font-bold text-lg">
                    γ = f / l
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Diagrams */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col items-center">
              <h4 className="font-['JetBrains_Mono'] text-xs font-bold text-[#64748b] mb-4 uppercase tracking-wider">Gambar 14.1 - Resultan Gaya Molekul</h4>
              <svg viewBox="0 0 300 200" className="w-full max-w-[280px]">
                {/* Vapor Phase */}
                <rect x="10" y="10" width="280" height="60" fill="#f8fafc" stroke="#cbd5e1" />
                <text x="150" y="45" textAnchor="middle" fill="#64748b" className="font-sans text-sm font-semibold">Vapor phase</text>
                
                {/* Liquid Phase */}
                <rect x="10" y="70" width="280" height="120" fill="#e0e7ff" stroke="#cbd5e1" />
                <text x="150" y="180" textAnchor="middle" fill="#3b82f6" className="font-sans text-sm font-semibold">Liquid phase</text>

                {/* Surface Molecule */}
                <circle cx="150" cy="70" r="12" fill="#a855f7" />
                <circle cx="150" cy="70" r="4" fill="#fff" />
                <path d="M150 70 L150 100" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />
                <path d="M150 70 L120 70" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />
                <path d="M150 70 L180 70" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />
                <path d="M150 70 L125 95" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />
                <path d="M150 70 L175 95" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />

                {/* Bulk Molecule */}
                <circle cx="150" cy="135" r="12" fill="#a855f7" />
                <circle cx="150" cy="135" r="4" fill="#fff" />
                <path d="M150 135 L150 105" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />
                <path d="M150 135 L150 165" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />
                <path d="M150 135 L120 135" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />
                <path d="M150 135 L180 135" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />
                <path d="M150 135 L128 113" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />
                <path d="M150 135 L172 157" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />
                <path d="M150 135 L172 113" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />
                <path d="M150 135 L128 157" stroke="#a855f7" strokeWidth="3" markerEnd="url(#arrow)" />

                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
                  </marker>
                </defs>
              </svg>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col items-center">
              <h4 className="font-['JetBrains_Mono'] text-xs font-bold text-[#64748b] mb-4 uppercase tracking-wider">Gambar 14.2 - Kerja Permukaan</h4>
              <svg viewBox="0 0 300 150" className="w-full max-w-[280px]">
                {/* U-Frame */}
                <path d="M 250 20 L 50 20 L 50 130 L 250 130" fill="none" stroke="#334155" strokeWidth="3" />
                
                {/* Sliding Wire */}
                <line x1="150" y1="10" x2="150" y2="140" stroke="#334155" strokeWidth="4" />
                <line x1="150" y1="20" x2="150" y2="130" stroke="#334155" strokeWidth="4" strokeDasharray="5,5" opacity="0.3" transform="translate(40,0)" />

                {/* Force Arrow F */}
                <path d="M 150 75 L 210 75" stroke="#3b82f6" strokeWidth="3" markerEnd="url(#arrow-blue)" />
                <text x="220" y="80" fill="#3b82f6" className="font-['JetBrains_Mono'] font-bold">F</text>

                {/* dx Arrow */}
                <path d="M 150 15 L 190 15" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow-gray)" markerStart="url(#arrow-gray)" />
                <text x="165" y="10" fill="#64748b" className="font-['JetBrains_Mono'] text-xs font-bold">dx</text>

                {/* length l Arrow */}
                <path d="M 30 20 L 30 130" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow-gray)" markerStart="url(#arrow-gray)" />
                <text x="15" y="80" fill="#64748b" className="font-['JetBrains_Mono'] text-xs font-bold">l</text>

                <defs>
                  <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                  </marker>
                  <marker id="arrow-gray" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                  </marker>
                </defs>
              </svg>
              <p className="text-center font-['Inter'] text-xs text-[#42474f] mt-3">
                Kerja yang dilakukan untuk memperbesar luas permukaan:<br/>
                <span className="font-['JetBrains_Mono'] font-bold">dw = f · dx = γ l dx = γ dA</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'kapiler' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-xl p-6 shadow-sm border border-[#cbd5e1]/60 flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
                  Simulasi Meniskus Kapiler
                </span>
                <span className="font-['Inter'] text-xs text-[#42474f]">
                  Model kenaikan cairan dalam pipa kapiler
                </span>
              </div>
              <span className="p-2 rounded-lg bg-[#e5eeff] text-[#0D9488] material-symbols-outlined">
                fluid_med
              </span>
            </div>

            <div className="relative w-full h-80 my-4 bg-[#eff4ff] rounded-lg p-4 flex items-center justify-center overflow-hidden border border-[#cbd5e1]/40">
              <svg className="w-full h-full max-w-[280px]" viewBox="0 0 280 260">
                <rect fill="#e2e8f0" fillOpacity="0.5" height="60" rx="8" width="210" x="35" y="190" />
                <path d="M 36 210 Q 70 212 140 210 T 244 210 L 244 248 Q 244 250 240 250 L 40 250 Q 36 250 36 248 Z" fill="#0D9488" fillOpacity="0.45" />
                <rect fill="none" height="210" opacity="0.75" rx="2" stroke="#727780" strokeDasharray="2 1" strokeWidth="2.5" width="48" x="116" y="25" />
                <rect fill="#ffffff" fillOpacity="0.3" height="215" rx="0" width="36" x="122" y="20" />
                <path d={`M 122 ${210} L 122 ${210 - norm * 140} Q 140 ${210 - norm * 140 + 15} 158 ${210 - norm * 140} L 158 ${210} Z`} fill="#0D9488" fillOpacity="0.75" />
                <path d={`M 122 ${210 - norm * 140} Q 140 ${210 - norm * 140 + 15} 158 ${210 - norm * 140}`} fill="none" stroke="#0f766e" strokeWidth="2" />
                
                <path d={`M 170 210 L 190 210`} stroke="#003159" strokeWidth="1.5" strokeDasharray="2,2" />
                <path d={`M 170 ${210 - norm * 140} L 190 ${210 - norm * 140}`} stroke="#003159" strokeWidth="1.5" strokeDasharray="2,2" />
                <path d={`M 180 210 L 180 ${210 - norm * 140}`} stroke="#003159" strokeWidth="1.5" markerStart="url(#arrow)" markerEnd="url(#arrow)" />
                
                <text fill="#003159" fontSize="12" fontWeight="bold" x="195" y={210 - (norm * 140)/2 + 4}>h</text>
                <text fill="#ffffff" fontSize="24" fontWeight="bold" opacity="0.1" x="140" y="240" textAnchor="middle">AIR</text>
              </svg>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm font-['JetBrains_Mono']">
                <span className="text-[#64748b]">Simulasi γ (mN/m):</span>
                <span className="font-bold text-[#0D9488]">{simGamma.toFixed(2)}</span>
              </div>
              <input
                className="w-full h-2 bg-[#cbd5e1] rounded-lg appearance-none cursor-pointer accent-[#0D9488]"
                max="85"
                min="25"
                onChange={handleSliderChange}
                step="0.5"
                type="range"
                value={simGamma}
              />
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#0D9488]"></span>
                  <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
                    Metode Kapiler
                  </h3>
                </div>
              </div>

              <p className="font-['Inter'] text-sm text-[#42474f] leading-relaxed">
                Jika pipa kapiler berjari-jari <strong>r</strong> dicelupkan ke dalam cairan, permukaan cairan di dalamnya akan naik setinggi <strong>h</strong>. 
                Saat kesetimbangan tercapai, gaya gravitasi (berat kolom cairan) sama dengan gaya tegangan permukaan ke atas.
              </p>

              <ul className="list-disc pl-5 font-['Inter'] text-sm text-[#42474f] space-y-1 mb-2">
                <li>Gaya gravitasi ke bawah = <span className="font-['JetBrains_Mono']">m g = π r² h ρ g</span></li>
                <li>Gaya tegangan ke atas = <span className="font-['JetBrains_Mono']">2 π r γ cos(θ)</span></li>
              </ul>

              <div className="bg-[#eff4ff] p-4 rounded-lg flex items-center justify-center border border-[#cbd5e1]/30">
                <div className="font-['JetBrains_Mono'] text-base md:text-lg text-[#003159] flex items-center gap-3 tracking-wide">
                  <span>γ = </span>
                  <span className="flex flex-col items-center">
                    <span className="pb-1 border-b border-[#003159]/40 font-semibold">ρ h r g</span>
                    <span className="pt-1 font-semibold">2 cos(θ)</span>
                  </span>
                </div>
              </div>

              <p className="font-['Inter'] text-sm text-[#42474f] leading-relaxed mt-2">
                Asumsi: Sudut kontak cairan dengan kaca sangat kecil sehingga cos(θ) ≈ 1.
                Karena jari-jari pipa (r) sulit diukur secara akurat, praktikum menggunakan metode pembandingan cairan terhadap <strong>Air</strong> pada pipa yang sama:
              </p>

              <div className="bg-[#eff4ff] p-4 rounded-lg flex items-center justify-center border border-[#cbd5e1]/30">
                <div className="font-['JetBrains_Mono'] text-base md:text-lg text-[#003159] flex items-center gap-3 tracking-wide">
                  <span>γ<sub>x</sub> = </span>
                  <span className="flex flex-col items-center">
                    <span className="pb-1 border-b border-[#003159]/40 font-semibold">ρ<sub>x</sub> · h<sub>x</sub></span>
                    <span className="pt-1 font-semibold">ρ<sub>air</sub> · h<sub>air</sub></span>
                  </span>
                  <span>x γ<sub>air</sub></span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === 'gibbs' && (
        <div className="flex flex-col gap-4 max-w-3xl">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#7C3AED]"></span>
                <h3 className="font-['Space_Grotesk'] font-bold text-xl text-[#003159]">
                  Persamaan Isoterm Adsorpsi Gibbs
                </h3>
              </div>
            </div>

            <p className="font-['Inter'] text-sm text-[#42474f]">
              Persamaan Gibbs digunakan untuk menghitung jumlah zat yang teradsorpsi pada permukaan. Konsentrasi zat terlarut pada permukaan biasanya berbeda dengan konsentrasi di dalam larutan (<i>bulk</i>).
            </p>

            <div className="bg-[#eff4ff] p-5 rounded-lg flex flex-col md:flex-row items-center justify-around gap-6 border border-[#cbd5e1]/30">
              <div className="font-['JetBrains_Mono'] text-xl text-[#7C3AED] font-bold tracking-wider">
                Γ = - <span className="inline-flex flex-col items-center align-middle mx-1">
                  <span className="border-b border-[#7C3AED]/40 pb-0.5">a</span>
                  <span className="pt-0.5">R T</span>
                </span> <span className="inline-flex flex-col items-center align-middle mx-1">
                  <span className="border-b border-[#7C3AED]/40 pb-0.5">dγ</span>
                  <span className="pt-0.5">da</span>
                </span>
                <span className="mx-2 text-black/40">≈</span>
                - <span className="inline-flex flex-col items-center align-middle mx-1">
                  <span className="border-b border-[#7C3AED]/40 pb-0.5">C</span>
                  <span className="pt-0.5">R T</span>
                </span> <span className="inline-flex flex-col items-center align-middle mx-1">
                  <span className="border-b border-[#7C3AED]/40 pb-0.5">dγ</span>
                  <span className="pt-0.5">dC</span>
                </span>
              </div>
              <div className="text-[#42474f] font-['JetBrains_Mono'] text-sm flex flex-col gap-2">
                <div><span className="text-[#003159] font-bold">Γ</span> = <i>Surface excess</i> (mol/m²)</div>
                <div><span className="text-[#003159] font-bold">a</span> = Aktivitas larutan</div>
                <div><span className="text-[#003159] font-bold">C</span> = Konsentrasi larutan (mol/m³)</div>
                <div><span className="text-[#003159] font-bold">R</span> = Tetapan gas (8.314)</div>
              </div>
            </div>

            <p className="font-['Inter'] text-sm text-[#42474f] mt-2">
              <strong>Kelebihan Permukaan (<i>Surface Excess</i>, Γ)</strong> adalah perbedaan antara konsentrasi molekul di antarmuka dengan konsentrasi di dalam cairan (bulk).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-white shadow-sm flex flex-col gap-3 border border-[#e9d5ff]">
              <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-sm text-[#7C3AED] font-bold">
                <span className="material-symbols-outlined">bubble_chart</span>
                Surfaktan (SDS & Deterjen)
              </div>
              <p className="font-['Inter'] text-sm text-[#42474f] leading-relaxed">
                Menurunkan tegangan permukaan seiring naiknya konsentrasi (<strong>dγ/dC &lt; 0</strong>), sehingga nilai <strong>Γ positif</strong>. Zat menumpuk di permukaan air.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white shadow-sm flex flex-col gap-3 border border-[#fde68a]">
              <div className="flex items-center gap-2 font-['JetBrains_Mono'] text-sm text-[#D97706] font-bold">
                <span className="material-symbols-outlined">bolt</span>
                Garam Elektrolit (MgCl₂)
              </div>
              <p className="font-['Inter'] text-sm text-[#42474f] leading-relaxed">
                Meningkatkan tegangan permukaan secara perlahan (<strong>dγ/dC &gt; 0</strong>), sehingga nilai <strong>Γ negatif</strong>. Ion-ion cenderung menjauhi permukaan.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
