import { useCallback, useEffect, useRef, useState } from 'react';

/** Dua sampel: sukrosa + HCl 4 N, dan sukrosa referensi tanpa asam (kontrol). */
export type AcidKey = 'hcl' | 'ref';

export interface AcidInfo {
  key: AcidKey;
  label: string;
  short: string;
  formula: string;
  /** true = ada katalis asam (dianalisis kinetikanya); false = referensi/kontrol */
  catalyzed: boolean;
  color: string;
}

export const ACIDS: Record<AcidKey, AcidInfo> = {
  hcl: { key: 'hcl', label: 'Sukrosa + HCl 4 N', short: 'HCl', formula: 'Sukrosa + HCl', catalyzed: true, color: '#C2410C' },
  ref: { key: 'ref', label: 'Sukrosa referensi (tanpa asam)', short: 'Referensi', formula: 'Sukrosa + air', catalyzed: false, color: '#6D28D9' },
};
export const ACID_KEYS: AcidKey[] = ['hcl', 'ref'];

/**
 * Jadwal baca (menit) menurut Tabel 5.1 modul:
 * segera (0), tiap 5 menit s.d. 30, tiap 8 menit s.d. 60, tiap 15 menit s.d. 120.
 * Modul tidak tepat bersambung di menit 60, jadi 60 disisipkan sebagai batas periode.
 */
export const DEFAULT_SCHEDULE = [0, 5, 10, 15, 20, 25, 30, 38, 46, 54, 60, 75, 90, 105, 120];

export interface AcidData {
  startedAt: number | null;    // epoch ms saat asam dicampurkan (t = 0); null = stopwatch belum jalan
  times: (number | null)[];    // waktu baca aktual (menit, desimal) per baris jadwal
  alphas: (number | null)[];   // sudut putar terbaca (°) per baris jadwal
  alphaInf: number | null;     // sudut putar terbaca setelah pemanasan (α∞, belum dikoreksi)
}

export interface InversiState {
  version: 1;
  schedule: number[];
  zeroReading: number | null;  // pembacaan polarimeter untuk air suling (titik nol)
  tubeLength: number | null;   // dm
  temperatureC: number | null; // °C
  acids: Record<AcidKey, AcidData>;
}

const STORAGE_KEY = 'srslab_inversi';
const STEP_KEY = 'srslab_inversi_step';

const emptyAcid = (n: number): AcidData => ({
  startedAt: null,
  times: Array(n).fill(null),
  alphas: Array(n).fill(null),
  alphaInf: null,
});

export const INITIAL_STATE: InversiState = {
  version: 1,
  schedule: DEFAULT_SCHEDULE,
  zeroReading: null,
  tubeLength: null,
  temperatureC: null,
  acids: { hcl: emptyAcid(DEFAULT_SCHEDULE.length), ref: emptyAcid(DEFAULT_SCHEDULE.length) },
};

const fit = <T,>(arr: T[] | undefined, n: number, fill: T): T[] =>
  Array.from({ length: n }, (_, i) => (arr && i < arr.length ? arr[i] : fill));

/** Pastikan data (dari browser atau cloud) berbentuk benar. */
export function normalizeState(raw: any): InversiState {
  if (!raw || raw.version !== 1) return INITIAL_STATE;
  const schedule: number[] = Array.isArray(raw.schedule) && raw.schedule.length ? raw.schedule.map(Number) : DEFAULT_SCHEDULE;
  const n = schedule.length;
  const acid = (a: any): AcidData => ({
    startedAt: typeof a?.startedAt === 'number' ? a.startedAt : null,
    times: fit(a?.times, n, null),
    alphas: fit(a?.alphas, n, null),
    alphaInf: typeof a?.alphaInf === 'number' ? a.alphaInf : null,
  });
  const num = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  return {
    version: 1,
    schedule,
    zeroReading: num(raw.zeroReading),
    tubeLength: num(raw.tubeLength),
    temperatureC: num(raw.temperatureC),
    acids: { hcl: acid(raw.acids?.hcl), ref: acid(raw.acids?.ref) },
  };
}

/** Ubah jadwal, sambil mempertahankan data baris yang masih ada. */
export function withSchedule(state: InversiState, schedule: number[]): InversiState {
  const n = schedule.length;
  const resize = (a: AcidData): AcidData => ({ ...a, times: fit(a.times, n, null), alphas: fit(a.alphas, n, null) });
  return { ...state, schedule, acids: { hcl: resize(state.acids.hcl), ref: resize(state.acids.ref) } };
}

export function hasAnyData(s: InversiState) {
  return (
    s.zeroReading !== null ||
    ACID_KEYS.some((k) => {
      const a = s.acids[k];
      return a.startedAt !== null || a.alphaInf !== null || a.times.some((v) => v !== null) || a.alphas.some((v) => v !== null);
    })
  );
}

function load(): InversiState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : INITIAL_STATE;
  } catch {
    return INITIAL_STATE;
  }
}

export function useInversiState() {
  const [state, setState] = useState<InversiState>(load);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // penyimpanan browser tidak tersedia
    }
  }, [state]);
  return [state, setState] as const;
}

