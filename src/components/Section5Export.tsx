import React, { useState } from 'react';
import { SubstanceInfo, GlobalCalibration, CalculatedDataRow } from '../types';
import { generateCSV, generateMarkdown } from '../utils/physics';

interface Section5ExportProps {
  currentSubstance: SubstanceInfo;
  calibration: GlobalCalibration;
  calculatedRows: CalculatedDataRow[];
}

export const Section5Export: React.FC<Section5ExportProps> = ({
  currentSubstance,
  calibration,
  calculatedRows,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleDownloadCSV = () => {
    const csvContent = generateCSV(currentSubstance, calibration, calculatedRows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_TeganganPermukaan_${currentSubstance.id}_UI.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdown(currentSubstance, calculatedRows);
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
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
          Format Terstandar Departemen Kimia UI
        </div>
      </div>

      {/* Export Cards Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CSV */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#0D9488] border border-[#cbd5e1]/40">
              <span className="material-symbols-outlined text-2xl">table_view</span>
            </div>
            <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
              Lembar Kerja Excel (.csv / .xlsx)
            </h3>
            <p className="font-['Inter'] text-xs text-[#42474f] leading-relaxed">
              Ekspor seluruh data mentah piknometer, observasi kenaikan kapiler 15 baris, dan hasil pengolahan Gibbs ke format
              spreadsheet yang kompatibel dengan Microsoft Excel dan Google Sheets.
            </p>
          </div>
          <button
            onClick={handleDownloadCSV}
            className="w-full py-2.5 px-4 rounded-lg bg-[#003159] text-white font-['JetBrains_Mono'] text-xs font-semibold hover:bg-[#0e487a] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Unduh Dataset CSV
          </button>
        </div>

        {/* Print / PDF */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#00687a] border border-[#cbd5e1]/40">
              <span className="material-symbols-outlined text-2xl">picture_as_pdf</span>
            </div>
            <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
              Cetak Lembar Pengamatan Aslab
            </h3>
            <p className="font-['Inter'] text-xs text-[#42474f] leading-relaxed">
              Tampilkan dialog print-to-PDF yang bersih tanpa elemen antarmuka, siap ditandatangani oleh asisten laboratorium
              pengampu sebagai bukti penyelesaian praktikum bench.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="w-full py-2.5 px-4 rounded-lg bg-[#00687a] text-white font-['JetBrains_Mono'] text-xs font-semibold hover:bg-[#004e5c] transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-base">print</span>
            Cetak Dokumen Resmi
          </button>
        </div>

        {/* Markdown / LaTeX */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col gap-2">
            <div className="w-12 h-12 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#7C3AED] border border-[#cbd5e1]/40">
              <span className="material-symbols-outlined text-2xl">content_copy</span>
            </div>
            <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
              Salin Format Markdown / LaTeX
            </h3>
            <p className="font-['Inter'] text-xs text-[#42474f] leading-relaxed">
              Salin matriks tabel pengamatan dalam format sintaks Markdown atau LaTeX tabular untuk disematkan langsung ke
              dalam laporan mingguan atau Notion praktikan.
            </p>
          </div>
          <button
            onClick={handleCopyMarkdown}
            className="w-full py-2.5 px-4 rounded-lg bg-[#eff4ff] text-[#003159] font-['JetBrains_Mono'] text-xs font-semibold hover:bg-[#dce9ff] transition-all flex items-center justify-center gap-2 border border-[#cbd5e1]/50 active:scale-95"
            type="button"
          >
            {copied ? (
              <>
                <span className="material-symbols-outlined text-base text-[#059669]">check</span>
                <span className="text-[#059669]">Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">terminal</span>
                <span>Salin Tabel Markdown</span>
              </>
            )}
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
              Verifikasi Integritas Praktikum
            </span>
            <span className="font-['Inter'] text-xs text-[#42474f]">
              Semua perhitungan memenuhi toleransi hukum Young-Laplace dan batas derivatif Gibbs.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-[#eff4ff] text-[#003159] font-['JetBrains_Mono'] text-xs font-bold border border-[#cbd5e1]/40">
            Laboratorium Kimia Fisik UI
          </span>
        </div>
      </div>
    </section>
  );
};
