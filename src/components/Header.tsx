import React from 'react';

interface HeaderProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onAutofillDemo: () => void;
  temperatureKelvin: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeSection,
  onNavigate,
  onAutofillDemo,
  temperatureKelvin,
}) => {
  const tempCelsius = (temperatureKelvin - 273.15).toFixed(0);

  const navItems = [
    { id: 'pendahuluan', label: '1. Teori & Konsep' },
    { id: 'prosedur', label: '2. Prosedur & Kalkulator' },
    { id: 'lembar-kerja', label: '3. Lembar Kerja Input' },
    { id: 'analisis-hasil', label: '4. Analisis & Kurva' },
    { id: 'unduh-laporan', label: '5. Ekspor Laporan' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl shadow-[0_4px_20px_-2px_rgba(15,23,42,0.04)] border-b border-[#cbd5e1]/40">
      <div className="h-20 max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-4">
        {/* Logo and Department */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 rounded-xl bg-[#dce9ff] text-[#003159]">
            <span className="material-symbols-outlined text-2xl">science</span>
          </div>
          <div className="flex flex-col">
            <span className="font-['Space_Grotesk'] font-bold text-lg text-[#003159] tracking-tight">
              SURFTEN LAB
            </span>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#42474f] uppercase tracking-wider">
              Praktikum Kimia Fisik · Dept. Kimia UI
            </span>
          </div>
        </div>

        {/* Navigation bar */}
        <nav className="hidden xl:flex items-center gap-1 px-2 py-1 bg-[#eff4ff] rounded-xl">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Inter'] transition-all ${
                  isActive
                    ? 'bg-[#0e487a] text-white font-semibold shadow-sm'
                    : 'text-[#42474f] hover:bg-[#dce9ff] hover:text-[#0b1c30]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Actions and Status */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#e5eeff]">
            <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#003159] font-semibold">
              Status: Siap Isi Data
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-[#dce9ff] text-[#0b1c30]">
            <span className="material-symbols-outlined text-sm text-[#003159]">device_thermostat</span>
            <span className="font-['JetBrains_Mono'] text-xs font-medium">
              {temperatureKelvin.toFixed(2)} K ({tempCelsius}°C)
            </span>
          </div>

          <button
            onClick={onAutofillDemo}
            type="button"
            className="px-3.5 py-1.5 rounded-lg bg-[#003159] text-white font-['JetBrains_Mono'] text-xs font-medium hover:bg-[#0e487a] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">play_circle</span>
            <span className="hidden lg:inline">Isi Data Demo</span>
          </button>

          <img
            alt="Profile Avatar"
            className="w-8 h-8 rounded-full object-cover border border-[#cbd5e1]"
            src="https://lh3.googleusercontent.com/aida/AEtjO1XfpBF_yu04ZBpC4NzIKLMUJcbqT3vwZ4KgbN993VjKQ53HSzEhld6ldMzeHPE0vMeWH9xSAKB_Xp-VMIHOshYWswJfPMNLaMjqIWV4FahxIGGkRYqPpXuTl5Wljqfsk4sX4szD0LQAP2759NJmHrYo2gN5rcEhrzs8obeLJHC1jDdEfttlxlHQGq3uLpi3YGHcK5lsLk9WRp9N5Dd2xHhQwFGtTjktW1oKC1Hc68XfRZO4jz4j8Iz6TnFA"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Breadcrumb and methodology ribbon */}
      <div className="bg-[#eff4ff]/80 border-t border-[#cbd5e1]/30">
        <div className="max-w-[1400px] mx-auto px-6 py-1.5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-['JetBrains_Mono'] text-[#42474f]">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e5eeff] text-[#003159] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#003159]"></span>Pendahuluan
            </span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>Prosedur</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>Input Data</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>Pengolahan Data</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span>Unduh Hasil</span>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#e5eeff] text-[#00687a] font-medium">
              Metode: Kenaikan Kapiler Relatif
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#e5eeff] text-[#003159] font-medium">
              Zat: MgCl₂ · Deterjen · SDS
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#e5eeff] text-[#7C3AED] font-medium">
              Isoterm Gibbs Adsorpsi
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
