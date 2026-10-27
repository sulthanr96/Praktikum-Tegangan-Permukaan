import React from 'react';
import { Tex } from './Tex';
import { Card, CardTitle, DerivStep, Note } from './ui';

const SECTIONS = [
  ['tujuan', 'Tujuan'],
  ['laju', 'Laju & hukum laju'],
  ['inversi', 'Inversi sukrosa'],
  ['semu', 'Orde pertama semu'],
  ['pers6', 'Penurunan pers. (6)'],
  ['polarimetri', 'Polarimetri'],
  ['pers9', 'Penurunan pers. (9)'],
  ['grafik', 'Dari grafik ke k'],
  ['ringkasan', 'Ringkasan rumus'],
] as const;

const ROTATIONS = [
  ['Sukrosa', '+66,5°', 'dekstrorotatori (memutar ke kanan)'],
  ['Glukosa', '+52,7°', 'dekstrorotatori'],
  ['Fruktosa', '−92,4°', 'levorotatori kuat (memutar ke kiri)'],
  ['Gula invert (glukosa + fruktosa)', '≈ −20°', 'levorotatori → tanda rotasi "terbalik"'],
];

export const TeoriStep: React.FC = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-3">
      <span className="text-xs font-extrabold tracking-wider text-spek-orange">LANGKAH 1 DARI 5</span>
      <h1 className="m-0 font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Teori &amp; konsep</h1>
      <p className="m-0 text-spek-muted text-[16px] max-w-[760px] leading-relaxed">
        Ringkasan teori dari modul, ditambah penurunan persamaan (6) dan (9) yang diminta pada bagian Pertanyaan.
      </p>
      <nav aria-label="Daftar isi teori" className="flex flex-wrap gap-2 mt-1">
        {SECTIONS.map(([id, label], i) => (
          <a
            key={id}
            href={`#teori-${id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(`teori-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="min-h-[40px] inline-flex items-center px-3.5 rounded-full bg-white text-sm font-semibold text-spek-ink no-underline hover:bg-spek-violet-tint transition-colors"
          >
            <span className="font-mono text-xs text-spek-muted mr-1.5">{i + 1}</span>
            {label}
          </a>
        ))}
      </nav>
    </div>

    <Card id="teori-tujuan">
      <CardTitle number="1">Tujuan praktikum</CardTitle>
      <ul className="m-0 pl-5 flex flex-col gap-2 text-[16px] leading-relaxed">
        <li>Mempelajari katalisis ion H⁺ pada hidrolisis sukrosa menjadi glukosa dan fruktosa menggunakan polarimeter.</li>
        <li>Menentukan tetapan laju reaksi orde pertama (<Tex>k</Tex>) hidrolisis sukrosa.</li>
      </ul>
    </Card>

    <Card id="teori-laju">
      <CardTitle number="2">Laju reaksi &amp; hukum laju</CardTitle>
      <p className="m-0 text-[16px] leading-relaxed">
        Laju reaksi adalah laju berkurangnya konsentrasi pereaksi atau laju bertambahnya konsentrasi produk. Untuk reaksi
      </p>
      <Tex block>{String.raw`A + B \longrightarrow P \qquad (1)`}</Tex>
      <p className="m-0 text-[16px] leading-relaxed">laju reaksinya dapat ditulis dari sisi mana pun dengan hasil yang sama:</p>
      <Tex block>{String.raw`v = -\frac{d[A]}{dt} = -\frac{d[B]}{dt} = \frac{d[P]}{dt} \qquad (2)`}</Tex>
      <p className="m-0 text-[16px] leading-relaxed">
        Hukum laju menghubungkan laju dengan tetapan laju <Tex>k</Tex> dan konsentrasi tiap pereaksi yang dipangkatkan dengan orde reaksinya
        (<Tex>a</Tex> dan <Tex>b</Tex>):
      </p>
      <Tex block>{String.raw`v = k\,[A]^a[B]^b \qquad (3)`}</Tex>
    </Card>

    <Card id="teori-inversi">
      <CardTitle number="3">Reaksi inversi sukrosa</CardTitle>
      <p className="m-0 text-[16px] leading-relaxed">
        Dengan katalis asam, sukrosa terhidrolisis menjadi glukosa dan fruktosa:
      </p>
      <Tex block>{String.raw`\text{Sukrosa} + \mathrm{H_2O} \xrightarrow{\;\mathrm{H^+}\;} \text{Glukosa} + \text{Fruktosa} \qquad (4)`}</Tex>
      <figure className="m-0 flex flex-col gap-2">
        <div className="rounded-2xl border border-spek-violet-tint bg-white p-3 overflow-x-auto">
          <img src="/images/inversi/reaksi-hidrolisis-sukrosa.jpg" alt="Struktur reaksi hidrolisis sukrosa menjadi glukosa dan fruktosa" className="max-w-full h-auto mx-auto" loading="lazy" />
        </div>
        <figcaption className="text-sm text-spek-muted leading-relaxed">
          Gambar 5.1 modul. <strong className="text-spek-ink">Catatan koreksi:</strong> label pada gambar tertukar — cincin segi enam (piranosa) adalah{' '}
          <strong className="text-spek-ink">glukosa</strong>, dan cincin segi lima (furanosa) adalah <strong className="text-spek-ink">fruktosa</strong>.
        </figcaption>
      </figure>
      <p className="m-0 text-[16px] leading-relaxed">
        Sukrosa bersifat optis aktif dan memutar bidang polarisasi cahaya ke <strong>kanan</strong>. Selama hidrolisis, putaran ke kanan makin kecil lalu
        berbalik ke <strong>kiri</strong>, karena fruktosa memutar ke kiri lebih kuat daripada glukosa memutar ke kanan. Pembalikan arah putaran inilah yang
        disebut <strong>inversi</strong>, dan campuran hasilnya disebut <em>gula invert</em>.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-[15px]">
          <thead>
            <tr className="text-left text-xs font-bold text-white">
              <th className="bg-spek-indigo px-3 py-2.5 rounded-l-xl">Zat</th>
              <th className="bg-spek-indigo px-3 py-2.5 whitespace-nowrap">Rotasi spesifik [α]²⁰ᴅ</th>
              <th className="bg-spek-indigo px-3 py-2.5 rounded-r-xl">Sifat</th>
            </tr>
          </thead>
          <tbody>
            {ROTATIONS.map(([zat, rot, sifat]) => (
              <tr key={zat}>
                <td className="px-3 py-2.5 border-b border-spek-violet-tint font-semibold">{zat}</td>
                <td className="px-3 py-2.5 border-b border-spek-violet-tint font-mono">{rot}</td>
                <td className="px-3 py-2.5 border-b border-spek-violet-tint text-spek-muted">{sifat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note kind="info" title="SEJARAH">
        Wilhelmy menunjukkan bahwa hidrolisis sukrosa mengikuti kinetika orde pertama — salah satu pengukuran laju reaksi kuantitatif pertama.
        Penelitian ini dilakukan pada tahun <strong>1850</strong> (di modul tertulis 1950). Pada pH netral waktu paruhnya sekitar 10 minggu, tetapi menjadi
        jauh lebih singkat bila dikatalisis H⁺.
      </Note>
    </Card>

    <Card id="teori-semu">
      <CardTitle number="4">Mengapa orde pertama semu?</CardTitle>
      <p className="m-0 text-[16px] leading-relaxed">Hukum laju lengkap reaksi (4) melibatkan tiga spesi:</p>
      <Tex block>{String.raw`v = -\frac{d[\text{S}]}{dt} = k'\,[\text{S}]^{a}\,[\mathrm{H_2O}]^{b}\,[\mathrm{H^+}]^{c}`}</Tex>
      <p className="m-0 text-[16px] leading-relaxed">
        dengan S = sukrosa dan <Tex>a = 1</Tex>. Dua faktor lainnya praktis <strong>tetap</strong> selama reaksi:
      </p>
      <ul className="m-0 pl-5 flex flex-col gap-1.5 text-[16px] leading-relaxed">
        <li>Air adalah pelarut (±55 M) sehingga jumlah yang terpakai sangat kecil dibanding jumlahnya.</li>
        <li>H⁺ adalah katalis: tidak habis terpakai, konsentrasinya sama di awal dan akhir.</li>
      </ul>
      <p className="m-0 text-[16px] leading-relaxed">Keduanya bisa digabung ke dalam satu tetapan:</p>
      <Tex block>{String.raw`k = k'\,[\mathrm{H_2O}]^{b}\,[\mathrm{H^+}]^{c} \quad\Longrightarrow\quad v = -\frac{d[\text{S}]}{dt} = k\,[\text{S}] \qquad (5)`}</Tex>
      <Note kind="answer" title="MENJAWAB PERTANYAAN 1">
        Reaksi disebut <strong>orde pertama semu</strong> karena secara keseluruhan reaksi melibatkan lebih dari satu pereaksi, tetapi lajunya
        <em> tampak</em> hanya bergantung pada [sukrosa] pangkat satu. Hal ini terjadi karena [H₂O] (pelarut berlebih) dan [H⁺] (katalis) praktis tidak
        berubah, sehingga pengaruhnya terserap ke dalam tetapan laju semu <Tex>k</Tex>.
      </Note>
      <p className="m-0 text-[16px] leading-relaxed">
        Konsekuensi penting: <Tex>k</Tex> <strong>bergantung pada [H⁺]</strong>. Karena itu praktikum ini memakai dua sampel dengan konsentrasi sukrosa yang
        sama — satu dengan katalis HCl, satu tanpa asam sebagai pembanding (referensi):
      </p>
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))]">
        <div className="rounded-2xl bg-spek-orange-tint p-4 flex flex-col gap-1">
          <span className="text-xs font-extrabold text-spek-orange-deep">SUKROSA + HCl 4 N</span>
          <span className="text-[15px] leading-relaxed">25 mL sukrosa + 25 mL HCl 4 N. HCl terionisasi sempurna, setelah dicampur:</span>
          <Tex>{String.raw`[\mathrm{H^+}] \approx 2\ \mathrm{M} \;\Rightarrow\; \alpha \text{ turun cepat, lalu negatif}`}</Tex>
        </div>
        <div className="rounded-2xl bg-spek-violet-tint p-4 flex flex-col gap-1">
          <span className="text-xs font-extrabold text-spek-violet-deep">SUKROSA REFERENSI (TANPA ASAM)</span>
          <span className="text-[15px] leading-relaxed">25 mL sukrosa + 25 mL air suling. Tanpa katalis, waktu paruh ±10 minggu:</span>
          <Tex>{String.raw`\alpha \approx \text{tetap selama 120 menit}`}</Tex>
        </div>
      </div>
      <Note kind="tip" title="UNTUK PEMBAHASAN">
        Referensi adalah <strong>kontrol</strong>: bila α referensi tetap sementara α sampel HCl turun lalu berbalik negatif, terbukti perubahan itu disebabkan
        oleh reaksi berkatalis H⁺ — bukan oleh suhu atau alat. Karena konsentrasi sukrosanya sama, α referensi juga bisa dibandingkan dengan α₀ hasil
        ekstrapolasi sampel HCl.
      </Note>
    </Card>

    <Card id="teori-pers6">
      <CardTitle number="5" kicker="PERTANYAAN 2">Penurunan persamaan (6)</CardTitle>
      <p className="m-0 text-[16px] leading-relaxed">
        Misalkan konsentrasi sukrosa awal adalah <Tex>a</Tex> (pada <Tex>t = 0</Tex>) dan pada waktu <Tex>t</Tex> adalah <Tex>c</Tex>.
      </p>
      <ol className="m-0 p-0 list-none flex flex-col gap-4">
        <DerivStep n={1}>
          <span>Mulai dari hukum laju orde pertama (5):</span>
          <Tex block>{String.raw`-\frac{dc}{dt} = k\,c`}</Tex>
        </DerivStep>
        <DerivStep n={2}>
          <span>Pisahkan variabel — semua <Tex>c</Tex> di kiri, semua <Tex>t</Tex> di kanan:</span>
          <Tex block>{String.raw`\frac{dc}{c} = -k\,dt`}</Tex>
        </DerivStep>
        <DerivStep n={3}>
          <span>Integralkan dari keadaan awal (<Tex>t=0,\ c=a</Tex>) sampai waktu <Tex>t</Tex>:</span>
          <Tex block>{String.raw`\int_{a}^{c}\frac{dc}{c} = -k\int_{0}^{t}dt \;\Longrightarrow\; \ln c - \ln a = -k\,t`}</Tex>
        </DerivStep>
        <DerivStep n={4}>
          <span>Kalikan −1 dan gabungkan logaritmanya:</span>
          <Tex block>{String.raw`\ln\frac{a}{c} = k\,t \qquad (6)`}</Tex>
        </DerivStep>
      </ol>
    </Card>

    <Card id="teori-polarimetri">
      <CardTitle number="6">Polarimetri: dari konsentrasi ke sudut putar</CardTitle>
      <p className="m-0 text-[16px] leading-relaxed">
        Konsentrasi sukrosa tidak diukur langsung, melainkan lewat sudut putar bidang polarisasi. Untuk satu zat optis aktif A berlaku:
      </p>
      <Tex block>{String.raw`\alpha_A = [\alpha_A]^{t}_{\lambda}\; l\; c \qquad (7)`}</Tex>
      <ul className="m-0 pl-5 flex flex-col gap-1.5 text-[15px] leading-relaxed text-spek-muted">
        <li><Tex>\alpha_A</Tex> = sudut putar yang teramati</li>
        <li><Tex>{String.raw`[\alpha_A]^{t}_{\lambda}`}</Tex> = rotasi spesifik zat A pada suhu <Tex>t</Tex> dan panjang gelombang <Tex>\lambda</Tex> (lampu natrium)</li>
        <li><Tex>l</Tex> = panjang jalan cahaya dalam larutan (panjang tabung polarimeter)</li>
        <li><Tex>c</Tex> = konsentrasi larutan</li>
      </ul>
      <p className="m-0 text-[16px] leading-relaxed">Untuk campuran beberapa zat, sudut putarnya bersifat <strong>aditif</strong>:</p>
      <Tex block>{String.raw`\alpha = \alpha_A + \alpha_B \qquad (8)`}</Tex>
      <p className="m-0 text-[16px] leading-relaxed">
        Artinya, sudut putar selalu sebanding dengan konsentrasi — itulah sebabnya α bisa menggantikan konsentrasi dalam persamaan laju.
      </p>
    </Card>

    <Card id="teori-pers9">
      <CardTitle number="7" kicker="PERTANYAAN 2">Penurunan persamaan (9)</CardTitle>
      <p className="m-0 text-[16px] leading-relaxed">
        Dari persamaan (7), tiap zat memberi sudut putar sebanding konsentrasinya. Tuliskan <Tex>{String.raw`\kappa_S`}</Tex> sebagai tetapan
        kesebandingan sukrosa dan <Tex>{String.raw`\kappa_P`}</Tex> untuk produk (glukosa + fruktosa), keduanya sudah termasuk <Tex>l</Tex>.
        Setiap 1 mol sukrosa yang terhidrolisis menghasilkan 1 mol campuran produk.
      </p>
      <ol className="m-0 p-0 list-none flex flex-col gap-4">
        <DerivStep n={1}>
          <span>Saat awal (<Tex>t = 0</Tex>), hanya ada sukrosa:</span>
          <Tex block>{String.raw`\alpha_0 = \kappa_S\, a`}</Tex>
        </DerivStep>
        <DerivStep n={2}>
          <span>Pada waktu <Tex>t</Tex>, tersisa sukrosa <Tex>c</Tex> dan terbentuk produk <Tex>a - c</Tex>. Dengan sifat aditif (8):</span>
          <Tex block>{String.raw`\alpha_t = \kappa_S\, c + \kappa_P\,(a - c)`}</Tex>
        </DerivStep>
        <DerivStep n={3}>
          <span>Saat reaksi selesai (<Tex>t \to \infty</Tex>), semua sukrosa berubah menjadi produk:</span>
          <Tex block>{String.raw`\alpha_\infty = \kappa_P\, a`}</Tex>
        </DerivStep>
        <DerivStep n={4}>
          <span>Kurangkan langkah 2 dan 1 dengan langkah 3:</span>
          <Tex block>{String.raw`\alpha_t - \alpha_\infty = (\kappa_S - \kappa_P)\,c \qquad\quad \alpha_0 - \alpha_\infty = (\kappa_S - \kappa_P)\,a`}</Tex>
        </DerivStep>
        <DerivStep n={5}>
          <span>Bagi kedua persamaan — faktor <Tex>{String.raw`(\kappa_S-\kappa_P)`}</Tex> saling menghapus:</span>
          <Tex block>{String.raw`\frac{\alpha_t - \alpha_\infty}{\alpha_0 - \alpha_\infty} = \frac{c}{a}`}</Tex>
        </DerivStep>
        <DerivStep n={6}>
          <span>Substitusikan ke persamaan (6), yaitu <Tex>{String.raw`\ln(c/a) = -kt`}</Tex>:</span>
          <Tex block>{String.raw`\ln\frac{\alpha_t - \alpha_\infty}{\alpha_0 - \alpha_\infty} = -k\,t \qquad (9)`}</Tex>
        </DerivStep>
      </ol>
      <Note kind="tip">
        Keunggulan persamaan (9): kita tidak perlu tahu nilai <Tex>{String.raw`[\alpha]`}</Tex>, <Tex>l</Tex>, maupun konsentrasi sebenarnya — cukup
        tiga pembacaan sudut putar: <Tex>\alpha_0</Tex>, <Tex>\alpha_t</Tex>, dan <Tex>\alpha_\infty</Tex>.
      </Note>
    </Card>

    <Card id="teori-grafik">
      <CardTitle number="8">Dari grafik ke tetapan laju</CardTitle>
      <p className="m-0 text-[16px] leading-relaxed">Persamaan (9) bisa ditata ulang menjadi bentuk garis lurus <Tex>y = b + m\,x</Tex>:</p>
      <Tex block>{String.raw`\underbrace{\ln(\alpha_t - \alpha_\infty)}_{y} = \underbrace{\ln(\alpha_0 - \alpha_\infty)}_{\text{intersep}} \;\underbrace{-\,k}_{\text{kemiringan}}\;\underbrace{t}_{x}`}</Tex>
      <ul className="m-0 pl-5 flex flex-col gap-1.5 text-[16px] leading-relaxed">
        <li>Alurkan <Tex>{String.raw`\ln(\alpha_t-\alpha_\infty)`}</Tex> terhadap <Tex>t</Tex> → garis lurus menurun.</li>
        <li>Kemiringan garis = <Tex>-k</Tex>, sehingga <Tex>{String.raw`k = -\,\text{kemiringan}`}</Tex>.</li>
        <li>Intersep = <Tex>{String.raw`\ln(\alpha_0-\alpha_\infty)`}</Tex>, sehingga <Tex>\alpha_0</Tex> bisa dihitung tanpa diukur langsung.</li>
        <li>Waktu paruh: <Tex>{String.raw`t_{1/2} = \dfrac{\ln 2}{k}`}</Tex>.</li>
      </ul>
      <Note kind="warn" title="PERHATIKAN TANDA">
        Modul menyebut kemiringan garis sebagai <Tex>k</Tex>. Karena grafiknya menurun, kemiringannya bernilai <strong>negatif</strong>, jadi yang benar:
        kemiringan = <Tex>-k</Tex>. Tetapan laju <Tex>k</Tex> sendiri selalu positif.
      </Note>
    </Card>

    <Card id="teori-ringkasan" className="bg-spek-indigo text-white">
      <CardTitle number="9" dark>Ringkasan rumus</CardTitle>
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] text-spek-ink">
        {[
          ['Hukum laju orde 1 semu', String.raw`-\frac{d[\text{S}]}{dt} = k[\text{S}]`],
          ['Bentuk integral', String.raw`\ln\frac{a}{c} = kt`],
          ['Dalam sudut putar', String.raw`\ln\frac{\alpha_t-\alpha_\infty}{\alpha_0-\alpha_\infty} = -kt`],
          ['Persamaan garis', String.raw`\ln(\alpha_t-\alpha_\infty) = \ln(\alpha_0-\alpha_\infty) - kt`],
          ['Waktu paruh', String.raw`t_{1/2} = \frac{\ln 2}{k}`],
          ['Koreksi titik nol', String.raw`\alpha = \alpha_{\text{baca}} - \alpha_{\text{nol}}`],
        ].map(([label, tex]) => (
          <div key={label} className="bg-white rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-xs font-extrabold tracking-wider text-spek-violet-deep">{label.toUpperCase()}</span>
            <Tex block>{tex}</Tex>
          </div>
        ))}
      </div>
    </Card>
  </div>
);
