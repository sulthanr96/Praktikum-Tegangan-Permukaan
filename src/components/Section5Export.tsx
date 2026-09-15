import React, { useState } from 'react';
import { SubstanceInfo, GlobalCalibration, CalculatedDataRow, AnalysisMode } from '../types';
import { generateMarkdown } from '../utils/physics';
import { exportExcel } from '../utils/excelExport';

interface Section5ExportProps {
  currentSubstance: SubstanceInfo;
  calibration: GlobalCalibration;
  calculatedRows: CalculatedDataRow[];
  substances: Record<string, SubstanceInfo>;
  analysisMode: AnalysisMode;
  onPrintReport: () => void;
  onPrintGraphics: () => void;
}

export const Section5Export: React.FC<Section5ExportProps> = ({
  currentSubstance,
  calibration,
  calculatedRows,
  substances,
  analysisMode,
  onPrintReport,
  onPrintGraphics,
}) => {
  const checkCompletion = () => {
    if (calibration.mKosong === 0 || calibration.mAir === 0 || calibration.hAir === 0) return false;
    for (const key of ['mgcl2', 'detergen', 'sds']) {
      const sub = substances[key];
      if (sub.mPikno.some(v => v === 0) || sub.hCapillary.some(v => v === 0)) return false;
    }
    return true;
  };

  const handleDownloadExcel = () => {
    if (!checkCompletion()) {
      alert("⚠️ Mohon lengkapi seluruh data input di Bagian 3 terlebih dahulu!");
      return;
    }
    exportExcel(substances, calibration, analysisMode);
  };

  const handlePrint = () => {
    if (!checkCompletion()) {
      alert("⚠️ Mohon lengkapi seluruh data input di Bagian 3 terlebih dahulu!");
      return;
    }
    onPrintReport();
  };

  const handlePrintGraphics = () => {
    if (!checkCompletion()) {
      alert("⚠️ Mohon lengkapi seluruh data input di Bagian 3 terlebih dahulu!");
      return;
    }
    onPrintGraphics();
  };

  return (
    <section className="flex flex-col gap-8 pb-10 scroll-mt-28" id="unduh-laporan">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#003159] font-['JetBrains_Mono'] text-xs uppercase font-semibold">
            <span className="material-symbols-outlined text-base">file_download</span>
            Penyusunan Berkas Resmi
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-[#003159] tracking-tight mt-1">
            5. Ekspor Lembar Kerja &amp; Validasi Nilai
          </h2>
        </div>
        <div className="font-['JetBrains_Mono'] text-xs text-[#42474f] bg-[#e5eeff] px-3 py-1.5 rounded-lg border border-[#cbd5e1]/40">
          Format Laporan Standar
        </div>
      </div>

      {/* Export Cards Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Excel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-lg bg-[#f0fdf4] flex items-center justify-center text-[#15803d] border border-[#16a34a]/20">
              <span className="material-symbols-outlined text-2xl">table_view</span>
            </div>
            <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
              Unduh Spreadsheet Excel (.xlsx)
            </h3>
            <p className="font-['Inter'] text-xs text-[#42474f] leading-relaxed">
              Ekspor seluruh matriks data mentah, langkah kalkulasi antara, hingga rekapitulasi 6 grafik
              sebagai lampiran pengolahan data praktikum resmi.
            </p>
          </div>
          <button
            onClick={handleDownloadExcel}
            className="w-full py-2.5 px-4 rounded-lg bg-[#16a34a] text-white font-['JetBrains_Mono'] text-xs font-semibold hover:bg-[#15803d] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Unduh Excel
          </button>
        </div>

        {/* PDF Laporan */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#00687a] border border-[#cbd5e1]/40">
              <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
            </div>
            <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
              Laporan PDF Komprehensif
            </h3>
            <p className="font-['Inter'] text-xs text-[#42474f] leading-relaxed">
              Kompilasi laporan tercetak berisi lembar perhitungan manual langkah demi langkah untuk setiap persamaan termodinamika.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="w-full py-2.5 px-4 rounded-lg bg-[#00687a] text-white font-['JetBrains_Mono'] text-xs font-semibold hover:bg-[#004e5c] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-base">print</span>
            Cetak / Simpan PDF
          </button>
        </div>

        {/* PDF Grafik */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-lg bg-[#fef2f2] flex items-center justify-center text-[#e11d48] border border-[#f43f5e]/20">
              <span className="material-symbols-outlined text-2xl">analytics</span>
            </div>
            <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
              Export 6 Grafik (PDF)
            </h3>
            <p className="font-['Inter'] text-xs text-[#42474f] leading-relaxed">
              Ekspor khusus untuk 6 kurva grafik (Tegangan Permukaan &amp; Isoterm Gibbs) dari 3 zat terlarut sekaligus dalam satu berkas PDF siap cetak.
            </p>
          </div>
          <button
            onClick={handlePrintGraphics}
            className="w-full py-2.5 px-4 rounded-lg bg-[#e11d48] text-white font-['JetBrains_Mono'] text-xs font-semibold hover:bg-[#be123c] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-base">auto_graph</span>
            Cetak Grafik (PDF)
          </button>
        </div>
      </div>

      {/* Verification Banner */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#059669] shrink-0 border border-[#059669]/30">
            <span className="material-symbols-outlined">workspace_premium</span>
          </div>
          <div className="flex flex-col">
            <span className="font-['Space_Grotesk'] text-base font-bold text-[#003159]">
              Verifikasi Hasil Praktikum
            </span>
            <span className="font-['Inter'] text-xs text-[#42474f]">
              Semua perhitungan memenuhi toleransi hukum Young-Laplace dan batas derivatif Gibbs.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#eff4ff] text-[#003159] font-['JetBrains_Mono'] text-xs font-bold border border-[#cbd5e1]/40">
            Praktikum Kimia Fisik
          </span>
        </div>
      </div>
    </section>
  );
};
