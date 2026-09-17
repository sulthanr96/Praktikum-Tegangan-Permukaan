import React from 'react';
import { SubstanceInfo, GlobalCalibration, AnalysisMode } from '../types';
import { computeAnalysis, calculateRhoAir } from '../utils/physics';
import { generateChart1Svg, generateChart2Svg } from '../utils/chartRenderer';

interface GraphicsReportProps {
  substances: Record<string, SubstanceInfo>;
  cal: GlobalCalibration;
  mode: AnalysisMode;
}

export const GraphicsReport: React.FC<GraphicsReportProps> = ({ substances, cal, mode }) => {
  const substanceKeys: ('mgcl2' | 'detergen' | 'sds')[] = ['mgcl2', 'detergen', 'sds'];
  const mAir = cal.mAir - cal.mKosong;
  const rhoAir = calculateRhoAir(cal);

  return (
    <div className="bg-white text-black p-8 max-w-[1050px] mx-auto font-sans [print-color-adjust:exact]">
      {/* Header Halaman Cetak */}
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold font-['Space_Grotesk'] uppercase tracking-widest text-slate-900">
          Lembar Lampiran Tabel &amp; Grafik
        </h1>
        <p className="text-xs font-mono text-slate-600 mt-1">
          Praktikum Kimia Fisik · Penentuan Tegangan Permukaan &amp; Isoterm Adsorpsi Gibbs · SRS Lab
        </p>
        <p className="text-[11px] italic text-slate-500 mt-1 bg-slate-100 py-1 px-3 rounded inline-block border border-slate-300">
          ✂ Petunjuk: Seluruh tabel dan grafik di lembar ini dirancang untuk dicetak, digunting mengikuti garis putus-putus, lalu ditempelkan pada Laporan Fisik Anda.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN I: TABEL-TABEL HASIL PENGAMATAN & PENGOLAHAN                       */}
      {/* ========================================================================= */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-300">
          <span className="bg-slate-800 text-white font-bold text-xs px-2.5 py-1 rounded">BAGIAN 1</span>
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
            Tabel Data Pengamatan &amp; Pengolahan (Siap Gunting &amp; Tempel)
          </h2>
        </div>

        {/* Tabel 1: Kalibrasi Air Baku */}
        <div className="mb-8 p-3 border-2 border-dashed border-slate-400 rounded-xl bg-white break-inside-avoid">
          <div className="flex items-center justify-between mb-2 text-xs font-mono text-slate-700">
            <span className="font-bold uppercase tracking-wider">✂ Tabel 1: Data Kalibrasi Piknometer &amp; Air Baku</span>
            <span className="text-[10px] text-slate-400">Gunting di sepanjang garis putus-putus</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-800 font-mono">
              <thead className="bg-slate-100 text-slate-900">
                <tr className="border-b border-slate-800">
                  <th className="p-2 border-r border-slate-800">Parameter Kalibrasi</th>
                  <th className="p-2 border-r border-slate-800 text-center">Nilai Terukur</th>
                  <th className="p-2 border-r border-slate-800">Satuan</th>
                  <th className="p-2">Keterangan / Formula</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-400">
                <tr>
                  <td className="p-2 border-r border-slate-800 font-semibold">Suhu Ruang Pengukuran (T)</td>
                  <td className="p-2 border-r border-slate-800 text-center font-bold">{cal.tKelvin.toFixed(2)}</td>
                  <td className="p-2 border-r border-slate-800">Kelvin (K)</td>
                  <td className="p-2 text-slate-600">Termometer terkalibrasi</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-800 font-semibold">Volume Piknometer (V_pikno)</td>
                  <td className="p-2 border-r border-slate-800 text-center font-bold">{cal.vPikno.toFixed(2)}</td>
                  <td className="p-2 border-r border-slate-800">mL (cm³)</td>
                  <td className="p-2 text-slate-600">Volume nominal botol piknometer</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-800 font-semibold">Massa Piknometer Kosong (m_kosong)</td>
                  <td className="p-2 border-r border-slate-800 text-center font-bold">{cal.mKosong.toFixed(4)}</td>
                  <td className="p-2 border-r border-slate-800">gram</td>
                  <td className="p-2 text-slate-600">Neraca analitik digital 4 desimal</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-800 font-semibold">Massa Piknometer + Air (m_air+pikno)</td>
                  <td className="p-2 border-r border-slate-800 text-center font-bold">{cal.mAir.toFixed(4)}</td>
                  <td className="p-2 border-r border-slate-800">gram</td>
                  <td className="p-2 text-slate-600">Akuades murni suhu ruang</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-800 font-semibold">Massa Air Bersih (m_air)</td>
                  <td className="p-2 border-r border-slate-800 text-center font-bold">{mAir.toFixed(4)}</td>
                  <td className="p-2 border-r border-slate-800">gram</td>
                  <td className="p-2 text-slate-600">m_air = m_isi - m_kosong</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-800 font-semibold">Densitas Air Terukur (ρ_air)</td>
                  <td className="p-2 border-r border-slate-800 text-center font-bold">{rhoAir.toFixed(4)}</td>
                  <td className="p-2 border-r border-slate-800">g/cm³</td>
                  <td className="p-2 text-slate-600">ρ_air = m_air / V_pikno</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-800 font-semibold">Tinggi Kenaikan Kapiler Air (h_air)</td>
                  <td className="p-2 border-r border-slate-800 text-center font-bold">{cal.hAir.toFixed(2)}</td>
                  <td className="p-2 border-r border-slate-800">cm</td>
                  <td className="p-2 text-slate-600">Jangka sorong ketelitian 0.05 mm</td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-slate-800 font-semibold">Tegangan Permukaan Air Baku (γ_air)</td>
                  <td className="p-2 border-r border-slate-800 text-center font-bold">{cal.gammaAir.toFixed(2)}</td>
                  <td className="p-2 border-r border-slate-800">mN/m (dyne/cm)</td>
                  <td className="p-2 text-slate-600">Nilai standar referensi pada {cal.tKelvin} K</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel 2, 3, 4: Data 3 Zat */}
        {substanceKeys.map((key, sIdx) => {
          const sub = substances[key];
          const { rows } = computeAnalysis(sub, cal, mode);

          return (
            <div key={key} className="mb-8 p-3 border-2 border-dashed border-slate-400 rounded-xl bg-white break-inside-avoid">
              <div className="flex items-center justify-between mb-2 text-xs font-mono text-slate-700">
                <span className="font-bold uppercase tracking-wider">
                  ✂ Tabel {sIdx + 2}: Data Pengamatan &amp; Pengolahan Larutan {sub.name}
                </span>
                <span className="text-[10px] text-slate-400">Gunting di sepanjang garis putus-putus</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse border border-slate-800 font-mono">
                  <thead className="bg-slate-100 text-slate-900 border-b border-slate-800">
                    <tr>
                      <th className="p-2 border-r border-slate-800">Labu</th>
                      <th className="p-2 border-r border-slate-800">Konsentrasi (M)</th>
                      <th className="p-2 border-r border-slate-800">Massa Pikno (g)</th>
                      <th className="p-2 border-r border-slate-800">h Kapiler (cm)</th>
                      <th className="p-2 border-r border-slate-800">Densitas ρ (g/cm³)</th>
                      <th className="p-2 border-r border-slate-800">Tegangan γ (mN/m)</th>
                      <th className="p-2 border-r border-slate-800">dγ/dC</th>
                      <th className="p-2">Surface Excess Γ (μmol/m²)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-400">
                    {rows.map((r, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-800 font-bold text-slate-600">{rIdx + 1}</td>
                        <td className="p-2 border-r border-slate-800 font-bold">{r.concentration.toFixed(2)}</td>
                        <td className="p-2 border-r border-slate-800">{sub.mPikno[rIdx].toFixed(4)}</td>
                        <td className="p-2 border-r border-slate-800">{r.hCapillary.toFixed(2)}</td>
                        <td className="p-2 border-r border-slate-800 font-semibold">{r.rho.toFixed(4)}</td>
                        <td className="p-2 border-r border-slate-800 font-bold text-slate-900">{r.gamma.toFixed(2)}</td>
                        <td className="p-2 border-r border-slate-800">{r.dGammaDC.toFixed(2)}</td>
                        <td className="p-2 font-bold text-slate-900">{r.surfaceExcessMicro.toFixed(3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      <div className="my-10 border-t-2 border-dashed border-slate-400"></div>

      {/* ========================================================================= */}
      {/* BAGIAN II: 6 GRAFIK PRAKTIKUM (SIAP GUNTING & TEMPEL)                     */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-300">
          <span className="bg-slate-800 text-white font-bold text-xs px-2.5 py-1 rounded">BAGIAN 2</span>
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
            6 Grafik Kurva Karakteristik (Siap Gunting &amp; Tempel)
          </h2>
        </div>

        <div className="flex flex-col gap-10">
          {substanceKeys.map((key, idx) => {
            const sub = substances[key];
            const { rows, regression } = computeAnalysis(sub, cal, mode);
            const concs = rows.map(r => r.concentration);
            const gammas = rows.map(r => r.gamma);
            const excesses = rows.map(r => r.surfaceExcessMicro);
            const maxExcess = Math.max(...excesses, 0);

            const chart1 = generateChart1Svg(sub, concs, gammas, regression);
            const chart2 = generateChart2Svg(sub, concs, excesses, maxExcess);

            return (
              <div key={key} className="p-4 border-2 border-dashed border-slate-400 rounded-xl bg-white break-inside-avoid">
                <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-800 uppercase">
                      ✂ Grafik Set {idx + 1}: Sistem {sub.name}
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Gunting masing-masing grafik di batas border hitam untuk ditempelkan pada Laporan Bagian H.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-[10px] font-mono font-bold text-slate-700">
                    2 Grafik Berdampingan
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <div 
                      className="w-full aspect-[450/330] shadow-sm rounded overflow-hidden border border-slate-800"
                      dangerouslySetInnerHTML={{ __html: chart1 }} 
                    />
                    <span className="text-center font-mono text-[10px] text-slate-600 mt-1 font-semibold">
                      [Gunting: Grafik γ vs C - {sub.name}]
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <div 
                      className="w-full aspect-[450/330] shadow-sm rounded overflow-hidden border border-slate-800"
                      dangerouslySetInnerHTML={{ __html: chart2 }} 
                    />
                    <span className="text-center font-mono text-[10px] text-slate-600 mt-1 font-semibold">
                      [Gunting: Grafik Isoterm Gibbs - {sub.name}]
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3 font-mono">
        Lembar Lampiran Resmi · Cetak &amp; Gunting · SRS Lab
      </div>
    </div>
  );
};
