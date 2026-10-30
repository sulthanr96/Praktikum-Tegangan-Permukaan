import React, { useState } from 'react';
import { isAcidComplete } from './analysis';
import { ACIDS, ACID_KEYS, type InversiState } from './state';
import { Card, Note } from './ui';
import type { useCloudSync } from './cloud';
import type { AuthUser } from '../../platform/api';

interface EksporStepProps {
  state: InversiState;
  user: AuthUser;
  cloud: ReturnType<typeof useCloudSync>;
  onPrint: (mode: 'report' | 'sheet') => void;
}

export const EksporStep: React.FC<EksporStepProps> = ({ state, user, cloud, onPrint }) => {
  const [busy, setBusy] = useState(false);
  const [group, setGroup] = useState('');
  const complete = ACID_KEYS.filter((k) => isAcidComplete(state, k));
  const missing = ACID_KEYS.filter((k) => !complete.includes(k));

  const guard = () => {
    if (complete.length === 0) {
      alert('Data belum cukup. Isi minimal 3 pembacaan dan α∞ sampel HCl di Lembar Kerja.');
      return false;
    }
    if (missing.length && !window.confirm(`Data ${missing.map((k) => ACIDS[k].short).join(' & ')} belum lengkap. Tetap lanjutkan?`)) return false;
    return true;
  };

  const downloadExcel = async () => {
    if (!guard()) return;
    setBusy(true);
    try {
      const { exportInversiExcel } = await import('./excelExport');
      await exportInversiExcel(state, user.role === 'admin' && group ? group : user.displayName);
    } catch (err) {
      alert('Gagal membuat file Excel: ' + (err instanceof Error ? err.message : 'kesalahan tidak diketahui'));
    } finally {
      setBusy(false);
    }
  };

  const cards = [
    {
      title: 'Spreadsheet Excel (.xlsx)',
      desc: 'Tabel data, langkah perhitungan, hasil metode A & B, dan grafik dalam satu file.',
      cta: busy ? 'Menyiapkan…' : 'Unduh Excel',
      onClick: downloadExcel,
      tone: 'bg-spek-lime text-spek-indigo hover:bg-[#BEF264]',
      badge: 'XLSX',
    },
    {
      title: 'Panduan laporan (A–K)',
      desc: 'Contoh perhitungan langkah demi langkah dengan angka kelompokmu, poin pembahasan, draf kesimpulan, dan jawaban pertanyaan.',
      cta: 'Cetak / simpan PDF',
      onClick: () => guard() && onPrint('report'),
      tone: 'bg-spek-orange text-white hover:bg-spek-orange-deep',
      badge: 'PDF',
    },
    {
      title: 'Lembar tabel & grafik',
      desc: '4 tabel dan 2 grafik bergaris potong, siap digunting dan ditempel di buku laporan.',
      cta: 'Cetak lembar tempel',
      onClick: () => guard() && onPrint('sheet'),
      tone: 'bg-spek-violet text-white hover:bg-spek-violet-deep',
      badge: 'PDF',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-extrabold tracking-wider text-spek-orange">LANGKAH 6 DARI 6</span>
        <h1 className="m-0 font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Ekspor laporan</h1>
        <p className="m-0 text-spek-muted text-[16px] max-w-[680px] leading-relaxed">
          Untuk PDF, pilih "Simpan sebagai PDF" di jendela cetak. Gunakan kertas A4 dan aktifkan "Grafik latar belakang" agar warna tabel ikut tercetak.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {ACID_KEYS.map((k) => (
          <span key={k} className={`px-3.5 py-2 rounded-full text-sm font-bold ${complete.includes(k) ? 'bg-spek-lime-tint text-spek-lime-deep' : 'bg-spek-orange-tint text-spek-orange-deep'}`}>
            {ACIDS[k].short}: {complete.includes(k) ? 'data lengkap' : 'belum lengkap'}
          </span>
        ))}
      </div>

      <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))]">
        {cards.map((c) => (
          <Card key={c.title} className="justify-between">
            <div className="flex flex-col gap-2">
              <span className="self-start px-2.5 py-1 rounded-lg bg-spek-soft font-mono text-xs font-bold text-spek-muted">{c.badge}</span>
              <h2 className="m-0 font-heading text-xl font-extrabold">{c.title}</h2>
              <p className="m-0 text-[15px] text-spek-muted leading-relaxed">{c.desc}</p>
            </div>
            <button type="button" onClick={c.onClick} disabled={busy} className={`min-h-[52px] rounded-2xl font-extrabold transition-colors disabled:opacity-60 cursor-pointer ${c.tone}`}>
              {c.cta}
            </button>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="m-0 font-heading text-xl font-extrabold">Penyimpanan cloud</h2>
        {cloud.isAdmin ? (
          <>
            <p className="m-0 text-[15px] text-spek-muted">Sebagai aslab, buka data kelompok untuk diperiksa atau dicetak. Data yang dibuka tidak tersimpan otomatis.</p>
            <div className="flex flex-wrap gap-2">
              <input
                aria-label="ID kelompok"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="ID kelompok, mis. kelompok3"
                className="flex-[1_1_240px] min-h-[48px] px-3.5 rounded-xl border-2 border-spek-violet-tint bg-spek-soft font-ui outline-none focus:border-spek-violet"
              />
              <button type="button" onClick={() => group.trim() && cloud.loadFrom(group.trim())} className="min-h-[48px] px-5 rounded-xl bg-spek-indigo text-white font-bold cursor-pointer">
                Buka data
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="m-0 text-[15px] text-spek-muted">
              Data kelompok tersimpan otomatis ke cloud beberapa detik setelah berubah, jadi aman bila HP mati atau berpindah perangkat.
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={cloud.saveNow} className="min-h-[48px] px-5 rounded-xl bg-spek-indigo text-white font-bold cursor-pointer">Simpan sekarang</button>
              <button
                type="button"
                onClick={() => window.confirm('Muat data dari cloud? Data di perangkat ini akan diganti.') && cloud.loadFrom()}
                className="min-h-[48px] px-5 rounded-xl border-2 border-spek-violet-tint font-bold cursor-pointer"
              >
                Muat dari cloud
              </button>
            </div>
          </>
        )}
        {cloud.message && <Note kind={cloud.status === 'error' ? 'warn' : 'info'}>{cloud.message}</Note>}
      </Card>
    </div>
  );
};
