import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white shadow-[0_-4px_20px_-2px_rgba(15,23,42,0.03)] mt-4 border-t border-[#cbd5e1]/40">
      <div className="max-w-[1400px] mx-auto px-6 py-6 sm:py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <span className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
            SRS Lab
          </span>
          <span className="font-['Inter'] text-xs text-[#42474f]">
            Kalkulator Praktikum Kimia Fisik
          </span>
          <div className="hidden sm:flex flex-wrap items-center gap-2 mt-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#eff4ff] font-['JetBrains_Mono'] text-xs text-[#00687a] font-medium border border-[#cbd5e1]/40">
              Client-side Engine: Reactive React + Vite
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-[#eff4ff] font-['JetBrains_Mono'] text-xs text-[#003159] font-medium border border-[#cbd5e1]/40">
              KaTeX Formula Formatting
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-[#eff4ff] font-['JetBrains_Mono'] text-xs text-[#0D9488] font-medium border border-[#cbd5e1]/40">
              Interactive SVG Visualizer
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[#42474f] font-['JetBrains_Mono'] text-xs">
          <a
            className="hover:text-[#003159] transition-colors flex items-center gap-1"
            href="#prosedur"
          >
            <span className="material-symbols-outlined text-sm">menu_book</span>
            SOP Laboratorium
          </a>
          <a
            className="hover:text-[#003159] transition-colors flex items-center gap-1"
            href="#pendahuluan"
          >
            <span className="material-symbols-outlined text-sm">table_chart</span>
            Tabel γ Air Standar
          </a>
          <a
            className="hover:text-[#003159] transition-colors flex items-center gap-1"
            href="#prosedur"
          >
            <span className="material-symbols-outlined text-sm">shield</span>
            MSDS SDS &amp; MgCl₂
          </a>
        </div>
      </div>

      <div className="bg-[#eff4ff] py-3 border-t border-[#cbd5e1]/30">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[#42474f] font-['JetBrains_Mono'] text-xs">
          <span>© 2025 Kalkulator Praktikum · Kalkulator Praktikum Kimia Fisik</span>
          <span>Presisi Kalibrasi Kapiler &amp; Persamaan Gibbs</span>
        </div>
      </div>
    </footer>
  );
};
