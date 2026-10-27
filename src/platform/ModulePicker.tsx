import React, { useEffect, useState } from 'react';
import { api, type AuthUser } from './api';
import { BrandMark, LiveClock, groupInitials } from './ui';
import { MODULES, type ModuleInfo } from '../modules/registry';

interface ModulePickerProps {
  user: AuthUser;
  onOpenModule: (id: string) => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
}

const CARD_THEME: Record<ModuleInfo['theme'], { card: string; number: string; chip: string; desc: string; cta: string; badge: string }> = {
  orange: {
    card: 'bg-spek-orange text-white',
    number: 'text-[#FED7AA]',
    chip: 'bg-spek-orange-deep',
    desc: 'text-spek-orange-tint',
    cta: 'bg-white text-spek-orange-deep hover:bg-spek-orange-tint',
    badge: 'bg-white text-spek-orange-deep',
  },
  violet: {
    card: 'bg-spek-violet text-white',
    number: 'text-[#DDD6FE]',
    chip: 'bg-spek-violet-deep',
    desc: 'text-spek-violet-tint',
    cta: 'bg-transparent border-2 border-white text-white hover:bg-spek-violet-deep',
    badge: 'bg-spek-violet-deep text-white',
  },
  lime: {
    card: 'bg-spek-lime-tint text-spek-lime-deep border-2 border-dashed border-[#84CC16]',
    number: 'text-[#4D7C0F]',
    chip: 'bg-white',
    desc: 'text-spek-lime-deep',
    cta: 'bg-spek-lime-deep text-white',
    badge: 'bg-white text-spek-lime-deep',
  },
};

const STATUS_LABEL: Record<ModuleInfo['status'], string> = {
  aktif: 'AKTIF',
  selesai: 'SELESAI',
  segera: 'SEGERA',
};

function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export const ModulePicker: React.FC<ModulePickerProps> = ({ user, onOpenModule, onOpenAdmin, onLogout }) => {
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    api<{ text: string }>('/api/announcement')
      .then((res) => setAnnouncement(res.text || ''))
      .catch(() => setAnnouncement(''));
  }, []);

  return (
    <div className="min-h-screen bg-white font-ui text-spek-ink">
      <section className="bg-spek-indigo text-white">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-4 pb-28 flex flex-col gap-10 sm:gap-11">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <BrandMark />
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-2 py-1.5 pl-1.5 pr-3.5 rounded-full bg-spek-indigo-2 text-sm font-semibold">
                <span className="w-8 h-8 rounded-full bg-spek-lime text-spek-indigo font-heading text-[13px] font-extrabold inline-flex items-center justify-center">
                  {isAdmin ? 'AS' : groupInitials(user.displayName)}
                </span>
                {user.displayName}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="min-h-[44px] px-4 rounded-full border border-spek-indigo-3 text-white text-sm font-semibold hover:bg-spek-indigo-2 transition-colors cursor-pointer"
              >
                Keluar
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-end gap-6">
            <div className="flex flex-col gap-3.5 max-w-[760px]">
              <span className="self-start px-3 py-1.5 rounded-full bg-spek-lime text-spek-indigo text-xs font-extrabold tracking-wider">
                {isAdmin ? 'PANEL ASISTEN LABORATORIUM' : 'PERIODE 2 SUDAH DIBUKA'}
              </span>
              <h1 className="m-0 font-heading text-4xl sm:text-[56px] leading-[1.04] font-extrabold tracking-tight">
                {greeting()}, {user.displayName}. {isAdmin ? 'Mau cek apa hari ini?' : 'Mau lanjut praktikum apa?'}
              </h1>
              <p className="m-0 text-[17px] text-spek-mist leading-relaxed">
                {user.members.length > 0 ? `${user.members.join(' · ')} · ` : ''}
                Data tiap modul tersimpan terpisah dan bisa dibuka kembali.
              </p>
            </div>
            <LiveClock className="hidden sm:flex" />
          </div>
        </div>
      </section>

      <main className="max-w-[1200px] mx-auto -mt-20 px-4 sm:px-6 pb-14 grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]">
        {MODULES.map((m) => {
          const t = CARD_THEME[m.theme];
          return (
            <article key={m.id} className={`${t.card} rounded-[28px] p-7 flex flex-col gap-5 min-h-[420px] shadow-lg`}>
              <div className="flex justify-between items-start">
                <span className={`font-heading text-6xl font-extrabold leading-none ${t.number}`}>{m.number}</span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold ${t.badge}`}>
                  {STATUS_LABEL[m.status]} · {m.period}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="m-0 font-heading text-[32px] font-extrabold tracking-tight leading-tight">{m.title}</h2>
                <p className={`m-0 text-[15px] leading-relaxed ${t.desc}`}>{m.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {m.chips.map((c) => (
                  <span key={c} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${t.chip}`}>
                    {c}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => onOpenModule(m.id)}
                className={`mt-auto min-h-[52px] rounded-2xl text-base font-extrabold transition-colors cursor-pointer ${t.cta}`}
              >
                {m.status === 'selesai' ? 'Buka modul' : 'Mulai / lanjutkan'}
              </button>
            </article>
          );
        })}

        <article className="bg-spek-lime-tint border-2 border-dashed border-[#84CC16] rounded-[28px] p-7 flex flex-col justify-between gap-4 min-h-[420px]">
          <span className="font-heading text-6xl font-extrabold leading-none text-[#4D7C0F]">
            {String(MODULES.length + 1).padStart(2, '0')}
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="m-0 font-heading text-[28px] font-extrabold text-[#365314]">
              {isAdmin ? 'Panel aslab' : 'Modul berikutnya'}
            </h2>
            <p className="m-0 text-[15px] text-spek-lime-deep leading-relaxed">
              {isAdmin
                ? 'Kelola kelompok, kode akses, dan pengumuman untuk praktikan.'
                : 'Akan dibuka oleh aslab pada periode selanjutnya.'}
            </p>
          </div>
          <div className="px-4 py-3.5 rounded-2xl bg-white flex flex-col gap-1">
            <span className="text-xs font-bold text-[#4D7C0F]">PENGUMUMAN ASLAB</span>
            <span className="text-sm text-spek-ink whitespace-pre-line">
              {announcement === null ? 'Memuat…' : announcement || 'Belum ada pengumuman.'}
            </span>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="min-h-[52px] rounded-2xl bg-spek-lime-deep text-white text-base font-extrabold hover:bg-[#365314] transition-colors cursor-pointer"
            >
              Buka panel aslab
            </button>
          )}
        </article>
      </main>
    </div>
  );
};
