import React from 'react';
import { Card, CardTitle, Note } from './ui';
import { Stopwatch } from './Stopwatch';
import type { AcidKey, InversiState } from './state';

interface ProsedurStepProps {
  state: InversiState;
  setState: React.Dispatch<React.SetStateAction<InversiState>>;
  now: number;
  acid: AcidKey;
  onSelectAcid: (k: AcidKey) => void;
  onGoToWorksheet: () => void;
}

const TOOLS = [
  ['Polarimeter', '1 buah'],
  ['Tabung polarimeter', '1 buah'],
  ['Lampu uap natrium', '1 buah'],
  ['Stopwatch (bisa pakai website ini)', '1 buah'],
  ['Labu Erlenmeyer 100 mL', '1 buah'],
  ['Gelas ukur 100 mL', '1 buah'],
  ['Pipet volume 25 mL', '1 buah'],
];

const CHEMICALS = [
  ['Sukrosa (p.a.)', '20 gram'],
  ['Larutan asam klorida (p.a.)', '4 N'],
  ['Air suling (untuk sampel referensi)', '25 mL'],
];

const Steps: React.FC<{ items: React.ReactNode[]; start?: number }> = ({ items, start = 1 }) => (
  <ol className="m-0 p-0 list-none flex flex-col gap-3">
    {items.map((item, i) => (
      <li key={i} className="flex gap-3 text-[16px] leading-relaxed">
        <span className="shrink-0 w-8 h-8 rounded-full bg-spek-indigo text-white font-heading font-bold text-sm flex items-center justify-center">{start + i}</span>
        <div className="flex-1 pt-0.5">{item}</div>
      </li>
    ))}
  </ol>
);

const PhaseTag: React.FC<{ letter: string; color: string }> = ({ letter, color }) => (
  <span className="shrink-0 w-10 h-10 rounded-xl text-white font-heading font-extrabold text-lg flex items-center justify-center" style={{ background: color }}>
    {letter}
  </span>
);

