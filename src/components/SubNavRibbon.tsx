import React from 'react';

interface SubNavRibbonProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const SubNavRibbon: React.FC<SubNavRibbonProps> = ({ activeSection, onNavigate }) => {
  const anchors = [
    { id: 'pendahuluan', label: '1. Teori Fisika', dotColor: 'bg-[#0D9488]' },
    { id: 'prosedur', label: '2. Prosedur & Alat', dotColor: 'bg-[#00687a]' },
    { id: 'lembar-kerja', label: '3. Data Input', dotColor: 'bg-[#7C3AED]' },
    { id: 'analisis-hasil', label: '4. Analisis & Grafik', dotColor: 'bg-[#00E5FF]' },
    { id: 'unduh-laporan', label: '5. Ekspor', isButton: true },
  ];

  return (
    <div className="sticky top-[108px] z-40 bg-white/90 backdrop-blur-md shadow-sm border-b border-[#cbd5e1]/40 no-print">
      <div className="max-w-[1400px] mx-auto px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-[#003159] text-white font-['JetBrains_Mono'] text-[11px] font-semibold tracking-wider uppercase">
            MODUL 04
          </span>
          <h1 className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
            Tegangan Permukaan Cairan &amp; Adsorpsi Gibbs
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {anchors.map((item) => {
            const isActive = activeSection === item.id;
            if (item.isButton) {
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="px-3 py-1 rounded text-white bg-[#003159] hover:bg-[#0e487a] transition-all font-['JetBrains_Mono'] text-xs flex items-center gap-1 shadow-sm font-semibold active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  {item.label}
                </button>
              );
            }
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1 rounded transition-colors font-['JetBrains_Mono'] text-xs flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#dce9ff] text-[#003159] font-bold'
                    : 'text-[#0b1c30] hover:bg-[#dce9ff]/60'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${item.dotColor}`}></span>
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