export function useStoredStep(total: number) {
  const [step, setStep] = useState(() => {
    try {
      const n = Number(localStorage.getItem(STEP_KEY));
      return Number.isInteger(n) && n >= 0 && n < total ? n : 0;
    } catch {
      return 0;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(STEP_KEY, String(step));
    } catch {
      // abaikan
    }
  }, [step]);
  return [step, setStep] as const;
}

/** Waktu sekarang yang diperbarui berkala selama `active`. */
export function useNow(active: boolean, intervalMs = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs]);
  return now;
}

/** Status stopwatch satu asam pada waktu `now`. */
export function timerStatus(acid: AcidData, schedule: number[], now: number) {
  const running = acid.startedAt !== null;
  const elapsedMs = running ? Math.max(0, now - (acid.startedAt as number)) : 0;
  const idx = acid.times.findIndex((v) => v === null);
  const finished = idx === -1;
  const nextIndex = finished ? schedule.length : idx;
  const nextMin = finished ? null : schedule[nextIndex];
  const countdownMs = nextMin === null ? null : nextMin * 60000 - elapsedMs;
  const doneCount = acid.times.filter((v) => v !== null).length;
  return { running, elapsedMs, nextIndex, nextMin, countdownMs, finished, doneCount };
}

export function formatClock(ms: number) {
  const sign = ms < 0 ? '−' : '';
  const total = Math.floor(Math.abs(ms) / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${sign}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Menit desimal → "mm:ss" */
export function formatMinutes(min: number | null | undefined) {
  if (min === null || min === undefined || !Number.isFinite(min)) return '—';
  return formatClock(Math.round(min * 60) * 1000);
}

/** "mm:ss", "m.ss" atau angka menit → menit desimal */
export function parseMinutes(text: string): number | null {
  const t = text.trim().replace(',', '.');
  if (!t) return null;
  const mmss = t.match(/^(\d+):(\d{1,2})$/);
  if (mmss) return Number(mmss[1]) + Number(mmss[2]) / 60;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function scheduleLabel(min: number) {
  return min === 0 ? 'segera' : `${min}`;
}

// ---------------------------------------------------------------------------
// Bunyi, getar, dan layar tetap menyala
// ---------------------------------------------------------------------------
let audioCtx: AudioContext | null = null;

/** Panggil dari aksi pengguna (mis. tombol Mulai) agar browser mengizinkan suara. */
export function unlockAudio() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioCtx && Ctx) audioCtx = new Ctx();
    if (audioCtx?.state === 'suspended') audioCtx.resume();
  } catch {
    // perangkat tanpa Web Audio
  }
}

export function beep(kind: 'warn' | 'now') {
  try {
    unlockAudio();
    if (audioCtx) {
      const pattern = kind === 'now' ? [0, 0.25, 0.5] : [0];
      pattern.forEach((offset) => {
        const osc = audioCtx!.createOscillator();
        const gain = audioCtx!.createGain();
        osc.frequency.value = kind === 'now' ? 880 : 660;
        const t0 = audioCtx!.currentTime + offset;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18);
        osc.connect(gain).connect(audioCtx!.destination);
        osc.start(t0);
        osc.stop(t0 + 0.2);
      });
    }
    if (navigator.vibrate) navigator.vibrate(kind === 'now' ? [200, 100, 200, 100, 200] : 150);
  } catch {
    // abaikan
  }
}

/** Minta layar tetap menyala selama `active` (didukung di sebagian besar HP modern). */
export function useWakeLock(active: boolean) {
  const lockRef = useRef<any>(null);
  const request = useCallback(async () => {
    try {
      const wl = (navigator as any).wakeLock;
      if (wl && !lockRef.current) {
        lockRef.current = await wl.request('screen');
        lockRef.current.addEventListener?.('release', () => { lockRef.current = null; });
      }
    } catch {
      // ditolak / tidak didukung
    }
  }, []);
  useEffect(() => {
    if (!active) {
      lockRef.current?.release?.();
      lockRef.current = null;
      return;
    }
    request();
    const onVisible = () => document.visibilityState === 'visible' && request();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [active, request]);
}

/** Bunyikan peringatan 30 detik sebelum dan tepat saat jadwal baca, untuk tiap sampel. */
export function useReadingAlerts(state: InversiState, now: number) {
  const fired = useRef(new Set<string>());
  useEffect(() => {
    for (const key of ACID_KEYS) {
      const acid = state.acids[key];
      if (acid.startedAt === null) continue;
      const { nextIndex, countdownMs } = timerStatus(acid, state.schedule, now);
      if (countdownMs === null) continue;
      const id = `${key}:${acid.startedAt}:${nextIndex}`;
      // Abaikan jadwal yang sudah lewat jauh (mis. setelah halaman dibuka ulang)
      if (countdownMs <= 0 && countdownMs > -5000 && !fired.current.has(`${id}:now`)) {
        fired.current.add(`${id}:now`);
        beep('now');
      } else if (countdownMs <= 30000 && countdownMs > 25000 && !fired.current.has(`${id}:warn`)) {
        fired.current.add(`${id}:warn`);
        beep('warn');
      }
    }
  }, [state, now]);
}