export const ProsedurStep: React.FC<ProsedurStepProps> = ({ state, setState, now, acid, onSelectAcid, onGoToWorksheet }) => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <span className="text-xs font-extrabold tracking-wider text-spek-orange">LANGKAH 2 DARI 5</span>
      <h1 className="m-0 font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Prosedur &amp; stopwatch</h1>
      <p className="m-0 text-spek-muted text-[16px] max-w-[760px] leading-relaxed">
        Langkah kerja dari modul, dikelompokkan per tahap. Stopwatch di tahap C menyimpan waktu baca sebenarnya dan memberi bunyi/getar saat jadwal tiba.
      </p>
    </div>

    <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))]">
      <Card>
        <CardTitle number="1">Alat</CardTitle>
        <div className="flex flex-wrap gap-5 items-start">
          <img src="/images/inversi/polarimeter.jpg" alt="Polarimeter (Gambar 5.2 modul)" className="w-36 h-auto rounded-2xl bg-white" loading="lazy" />
          <ul className="m-0 p-0 list-none flex-[1_1_200px] flex flex-col divide-y divide-spek-violet-tint">
            {TOOLS.map(([name, qty]) => (
              <li key={name} className="flex justify-between gap-3 py-2 text-[15px]">
                <span>{name}</span>
                <span className="font-mono text-sm text-spek-muted shrink-0">{qty}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
      <Card>
        <CardTitle number="2">Bahan kimia</CardTitle>
        <ul className="m-0 p-0 list-none flex flex-col divide-y divide-spek-violet-tint">
          {CHEMICALS.map(([name, qty]) => (
            <li key={name} className="flex justify-between gap-3 py-2 text-[15px]">
              <span>{name}</span>
              <span className="font-mono text-sm text-spek-muted shrink-0">{qty}</span>
            </li>
          ))}
        </ul>
        <Note kind="warn" title="KESELAMATAN">
          HCl 4 N <strong>korosif</strong> dan uapnya mengiritasi. Gunakan sarung tangan, kacamata pelindung, dan jas lab; tuang asam di lemari asam bila tersedia;
          bilas segera dengan air mengalir bila terkena kulit.
        </Note>
      </Card>
    </div>

    <Card>
      <div className="flex items-start gap-3">
        <PhaseTag letter="A" color="#1E1B4B" />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-extrabold tracking-wider text-spek-orange">TAHAP A</span>
          <h2 className="m-0 font-heading text-2xl font-extrabold tracking-tight">Titik nol polarimeter</h2>
        </div>
      </div>
      <Steps
        items={[
          'Pelajari cara penggunaan polarimeter (Gambar 5.2).',
          'Lepaskan salah satu tutup tabung polarimeter beserta kaca jendelanya. Bersihkan tabung dengan air suling.',
          'Isi tabung dengan air suling sampai penuh hingga permukaannya cembung di bibir tabung. Geser kaca jendela perlahan di bibir tabung agar tidak ada gelembung udara, lalu pasang tutupnya rapat.',
          <>Ukur sudut putar air suling. Catat sebagai <strong>titik nol</strong> untuk koreksi semua pembacaan berikutnya. Kosongkan dan keringkan tabung.</>,
        ]}
      />
      <Note kind="tip" title="MEMBACA POLARIMETER">
        Putar analisator sampai kedua (atau ketiga) bagian medan pandang tampak <strong>sama terang</strong>. Baca skala utama, lalu tambahkan bacaan nonius.
        Ulangi 2–3 kali dan ambil rata-ratanya bila waktu memungkinkan.
      </Note>
    </Card>

    <Card>
      <div className="flex items-start gap-3">
        <PhaseTag letter="B" color="#6D28D9" />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-extrabold tracking-wider text-spek-orange">TAHAP B</span>
          <h2 className="m-0 font-heading text-2xl font-extrabold tracking-tight">Larutan sukrosa</h2>
        </div>
      </div>
      <Steps
        start={5}
        items={[
          'Larutkan 20 gram sukrosa dalam 100 mL air suling. Saring bila larutan tidak jernih.',
          'Pipet 25 mL larutan sukrosa ke Erlenmeyer 1 (sampel HCl) dan 25 mL lagi ke Erlenmeyer 2 (referensi).',
          'Siapkan 25 mL HCl 4 N dan 25 mL air suling. Pastikan stopwatch siap — di website ini, buka tahap C di bawah.',
        ]}
      />
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))]">
        {[
          ['Sukrosa awal', '20 g / 100 mL ≈ 0,584 M', 'Mr sukrosa 342,30'],
          ['Setelah dicampur 1 : 1', '≈ 0,292 M sukrosa', 'volume menjadi 50 mL'],
          ['HCl setelah dicampur', '4 N → 2 N', 'referensi: tanpa asam'],
        ].map(([title, value, note]) => (
          <div key={title} className="rounded-2xl bg-spek-soft p-4 flex flex-col gap-1">
            <span className="text-xs font-extrabold tracking-wider text-spek-violet-deep">{title.toUpperCase()}</span>
            <span className="font-mono text-[15px] font-bold">{value}</span>
            <span className="text-xs text-spek-muted">{note}</span>
          </div>
        ))}
      </div>
    </Card>

    <Card className="bg-[#FFF7ED]">
      <div className="flex items-start gap-3">
        <PhaseTag letter="C" color="#C2410C" />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-extrabold tracking-wider text-spek-orange">TAHAP C</span>
          <h2 className="m-0 font-heading text-2xl font-extrabold tracking-tight">Mulai reaksi &amp; baca sudut putar</h2>
        </div>
      </div>
      <Steps
        start={8}
        items={[
          <>Tambahkan 25 mL HCl 4 N ke Erlenmeyer 1. <strong>Tekan Mulai (HCl) tepat saat mencampurkan</strong> — itulah t = 0. Aduk sampai rata. Tambahkan 25 mL air suling ke Erlenmeyer 2 (referensi) dan mulai stopwatch Referensi.</>,
          'Segera bilas tabung polarimeter dengan sedikit campuran, lalu isi penuh dengan campuran reaksi.',
          'Baca sudut putar sesuai jadwal. Tekan "Catat waktu baca" tepat saat membaca, lalu ketik sudutnya.',
        ]}
      />
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-[15px] max-w-[560px]">
          <caption className="text-left text-xs font-extrabold tracking-wider text-spek-orange-deep pb-2">TABEL 5.1 · PERIODE WAKTU PENGUKURAN</caption>
          <thead>
            <tr className="text-left text-xs font-bold text-white">
              <th className="bg-spek-indigo px-3 py-2.5 rounded-l-xl">Periode</th>
              <th className="bg-spek-indigo px-3 py-2.5 rounded-r-xl">Waktu pengukuran</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['0 – 30 menit', 'Segera setelah mungkin, lalu tiap 5 menit'],
              ['30 – 60 menit', 'Tiap 8 menit'],
              ['60 – 120 menit', 'Tiap 15 menit'],
            ].map(([p, w]) => (
              <tr key={p}>
                <td className="px-3 py-2.5 border-b border-[#FED7AA] font-semibold whitespace-nowrap">{p}</td>
                <td className="px-3 py-2.5 border-b border-[#FED7AA]">{w}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note kind="info" title="TENTANG JADWAL">
        Tiap 8 menit dari menit 30 jatuh di 38, 46, 54, lalu 62 — tidak tepat di 60. Jadwal default di website: 0, 5, …, 30, 38, 46, 54, <strong>60</strong>,
        75, 90, 105, 120. Waktu baca yang dipakai dalam perhitungan selalu <strong>waktu aktual</strong>, jadi sedikit terlambat tidak masalah.
      </Note>
      <Stopwatch state={state} setState={setState} now={now} acid={acid} onSelectAcid={onSelectAcid} />
      <Note kind="tip" title="SAMPEL HCl & REFERENSI">
        Kedua stopwatch berjalan sendiri-sendiri. Prioritaskan jadwal sampel HCl karena α-nya berubah cepat. Referensi boleh dibaca lebih jarang di sela jadwal HCl
        (sesuai arahan aslab) — baris yang tidak dibaca cukup dikosongkan. Peringatan bunyi muncul 30 detik sebelum dan tepat pada jadwal, di langkah mana pun.
      </Note>
    </Card>

    <Card>
      <div className="flex items-start gap-3">
        <PhaseTag letter="D" color="#3F6212" />
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-extrabold tracking-wider text-spek-orange">TAHAP D</span>
          <h2 className="m-0 font-heading text-2xl font-extrabold tracking-tight">Sudut putar akhir (α∞)</h2>
        </div>
      </div>
      <Steps
        start={11}
        items={[
          <>Setelah 120 menit, tuang sisa larutan <strong>sampel HCl</strong> ke Erlenmeyer tertutup dan panaskan di penangas air ±40 °C selama 20 menit.</>,
          'Dinginkan kembali ke suhu ruang, lalu ukur sudut putarnya. Nilai ini adalah α∞ (waktu tak hingga / reaksi selesai).',
        ]}
      />
      <Note kind="warn">
        Jangan memanaskan terlalu panas — larutan bisa berubah cokelat (karamelisasi) dan pembacaan α∞ menjadi tidak valid. Ukur α∞ pada suhu yang sama dengan
        pembacaan lainnya.
      </Note>
      <button type="button" onClick={onGoToWorksheet} className="self-start min-h-[52px] px-6 rounded-2xl bg-spek-indigo text-white font-extrabold hover:bg-spek-indigo-2 cursor-pointer">
        Isi data di Lembar Kerja
      </button>
    </Card>
  </div>
);
