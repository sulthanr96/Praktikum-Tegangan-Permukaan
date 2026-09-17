import React from 'react';
import { GlobalCalibration, SubstanceInfo, AnalysisMode } from '../types';
import { calculateRhoAir, computeAnalysis } from '../utils/physics';

interface CalculationReportProps {
  substances: Record<string, SubstanceInfo>;
  cal: GlobalCalibration;
  mode: AnalysisMode;
}

const Fraction = ({ num, den }: { num: React.ReactNode; den: React.ReactNode }) => (
  <span className="inline-flex flex-col items-center justify-center align-middle mx-1">
    <span className="px-1 leading-tight text-center">{num}</span>
    <span className="w-full border-t border-black"></span>
    <span className="px-1 leading-tight text-center">{den}</span>
  </span>
);

export const CalculationReport: React.FC<CalculationReportProps> = ({ substances, cal, mode }) => {
  const mAir = cal.mAir - cal.mKosong;
  const rhoAir = calculateRhoAir(cal);
  const gammaAir = cal.gammaAir;

  // Analisis 3 zat
  const mgcl2Analysis = computeAnalysis(substances.mgcl2, cal, mode);
  const detergenAnalysis = computeAnalysis(substances.detergen, cal, mode);
  const sdsAnalysis = computeAnalysis(substances.sds, cal, mode);

  const getInterpretation = (sub: SubstanceInfo, rows: any[], regression: any, maxExcess: number) => {
    const gFirst = rows[0]?.gamma.toFixed(2);
    const gLast = rows[4]?.gamma.toFixed(2);

    if (sub.type === 'electrolyte') {
      return `Tegangan permukaan larutan MgCl₂ terpantau relatif stabil atau sedikit meningkat (${gFirst} mN/m ke ${gLast} mN/m), menghasilkan gradien dγ/dC ≥ 0 dan surface excess bertanda negatif (Γ < 0). Fenomena ini menunjukkan adanya desorpsi negatif (negative adsorption / efek Jones-Ray), di mana ion terhidrasi Mg²⁺ dan Cl⁻ lebih terstabilkan di fasa ruah (bulk) dibanding di antarmuka udara-air.`;
    } else if (sub.type === 'anionic_surfactant') {
      return `Penambahan konsentrasi SDS menyebabkan penurunan tegangan permukaan yang tajam (dari ${gFirst} mN/m turun drastis ke ${gLast} mN/m), menghasilkan gradien dγ/dC < 0 dan surface excess positif (Γ > 0) hingga mencapai saturasi ${maxExcess.toFixed(2)} μmol/m². Hal ini menandakan akumulasi aktif gugus amfifilik SDS di antarmuka membentuk monolayer rapat sebelum mencapai Critical Micelle Concentration (CMC).`;
    } else {
      return `Larutan deterjen komersial memperlihatkan penurunan progresif tegangan permukaan (dari ${gFirst} mN/m ke ${gLast} mN/m) dengan gradien dγ/dC < 0 dan surface excess positif (Γ_maks = ${maxExcess.toFixed(2)} μmol/m²). Profil kurva mencerminkan karakteristik campuran surfaktan aktif (LAS) dan builder penstabil yang secara efektif mereduksi energi kohesi permukaan air.`;
    }
  };

  const renderSubstanceCalculation = (sub: SubstanceInfo, romanIndex: number, analysisResult: any) => {
    const { rows, regression, maxExcess } = analysisResult;
    const rFirst = rows[0]; // 0.02 M
    const rLast = rows[4];  // 0.10 M

    return (
      <div key={sub.id} className="mb-8 border-b border-gray-300 pb-6 break-inside-avoid">
        <h3 className="text-base font-bold bg-slate-100 p-2 border-l-4 border-slate-700 mb-4 uppercase tracking-wide">
          {romanIndex}. Larutan {sub.name}
        </h3>

        <div className="ml-2 space-y-5 text-sm">
          {/* a. Densitas */}
          <div>
            <h4 className="font-bold text-slate-900 mb-1">a. Perhitungan Densitas (ρ)</h4>
            <div className="bg-slate-50 border border-slate-300 p-2 rounded mb-2 font-mono text-xs inline-block">
              <span className="font-bold">Rumus:</span> ρ = <Fraction num="m_wadah - m_kosong" den="V_pikno" />
            </div>
            <ul className="list-disc ml-5 space-y-2 font-mono text-xs">
              <li>
                <strong>Konsentrasi 0.02 M (Wajib):</strong><br />
                ρ = <Fraction num={`${sub.mPikno[0].toFixed(4)} g - ${cal.mKosong.toFixed(4)} g`} den={`${cal.vPikno.toFixed(2)} mL`} /> = <strong>{rFirst.rho.toFixed(4)} g/cm³</strong>
              </li>
              <li>
                <strong>Konsentrasi 0.10 M (Wajib):</strong><br />
                ρ = <Fraction num={`${sub.mPikno[4].toFixed(4)} g - ${cal.mKosong.toFixed(4)} g`} den={`${cal.vPikno.toFixed(2)} mL`} /> = <strong>{rLast.rho.toFixed(4)} g/cm³</strong>
              </li>
            </ul>
            <div className="mt-2 text-xs italic text-slate-600 bg-amber-50 p-1.5 rounded border border-amber-200">
              💡 <em>Catatan: Hitung untuk 3 konsentrasi lainnya (0.04 M, 0.06 M, 0.08 M) menggunakan rumus yang sama (opsional, kalau nggak juga gapapa yaa 😊).</em>
            </div>
          </div>

          {/* b. Tegangan Permukaan */}
          <div>
            <h4 className="font-bold text-slate-900 mb-1">b. Perhitungan Tegangan Permukaan (γ)</h4>
            <div className="bg-slate-50 border border-slate-300 p-2 rounded mb-2 font-mono text-xs inline-block">
              <span className="font-bold">Rumus:</span> γ = <Fraction num="ρ × h" den="ρ_air × h_air" /> × γ_air
            </div>
            <ul className="list-disc ml-5 space-y-2 font-mono text-xs">
              <li>
                <strong>Konsentrasi 0.02 M (Wajib):</strong><br />
                γ = <Fraction num={`${rFirst.rho.toFixed(4)} g/cm³ × ${rFirst.hCapillary.toFixed(2)} cm`} den={`${rhoAir.toFixed(4)} g/cm³ × ${cal.hAir.toFixed(2)} cm`} /> × {gammaAir.toFixed(2)} mN/m = <strong>{rFirst.gamma.toFixed(2)} mN/m</strong>
              </li>
              <li>
                <strong>Konsentrasi 0.10 M (Wajib):</strong><br />
                γ = <Fraction num={`${rLast.rho.toFixed(4)} g/cm³ × ${rLast.hCapillary.toFixed(2)} cm`} den={`${rhoAir.toFixed(4)} g/cm³ × ${cal.hAir.toFixed(2)} cm`} /> × {gammaAir.toFixed(2)} mN/m = <strong>{rLast.gamma.toFixed(2)} mN/m</strong>
              </li>
            </ul>
            <div className="mt-2 text-xs italic text-slate-600 bg-amber-50 p-1.5 rounded border border-amber-200">
              💡 <em>Catatan: Hitung untuk 3 konsentrasi lainnya menggunakan rumus yang sama (opsional, kalau nggak juga gapapa yaa 😊).</em>
            </div>
          </div>

          {/* c. Gradien */}
          <div>
            <h4 className="font-bold text-slate-900 mb-1">c. Penentuan Gradien (dγ/dC)</h4>
            <p className="text-xs text-slate-600 mb-1.5 leading-relaxed">
              Persamaan garis tren regresi linier kurva tegangan permukaan: <strong>γ = {regression.slope >= 0 ? '+' : ''}{regression.slope.toFixed(2)}C + {regression.intercept.toFixed(2)}</strong> (R² = {regression.r2.toFixed(4)})
            </p>
            <div className="font-mono text-xs bg-slate-50 p-2 rounded border border-slate-200">
              Nilai dγ/dC (gradien garis singgung) = <strong>{rFirst.dGammaDC.toFixed(2)} mN·L/(m·mol)</strong>
            </div>
          </div>

          {/* d. Surface Excess */}
          <div>
            <h4 className="font-bold text-slate-900 mb-1">d. Perhitungan Surface Excess (Γ)</h4>
            <div className="bg-slate-50 border border-slate-300 p-2 rounded mb-2 font-mono text-xs inline-block">
              <span className="font-bold">Rumus:</span> Γ = - <Fraction num="C" den="R × T" /> × <Fraction num="dγ" den="dC" /> × 10⁻⁶
              <span className="block text-[10px] text-slate-500 mt-1">R = 8.314 J/(mol·K) dan T = {cal.tKelvin} K</span>
            </div>
            <ul className="list-disc ml-5 space-y-2 font-mono text-xs">
              <li>
                <strong>Konsentrasi 0.02 M (Wajib):</strong><br />
                Γ = - <Fraction num="0.02 mol/L" den={`8.314 × ${cal.tKelvin}`} /> × ({rFirst.dGammaDC.toFixed(2)}) × 10⁻⁶ = <strong>{rFirst.surfaceExcessMicro.toFixed(3)} × 10⁻⁶ mol/m²</strong>
              </li>
              <li>
                <strong>Konsentrasi 0.10 M (Wajib):</strong><br />
                Γ = - <Fraction num="0.10 mol/L" den={`8.314 × ${cal.tKelvin}`} /> × ({rLast.dGammaDC.toFixed(2)}) × 10⁻⁶ = <strong>{rLast.surfaceExcessMicro.toFixed(3)} × 10⁻⁶ mol/m²</strong>
              </li>
            </ul>
            <div className="mt-2 text-xs italic text-slate-600 bg-amber-50 p-1.5 rounded border border-amber-200">
              💡 <em>Catatan: Hitung untuk 3 konsentrasi lainnya menggunakan rumus yang sama (opsional, kalau nggak juga gapapa yaa 😊).</em>
            </div>
          </div>

          {/* Kotak Placeholder Tempel Grafik */}
          <div className="mt-4 pt-3 border-t border-dashed border-slate-300">
            <h5 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2">
              Lampiran Grafik Sistem {sub.name}:
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="border-2 border-dashed border-slate-400 bg-slate-50 rounded-lg p-3 text-center flex flex-col items-center justify-center min-h-[90px]">
                <span className="text-sm">✂ 📊</span>
                <span className="font-bold text-xs text-slate-700 mt-1">Tempelkan Grafik 1 di Sini</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Kurva Tegangan Permukaan (γ vs C) {sub.name}</span>
              </div>
              <div className="border-2 border-dashed border-slate-400 bg-slate-50 rounded-lg p-3 text-center flex flex-col items-center justify-center min-h-[90px]">
                <span className="text-sm">✂ 📈</span>
                <span className="font-bold text-xs text-slate-700 mt-1">Tempelkan Grafik 2 di Sini</span>
                <span className="text-[10px] text-slate-500 mt-0.5">Kurva Isoterm Adsorpsi Gibbs (Γ vs C) {sub.name}</span>
              </div>
            </div>

            {/* Interpretasi Singkat Otomatis */}
            <div className="mt-3 p-2.5 rounded-lg bg-teal-50/70 border border-teal-200 text-xs leading-relaxed text-teal-950">
              <strong className="text-teal-900 font-semibold block mb-0.5">📌 Interpretasi Grafik &amp; Hasil Analisis:</strong>
              {getInterpretation(sub, rows, regression, maxExcess)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans text-black max-w-4xl mx-auto bg-white p-8 [print-color-adjust:exact]">
      {/* Header Laporan */}
      <div className="text-center pb-4 mb-6 border-b-2 border-black">
        <h1 className="text-xl font-bold uppercase tracking-widest text-slate-900">
          Laporan Praktikum Kimia Fisik
        </h1>
        <h2 className="text-base font-semibold text-slate-700 mt-1">
          Penentuan Tegangan Permukaan Cairan &amp; Isoterm Adsorpsi Gibbs
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 font-mono">
          Laboratorium Kimia Fisik · SRS Lab
        </p>
      </div>

      {/* ========================================================= */}
      {/* BAGIAN I: JURNAL PRAKTIKUM (PRA-LAB)                      */}
      {/* ========================================================= */}
      <div className="mb-8">
        <div className="bg-slate-800 text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wider mb-4 rounded-t flex items-center justify-between">
          <span>Bagian I: Jurnal Praktikum (Pra-Lab)</span>
          <span className="text-[10px] font-normal normal-case opacity-90">Telah dikerjakan di lembar pra-lab</span>
        </div>

        <div className="space-y-4 text-xs ml-1">
          <div>
            <span className="font-bold text-slate-900 block mb-1">A. Judul Percobaan</span>
            <p className="text-slate-700 pl-4 border-l-2 border-slate-300">
              Penentuan Tegangan Permukaan Cairan Menggunakan Metoda Kenaikan Kapiler dan Penentuan Konsentrasi Berlebih (Surface Excess) Menggunakan Persamaan Adsorpsi Gibbs.
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">B. Tujuan Percobaan</span>
            <div className="border border-slate-300 rounded p-2 bg-slate-50 text-slate-400 italic min-h-[40px] flex items-center justify-center">
              (Telah dikerjakan di lembar jurnal pra-lab)
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">C. Dasar Teori</span>
            <div className="border border-slate-300 rounded p-2 bg-slate-50 text-slate-400 italic min-h-[40px] flex items-center justify-center">
              (Telah dikerjakan di lembar jurnal pra-lab)
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">D. Alat dan Bahan</span>
            <div className="border border-slate-300 rounded p-2 bg-slate-50 text-slate-400 italic min-h-[40px] flex items-center justify-center">
              (Telah dikerjakan di lembar jurnal pra-lab)
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">E. MSDS (Material Safety Data Sheet)</span>
            <div className="border border-slate-300 rounded p-2 bg-slate-50 text-slate-400 italic min-h-[40px] flex items-center justify-center">
              (Telah dikerjakan di lembar jurnal pra-lab — Akuades, MgCl₂, SDS, Deterjen)
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">F. Cara Kerja (Diagram Alir)</span>
            <div className="border border-slate-300 rounded p-2 bg-slate-50 text-slate-400 italic min-h-[40px] flex items-center justify-center">
              (Telah dikerjakan di lembar jurnal pra-lab)
            </div>
          </div>
        </div>
      </div>

      <div className="my-8 border-t-2 border-dashed border-slate-400"></div>

      {/* ========================================================= */}
      {/* BAGIAN II: LAPORAN PRAKTIKUM                              */}
      {/* ========================================================= */}
      <div>
        <div className="bg-slate-800 text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wider mb-4 rounded-t flex items-center justify-between">
          <span>Bagian II: Laporan Praktikum (Pengolahan Data &amp; Pembahasan)</span>
          <span className="text-[10px] font-normal normal-case opacity-90">Salin &amp; tempelkan lampiran pada lembar ini</span>
        </div>

        {/* G. DATA PENGAMATAN */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
            G. Data Pengamatan
          </h3>
          <p className="text-xs text-slate-600 mb-3 italic">
            *Petunjuk: Gunting tabel data dari <strong>Lembar Lampiran Tabel &amp; Grafik</strong> dan tempelkan pada kotak yang disediakan di bawah ini:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div className="border-2 border-dashed border-slate-400 bg-slate-50 rounded-lg p-3 text-center flex flex-col items-center justify-center min-h-[85px]">
              <span className="text-base">✂ 📋</span>
              <span className="font-bold text-xs text-slate-700 mt-1">Tempelkan Tabel 1: Kalibrasi Air Baku &amp; Piknometer</span>
              <span className="text-[10px] text-slate-500 mt-0.5">(Dari Lembar Tempel Lampiran)</span>
            </div>
            <div className="border-2 border-dashed border-slate-400 bg-slate-50 rounded-lg p-3 text-center flex flex-col items-center justify-center min-h-[85px]">
              <span className="text-base">✂ 📋</span>
              <span className="font-bold text-xs text-slate-700 mt-1">Tempelkan Tabel 2: Data Pengamatan Larutan MgCl₂</span>
              <span className="text-[10px] text-slate-500 mt-0.5">(Dari Lembar Tempel Lampiran)</span>
            </div>
            <div className="border-2 border-dashed border-slate-400 bg-slate-50 rounded-lg p-3 text-center flex flex-col items-center justify-center min-h-[85px]">
              <span className="text-base">✂ 📋</span>
              <span className="font-bold text-xs text-slate-700 mt-1">Tempelkan Tabel 3: Data Pengamatan Larutan Detergen</span>
              <span className="text-[10px] text-slate-500 mt-0.5">(Dari Lembar Tempel Lampiran)</span>
            </div>
            <div className="border-2 border-dashed border-slate-400 bg-slate-50 rounded-lg p-3 text-center flex flex-col items-center justify-center min-h-[85px]">
              <span className="text-base">✂ 📋</span>
              <span className="font-bold text-xs text-slate-700 mt-1">Tempelkan Tabel 4: Data Pengamatan Larutan SDS</span>
              <span className="text-[10px] text-slate-500 mt-0.5">(Dari Lembar Tempel Lampiran)</span>
            </div>
          </div>
        </div>

        {/* H. PENGOLAHAN DATA */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-4">
            H. Pengolahan Data
          </h3>

          {/* 1. Air Baku */}
          <div className="mb-8 border-b border-gray-300 pb-6">
            <h4 className="text-base font-bold bg-slate-100 p-2 border-l-4 border-slate-700 mb-4 uppercase tracking-wide">
              I. Air (Pelarut Referensi)
            </h4>
            <div className="ml-2 space-y-4 text-sm">
              <div>
                <h5 className="font-bold text-slate-900 mb-1">a. Perhitungan Massa Air (m_air)</h5>
                <div className="bg-slate-50 border border-slate-300 p-2 rounded mb-1 font-mono text-xs inline-block">
                  <span className="font-bold">Rumus:</span> m_air = m_pikno+air - m_kosong
                </div>
                <p className="font-mono text-xs ml-2">
                  m_air = {cal.mAir.toFixed(4)} g - {cal.mKosong.toFixed(4)} g = <strong>{mAir.toFixed(4)} g</strong>
                </p>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1">b. Perhitungan Densitas Air (ρ_air)</h5>
                <div className="bg-slate-50 border border-slate-300 p-2 rounded mb-1 font-mono text-xs inline-block">
                  <span className="font-bold">Rumus:</span> ρ_air = <Fraction num="m_air" den="V_pikno" />
                </div>
                <p className="font-mono text-xs ml-2 mt-1">
                  ρ_air = <Fraction num={`${mAir.toFixed(4)} g`} den={`${cal.vPikno.toFixed(2)} mL`} /> = <strong>{rhoAir.toFixed(4)} g/cm³</strong>
                </p>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1">c. Tegangan Permukaan Air Standar (γ_air)</h5>
                <p className="font-mono text-xs ml-2">
                  Pada suhu praktikum <strong>{cal.tKelvin} K</strong>: γ_air = <strong>{gammaAir.toFixed(2)} mN/m</strong>
                </p>
              </div>
            </div>
          </div>

          {/* 2. MgCl2 */}
          {renderSubstanceCalculation(substances.mgcl2, 2, mgcl2Analysis)}

          {/* 3. Detergen */}
          {renderSubstanceCalculation(substances.detergen, 3, detergenAnalysis)}

          {/* 4. SDS */}
          {renderSubstanceCalculation(substances.sds, 4, sdsAnalysis)}
        </div>

        {/* I. PEMBAHASAN */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">
            I. Pembahasan
          </h3>
          <p className="text-xs text-slate-600 mb-4 italic">
            *Panduan diskusi ilmiah: Salin dan elaborasikan poin-poin pertanyaan kritis berikut pada laporan Anda:
          </p>

          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded border border-slate-300">
              <span className="font-bold text-slate-800 block mb-1">
                1. Bagaimana tren tegangan permukaan terhadap konsentrasi untuk masing-masing larutan? (sekilas saja)
              </span>
              <div className="border-b border-dashed border-slate-300 h-6"></div>
              <div className="border-b border-dashed border-slate-300 h-6"></div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-300">
              <span className="font-bold text-slate-800 block mb-1">
                2. Mengapa surfaktan (SDS &amp; detergen) lebih signifikan menurunkan γ dibanding MgCl₂?
              </span>
              <div className="border-b border-dashed border-slate-300 h-6"></div>
              <div className="border-b border-dashed border-slate-300 h-6"></div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-300">
              <span className="font-bold text-slate-800 block mb-1">
                3. Apa makna fisik dari nilai Γ_maks dan C_CMC dari isoterm Gibbs?
              </span>
              <div className="border-b border-dashed border-slate-300 h-6"></div>
              <div className="border-b border-dashed border-slate-300 h-6"></div>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-300">
              <span className="font-bold text-slate-800 block mb-1">
                4. Faktor apa yang mempengaruhi keakuratan hasil (sumber error eksperimen)?
              </span>
              <div className="border-b border-dashed border-slate-300 h-6"></div>
              <div className="border-b border-dashed border-slate-300 h-6"></div>
            </div>
          </div>
        </div>

        {/* J. KESIMPULAN */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">
            J. Kesimpulan
          </h3>
          <p className="text-xs text-slate-600 mb-3 italic">
            *Tuliskan kesimpulan percobaan (minimal 4 poin):
          </p>

          <div className="space-y-3 text-xs pl-2">
            <div className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <div className="border-b border-slate-400 flex-1 h-5"></div>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <div className="border-b border-slate-400 flex-1 h-5"></div>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <div className="border-b border-slate-400 flex-1 h-5"></div>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <div className="border-b border-slate-400 flex-1 h-5"></div>
            </div>
          </div>
        </div>

        {/* K. DAFTAR PUSTAKA */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-3">
            K. Daftar Pustaka
          </h3>
          <p className="text-xs text-slate-600 mb-3 italic">
            *Cantumkan referensi rujukan ilmiah yang digunakan (minimal 2 pustaka):
          </p>

          <div className="space-y-3 text-xs pl-2">
            <div className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <div className="border-b border-slate-400 flex-1 h-5"></div>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <div className="border-b border-slate-400 flex-1 h-5"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3 font-mono">
        Kalkulator Praktikum Kimia Fisik · SRS Lab · Format Standar Laporan
      </div>
    </div>
  );
};
