import React from 'react';
import { analyzeAll, type AcidAnalysis } from './analysis';
import { alphaWithSucroseSeries, fmt, lnChartSeries, sci } from './AnalisisStep';
import { Chart } from './Chart';
import { ACIDS, formatMinutes, scheduleLabel, type InversiState } from './state';
import { Tex } from './Tex';
import type { AuthUser } from '../../platform/api';

interface PrintProps {
  state: InversiState;
  user: AuthUser;
}

const H3: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-sm font-bold uppercase tracking-wide border-b border-slate-400 pb-1 mb-3 mt-6">{children}</h3>
);

const Placeholder: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border border-dashed border-slate-400 rounded p-2 text-slate-500 italic text-xs text-center">{children}</div>
);

const PasteBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="border-2 border-dashed border-slate-400 bg-slate-50 rounded-lg py-2 px-3 text-center text-xs font-bold text-slate-700 break-inside-avoid">✂ Tempelkan {children}</div>
);

const DocHeader: React.FC<{ title: string; user: AuthUser; state: InversiState }> = ({ title, user, state }) => (
  <div className="border-b-2 border-black pb-3 mb-4">
    <p className="text-[11px] font-mono text-slate-600 m-0">SRS Lab · Praktikum Kimia Fisik · Modul Laju Inversi Gula</p>
    <h1 className="text-xl font-bold m-0 mt-1">{title}</h1>
    <p className="text-xs m-0 mt-1">
      <strong>{user.displayName}</strong>
      {user.members.length ? ` — ${user.members.join(', ')}` : ''} · Dicetak {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
      {state.temperatureC !== null ? ` · Suhu ${String(state.temperatureC).replace('.', ',')} °C` : ''}
    </p>
  </div>
);

/** Contoh perhitungan untuk satu asam (titik pertama & terakhir yang dipakai). */
const WorkedExample: React.FC<{ a: AcidAnalysis; roman: string; state: InversiState }> = ({ a, roman, state }) => {
  const info = ACIDS[a.key];
  const first = a.used[0];
  const last = a.used[a.used.length - 1];
  const zero = a.zero;
  const raw = state.acids[a.key].alphaInf;

  if (!first || !a.regression || a.alphaInf === null) {
    return (
      <div className="mb-5 break-inside-avoid">
        <h4 className="text-sm font-bold bg-slate-100 p-2 border-l-4 border-slate-700">{roman}. {info.label}</h4>
        <p className="text-xs italic text-slate-500 ml-2">Data belum lengkap — isi minimal 3 pembacaan dan α∞ di Lembar Kerja.</p>
      </div>
    );
  }
  const pts = [first, last].filter((p, i, arr) => arr.indexOf(p) === i);
  return (
    <div className="mb-6">
      <h4 className="text-sm font-bold bg-slate-100 p-2 border-l-4 border-slate-700 mb-2">{roman}. {info.label}</h4>
      <p className="text-[11px] italic text-slate-500 ml-2 mb-3">*Contoh dihitung untuk titik pertama dan terakhir; titik lainnya dihitung dengan cara yang sama (lihat tabel).</p>
      <div className="ml-2 space-y-4 text-xs">
        <div className="break-inside-avoid">
          <p className="font-bold m-0 mb-1">a. Koreksi titik nol</p>
          <Tex>{String.raw`\alpha = \alpha_{\text{baca}} - \alpha_{\text{nol}}`}</Tex>
          <ul className="list-disc ml-5 mt-1 space-y-1">
            {pts.map((p) => (
              <li key={p.index}>
                t = {formatMinutes(p.t)}: <Tex>{`\\alpha_t = ${fmt(p.alphaRead, 2)} - (${fmt(zero, 2)}) = ${fmt(p.alphaT, 2)}^\\circ`}</Tex>
              </li>
            ))}
            <li>
              α∞: <Tex>{`\\alpha_\\infty = ${fmt(raw, 2)} - (${fmt(zero, 2)}) = ${fmt(a.alphaInf, 2)}^\\circ`}</Tex>
            </li>
          </ul>
        </div>
        <div className="break-inside-avoid">
          <p className="font-bold m-0 mb-1">b. Menghitung ln(αₜ − α∞)</p>
          <ul className="list-disc ml-5 space-y-1">
            {pts.map((p) => (
              <li key={p.index}>
                t = {formatMinutes(p.t)}: <Tex>{`\\ln(${fmt(p.alphaT, 2)} - (${fmt(a.alphaInf, 2)})) = \\ln(${fmt(p.diff, 2)}) = ${fmt(p.lnDiff, 4)}`}</Tex>
              </li>
            ))}
          </ul>
        </div>
        <div className="break-inside-avoid">
          <p className="font-bold m-0 mb-1">c. Regresi linear ln(αₜ − α∞) terhadap t ({a.used.length} titik)</p>
          <Tex block>{`\\ln(\\alpha_t-\\alpha_\\infty) = ${fmt(a.regression.intercept, 4)} ${a.regression.slope >= 0 ? '+' : '-'} ${fmt(Math.abs(a.regression.slope), 5)}\\,t \\qquad R^2 = ${fmt(a.regression.r2, 4)}`}</Tex>
        </div>
        <div className="break-inside-avoid">
          <p className="font-bold m-0 mb-1">d. Tetapan laju dan waktu paruh</p>
          <Tex block>{`k = -\\text{kemiringan} = ${fmt(a.k, 5)}\\ \\text{menit}^{-1} = ${fmt((a.k as number) / 60, 7)}\\ \\text{s}^{-1}`}</Tex>
          <Tex block>{`t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0{,}6931}{${fmt(a.k, 5)}} = ${fmt(a.tHalf, 1)}\\ \\text{menit}`}</Tex>
        </div>
        <div className="break-inside-avoid">
          <p className="font-bold m-0 mb-1">e. α₀ dari intersep</p>
          <Tex block>{`\\alpha_0 = \\alpha_\\infty + e^{\\text{intersep}} = ${fmt(a.alphaInf, 2)} + e^{${fmt(a.regression.intercept, 4)}} = ${fmt(a.alpha0, 2)}^\\circ`}</Tex>
        </div>
        {last.conversion !== null && (
          <div className="break-inside-avoid">
            <p className="font-bold m-0 mb-1">f. Sukrosa terhidrolisis pada t = {formatMinutes(last.t)}</p>
            <Tex block>{`\\frac{\\alpha_0-\\alpha_t}{\\alpha_0-\\alpha_\\infty}\\times100\\% = \\frac{${fmt(a.alpha0, 2)} - ${fmt(last.alphaT, 2)}}{${fmt(a.alpha0, 2)} - (${fmt(a.alphaInf, 2)})}\\times100\\% = ${fmt(last.conversion * 100, 1)}\\%`}</Tex>
          </div>
        )}
      </div>
    </div>
  );
};

export const InversiReport: React.FC<PrintProps> = ({ state, user }) => {
  const { hcl, sucrose, alpha0Diff, infRatio } = analyzeAll(state);
  return (
    <div className="max-w-[780px] mx-auto p-6 text-[13px] leading-relaxed font-ui">
      <DocHeader title="Panduan Laporan Praktikum — Laju Inversi Gula" user={user} state={state} />
      <p className="text-[11px] bg-slate-100 border border-slate-300 rounded p-2 mb-4">
        Dokumen ini adalah <strong>panduan</strong>: angka sudah dihitung dari data kelompok, tetapi pembahasan dan kesimpulan tetap harus ditulis dengan kata-kata sendiri di buku laporan.
      </p>

      <div className="bg-slate-800 text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wider rounded-t">Bagian I: Jurnal praktikum (pra-lab)</div>
      <div className="space-y-3 text-xs mt-3">
        <div>
          <p className="font-bold m-0 mb-1">A. Judul percobaan</p>
          <p className="m-0 pl-3 border-l-2 border-slate-300">Penentuan Tetapan Laju Reaksi Inversi Gula (Hidrolisis Sukrosa) Berkatalis Asam Klorida dengan Polarimeter</p>
        </div>
        {['B. Tujuan percobaan', 'C. Dasar teori', 'D. Alat dan bahan', 'E. MSDS (Akuades, Sukrosa, HCl)', 'F. Cara kerja (diagram alir)'].map((t) => (
          <div key={t}>
            <p className="font-bold m-0 mb-1">{t}</p>
            <Placeholder>(Dikerjakan di jurnal)</Placeholder>
          </div>
        ))}
      </div>

      <div className="my-6 border-t-2 border-dashed border-slate-400" />
      <div className="bg-slate-800 text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wider rounded-t">Bagian II: Laporan praktikum</div>

      <H3>G. Data pengamatan</H3>
      <div className="grid grid-cols-2 gap-2">
        <PasteBox>Tabel 1: Air suling, sukrosa murni &amp; kondisi</PasteBox>
        <PasteBox>Tabel 2: Data sukrosa + HCl 4 N</PasteBox>
        <PasteBox>Tabel 3: Ringkasan hasil</PasteBox>
      </div>

      <H3>H. Pengolahan data</H3>
      <WorkedExample a={hcl} roman="I" state={state} />
      <div className="mb-6 break-inside-avoid">
        <h4 className="text-sm font-bold bg-slate-100 p-2 border-l-4 border-slate-700 mb-2">II. Sukrosa murni (tanpa asam) sebagai pembanding α₀</h4>
        {sucrose.corrected === null ? (
          <p className="text-xs italic text-slate-500 ml-2">Pembacaan sukrosa murni belum diisi.</p>
        ) : (
          <div className="ml-2 space-y-2 text-xs">
            <Tex block>{`\\alpha_{\\text{sukrosa}} = ${fmt(state.sucroseReading, 2)} - (${fmt(state.zeroReading ?? 0, 2)}) = ${fmt(sucrose.corrected, 2)}^\\circ`}</Tex>
            {state.sucroseDiluted ? (
              <p className="m-0">Sukrosa diukur dengan pengenceran 1 : 1 (sama dengan campuran reaksi), sehingga α₀ yang diharapkan = {fmt(sucrose.expectedAlpha0, 2)}°.</p>
            ) : (
              <>
                <p className="m-0">Larutan stok diencerkan menjadi setengahnya ketika dicampur HCl 1 : 1, sehingga:</p>
                <Tex block>{`\\alpha_{0,\\text{harapan}} = \\tfrac{1}{2}\\,\\alpha_{\\text{sukrosa}} = \\tfrac{1}{2}(${fmt(sucrose.corrected, 2)}) = ${fmt(sucrose.expectedAlpha0, 2)}^\\circ`}</Tex>
              </>
            )}
            {alpha0Diff !== null && (
              <Tex block>{`\\alpha_{0,\\text{intersep}} - \\alpha_{0,\\text{harapan}} = ${fmt(hcl.alpha0, 2)} - ${fmt(sucrose.expectedAlpha0, 2)} = ${fmt(alpha0Diff, 2)}^\\circ`}</Tex>
            )}
            {infRatio !== null && (
              <Tex block>{`\\frac{\\alpha_\\infty}{\\alpha_{0,\\text{harapan}}} = \\frac{${fmt(hcl.alphaInf, 2)}}{${fmt(sucrose.expectedAlpha0, 2)}} = ${fmt(infRatio, 2)} \\quad (\\text{teori} \\approx -0{,}32)`}</Tex>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <PasteBox>Grafik 1: ln(αₜ − α∞) vs t</PasteBox>
          <PasteBox>Grafik 2: αₜ vs t</PasteBox>
        </div>
      </div>

      <H3>I. Pembahasan (poin panduan)</H3>
      <ol className="text-xs space-y-2 pl-5 m-0">
        <li><strong>Orde pertama semu.</strong> Jelaskan mengapa [H₂O] dan [H⁺] dianggap tetap sehingga laju hanya bergantung pada [sukrosa].</li>
        <li>
          <strong>Inversi sudut putar.</strong> Pada sampel HCl, α turun dari {fmt(hcl.alpha0, 2)}° (α₀) menuju {fmt(hcl.alphaInf, 2)}° (α∞) — kaitkan dengan rotasi
          spesifik sukrosa (+66,5°), glukosa (+52,7°), dan fruktosa (−92,4°).
        </li>
        <li><strong>Kelinearan grafik.</strong> R² = {fmt(hcl.regression?.r2, 4)}. Grafik ln(αₜ − α∞) vs t yang linear membuktikan reaksi berorde satu (semu).</li>
        <li>
          <strong>Peran katalis H⁺.</strong> Sukrosa murni memiliki sudut putar tetap ({fmt(sucrose.corrected, 2)}°), sedangkan setelah HCl ditambahkan α turun dengan
          k = {sci(hcl.k)} menit⁻¹. Jelaskan mengapa tanpa H⁺ hidrolisis sukrosa sangat lambat (waktu paruh ±10 minggu pada pH netral).
        </li>
        <li>
          <strong>Validasi α₀ dan α∞.</strong> α₀ dari intersep ({fmt(hcl.alpha0, 2)}°) dibanding α₀ dari sukrosa murni ({fmt(sucrose.expectedAlpha0, 2)}°); rasio
          α∞/α₀ = {fmt(infRatio, 2)} (teori ≈ −0,32). Bahas arti kecocokan atau perbedaannya.
        </li>
        <li><strong>Waktu paruh.</strong> t½ HCl = {fmt(hcl.tHalf, 1)} menit. Berapa persen sukrosa terhidrolisis setelah 30 menit pengamatan?</li>
        <li><strong>Sumber kesalahan.</strong> Ketepatan waktu baca, gelembung udara di tabung, fluktuasi suhu, pemanasan α∞ yang kurang/berlebih (karamelisasi), dan pembacaan titik nol.</li>
        {hcl.expFit?.ok && (
          <li>
            <strong>Pembanding (opsional).</strong> Fitting eksponensial tanpa α∞ terukur memberi k = {sci(hcl.expFit.k)} menit⁻¹ dan α∞ = {fmt(hcl.expFit.alphaInf, 2)}°.
            Bandingkan dengan hasil metode grafik.
          </li>
        )}
      </ol>

      <H3>J. Kesimpulan (draf)</H3>
      <ol className="text-xs space-y-1.5 pl-5 m-0">
        <li>Hidrolisis sukrosa berkatalis HCl mengikuti kinetika orde pertama semu (grafik ln(αₜ − α∞) terhadap t linear, R² = {fmt(hcl.regression?.r2, 4)}).</li>
        <li>Tetapan laju dengan HCl 4 N: k = {sci(hcl.k)} menit⁻¹ = {sci(hcl.k !== null ? hcl.k / 60 : null)} s⁻¹ (t½ = {fmt(hcl.tHalf, 1)} menit).</li>
        <li>Ion H⁺ berperan sebagai katalis: sukrosa tanpa asam memiliki sudut putar tetap, sedangkan dengan HCl sudut putar turun hingga berbalik negatif.</li>
      </ol>

      <H3>K. Jawaban pertanyaan &amp; daftar pustaka</H3>
      <div className="text-xs space-y-2">
        <p className="m-0">
          <strong>1. Arti orde pertama semu:</strong> reaksi sebenarnya melibatkan sukrosa, air, dan H⁺, tetapi [H₂O] (pelarut berlebih) dan [H⁺] (katalis) praktis tetap,
          sehingga laju hanya tampak bergantung pada [sukrosa]¹ dengan k = k′[H₂O]ᵇ[H⁺]ᶜ.
        </p>
        <p className="m-0"><strong>2. Penurunan persamaan (6) dan (9):</strong> lihat langkah 1 (Teori) di website — tuliskan ulang langkah integrasi dan substitusi sudut putar.</p>
        <ol className="pl-5 m-0 mt-2 space-y-1">
          <li>Atkins, P. W. (1998). <em>Physical Chemistry</em> (6th ed.). Oxford University Press.</li>
          <li>Bettelheim, F. A. (1971). <em>Experimental Physical Chemistry</em>. W. B. Saunders Co., Philadelphia, hlm. 269.</li>
          <li>Benson, S. W. (1960). <em>The Foundations of Chemical Kinetics</em>. McGraw-Hill, hlm. 570–579.</li>
          <li>Frost, A. A., &amp; Pearson, R. G. <em>Kinetics and Mechanism</em>, hlm. 200–205.</li>
        </ol>
      </div>
    </div>
  );
};

const Cut: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-2 border-dashed border-slate-500 rounded p-3 mb-4 break-inside-avoid">
    <p className="text-[10px] font-mono text-slate-500 m-0 mb-1">✂ — gunting di sepanjang garis</p>
    <p className="text-xs font-bold m-0 mb-2">{title}</p>
    {children}
  </div>
);

const td = 'border border-slate-400 px-1.5 py-1 text-center';

export const InversiSheet: React.FC<PrintProps> = ({ state, user }) => {
  const { hcl, sucrose } = analyzeAll(state);
  return (
    <div className="max-w-[780px] mx-auto p-6 font-ui">
      <DocHeader title="Lembar Tabel & Grafik (Siap Gunting)" user={user} state={state} />
      <Cut title="Tabel 1. Air suling, sukrosa murni & kondisi">
        <table className="w-full border-collapse text-[11px]">
          <tbody>
            <tr>
              <td className={td}>Titik nol (air suling)</td><td className={td}>{fmt(state.zeroReading, 2)}°</td>
              <td className={td}>Panjang tabung</td><td className={td}>{fmt(state.tubeLength, 1)} dm</td>
            </tr>
            <tr>
              <td className={td}>α sukrosa murni (baca / terkoreksi)</td><td className={td}>{fmt(state.sucroseReading, 2)}° / {fmt(sucrose.corrected, 2)}°</td>
              <td className={td}>α₀ yang diharapkan</td><td className={td}>{fmt(sucrose.expectedAlpha0, 2)}°</td>
            </tr>
            <tr>
              <td className={td}>Suhu ruang</td><td className={td}>{fmt(state.temperatureC, 1)} °C</td>
              <td className={td}>Sukrosa / HCl setelah campur</td><td className={td}>0,292 M / 2 N</td>
            </tr>
          </tbody>
        </table>
      </Cut>
      <Cut title={`Tabel 2. Data pengamatan — ${ACIDS.hcl.label}`}>
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-slate-100">
              {['No', 't jadwal (mnt)', 't aktual', 'α baca (°)', 'αₜ (°)', 'αₜ − α∞ (°)', 'ln(αₜ − α∞)'].map((h) => <th key={h} className={td}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {hcl.rows.filter((r) => r.t !== null || r.alphaRead !== null).map((r) => (
              <tr key={r.index}>
                <td className={td}>{r.index + 1}</td>
                <td className={td}>{scheduleLabel(r.scheduled)}</td>
                <td className={td}>{formatMinutes(r.t)}</td>
                <td className={td}>{fmt(r.alphaRead, 2)}</td>
                <td className={td}>{fmt(r.alphaT, 2)}</td>
                <td className={td}>{fmt(r.diff, 2)}</td>
                <td className={td}>{r.status === 'tidak-valid' ? 'tak terdefinisi' : fmt(r.lnDiff, 4)}</td>
              </tr>
            ))}
            <tr className="bg-slate-50">
              <td className={td} colSpan={3}>α∞ (baca / terkoreksi)</td>
              <td className={td}>{fmt(state.acids.hcl.alphaInf, 2)}</td>
              <td className={td}>{fmt(hcl.alphaInf, 2)}</td>
              <td className={td} colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </Cut>
      <Cut title="Tabel 3. Ringkasan hasil">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-slate-100">{['Sampel', 'Kemiringan', 'R²', 'k (menit⁻¹)', 'k (s⁻¹)', 't½ (menit)', 'α₀ (°)'].map((h) => <th key={h} className={td}>{h}</th>)}</tr>
          </thead>
          <tbody>
            <tr>
              <td className={td}>Sukrosa + HCl 4 N</td>
              <td className={td}>{fmt(hcl.regression?.slope, 5)}</td>
              <td className={td}>{fmt(hcl.regression?.r2, 4)}</td>
              <td className={td}>{sci(hcl.k)}</td>
              <td className={td}>{sci(hcl.k !== null ? hcl.k / 60 : null)}</td>
              <td className={td}>{fmt(hcl.tHalf, 1)}</td>
              <td className={td}>{fmt(hcl.alpha0, 2)}</td>
            </tr>
            <tr>
              <td className={td}>Sukrosa murni (tanpa asam)</td>
              <td className={td} colSpan={5}>α terkoreksi = {fmt(sucrose.corrected, 2)}° → α₀ harapan = {fmt(sucrose.expectedAlpha0, 2)}° (k tidak dihitung)</td>
              <td className={td}>{fmt(sucrose.expectedAlpha0, 2)}</td>
            </tr>
          </tbody>
        </table>
      </Cut>
      <div style={{ breakBefore: 'page' }} />
      <Cut title={`Grafik 1. ln(αₜ − α∞) terhadap t — ${ACIDS.hcl.label}`}>
        <Chart
          xLabel="t (menit)"
          yLabel="ln(αₜ − α∞)"
          subtitle={hcl.regression ? `y = ${fmt(hcl.regression.intercept, 4)} ${hcl.regression.slope >= 0 ? '+' : '−'} ${fmt(Math.abs(hcl.regression.slope), 5)}t · R² = ${fmt(hcl.regression.r2, 4)}` : 'data belum lengkap'}
          title=" "
          series={lnChartSeries(hcl)}
          height={330}
        />
      </Cut>
      <Cut title="Grafik 2. αₜ terhadap t — sukrosa + HCl (titik berongga: α₀ dari sukrosa murni)">
        <Chart xLabel="t (menit)" yLabel="αₜ terkoreksi (°)" series={alphaWithSucroseSeries(hcl, sucrose)} height={330} yZeroLine />
      </Cut>
    </div>
  );
};
