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

  const getInterpretation = (sub: SubstanceInfo, rows: any[], regression: any, keyExcess: number) => {
    const gFirst = rows[0]?.gamma ?? 0;
    const gLast = rows[rows.length - 1]?.gamma ?? 0;
    const slopePositive = regression.slope > 0;
    const slopeSign = slopePositive ? 'positif (dγ/dC > 0)' : 'negatif (dγ/dC < 0)';
    const delta = Math.abs(gLast - gFirst).toFixed(2);
    const deltaSign = gLast > gFirst ? '+' : '−';

    if (sub.type === 'electrolyte') {
      const adsorpsiLabel = keyExcess < 0 ? 'negatif (Γ < 0)' : 'positif (Γ > 0)';
      const trenTeks = slopePositive
        ? `Tegangan permukaan larutan MgCl₂ secara keseluruhan cenderung meningkat (Δ titik ujung = ${deltaSign}${delta} mN/m), menghasilkan gradien regresi ${slopeSign} dan surface excess ${adsorpsiLabel}. Hal ini mengindikasikan adsorpsi negatif (ion Mg²⁺ dan Cl⁻ terdeplesi di antarmuka udara-air) sesuai teori Efek Jones-Ray.`
        : `Tegangan permukaan larutan MgCl₂ secara keseluruhan cenderung menurun (Δ titik ujung = ${deltaSign}${delta} mN/m), menghasilkan gradien regresi ${slopeSign}. Pola ini tidak umum untuk elektrolit kuat dan dapat mengindikasikan error sistematik pengukuran tinggi kapiler atau adanya pengaruh surfaktan kontaminan. Nilai Γ_min terhitung: ${keyExcess.toFixed(3)} μmol/m².`;
      return trenTeks;
    } else if (sub.type === 'anionic_surfactant') {
      const adsorpsiLabel = keyExcess > 0 ? `positif (Γ_maks = ${keyExcess.toFixed(3)} μmol/m²)` : `bernilai ${keyExcess.toFixed(3)} μmol/m²`;
      const trenTeks = !slopePositive
        ? `SDS secara efektif menurunkan tegangan permukaan (Δ titik ujung = ${deltaSign}${delta} mN/m). Gradien regresi ${slopeSign} menghasilkan surface excess ${adsorpsiLabel}, membuktikan pembentukan monolayer surfaktan anionik rapat di antarmuka udara-air.`
        : `Tegangan permukaan SDS secara keseluruhan terpantau naik dengan gradien regresi ${slopeSign}. Hasil ini sangat tidak tipikal — surfaktan secara termodinamika selalu menurunkan γ air murni. Periksa kembali validitas data. Nilai Γ terhitung: ${keyExcess.toFixed(3)} μmol/m².`;
      return trenTeks;
    } else {
      const adsorpsiLabel = keyExcess > 0 ? `positif (Γ_maks = ${keyExcess.toFixed(3)} μmol/m²)` : `bernilai ${keyExcess.toFixed(3)} μmol/m²`;
      const trenTeks = !slopePositive
        ? `Deterjen komersial menurunkan tegangan permukaan (Δ titik ujung = ${deltaSign}${delta} mN/m). Gradien regresi ${slopeSign} menghasilkan surface excess ${adsorpsiLabel}, mencerminkan adsorpsi rata-rata dari campuran molekul amfifilik builder+LAS pada antarmuka.`
        : `Tegangan permukaan deterjen secara keseluruhan terpantau naik dengan gradien regresi ${slopeSign}. Pola ini tidak lazim — deterjen seharusnya menurunkan γ. Periksa data input. Nilai Γ terhitung: ${keyExcess.toFixed(3)} μmol/m².`;
      return trenTeks;
    }
  };

  const renderSubstanceCalculation = (sub: SubstanceInfo, romanIndex: number, analysisResult: any) => {
    const { rows, regression, keyExcess, minExcess, maxExcess } = analysisResult;
    const rFirst = rows[0]; // 0.02 M
    const rLast = rows[4];  // 0.10 M

    const romanStr = romanIndex === 2 ? 'II' : romanIndex === 3 ? 'III' : 'IV';
    const subName = sub.id === 'mgcl2' ? 'MgCl₂' : sub.name.toUpperCase();
    // For electrolytes: Γ_min; for surfactants: Γ_max
    const isElectrolyte = sub.type === 'electrolyte';
    const gammaExtremeLabel = isElectrolyte ? 'Γ_min' : 'Γ_maks';
    const gammaExtremeValue = isElectrolyte ? minExcess : maxExcess;

    return (
      <div key={sub.id} className="mb-6 border-b border-gray-300 pb-4">
        <h4 className="text-base font-bold bg-slate-100 p-2 border-l-4 border-slate-700 mb-2 tracking-wide">
          {romanStr}. LARUTAN {subName}
        </h4>
        <p className="text-xs text-slate-500 italic mb-4 ml-2">
          *Catatan: Yang wajib dihitung 0,02 M dan 0,10 M saja. Untuk sisanya dapat juga dituliskan atau pun tidak, opsional :)
        </p>

        <div className="ml-2 space-y-5 text-sm">
          {/* a. Densitas */}
          <div>
            <h4 className="font-bold text-slate-900 mb-1">a. Perhitungan Densitas (ρ)</h4>
            <div className="bg-slate-50 border border-slate-300 p-2 rounded mb-2 font-mono text-xs inline-block">
              <span className="font-bold">Rumus:</span> ρ = <Fraction num={<>m<sub>wadah</sub> - m<sub>kosong</sub></>} den={<>V<sub>pikno</sub></>} />
            </div>
            <ul className="list-disc ml-5 space-y-2 font-mono text-xs">
              <li>
                <strong>Konsentrasi 0.02 M:</strong><br />
                ρ = <Fraction num={`${sub.mPikno[0].toFixed(4)} g - ${cal.mKosong.toFixed(4)} g`} den={`${cal.vPikno.toFixed(2)} mL`} /> = <strong>{rFirst.rho.toFixed(4)} g/cm³</strong>
              </li>
              <li>
                <strong>Konsentrasi 0.10 M:</strong><br />
                ρ = <Fraction num={`${sub.mPikno[4].toFixed(4)} g - ${cal.mKosong.toFixed(4)} g`} den={`${cal.vPikno.toFixed(2)} mL`} /> = <strong>{rLast.rho.toFixed(4)} g/cm³</strong>
              </li>
            </ul>
          </div>

          {/* b. Tegangan Permukaan */}
          <div>
            <h4 className="font-bold text-slate-900 mb-1">b. Perhitungan Tegangan Permukaan (γ)</h4>
            <div className="bg-slate-50 border border-slate-300 p-2 rounded mb-2 font-mono text-xs inline-block">
              <span className="font-bold">Rumus:</span> γ = <Fraction num="ρ × h" den={<>ρ<sub>air</sub> × h<sub>air</sub></>} /> × γ<sub>air</sub>
            </div>
            <ul className="list-disc ml-5 space-y-2 font-mono text-xs">
              <li>
                <strong>Konsentrasi 0.02 M:</strong><br />
                γ = <Fraction num={`${rFirst.rho.toFixed(4)} g/cm³ × ${rFirst.hCapillary.toFixed(2)} cm`} den={`${rhoAir.toFixed(4)} g/cm³ × ${cal.hAir.toFixed(2)} cm`} /> × {gammaAir.toFixed(2)} mN/m = <strong>{rFirst.gamma.toFixed(2)} mN/m</strong>
              </li>
              <li>
                <strong>Konsentrasi 0.10 M:</strong><br />
                γ = <Fraction num={`${rLast.rho.toFixed(4)} g/cm³ × ${rLast.hCapillary.toFixed(2)} cm`} den={`${rhoAir.toFixed(4)} g/cm³ × ${cal.hAir.toFixed(2)} cm`} /> × {gammaAir.toFixed(2)} mN/m = <strong>{rLast.gamma.toFixed(2)} mN/m</strong>
              </li>
            </ul>
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
                <strong>Konsentrasi 0.02 M:</strong><br />
                Γ = - <Fraction num="0.02 mol/L" den={`8.314 × ${cal.tKelvin}`} /> × ({rFirst.dGammaDC.toFixed(2)}) × 10⁻⁶ = <strong>{rFirst.surfaceExcessMicro.toFixed(3)} × 10⁻⁶ mol/m²</strong>
              </li>
              <li>
                <strong>Konsentrasi 0.10 M:</strong><br />
                Γ = - <Fraction num="0.10 mol/L" den={`8.314 × ${cal.tKelvin}`} /> × ({rLast.dGammaDC.toFixed(2)}) × 10⁻⁶ = <strong>{rLast.surfaceExcessMicro.toFixed(3)} × 10⁻⁶ mol/m²</strong>
              </li>
            </ul>
            <div className="mt-2 font-mono text-xs bg-slate-100 p-2 rounded border border-slate-300 inline-block">
              <strong>{gammaExtremeLabel} = {gammaExtremeValue.toFixed(3)} × 10⁻⁶ mol/m²</strong>
              {isElectrolyte
                ? ' → adsorpsi negatif (deplesi ion di antarmuka)'
                : ' → saturasi monolayer surfaktan di antarmuka'}
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
              {getInterpretation(sub, rows, regression, keyExcess)}
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
          <span className="text-[10px] font-normal normal-case opacity-90">Telah dikerjakan di jurnal saja</span>
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
              (Telah dikerjakan di jurnal saja)
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">C. Dasar Teori</span>
            <div className="border border-slate-300 rounded p-2 bg-slate-50 text-slate-400 italic min-h-[40px] flex items-center justify-center">
              (Telah dikerjakan di jurnal saja)
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">D. Alat dan Bahan</span>
            <div className="border border-slate-300 rounded p-2 bg-slate-50 text-slate-400 italic min-h-[40px] flex items-center justify-center">
              (Telah dikerjakan di jurnal saja)
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">E. MSDS (Material Safety Data Sheet)</span>
            <div className="border border-slate-300 rounded p-2 bg-slate-50 text-slate-400 italic min-h-[40px] flex items-center justify-center">
              (Telah dikerjakan di jurnal saja — Akuades, MgCl₂, SDS, Deterjen)
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-900 block mb-1">F. Cara Kerja (Diagram Alir)</span>
            <div className="border border-slate-300 rounded p-2 bg-slate-50 text-slate-400 italic min-h-[40px] flex items-center justify-center">
              (Telah dikerjakan di jurnal saja)
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
        </div>

        {/* G. DATA PENGAMATAN */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
            G. Data Pengamatan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            <div className="border-2 border-dashed border-slate-400 bg-slate-50 rounded-lg py-2 px-3 text-center flex flex-col items-center justify-center break-inside-avoid">
              <span className="font-bold text-xs text-slate-700">✂ 📋 Tempelkan Tabel 1: Kalibrasi Air Baku &amp; Piknometer</span>
            </div>
            <div className="border-2 border-dashed border-slate-400 bg-slate-50 rounded-lg py-2 px-3 text-center flex flex-col items-center justify-center break-inside-avoid">
              <span className="font-bold text-xs text-slate-700">✂ 📋 Tempelkan Tabel 2: Data Pengamatan Larutan MgCl₂</span>
            </div>
            <div className="border-2 border-dashed border-slate-400 bg-slate-50 rounded-lg py-2 px-3 text-center flex flex-col items-center justify-center break-inside-avoid">
              <span className="font-bold text-xs text-slate-700">✂ 📋 Tempelkan Tabel 3: Data Pengamatan Larutan Detergen</span>
            </div>
            <div className="border-2 border-dashed border-slate-400 bg-slate-50 rounded-lg py-2 px-3 text-center flex flex-col items-center justify-center break-inside-avoid">
              <span className="font-bold text-xs text-slate-700">✂ 📋 Tempelkan Tabel 4: Data Pengamatan Larutan SDS</span>
            </div>
          </div>
        </div>

        {/* H. PENGOLAHAN DATA */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-4">
            H. Pengolahan Data
          </h3>

          {/* 1. Air Baku */}
          <div className="mb-6 border-b border-gray-300 pb-4">
            <h4 className="text-base font-bold bg-slate-100 p-2 border-l-4 border-slate-700 mb-4 tracking-wide">
              I. AIR
            </h4>
            <div className="ml-2 space-y-4 text-sm">
              <div>
                <h5 className="font-bold text-slate-900 mb-1">a. Perhitungan Massa Air (m<sub>air</sub>)</h5>
                <div className="bg-slate-50 border border-slate-300 p-2 rounded mb-1 font-mono text-xs inline-block">
                  <span className="font-bold">Rumus:</span> m<sub>air</sub> = m<sub>pikno+air</sub> - m<sub>kosong</sub>
                </div>
                <p className="font-mono text-xs ml-2">
                  m<sub>air</sub> = {cal.mAir.toFixed(4)} g - {cal.mKosong.toFixed(4)} g = <strong>{mAir.toFixed(4)} g</strong>
                </p>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1">b. Perhitungan Densitas Air (ρ<sub>air</sub>)</h5>
                <div className="bg-slate-50 border border-slate-300 p-2 rounded mb-1 font-mono text-xs inline-block">
                  <span className="font-bold">Rumus:</span> ρ<sub>air</sub> = <Fraction num={<>m<sub>air</sub></>} den={<>V<sub>pikno</sub></>} />
                </div>
                <p className="font-mono text-xs ml-2 mt-1">
                  ρ<sub>air</sub> = <Fraction num={`${mAir.toFixed(4)} g`} den={`${cal.vPikno.toFixed(2)} mL`} /> = <strong>{rhoAir.toFixed(4)} g/cm³</strong>
                </p>
              </div>

              <div>
                <h5 className="font-bold text-slate-900 mb-1">c. Tegangan Permukaan Air Standar (γ<sub>air</sub>)</h5>
                <p className="font-mono text-xs ml-2">
                  Pada suhu praktikum <strong>{cal.tKelvin} K</strong>: γ<sub>air</sub> = <strong>{gammaAir.toFixed(2)} mN/m</strong>
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
        <div className="mb-6 break-inside-avoid">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-300 pb-1 mb-2">
            I. Pembahasan
          </h3>
          <p className="text-xs text-slate-800 mb-2 font-medium">
            Sertakan poin-poin berikut dalam pembahasanmu pada laporan fisik:
          </p>

          <ol className="list-decimal ml-5 space-y-1 text-xs text-slate-700">
            <li>Bagaimana tren tegangan permukaan terhadap konsentrasi untuk masing-masing larutan? (sekilas saja)</li>
            <li>Mengapa surfaktan (SDS &amp; detergen) lebih signifikan menurunkan γ dibanding MgCl₂?</li>
            <li>Apa makna fisik dari nilai Γ<sub>maks</sub> dan C<sub>CMC</sub> dari isoterm Gibbs?</li>
            <li>Faktor apa yang mempengaruhi keakuratan hasil (sumber error eksperimen)?</li>
          </ol>
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
