import React from 'react';
import { Card, CardTitle, Note } from './ui';

interface ProsedurStepProps {
  onGoToStopwatch: () => void;
  onGoToWorksheet: () => void;
}

const TOOLS = [
  ['Polarimeter', '1 buah'],
  ['Tabung polarimeter', '1 buah'],
  ['Lampu uap natrium', '1 buah'],
  ['Stopwatch (tersedia di website ini)', '1 buah'],
  ['Labu ukur 50 mL', '1 buah'],
  ['Labu Erlenmeyer 100 mL', '2 buah'],
  ['Pipet ukur (untuk 12,5 mL)', '1 buah'],
  ['Penangas air', '1 buah'],
];

const CHEMICALS = [
  ['Sukrosa (p.a.)', '10 gram'],
  ['Larutan asam klorida (p.a.) 4 N', '12,5 mL'],
  ['Air suling', 'secukupnya'],
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

const PhaseHeader: React.FC<{ letter: string; color: string; title: string }> = ({ letter, color, title }) => (
  <div className="flex items-start gap-3">
    <PhaseTag letter={letter} color={color} />
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-extrabold tracking-wider text-spek-orange">TAHAP {letter}</span>
      <h2 className="m-0 font-heading text-2xl font-extrabold tracking-tight">{title}</h2>
    </div>
  </div>
);

export const ProsedurStep: React.FC<ProsedurStepProps> = ({ onGoToStopwatch, onGoToWorksheet }) => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-wrap justify-between items-end gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-extrabold tracking-wider text-spek-orange">LANGKAH 2 DARI 6</span>
        <h1 className="m-0 font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Prosedur</h1>
        <p className="m-0 text-spek-muted text-[16px] max-w-[760px] leading-relaxed">
          Langkah kerja disusun per tahap. Polarimeter digunakan untuk tiga pengukuran: air suling (titik nol), larutan sukrosa (sekali), dan campuran sukrosa +
          HCl selama 30 menit. Stopwatch dan timer pemanasan tersedia pada halaman tersendiri.
        </p>
      </div>
      <button type="button" onClick={onGoToStopwatch} className="min-h-[50px] px-5 rounded-2xl bg-spek-orange text-white font-extrabold hover:bg-spek-orange-deep cursor-pointer">
        Buka stopwatch
      </button>
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
          HCl 4 N bersifat korosif dan uapnya mengiritasi. Gunakan sarung tangan, kacamata pelindung, dan jas laboratorium; tuang asam di lemari asam bila tersedia;
          bilas segera dengan air mengalir bila terkena kulit.
        </Note>
      </Card>
    </div>

    <Card>
      <PhaseHeader letter="A" color="#1E1B4B" title="Titik nol polarimeter" />
      <Steps
        items={[
          'Nyalakan lampu natrium 5–10 menit sebelum digunakan dan pelajari cara penggunaan polarimeter (Gambar 5.2).',
          'Lepaskan salah satu tutup tabung polarimeter beserta kaca jendelanya. Bersihkan tabung dengan air suling.',
          'Isi tabung dengan air suling hingga penuh dan permukaannya cembung di bibir tabung. Geser kaca jendela perlahan agar tidak ada gelembung udara, lalu pasang tutupnya rapat.',
          <>Ukur sudut putar air suling dengan metode dua batas (gambar di bawah). Catat sebagai <strong>titik nol</strong>. Kosongkan dan keringkan tabung.</>,
        ]}
      />
      <figure className="m-0 flex flex-col gap-2">
        <div className="rounded-2xl border border-spek-violet-tint bg-white p-2 overflow-x-auto">
          <img
            src="/images/inversi/medan-pandang.png"
            alt="Medan pandang polarimeter: posisi medan terang (tidak disarankan) dan posisi medan redup (disarankan) beserta metode dua batas"
            className="w-full min-w-[640px] h-auto"
            loading="lazy"
          />
        </div>
        <figcaption className="text-sm text-spek-muted leading-relaxed">
          Gambar 1. Medan pandang polarimeter setengah bayangan. Pembacaan dilakukan pada posisi medan redup: catat θ₁ (sisi kiri mulai gelap) dan θ₂ (sisi kanan
          mulai gelap), lalu α = (θ₁ + θ₂)/2.
        </figcaption>
      </figure>
    </Card>

    <Card>
      <PhaseHeader letter="B" color="#6D28D9" title="Larutan sukrosa" />
      <Steps
        start={5}
        items={[
          'Larutkan 10 g sukrosa dengan air suling dalam labu ukur 50 mL hingga tanda batas. Saring bila larutan tidak jernih.',
          <>Isi tabung polarimeter dengan larutan sukrosa (tanpa asam), ukur sudut putarnya <strong>satu kali</strong>, dan catat sebagai α sukrosa. Kosongkan tabung.</>,
          'Pipet 12,5 mL larutan sukrosa ke dalam labu Erlenmeyer, dan siapkan 12,5 mL HCl 4 N di wadah terpisah.',
        ]}
      />
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))]">
        {[
          ['Larutan sukrosa', '10 g / 50 mL = 0,2 g/mL', '≈ 0,584 M (Mr 342,30)'],
          ['Campuran reaksi', '12,5 mL + 12,5 mL', 'volume total 25 mL'],
          ['Setelah dicampur', 'sukrosa ≈ 0,292 M', 'HCl 4 N → 2 N'],
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
      <PhaseHeader letter="C" color="#C2410C" title="Reaksi dan pengamatan (30 menit)" />
      <Steps
        start={8}
        items={[
          <>Tuang 12,5 mL HCl 4 N ke dalam larutan sukrosa. <strong>Tekan Mulai pada stopwatch tepat saat pencampuran</strong> (t = 0), lalu aduk hingga rata.</>,
          'Segera bilas tabung polarimeter dengan sedikit campuran, kemudian isi penuh dengan campuran reaksi.',
          'Baca sudut putar sesuai jadwal. Tekan "Catat waktu baca" tepat saat membaca, kemudian isikan nilainya.',
        ]}
      />
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-[15px] max-w-[560px]">
          <caption className="text-left text-xs font-extrabold tracking-wider text-spek-orange-deep pb-2">JADWAL PEMBACAAN</caption>
          <thead>
            <tr className="text-left text-xs font-bold text-white">
              <th className="bg-spek-indigo px-3 py-2.5 rounded-l-xl">Periode</th>
              <th className="bg-spek-indigo px-3 py-2.5">Waktu pengukuran</th>
              <th className="bg-spek-indigo px-3 py-2.5 rounded-r-xl">Menit ke-</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-3 py-2.5 border-b border-[#FED7AA] font-semibold whitespace-nowrap">0 – 30 menit</td>
              <td className="px-3 py-2.5 border-b border-[#FED7AA]">Segera setelah pencampuran, lalu tiap 5 menit</td>
              <td className="px-3 py-2.5 border-b border-[#FED7AA] font-mono whitespace-nowrap">0, 5, 10, 15, 20, 25, 30</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Note kind="info" title="CATATAN">
        Pengamatan dipersingkat menjadi 30 menit (periode pertama Tabel 5.1 modul). Perhitungan menggunakan <strong>waktu baca aktual</strong>, sehingga sedikit
        pergeseran dari jadwal tidak memengaruhi hasil.
      </Note>
      <button type="button" onClick={onGoToStopwatch} className="self-start min-h-[52px] px-6 rounded-2xl bg-spek-orange text-white font-extrabold hover:bg-spek-orange-deep cursor-pointer">
        Buka stopwatch
      </button>
    </Card>

    <Card>
      <PhaseHeader letter="D" color="#3F6212" title="Sudut putar akhir (α∞)" />
      <Steps
        start={11}
        items={[
          'Setelah pengamatan 30 menit selesai, tuang sisa campuran reaksi ke Erlenmeyer tertutup dan panaskan dalam penangas air ±40 °C selama 20 menit. Gunakan timer pemanasan pada halaman Stopwatch.',
          'Dinginkan kembali hingga suhu ruang, lalu ukur sudut putarnya. Nilai ini adalah α∞ (reaksi dianggap selesai).',
        ]}
      />
      <Note kind="warn">
        Jangan memanaskan terlalu tinggi karena larutan dapat berubah cokelat (karamelisasi) dan pembacaan α∞ menjadi tidak valid. Ukur α∞ pada suhu yang sama dengan
        pembacaan lainnya; bila memungkinkan, baca dua kali dengan selang beberapa menit untuk memastikan nilainya sudah tetap.
      </Note>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onGoToStopwatch} className="min-h-[52px] px-6 rounded-2xl bg-spek-lime-deep text-white font-extrabold hover:bg-[#365314] cursor-pointer">
          Buka timer pemanasan
        </button>
        <button type="button" onClick={onGoToWorksheet} className="min-h-[52px] px-6 rounded-2xl bg-spek-indigo text-white font-extrabold hover:bg-spek-indigo-2 cursor-pointer">
          Isi Lembar Kerja
        </button>
      </div>
    </Card>
  </div>
);
