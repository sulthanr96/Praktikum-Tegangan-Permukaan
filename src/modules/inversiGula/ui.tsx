import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = '', id }) => (
  <section id={id} className={`bg-white rounded-3xl p-5 sm:p-7 flex flex-col gap-4 scroll-mt-28 ${className}`}>{children}</section>
);

export const CardTitle: React.FC<{ number?: string; children: React.ReactNode; kicker?: string; dark?: boolean }> = ({ number, children, kicker, dark }) => (
  <div className="flex items-start gap-3">
    {number && (
      <span className={`shrink-0 w-10 h-10 rounded-xl font-heading font-extrabold text-lg flex items-center justify-center ${dark ? 'bg-spek-lime text-spek-indigo' : 'bg-spek-indigo text-white'}`}>
        {number}
      </span>
    )}
    <div className="flex flex-col gap-0.5">
      {kicker && <span className="text-xs font-extrabold tracking-wider text-spek-orange">{kicker}</span>}
      <h2 className="m-0 font-heading text-2xl font-extrabold tracking-tight leading-tight">{children}</h2>
    </div>
  </div>
);

const NOTE_STYLE = {
  info: 'bg-spek-soft border-spek-violet-tint text-spek-ink',
  tip: 'bg-spek-lime-tint border-[#D9F99D] text-[#1A2E05]',
  warn: 'bg-spek-orange-tint border-[#FED7AA] text-[#431407]',
  answer: 'bg-spek-violet-tint border-[#DDD6FE] text-[#2E1065]',
};
const NOTE_LABEL = { info: 'CATATAN', tip: 'TIPS', warn: 'PERHATIAN', answer: 'MENJAWAB PERTANYAAN' };

export const Note: React.FC<{ kind?: keyof typeof NOTE_STYLE; title?: string; children: React.ReactNode }> = ({ kind = 'info', title, children }) => (
  <div className={`rounded-2xl border-2 px-4 py-3.5 flex flex-col gap-1.5 text-[15px] leading-relaxed ${NOTE_STYLE[kind]}`}>
    <span className="text-xs font-extrabold tracking-wider opacity-80">{title ?? NOTE_LABEL[kind]}</span>
    <div>{children}</div>
  </div>
);

/** Langkah penurunan rumus bernomor. */
export const DerivStep: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => (
  <li className="flex gap-3">
    <span className="shrink-0 w-7 h-7 rounded-full bg-spek-orange-tint text-spek-orange-deep font-heading font-extrabold text-sm flex items-center justify-center mt-0.5">
      {n}
    </span>
    <div className="flex-1 min-w-0 flex flex-col gap-1">{children}</div>
  </li>
);
