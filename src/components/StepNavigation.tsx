import React from "react";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
}

const STEP_LABELS = [
  "Teori & Konsep",
  "Prosedur & Alat",
  "Lembar Kerja",
  "Analisis & Kurva",
  "Ekspor Laporan",
];

const SHORT_LABELS = [
  "Teori",
  "Prosedur",
  "Input",
  "Analisis",
  "Ekspor",
];

export const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
}) => {
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#cbd5e1]/50 shadow-[0_-4px_20px_-4px_rgba(15,23,42,0.08)] no-print">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className={`flex items-center justify-center gap-2 p-2.5 sm:px-5 sm:py-2.5 rounded-xl font-["JetBrains_Mono"] text-sm font-semibold transition-all min-w-[44px] ${
            isFirst
              ? "text-[#cbd5e1] cursor-not-allowed"
              : "text-[#003159] border-2 border-[#003159] hover:bg-[#eff4ff] active:scale-95"
          }`}
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          <span className="hidden sm:inline">Kembali</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === currentStep
                  ? "w-4 sm:w-6 h-2 sm:h-2.5 bg-[#003159]"
                  : i < currentStep
                  ? "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[#0D9488]"
                  : "w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[#e2e8f0]"
              }`}
            />
          ))}
          <span className="ml-1 sm:ml-2 font-[JetBrains_Mono] text-[10px] sm:text-[11px] text-[#94a3b8] whitespace-nowrap">
            {currentStep + 1}/{totalSteps}
          </span>
        </div>

        <button
          onClick={onNext}
          className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2.5 sm:px-6 sm:py-2.5 rounded-xl font-["JetBrains_Mono"] text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-sm whitespace-nowrap min-w-[100px] sm:min-w-0 ${
            isLast
              ? "bg-[#0D9488] text-white hover:bg-[#0a7c70]"
              : "bg-[#003159] text-white hover:bg-[#0e487a]"
          }`}
        >
          {isLast ? (
            <>
              <span className="material-symbols-outlined text-sm sm:text-base">download</span>
              <span className="hidden sm:inline">Ekspor Laporan</span>
              <span className="sm:hidden">Ekspor</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">{STEP_LABELS[currentStep + 1]}</span>
              <span className="sm:hidden">{SHORT_LABELS[currentStep + 1]}</span>
              <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};