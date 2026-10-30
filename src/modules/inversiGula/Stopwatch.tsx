import React, { useState } from 'react';
import {
  ACIDS,
  ACID_KEYS,
  formatClock,
  formatMinutes,
  scheduleLabel,
  timerStatus,
  DEFAULT_SCHEDULE,
  isSoundOn,
  setSoundOn,
  testSound,
  unlockAudio,
  withSchedule,
  type AcidKey,
  type InversiState,
} from './state';
import { NumberField } from './NumberField';

interface StopwatchProps {
  state: InversiState;
  setState: React.Dispatch<React.SetStateAction<InversiState>>;
  now: number;
  acid: AcidKey;
  onSelectAcid: (key: AcidKey) => void;
}

const C = 130; // pusat jam

/** Titik pada lingkaran jam; `frac` = bagian putaran (0–1). */
const polarFrac = (r: number, frac: number) => {
  const a = frac * Math.PI * 2;
  return { x: C + r * Math.sin(a), y: C - r * Math.cos(a) };
};

/**
 * Jam analog. Satu putaran = 30 menit bila pengamatan ≤ 30 menit, selain itu 60 menit.
 * Titik = jadwal baca pada putaran berjalan.
 */
const AnalogClock: React.FC<{ elapsedMs: number; schedule: number[]; doneFlags: boolean[]; nextIndex: number; running: boolean }> = ({
  elapsedMs,
  schedule,
  doneFlags,
  nextIndex,
  running,
}) => {
  const lastMin = schedule[schedule.length - 1] ?? 30;
  const span = lastMin <= 30 ? 30 : 60;
  const laps = Math.max(1, Math.ceil(lastMin / span));
  const minutes = elapsedMs / 60000;
  const lap = Math.floor(minutes / span);
  const inLap = minutes - lap * span;
  const sec = (elapsedMs / 1000) % 60;
  const minuteHand = polarFrac(70, inLap / span);
  const secondHand = polarFrac(94, sec / 60);
  const secondTail = polarFrac(-18, sec / 60);
  const R_ARC = 108;
  const circ = 2 * Math.PI * R_ARC;
  const labelStep = span === 30 ? 5 : 10;
  const majorEvery = span === 30 ? 10 : 5; // 60 garis; garis tebal tiap 5 menit

  // Jadwal yang jatuh di putaran berjalan (menit `span` = akhir putaran 1, dst.)
  const dots = schedule
    .map((m, i) => ({ m, i, lapOf: m === 0 ? 0 : Math.ceil(m / span) - 1 }))
    .filter((d) => d.lapOf === lap);

  return (
    <svg width="100%" viewBox="0 0 260 260" role="img" aria-label={`Jam stopwatch ${formatClock(elapsedMs)}`} className="max-w-[260px] shrink-0">
      <circle cx={C} cy={C} r="124" fill="#FFFFFF" />
      <circle cx={C} cy={C} r={R_ARC} fill="none" stroke="#FFEDD5" strokeWidth="10" />
      {running && (
        <circle
          cx={C}
          cy={C}
          r={R_ARC}
          fill="none"
          stroke="#FDBA74"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${Math.min(1, inLap / span) * circ} ${circ}`}
          transform={`rotate(-90 ${C} ${C})`}
        />
      )}
      <g stroke="#1E1B4B" strokeLinecap="round">
        {Array.from({ length: 60 }, (_, i) => {
          const major = i % majorEvery === 0;
          const p1 = polarFrac(118, i / 60), p2 = polarFrac(major ? 104 : 112, i / 60);
          return <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} strokeWidth={major ? 3 : 1.2} />;
        })}
      </g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="13" fontWeight="700" fill="#1E1B4B" textAnchor="middle">
        {Array.from({ length: span / labelStep }, (_, j) => j * labelStep).map((m) => {
          const p = polarFrac(84, m / span);
          return <text key={m} x={p.x} y={p.y + 5}>{m + lap * span}</text>;
        })}
      </g>
      {dots.map(({ m, i }) => {
        const p = polarFrac(96, (m - lap * span) / span);
        if (doneFlags[i]) return <circle key={i} cx={p.x} cy={p.y} r="5" fill="#C2410C" />;
        if (i === nextIndex) return <circle key={i} cx={p.x} cy={p.y} r="9" fill="#A3E635" stroke="#1E1B4B" strokeWidth="2.5" />;
        return <circle key={i} cx={p.x} cy={p.y} r="5" fill="#FFFFFF" stroke="#F97316" strokeWidth="2.5" />;
      })}
      <line x1={C} y1={C} x2={minuteHand.x} y2={minuteHand.y} stroke="#1E1B4B" strokeWidth="7" strokeLinecap="round" />
      {running && <line x1={secondTail.x} y1={secondTail.y} x2={secondHand.x} y2={secondHand.y} stroke="#C2410C" strokeWidth="2.5" strokeLinecap="round" />}
      <circle cx={C} cy={C} r="8" fill="#1E1B4B" />
      <circle cx={C} cy={C} r="3" fill="#C2410C" />
      <text x={C} y={C + 44} textAnchor="middle" fontFamily="Figtree, sans-serif" fontSize="12" fontWeight="700" fill="#5B5A7A">
        {laps > 1 ? `putaran ${Math.min(lap + 1, laps)}/${laps}` : `skala ${span} menit`}
      </text>
    </svg>
  );
};

export const Stopwatch: React.FC<StopwatchProps> = ({ state, setState, now, acid, onSelectAcid }) => {
  const data = state.acids[acid];
  const st = timerStatus(data, state.schedule, now);
  const [lastIdx, setLastIdx] = useState<number | null>(null);
  const [scheduleText, setScheduleText] = useState(state.schedule.join(', '));
  const [scheduleError, setScheduleError] = useState('');
  const anyRunning = ACID_KEYS.some((k) => state.acids[k].startedAt !== null);
  const [soundOn, setSound] = useState(isSoundOn);
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSound(next);
    if (next) testSound();
  };

  const update = (patch: Partial<typeof data>) =>
    setState((s) => ({ ...s, acids: { ...s.acids, [acid]: { ...s.acids[acid], ...patch } } }));

  const start = () => {
    unlockAudio();
    if (data.times.some((v) => v !== null) && !window.confirm(`Sudah ada waktu baca tercatat untuk ${ACIDS[acid].short}. Mulai ulang akan menghapus waktu-waktu tersebut (nilai α tetap). Lanjutkan?`)) return;
    update({ startedAt: Date.now(), times: data.times.map(() => null) });
    setLastIdx(null);
  };

  const record = () => {
    if (st.finished) return;
    const minutes = Math.round(st.elapsedMs / 1000) / 60;
    const times = [...data.times];
    times[st.nextIndex] = minutes;
    update({ times });
    setLastIdx(st.nextIndex);
  };

  const undo = () => {
    let last = -1;
    data.times.forEach((v, i) => { if (v !== null) last = i; });
    if (last < 0) return;
    const times = [...data.times];
    times[last] = null;
    update({ times });
    setLastIdx(null);
  };

  const stop = () => {
    if (!st.finished && !window.confirm('Hentikan stopwatch? Waktu yang sudah tercatat tetap disimpan.')) return;
    update({ startedAt: null });
  };

  const setAlpha = (i: number, v: number | null) => {
    const alphas = [...data.alphas];
    alphas[i] = v;
    update({ alphas });
  };

  const applySchedule = () => {
    const parts = scheduleText.split(/[,;\s]+/).filter(Boolean).map(Number);
    const ok = parts.length >= 3 && parts.every((v, i) => Number.isFinite(v) && v >= 0 && (i === 0 || v > parts[i - 1]));
    if (!ok) {
      setScheduleError('Isi minimal 3 angka menit yang terus naik, dipisah koma. Contoh: 0, 5, 10, 15');
      return;
    }
    setScheduleError('');
    setState((s) => withSchedule(s, parts));
  };

  const countdown = st.countdownMs;
  const due = countdown !== null && countdown <= 0;
  const soon = countdown !== null && countdown > 0 && countdown <= 30000;

  return (
    <div id="stopwatch" className="flex flex-col gap-4 scroll-mt-32">
      {ACID_KEYS.length > 1 && (
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Pilih sampel">
        {ACID_KEYS.map((k) => {
          const s = timerStatus(state.acids[k], state.schedule, now);
          const active = k === acid;
          return (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelectAcid(k)}
              className={`min-h-[48px] px-4 rounded-full text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                active ? 'bg-spek-indigo text-white' : 'bg-white text-spek-ink border-2 border-spek-violet-tint hover:bg-spek-soft'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: ACIDS[k].color }} />
              {ACIDS[k].short}
              <span className={`font-mono text-xs ${active ? 'text-spek-mist' : 'text-spek-muted'}`}>
                {s.running ? formatClock(s.elapsedMs) : `${s.doneCount}/${state.schedule.length}`}
              </span>
            </button>
          );
        })}
      </div>
      )}

      <section className={`rounded-[28px] p-5 sm:p-6 flex flex-wrap gap-6 items-center text-white transition-colors ${due ? 'bg-spek-indigo' : 'bg-spek-orange'}`}>
        <AnalogClock
          elapsedMs={st.elapsedMs}
          schedule={state.schedule}
          doneFlags={data.times.map((v) => v !== null)}
          nextIndex={st.nextIndex}
          running={st.running}
        />
        <div className="flex-[1_1_260px] min-w-0 flex flex-col gap-3">
          <div className="flex flex-wrap justify-between items-center gap-2 text-[13px]">
            <span className="font-extrabold tracking-wider text-spek-orange-tint">STOPWATCH · {ACIDS[acid].formula}</span>
            <span className="text-spek-orange-tint">Pembacaan {Math.min(st.doneCount + 1, state.schedule.length)} dari {state.schedule.length}</span>
          </div>
          <span className="font-mono text-6xl sm:text-7xl font-bold leading-none tabular-nums" aria-live="off">{formatClock(st.elapsedMs)}</span>

          {st.finished ? (
            <div className="rounded-2xl bg-spek-orange-deep px-4 py-3 text-[15px] leading-relaxed">
              Seluruh pembacaan terjadwal selesai. Lanjutkan dengan pemanasan untuk penentuan <strong>α∞</strong> menggunakan timer pemanasan di bawah.
            </div>
          ) : (
            <div className={`rounded-2xl px-4 py-3 flex items-center justify-between gap-3 ${due ? 'bg-spek-lime text-spek-indigo' : 'bg-spek-orange-deep'}`} aria-live="polite">
              <span className="flex items-center gap-2 text-[15px] font-semibold">
                <span className={`w-3 h-3 rounded-full ${due ? 'bg-spek-indigo animate-pulse' : 'bg-spek-lime'}`} />
                {!st.running
                  ? 'Tekan Mulai saat asam dicampurkan (t = 0)'
                  : due
                  ? `Baca sekarang! (jadwal t = ${scheduleLabel(st.nextMin as number)} menit)`
                  : `Baca berikutnya: t = ${scheduleLabel(st.nextMin as number)} menit`}
              </span>
              {st.running && countdown !== null && (
                <span className={`font-mono text-2xl font-bold tabular-nums ${soon ? 'animate-pulse' : ''}`}>
                  {due ? `+${formatClock(-countdown)}` : formatClock(countdown)}
                </span>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2.5">
            {!st.running ? (
              <button type="button" onClick={start} className="flex-1 min-h-[54px] px-5 rounded-2xl bg-white text-spek-orange-deep text-base font-extrabold hover:bg-spek-orange-tint cursor-pointer">
                Mulai (t = 0)
              </button>
            ) : (
              <button type="button" onClick={record} disabled={st.finished} className="flex-1 min-h-[54px] px-5 rounded-2xl bg-white text-spek-orange-deep text-base font-extrabold hover:bg-spek-orange-tint disabled:opacity-50 cursor-pointer">
                Catat waktu baca
              </button>
            )}
            <button type="button" onClick={undo} disabled={st.doneCount === 0} className="min-h-[54px] px-4 rounded-2xl border-2 border-[#FED7AA] text-white font-bold hover:bg-white/10 disabled:opacity-40 cursor-pointer">
              Batalkan catatan
            </button>
            {st.running && (
              <button type="button" onClick={stop} className="min-h-[54px] px-4 rounded-2xl border-2 border-[#FED7AA] text-white font-bold hover:bg-white/10 cursor-pointer">
                Hentikan
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-spek-orange-tint">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-spek-orange border-[3px] border-white box-border" />sudah dibaca</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-spek-lime" />berikutnya</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-[#FDBA74] box-border" />menunggu</span>
          </div>
        </div>
      </section>

      {lastIdx !== null && data.times[lastIdx] !== null && (
        <div className="bg-white rounded-2xl p-4 flex flex-wrap items-end gap-3 border-2 border-spek-lime">
          <div className="flex flex-col gap-0.5 flex-[1_1_200px]">
            <span className="text-xs font-extrabold tracking-wider text-spek-lime-deep">TERCATAT</span>
            <span className="text-[15px]">
              Pembacaan ke-{lastIdx + 1} pada <strong className="font-mono">{formatMinutes(data.times[lastIdx])}</strong>. Ketik sudut yang terbaca:
            </span>
          </div>
          <NumberField
            label={`α terbaca pembacaan ke-${lastIdx + 1}`}
            value={data.alphas[lastIdx]}
            onChange={(v) => setAlpha(lastIdx, v)}
            unit="°"
            autoFocus
            className="w-40"
          />
        </div>
      )}

      <div className="bg-white rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex flex-col flex-[1_1_220px]">
          <span className="font-bold text-[15px]">Alarm</span>
          <span className="text-sm text-spek-muted">Bunyi peringatan 30 detik sebelum jadwal baca dan bunyi alarm tepat pada jadwal (disertai getar pada ponsel).</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={soundOn}
          onClick={toggleSound}
          className={`min-h-[44px] px-4 rounded-full text-sm font-bold cursor-pointer ${soundOn ? 'bg-spek-lime text-spek-indigo' : 'bg-spek-soft text-spek-muted border-2 border-spek-violet-tint'}`}
        >
          Suara: {soundOn ? 'aktif' : 'nonaktif'}
        </button>
        <button type="button" onClick={testSound} className="min-h-[44px] px-4 rounded-full border-2 border-spek-violet-tint text-sm font-bold cursor-pointer hover:bg-spek-soft">
          Tes suara
        </button>
      </div>

      <details className="bg-white rounded-2xl px-4 py-3">
        <summary className="cursor-pointer min-h-[36px] flex items-center font-bold text-[15px]">Jadwal pembacaan ({state.schedule.length} titik)</summary>
        <div className="flex flex-col gap-2 pt-2">
          <p className="m-0 text-sm text-spek-muted leading-relaxed">
            Jadwal default: 0–30 menit, dibaca segera lalu tiap 5 menit. Dapat diubah sesuai arahan asisten (dalam menit, dipisahkan koma). Nilai α yang sudah diisi tetap tersimpan per baris.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              aria-label="Jadwal pembacaan dalam menit"
              value={scheduleText}
              onChange={(e) => setScheduleText(e.target.value)}
              disabled={anyRunning}
              className="flex-[1_1_280px] min-h-[46px] px-3.5 rounded-xl border-2 border-spek-violet-tint bg-spek-soft font-mono text-sm outline-none focus:border-spek-violet disabled:opacity-60"
            />
            <button type="button" onClick={applySchedule} disabled={anyRunning} className="min-h-[46px] px-4 rounded-xl bg-spek-violet text-white font-bold disabled:opacity-50 cursor-pointer">
              Terapkan
            </button>
            <button
              type="button"
              onClick={() => {
                setScheduleText(DEFAULT_SCHEDULE.join(', '));
                setScheduleError('');
                setState((s) => withSchedule(s, DEFAULT_SCHEDULE));
              }}
              disabled={anyRunning}
              className="min-h-[46px] px-4 rounded-xl border-2 border-spek-violet-tint font-bold disabled:opacity-50 cursor-pointer"
            >
              Jadwal default (30 menit)
            </button>
          </div>
          {anyRunning && <span className="text-xs text-spek-muted">Jadwal tidak bisa diubah saat stopwatch berjalan.</span>}
          {scheduleError && <span className="text-xs font-semibold text-rose-600">{scheduleError}</span>}
        </div>
      </details>
    </div>
  );
};
