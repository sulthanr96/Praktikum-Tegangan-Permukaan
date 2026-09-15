import React, { useState } from "react";
import { NumericInput } from "./NumericInput";

export const Section2Procedure: React.FC = () => {
  const [substance, setSubstance] = useState<"mgcl2" | "sds" | "detergen">("mgcl2");
  const [flaskVol, setFlaskVol] = useState<number>(100);
  const [customMr, setCustomMr] = useState<number>(288.38);

  const concentrations = [0.02, 0.04, 0.06, 0.08, 0.10];

  const getMolarMass = () => {
    if (substance === "mgcl2") return 95.21;
    if (substance === "sds") return 288.38;
    return customMr;
  };

  const flaskVolL = flaskVol / 1000;
  const currentMr = getMolarMass();

  const mgcl2Rows = concentrations.map((c) => {
    const aliquotMl = (c * flaskVol) / 1.0;
    return { concentration: c, aliquotMl };
  });

  const solidRows = concentrations.map((c) => {
    const directMass = c * flaskVolL * currentMr;
    return { concentration: c, directMass };
  });

  return (
    <section className="flex flex-col gap-8 scroll-mt-28" id="prosedur">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#00687a] font-['JetBrains_Mono'] text-xs uppercase font-semibold">
            <span className="material-symbols-outlined text-base">architecture</span>
            Instrumentasi &amp; Standardisasi Kerja
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-[#003159] tracking-tight mt-1">
            2. Prosedur &amp; Kalkulator Preparasi Seri Larutan
          </h2>
        </div>
        <div className="font-['JetBrains_Mono'] text-xs text-[#42474f] bg-[#e5eeff] px-3 py-1.5 rounded-lg border border-[#cbd5e1]/40">
          Peralatan Labu Ukur &amp; Neraca
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#cbd5e1]/60 overflow-hidden flex flex-col">
        <div className="bg-[#eff4ff] px-5 py-3 border-b border-[#cbd5e1]/40 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-[#003159] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-sm">1</span>
          <h3 className="font-['Space_Grotesk'] font-bold text-[#003159]">Kalibrasi Piknometer &amp; Kapiler Air</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-lg border border-[#cbd5e1]/40 overflow-hidden bg-[#f8fafc]">
            <img 
              src="/images/prosedur/prosedur-1-kalibrasi.jpg" 
              alt="Prosedur 1: Kalibrasi Piknometer dan Kapiler Air" 
              className="w-full h-auto object-contain"
            />
          </div>
          <div className="flex flex-col gap-3 justify-start">
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#cbd5e1]/40">
              <h4 className="font-['JetBrains_Mono'] font-bold text-[13px] sm:text-sm text-[#003159] mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">checklist</span> Langkah Kerja
              </h4>
              <ol className="text-[12px] sm:text-sm text-[#42474f] font-['Inter'] space-y-2 list-decimal pl-4">
                <li>Timbang piknometer kosong, catat massanya.</li>
                <li>Isi piknometer dengan 5 mL akuades, lalu timbang kembali (keringkan/lap bagian luar terlebih dahulu).</li>
                <li>Hitung massa air: Δm = massa piknometer isi − massa piknometer kosong.</li>
                <li>Celupkan pipa kapiler ke dalam beaker berisi akuades, biarkan air naik secara kapiler.</li>
                <li>Ukur tinggi kenaikan air (h air) menggunakan jangka sorong.</li>
              </ol>
            </div>
            <div className="p-3 rounded-xl bg-[#fffbeb] border border-[#fde68a]">
              <h4 className="font-['JetBrains_Mono'] font-bold text-[11px] sm:text-xs text-[#b45309] mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[13px] sm:text-sm">lightbulb</span> Catatan Penting
              </h4>
              <ul className="text-[11px] sm:text-xs text-[#78350f] font-['Inter'] space-y-1.5 list-disc pl-4">
                <li>Nilai massa air dan h air ini menjadi <strong>acuan (referensi)</strong> untuk menghitung tegangan permukaan relatif larutan lainnya.</li>
                <li>Gunakan <strong>air suling/aquades</strong> yang baru.</li>
                <li>Baca tinggi h dari <strong>dasar meniskus</strong> (meniskus cekung).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#cbd5e1]/60 overflow-hidden flex flex-col">
        <div className="bg-[#eff4ff] px-5 py-3 border-b border-[#cbd5e1]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-[#00687a] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-sm">2</span>
            <h3 className="font-['Space_Grotesk'] font-bold text-[#00687a]">Pembuatan Seri Larutan</h3>
          </div>
          
          <div className="flex bg-[#dce9ff] p-1 rounded-lg">
            <button
              onClick={() => setSubstance("mgcl2")}
              className={`px-4 py-1.5 rounded-md text-sm font-['JetBrains_Mono'] font-semibold transition-all ${
                substance === "mgcl2" ? "bg-white text-[#00687a] shadow-sm" : "text-[#42474f] hover:text-[#003159]"
              }`}
            >
              (A) MgCl₂
            </button>
            <button
              onClick={() => setSubstance("sds")}
              className={`px-4 py-1.5 rounded-md text-sm font-['JetBrains_Mono'] font-semibold transition-all ${
                substance === "sds" ? "bg-white text-[#00687a] shadow-sm" : "text-[#42474f] hover:text-[#003159]"
              }`}
            >
              (B) SDS
            </button>
            <button
              onClick={() => setSubstance("detergen")}
              className={`px-4 py-1.5 rounded-md text-sm font-['JetBrains_Mono'] font-semibold transition-all ${
                substance === "detergen" ? "bg-white text-[#00687a] shadow-sm" : "text-[#42474f] hover:text-[#003159]"
              }`}
            >
              (C) Detergen
            </button>
          </div>
        </div>
        
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-lg border border-[#cbd5e1]/40 overflow-hidden bg-[#f8fafc] flex items-center justify-center">
            {substance === "mgcl2" && (
               <img src="/images/prosedur/prosedur-2a-mgcl2.png" alt="Prosedur 2A: Seri Pengenceran MgCl2" className="w-full h-auto" />
            )}
            {substance === "sds" && (
               <img src="/images/prosedur/prosedur-2b-sds.png" alt="Prosedur 2B: Seri Konsentrasi SDS" className="w-full h-auto" />
            )}
            {substance === "detergen" && (
               <img src="/images/prosedur/prosedur-2c-detergen.png" alt="Prosedur 2C: Seri Konsentrasi Detergen" className="w-full h-auto" />
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Volume Input */}
              <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-[#f8fafc] border border-[#cbd5e1]/40">
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#64748b]">Volume Labu Ukur (mL)</span>
                <NumericInput
                  className="w-full bg-white px-2 py-1 border border-[#cbd5e1]/60 rounded-md font-['JetBrains_Mono'] text-[13px] sm:text-sm text-[#003159] focus:outline-none focus:border-[#003159]"
                  onChange={setFlaskVol}
                  value={flaskVol}
                />
              </div>

              {/* Dynamic Context Panel */}
              {substance === 'detergen' && (
                <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-[#f8fafc] border border-[#cbd5e1]/40">
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#64748b]">Massa Molar (Mr) Asumsi</span>
                  <NumericInput
                    className="w-full bg-white px-2 py-1 border border-[#cbd5e1]/60 rounded-md font-['JetBrains_Mono'] text-[13px] sm:text-sm text-[#003159] focus:outline-none focus:border-[#003159]"
                    onChange={setCustomMr}
                    value={customMr}
                  />
                </div>
              )}
              {substance === 'mgcl2' && (
                <div className="flex flex-col justify-center p-2.5 rounded-lg bg-[#f8fafc] border border-[#cbd5e1]/40 text-[#42474f]">
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#64748b]">Metode</span>
                  <span className="font-['Inter'] text-sm font-semibold">Pengenceran dari 1M</span>
                </div>
              )}
              {substance === 'sds' && (
                <div className="flex flex-col justify-center p-2.5 rounded-lg bg-[#f8fafc] border border-[#cbd5e1]/40 text-[#42474f]">
                  <span className="font-['JetBrains_Mono'] text-[10px] text-[#64748b]">Metode</span>
                  <span className="font-['Inter'] text-sm font-semibold">Penimbangan Langsung</span>
                </div>
              )}
            </div>

            {/* Extra Info Row for Detergen Method */}
            {substance === 'detergen' && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[#f8fafc] border border-[#cbd5e1]/40 text-[#42474f]">
                <span className="font-['JetBrains_Mono'] text-[10px] text-[#64748b] px-1">Metode:</span>
                <span className="font-['Inter'] text-sm font-semibold">Penimbangan Langsung</span>
              </div>
            )}


            <div className="overflow-x-auto rounded-xl border border-[#cbd5e1]/40 mt-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f1f5f9] border-b border-[#cbd5e1]/40 font-['JetBrains_Mono'] text-xs text-[#003159]">
                    <th className="py-2.5 px-4 font-semibold">Labu</th>
                    <th className="py-2.5 px-4 font-semibold">Konsentrasi Target</th>
                    <th className="py-2.5 px-4 font-semibold whitespace-nowrap text-right">
                      {substance === "mgcl2" ? "Ambil Induk 1M" : "Timbang Padatan"}
                    </th>
                  </tr>
                </thead>
                <tbody className="font-['JetBrains_Mono'] text-sm text-[#0b1c30]">
                  {substance === "mgcl2"
                    ? mgcl2Rows.map((r, idx) => (
                        <tr key={idx} className="border-b border-[#cbd5e1]/20 hover:bg-[#eff4ff]/40">
                          <td className="py-2.5 px-4 font-semibold text-[#64748b]">{idx + 1}</td>
                          <td className="py-2.5 px-4 font-bold">{r.concentration.toFixed(2)} M</td>
                          <td className="py-2.5 px-4 text-right whitespace-nowrap">
                            <span className="px-2 py-1 bg-[#dce9ff] text-[#003159] rounded font-bold">
                              {r.aliquotMl.toFixed(1)} mL
                            </span>
                          </td>
                        </tr>
                      ))
                    : solidRows.map((r, idx) => (
                        <tr key={idx} className="border-b border-[#cbd5e1]/20 hover:bg-[#eff4ff]/40">
                          <td className="py-2.5 px-4 font-semibold text-[#64748b]">{idx + 1}</td>
                          <td className="py-2.5 px-4 font-bold">{r.concentration.toFixed(2)} M</td>
                          <td className="py-2.5 px-4 text-right whitespace-nowrap">
                            <span className="px-2 py-1 bg-[#d3f9d8] text-[#0f5132] rounded font-bold">
                              {r.directMass.toFixed(4)} g
                            </span>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#cbd5e1]/40 mt-auto">
              <h4 className="font-['JetBrains_Mono'] font-bold text-[13px] sm:text-sm text-[#00687a] mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">checklist</span> Langkah Kerja
              </h4>
              <ol className="text-[12px] sm:text-sm text-[#42474f] font-['Inter'] space-y-2 list-decimal pl-4">
                {substance === "mgcl2" && (
                  <>
                    <li>Siapkan larutan induk MgCl₂ 1 M.</li>
                    <li>Pipet larutan induk sesuai volume tabel ke dalam 5 labu ukur terpisah.</li>
                    <li>Tambahkan akuades hingga tanda batas pada masing-masing labu ukur.</li>
                    <li>Homogenkan hingga diperoleh 5 seri konsentrasi MgCl₂ (0,02 M s.d. 0,10 M).</li>
                  </>
                )}
                {substance === "sds" && (
                  <>
                    <li>Timbang serbuk SDS sesuai massa target yang telah dihitung pada tabel.</li>
                    <li>Masukkan masing-masing hasil timbangan ke dalam labu ukur terpisah (bisa dilarutkan dulu di beaker kecil).</li>
                    <li>Tambahkan akuades hingga tanda batas.</li>
                    <li>Homogenkan hingga larut sempurna (0,02 M s.d. 0,10 M).</li>
                  </>
                )}
                {substance === "detergen" && (
                  <>
                    <li>Timbang deterjen sesuai massa target yang telah dihitung pada tabel.</li>
                    <li>Masukkan masing-masing hasil timbangan ke dalam labu ukur terpisah (bisa dilarutkan dulu di beaker kecil).</li>
                    <li>Tambahkan akuades hingga tanda batas.</li>
                    <li>Homogenkan hingga larut sempurna (0,02 M s.d. 0,10 M).</li>
                  </>
                )}
              </ol>
            </div>
            
            <div className="p-3 rounded-lg bg-[#fffbeb] border border-[#fde68a]">
              <h4 className="font-['JetBrains_Mono'] font-bold text-[11px] sm:text-xs text-[#b45309] mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[13px] sm:text-sm">lightbulb</span> Catatan Penting
              </h4>
              <p className="text-[11px] sm:text-xs text-[#78350f] font-['Inter']">
                {substance === "mgcl2" && "Bilas pipet dengan sedikit larutan induk sebelum digunakan."}
                {substance === "sds" && "Gunakan kaca arloji dan masker saat menimbang."}
                {substance === "detergen" && "Detergen komersial adalah campuran. Nilai Mr hanyalah asumsi."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prosedur 3: Pengukuran (Dinamis dengan Tab) */}
      <div className="bg-white rounded-xl shadow-sm border border-[#cbd5e1]/60 overflow-hidden flex flex-col">
        <div className="bg-[#eff4ff] px-5 py-3 border-b border-[#cbd5e1]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-[#7c3aed] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-sm">3</span>
            <div>
              <h3 className="font-['Space_Grotesk'] font-bold text-[#7c3aed]">Pengukuran Densitas &amp; Kenaikan Kapiler</h3>
              <p className="font-['Inter'] text-xs text-[#64748b] mt-0.5">Diulang untuk setiap konsentrasi dari seri larutan yang sudah disiapkan.</p>
            </div>
          </div>
          <div className="flex bg-[#dce9ff] p-1 rounded-lg">
            <button
              onClick={() => setSubstance('mgcl2')}
              className={`px-4 py-1.5 rounded-md text-sm font-['JetBrains_Mono'] font-semibold transition-all ${
                substance === 'mgcl2' ? 'bg-white text-[#7c3aed] shadow-sm' : 'text-[#42474f] hover:text-[#003159]'
              }`}
            >
              (A) MgCl₂
            </button>
            <button
              onClick={() => setSubstance('sds')}
              className={`px-4 py-1.5 rounded-md text-sm font-['JetBrains_Mono'] font-semibold transition-all ${
                substance === 'sds' ? 'bg-white text-[#7c3aed] shadow-sm' : 'text-[#42474f] hover:text-[#003159]'
              }`}
            >
              (B) SDS
            </button>
            <button
              onClick={() => setSubstance('detergen')}
              className={`px-4 py-1.5 rounded-md text-sm font-['JetBrains_Mono'] font-semibold transition-all ${
                substance === 'detergen' ? 'bg-white text-[#7c3aed] shadow-sm' : 'text-[#42474f] hover:text-[#003159]'
              }`}
            >
              (C) Detergen
            </button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-lg border border-[#cbd5e1]/40 overflow-hidden bg-[#f8fafc]">
            {substance === 'mgcl2' && (
              <img src="/images/prosedur/prosedur-3a-mgcl2.jpg" alt="Prosedur 3A: Pengukuran MgCl2" className="w-full h-auto" />
            )}
            {substance === 'sds' && (
              <img src="/images/prosedur/prosedur-3b-sds.jpg" alt="Prosedur 3B: Pengukuran SDS" className="w-full h-auto" />
            )}
            {substance === 'detergen' && (
              <img src="/images/prosedur/prosedur-3c-detergen.jpg" alt="Prosedur 3C: Pengukuran Detergen" className="w-full h-auto" />
            )}
          </div>

          <div className="flex flex-col gap-3 justify-start">
            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#cbd5e1]/40">
              <h4 className="font-['JetBrains_Mono'] font-bold text-[13px] sm:text-sm text-[#00687a] mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">checklist</span> Langkah Pengukuran
              </h4>
              <ol className="text-[12px] sm:text-sm text-[#42474f] font-['Inter'] space-y-2 list-decimal pl-4">
                <li>Pindahkan larutan dari labu ukur ke dalam beaker.</li>
                <li>Dari beaker, pindahkan sebagian larutan ke dalam piknometer 5 mL.</li>
                <li>Timbang piknometer yang telah berisi 5 mL larutan tersebut. Hitung Δm = massa larutan (massa piknometer isi − massa piknometer kosong).</li>
                <li>Sisa larutan yang masih ada di beaker digunakan untuk mengukur tinggi kenaikan kapiler: celupkan pipa kapiler ke dalamnya, biarkan larutan naik, lalu ukur h larutan dengan jangka sorong.</li>
                <li>Ulangi langkah 1–4 untuk setiap konsentrasi (0,02 M s.d. 0,10 M) dari ketiga jenis larutan (MgCl₂, SDS, deterjen).</li>
              </ol>
            </div>
            <div className="p-3 rounded-xl bg-[#fffbeb] border border-[#fde68a]">
              <h4 className="font-['JetBrains_Mono'] font-bold text-[11px] sm:text-xs text-[#b45309] mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[13px] sm:text-sm">lightbulb</span> Catatan Penting
              </h4>
              <ul className="text-[11px] sm:text-xs text-[#78350f] font-['Inter'] space-y-1.5 list-disc pl-4">
                <li>Baca tinggi h dari <strong>dasar meniskus</strong> (meniskus cekung).</li>
                <li>Bilas kapiler dengan larutan berikutnya sebelum pengukuran.</li>
                <li>Tunggu permukaan kapiler stabil ±30 detik sebelum membaca.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};