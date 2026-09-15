import React from 'react';

interface SubNavRibbonProps {
  currentStep: number;
  onNavigate: (step: number) => void;
}

const STEPS = [
  { icon: 'school', label: 'Teori', color: 'text-[#0D9488]' },
  { icon: 'architecture', label: 'Prosedur', color: 'text-[#00687a]' },
  { icon: 'edit_note', label: 'Data Input', color: 'text-[#7C3AED]' },
  { icon: 'analytics', label: 'Analisis', color: 'text-[#0ea5e9]' },
  { icon: 'download', label: 'Ekspor', color: 'text-[#003159]' },
];

export const SubNavRibbon: React.FC<SubNavRibbonProps> = ({ currentStep, onNavigate }) => {
  return (
    <div className="sticky top-14 z-40 bg-white border-b border-[#cbd5e1]/50 shadow-sm no-print">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Step tabs */}
        <div className="flex items-stretch overflow-x-auto">
          {STEPS.map((step, i) => {
            const isDone = i < currentStep;
            const isActive = i === currentStep;
            return (
              <button
                key={i}
                onClick={() => onNavigate(i)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap font-['JetBrains_Mono'] text-xs font-medium ${
                  isActive
                    ? 'border-[#003159] text-[#003159] bg-[#eff4ff]/60'
                    : isDone
                    ? 'border-[#0D9488] text-[#0D9488] hover:bg-[#f0fdf9]'
                    : 'border-transparent text-[#94a3b8] hover:text-[#64748b] hover:border-[#cbd5e1]'
                }`}
              >
                {isDone ? (
                  <span className="material-symbols-outlined text-sm text-[#0D9488]">check_circle</span>
                ) : (
                  <span className={`material-symbols-outlined text-sm ${isActive ? 'text-[#003159]' : 'text-[#cbd5e1]'}`}>
                    {step.icon}
                  </span>
                )}
                <span className="hidden sm:inline">{i + 1}. {step.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
