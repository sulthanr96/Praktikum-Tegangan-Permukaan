import React from 'react';

interface HeaderProps {
  currentStep: number;
  totalSteps: number;
  onAutofillDemo: () => void;
  temperatureKelvin: number;
  role?: string;
  view?: 'kalkulator' | 'admin';
  onToggleView?: () => void;
}

const STEP_LABELS = [
  'Teori & Konsep',
  'Prosedur & Alat',
  'Lembar Kerja',
  'Analisis & Kurva',
  'Ekspor Laporan',
];

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  totalSteps,
  onAutofillDemo,
  temperatureKelvin,
  role,
  view,
  onToggleView,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-[0_2px_16px_-2px_rgba(15,23,42,0.06)] border-b border-[#cbd5e1]/40">
      <div className="h-14 max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="p-1 sm:p-1.5 rounded-lg bg-[#dce9ff] text-[#003159]">
            <span className="material-symbols-outlined text-lg sm:text-xl">science</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-['Space_Grotesk'] font-bold text-sm sm:text-base text-[#003159] tracking-tight">
              <span className="hidden sm:inline">Kalkulator Praktikum</span>
              <span className="sm:hidden">Kalkulator</span>
            </span>
            <span className="hidden sm:block font-['JetBrains_Mono'] text-[9px] text-[#42474f] uppercase tracking-wider mt-0.5">
              Kimia Fisik · SRS Lab
            </span>
          </div>
        </div>

        {/* Center: Step Progress Bar */}
        <div className="flex-1 flex flex-col items-center gap-1 max-w-sm mx-4">
          <div className="flex items-center gap-1 w-full justify-center">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i < currentStep
                    ? 'bg-[#0D9488] flex-1'
                    : i === currentStep
                    ? 'bg-[#003159] flex-[2]'
                    : 'bg-[#e2e8f0] flex-1'
                }`}
              />
            ))}
          </div>
          <span className="font-['JetBrains_Mono'] text-[10px] text-[#42474f] hidden sm:block">
            <span className="text-[#003159] font-bold">{STEP_LABELS[currentStep]}</span>
            <span className="text-[#94a3b8]"> · Langkah {currentStep + 1}/{totalSteps}</span>
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#dce9ff] text-[#0b1c30]">
            <span className="material-symbols-outlined text-sm text-[#003159]">device_thermostat</span>
            <span className="font-['JetBrains_Mono'] text-xs font-medium">
              {temperatureKelvin.toFixed(1)} K
            </span>
          </div>

          {role === 'admin' && (
            <button
              onClick={onToggleView}
              type="button"
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-[#0D9488] text-[#0D9488] font-['JetBrains_Mono'] text-xs font-bold hover:bg-[#0D9488] hover:text-white transition-all flex items-center gap-1.5 active:scale-95 bg-white shrink-0"
              title={view === 'admin' ? 'Kalkulator' : 'Panel Admin'}
            >
              <span className="material-symbols-outlined text-sm sm:text-sm">
                {view === 'admin' ? 'calculate' : 'admin_panel_settings'}
              </span>
              <span className="hidden sm:inline">
                {view === 'admin' ? 'Kalkulator' : 'Panel Admin'}
              </span>
            </button>
          )}

          {view === 'kalkulator' && (
            <button
              onClick={onAutofillDemo}
              type="button"
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[#003159] text-white font-['JetBrains_Mono'] text-xs font-medium hover:bg-[#0e487a] transition-all flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
              title="Isi Demo"
            >
              <span className="material-symbols-outlined text-sm sm:text-sm">play_circle</span>
              <span className="hidden sm:inline">Isi Demo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
