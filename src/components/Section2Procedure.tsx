import React, { useState } from 'react';
import { NumericInput } from './NumericInput';

export const Section2Procedure: React.FC = () => {
  const [substance, setSubstance] = useState<'mgcl2' | 'sds' | 'detergen'>('mgcl2');
  const [flaskVol, setFlaskVol] = useState<number>(100);
  const [customMr, setCustomMr] = useState<number>(300.0);

  const concentrations = [0.02, 0.04, 0.06, 0.08, 0.10];

  const getMolarMass = () => {
    if (substance === 'mgcl2') return 95.21;
    if (substance === 'sds') return 288.38;
    return customMr;
  };

  // For MgCl2: Serial dilution from 1.0 M stock solution (V1 = C2 * V2 / 1.0)
  // For SDS & Detergen: Direct mass weighing (m = C * V * Mr)
  const flaskVolL = flaskVol / 1000;
  const currentMr = getMolarMass();

  const mgcl2Rows = concentrations.map((c) => {
    const aliquotMl = (c * flaskVol) / 1.0; // Dilution from 1 M stock
    return {
      concentration: c,
      aliquotMl,
    };
  });

  const solidRows = concentrations.map((c) => {
    const directMass = c * flaskVolL * currentMr;
    return {
      concentration: c,
      directMass,
    };
  });

  return (
    <section className="flex flex-col gap-8 scroll-mt-28" id="prosedur">
      {/* Header */}
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
          Peralatan Labu Ukur &amp; Neraca 4-Desimal
        </div>
      </div>

      {/* Equipment Deck (6 Items) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Piknometer */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
          <svg className="w-12 h-12 text-[#003159]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 48 48">
            <circle cx="24" cy="30" fill="#eff4ff" r="14" />
            <path d="M21 16V6H27V16" strokeLinecap="round" />
            <line strokeDasharray="2 2" strokeWidth="1.2" x1="24" x2="24" y1="6" y2="38" />
            <line strokeWidth="2" x1="17" x2="31" y1="44" y2="44" />
          </svg>
          <div className="flex flex-col">
            <span className="font-['Space_Grotesk'] font-bold text-sm text-[#003159]">Piknometer 5 mL</span>
            <span className="font-['Inter'] text-[11px] text-[#42474f]">Penentu densitas ρ</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#0D9488] font-['JetBrains_Mono'] text-[10px] font-semibold">
            Kalibrasi T
          </span>
        </div>

        {/* Kapiler & Statif */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
          <svg className="w-12 h-12 text-[#00687a]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 48 48">
            <line strokeWidth="1.5" x1="21" x2="21" y1="4" y2="42" />
            <line strokeWidth="1.5" x1="27" x2="27" y1="4" y2="42" />
            <path d="M12 44H36" strokeWidth="2.5" />
            <line x1="14" x2="18" y1="20" y2="20" />
            <line x1="14" x2="18" y1="28" y2="28" />
          </svg>
          <div className="flex flex-col">
            <span className="font-['Space_Grotesk'] font-bold text-sm text-[#003159]">Kapiler &amp; Statif</span>
            <span className="font-['Inter'] text-[11px] text-[#42474f]">Radius homogen</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#003159] font-['JetBrains_Mono'] text-[10px] font-semibold">
            Presisi Tinggi
          </span>
        </div>

        {/* Neraca Analitik */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
          <svg className="w-12 h-12 text-[#0D9488]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 48 48">
            <rect fill="#eff4ff" height="18" rx="2" width="32" x="8" y="24" />
            <rect fill="#ffffff" height="7" rx="1" width="20" x="14" y="28" />
            <line x1="24" x2="24" y1="12" y2="24" />
            <path d="M16 12H32" strokeLinecap="round" />
          </svg>
          <div className="flex flex-col">
            <span className="font-['Space_Grotesk'] font-bold text-sm text-[#003159]">Neraca Analitik</span>
            <span className="font-['Inter'] text-[11px] text-[#42474f]">Akurasi 0.0001 g</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#059669] font-['JetBrains_Mono'] text-[10px] font-semibold">
            4 Desimal
          </span>
        </div>

        {/* Labu Ukur 100mL */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
          <svg className="w-12 h-12 text-[#003159]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 48 48">
            <path d="M21 6H27V18L35 38C36 41 34 43 30 43H18C14 43 12 41 13 38L21 18V6Z" fill="#eff4ff" />
            <line strokeLinecap="round" x1="20" x2="28" y1="14" y2="14" />
          </svg>
          <div className="flex flex-col">
            <span className="font-['Space_Grotesk'] font-bold text-sm text-[#003159]">Labu Ukur 100mL</span>
            <span className="font-['Inter'] text-[11px] text-[#42474f]">Pengenceran seri</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#003159] font-['JetBrains_Mono'] text-[10px] font-semibold">
            Kelas A
          </span>
        </div>

        {/* Pipet Volumetrik */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
          <svg className="w-12 h-12 text-[#00687a]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 48 48">
            <line x1="24" x2="24" y1="4" y2="18" />
            <circle cx="24" cy="24" fill="#eff4ff" r="6" />
            <line x1="24" x2="24" y1="30" y2="44" />
            <line x1="21" x2="27" y1="12" y2="12" />
          </svg>
          <div className="flex flex-col">
            <span className="font-['Space_Grotesk'] font-bold text-sm text-[#003159]">Pipet Volumetrik</span>
            <span className="font-['Inter'] text-[11px] text-[#42474f]">Aliquot presisi</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#0D9488] font-['JetBrains_Mono'] text-[10px] font-semibold">
            Alir Bebas
          </span>
        </div>

        {/* Termometer Ruang */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col items-center text-center gap-2 hover:shadow-md transition-shadow">
          <svg className="w-12 h-12 text-[#D97706]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 48 48">
            <rect fill="#fffbeb" height="28" rx="3" width="6" x="21" y="6" />
            <circle cx="24" cy="38" fill="#D97706" r="6" />
            <line stroke="#D97706" strokeWidth="2" x1="24" x2="24" y1="16" y2="34" />
          </svg>
          <div className="flex flex-col">
            <span className="font-['Space_Grotesk'] font-bold text-sm text-[#003159]">Termometer Ruang</span>
            <span className="font-['Inter'] text-[11px] text-[#42474f]">Suhu mutlak (K)</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#eff4ff] text-[#D97706] font-['JetBrains_Mono'] text-[10px] font-semibold">
            ± 0.1 °C
          </span>
        </div>
      </div>

      {/* Live Preparation Calculator */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#cbd5e1]/40 pb-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#003159]">calculate</span>
              <h3 className="font-['Space_Grotesk'] font-bold text-xl text-[#003159]">
                Kalkulator Penimbangan Zat &amp; Pengenceran Labu
              </h3>
            </div>
            <span className="font-['Inter'] text-xs text-[#42474f]">
              Hitung massa padatan atau volume aliquot larutan stok untuk 5 konsentrasi (0.02 M - 0.10 M)
            </span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#eff4ff] px-3 py-1.5 rounded-lg border border-[#cbd5e1]/40">
              <label className="font-['JetBrains_Mono'] text-xs text-[#42474f] font-bold" htmlFor="calc-substance">
                Bahan:
              </label>
              <select
                className="bg-transparent font-['JetBrains_Mono'] text-xs text-[#003159] focus:outline-none font-semibold cursor-pointer"
                id="calc-substance"
                onChange={(e) => setSubstance(e.target.value as 'mgcl2' | 'sds' | 'detergen')}
                value={substance}
              >
                <option value="mgcl2">MgCl₂ (Pengenceran Stok 1 M)</option>
                <option value="sds">SDS (Mr = 288.38 g/mol - Penimbangan)</option>
                <option value="detergen">Deterjen (Mr Asumsi - Penimbangan)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-[#eff4ff] px-3 py-1.5 rounded-lg border border-[#cbd5e1]/40">
              <label className="font-['JetBrains_Mono'] text-xs text-[#42474f] font-bold" htmlFor="calc-flask-vol">
                Vol. Labu:
              </label>
              <NumericInput
                className="w-16 bg-transparent font-['JetBrains_Mono'] text-xs text-[#003159] font-bold text-center focus:outline-none border-b border-[#003159]"
                fallbackValue={100}
                id="calc-flask-vol"
                onChange={(val) => setFlaskVol(val > 0 ? val : 100)}
                placeholder="100"
                value={flaskVol}
              />
              <span className="font-['JetBrains_Mono'] text-xs text-[#42474f]">mL</span>
            </div>

            {substance === 'mgcl2' ? (
              <div className="flex items-center gap-2 bg-[#eff4ff] px-3 py-1.5 rounded-lg border border-[#cbd5e1]/40">
                <span className="font-['JetBrains_Mono'] text-xs text-[#42474f] font-bold">Stok Induk:</span>
                <span className="font-['JetBrains_Mono'] text-xs text-[#003159] font-bold">1.0 M</span>
              </div>
            ) : substance === 'detergen' ? (
              <div className="flex items-center gap-2 bg-[#eff4ff] px-3 py-1.5 rounded-lg border border-[#cbd5e1]/40">
                <label className="font-['JetBrains_Mono'] text-xs text-[#42474f] font-bold" htmlFor="calc-mr-custom">
                  Mr Asumsi:
                </label>
                <NumericInput
                  className="w-16 bg-transparent font-['JetBrains_Mono'] text-xs text-[#003159] font-bold text-center focus:outline-none border-b border-[#003159]"
                  fallbackValue={300}
                  id="calc-mr-custom"
                  onChange={(val) => setCustomMr(val > 0 ? val : 300)}
                  placeholder="300"
                  value={customMr}
                />
                <span className="font-['JetBrains_Mono'] text-xs text-[#42474f]">g/mol</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-[#eff4ff] px-3 py-1.5 rounded-lg border border-[#cbd5e1]/40">
                <span className="font-['JetBrains_Mono'] text-xs text-[#42474f] font-bold">Mr SDS:</span>
                <span className="font-['JetBrains_Mono'] text-xs text-[#003159] font-bold">288.38 g/mol</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 overflow-x-auto">
            {substance === 'mgcl2' ? (
              /* MgCl2: Serial Dilution from 1 M Stock Only (No direct mass, no status pelarutan) */
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#eff4ff] font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#42474f]">
                    <th className="py-2.5 px-3 rounded-l-lg">Konsentrasi Target (M)</th>
                    <th className="py-2.5 px-3">Aliquot dari Stok 1 M (mL)</th>
                    <th className="py-2.5 px-3 rounded-r-lg">Labu Ukur Tujuan</th>
                  </tr>
                </thead>
                <tbody className="font-['JetBrains_Mono'] text-xs divide-y divide-[#cbd5e1]/30">
                  {mgcl2Rows.map((row) => (
                    <tr key={row.concentration} className="hover:bg-[#eff4ff]/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[#003159]">{row.concentration.toFixed(2)} M</td>
                      <td className="py-2.5 px-3 text-[#00687a] font-bold text-sm">
                        {row.aliquotMl.toFixed(2)} mL
                      </td>
                      <td className="py-2.5 px-3 text-[#42474f]">
                        Pipet {row.aliquotMl.toFixed(2)} mL stok 1 M ke labu {flaskVol} mL, encerkan dengan aquades hingga tanda batas
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* SDS & Detergen: Direct Mass Weighing Only (No aliquot, no status pelarutan) */
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#eff4ff] font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#42474f]">
                    <th className="py-2.5 px-3 rounded-l-lg">Konsentrasi Target (M)</th>
                    <th className="py-2.5 px-3">Massa Ditimbang (g)</th>
                    <th className="py-2.5 px-3 rounded-r-lg">Prosedur Pelarutan</th>
                  </tr>
                </thead>
                <tbody className="font-['JetBrains_Mono'] text-xs divide-y divide-[#cbd5e1]/30">
                  {solidRows.map((row) => (
                    <tr key={row.concentration} className="hover:bg-[#eff4ff]/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[#003159]">{row.concentration.toFixed(2)} M</td>
                      <td className="py-2.5 px-3 text-[#003159] font-bold text-sm">
                        {row.directMass.toFixed(4)} g
                      </td>
                      <td className="py-2.5 px-3 text-[#42474f]">
                        Timbang {row.directMass.toFixed(4)} g padatan, larutkan dalam labu {flaskVol} mL hingga tanda batas
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* SOP Guidance Box */}
          <div className="lg:col-span-4 bg-[#eff4ff] p-4 rounded-xl flex flex-col justify-between gap-3 border border-[#cbd5e1]/40">
            {substance === 'mgcl2' ? (
              <>
                <div className="flex items-center gap-2 text-[#003159] font-['Space_Grotesk'] font-bold text-sm">
                  <span className="material-symbols-outlined text-[#D97706]">science</span>
                  SOP Seri Pengenceran MgCl₂ (Stok 1 M)
                </div>
                <p className="font-['Inter'] text-xs text-[#42474f] leading-relaxed">
                  Pada praktikum ini, preparasi MgCl₂ <span className="font-semibold text-[#003159]">tidak menggunakan penimbangan massa padatan</span>,
                  melainkan melalui <strong>seri pengenceran dari larutan stok awal 1 M</strong>. Gunakan pipet volumetrik / ukur
                  untuk mengambil volume aliquot presisi ke dalam labu ukur {flaskVol} mL, lalu encerkan dengan aquades murni hingga meniskus tepat menyentuh garis tanda batas labu (rumus: <span className="font-['JetBrains_Mono'] font-bold text-[#003159]">V₁M₁ = V₂M₂</span>).
                </p>
                <div className="p-2 rounded-lg bg-white text-[#42474f] font-['JetBrains_Mono'] text-[11px] flex items-center justify-between border border-[#cbd5e1]/40">
                  <span>Larutan Stok Awal: 1.0 M MgCl₂</span>
                  <span className="text-[#059669] font-bold">✓ Tanpa Menimbang</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-[#003159] font-['Space_Grotesk'] font-bold text-sm">
                  <span className="material-symbols-outlined text-[#0D9488]">balance</span>
                  SOP Penimbangan Massa Padatan {substance === 'sds' ? 'SDS' : 'Deterjen'}
                </div>
                <p className="font-['Inter'] text-xs text-[#42474f] leading-relaxed">
                  Untuk {substance === 'sds' ? 'natrium dodesil sulfat (SDS)' : 'deterjen komersial'}, preparasi larutan dilakukan
                  dengan <span className="font-semibold text-[#003159]">menimbang massa padatan langsung</span> menggunakan neraca
                  analitik ketelitian 4 desimal (0.0001 g) dengan rumus <span className="font-['JetBrains_Mono'] font-bold text-[#003159]">m = C × V × Mr</span>. Larutkan padatan dengan sedikit aquades hangat sebelum dimasukkan ke dalam labu ukur {flaskVol} mL.
                </p>
                <div className="p-2 rounded-lg bg-white text-[#42474f] font-['JetBrains_Mono'] text-[11px] flex items-center justify-between border border-[#cbd5e1]/40">
                  <span>Neraca Analitik 4 Desimal</span>
                  <span className="text-[#059669] font-bold">✓ Massa Langsung</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Procedural Steps Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-full bg-[#003159] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-sm">
              1
            </span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#42474f] uppercase font-medium">Fase Awal</span>
          </div>
          <h4 className="font-['Space_Grotesk'] font-bold text-base text-[#003159]">
            Kalibrasi Piknometer &amp; Air
          </h4>
          <p className="font-['Inter'] text-xs text-[#42474f] leading-relaxed">
            Timbang piknometer kosong yang bersih dan kering sempurna. Isi penuh dengan aquades murni hingga kapiler tutup
            terisi tanpa gelembung udara, keringkan dinding luar, lalu catat massanya. Ukur tinggi kenaikan kapiler
            aquades (<span className="font-['JetBrains_Mono'] font-semibold">h<sub>air</sub></span>) pada suhu ruang konstan.
          </p>
          <div className="mt-auto pt-2 text-[#EAB308] font-['JetBrains_Mono'] text-[11px] flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-sm">visibility</span>
            Hindari paralaks: baca tepat di dasar miniskus air
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-full bg-[#0D9488] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-sm">
              2
            </span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#42474f] uppercase font-medium">Seri Pengukuran</span>
          </div>
          <h4 className="font-['Space_Grotesk'] font-bold text-base text-[#003159]">
            Pengujian Seri Konsentrasi
          </h4>
          <p className="font-['Inter'] text-xs text-[#42474f] leading-relaxed">
            Ukur densitas dan kenaikan kapiler secara berurutan dari konsentrasi paling encer (0.02 M) ke paling pekat (0.10 M).
            Bersihkan dan bilas pipa kapiler menggunakan sedikit larutan yang akan diuji berikutnya sebelum pencelupan final.
          </p>
          <div className="mt-auto pt-2 text-[#00687a] font-['JetBrains_Mono'] text-[11px] flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-sm">swap_vert</span>
            Urutan encer → pekat meminimalkan kontaminasi
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#cbd5e1]/60 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-sm">
              3
            </span>
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#42474f] uppercase font-medium">Bilas &amp; Ulang</span>
          </div>
          <h4 className="font-['Space_Grotesk'] font-bold text-base text-[#003159]">
            Transisi Antar Bahan Uji
          </h4>
          <p className="font-['Inter'] text-xs text-[#42474f] leading-relaxed">
            Saat beralih bahan (misal dari MgCl₂ ke SDS), bilas piknometer dan pipa kapiler minimal 3 kali dengan aquades hangat
            dan aseton teknis untuk melarutkan sisa surfaktan yang teradsorpsi kuat pada dinding silikat kaca.
          </p>
          <div className="mt-auto pt-2 text-[#E11D48] font-['JetBrains_Mono'] text-[11px] flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-sm">report</span>
            Residu surfaktan akan mendegradasi γ air murni
          </div>
        </div>
      </div>
    </section>
  );
};
