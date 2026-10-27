import { ACIDS, ACID_KEYS, DEFAULT_SCHEDULE, INITIAL_STATE, type AcidKey, type InversiState } from './state';

export interface Regression {
  slope: number;
  intercept: number;
  r2: number;
  n: number;
  seSlope: number;
}

export function linearRegression(xs: number[], ys: number[]): Regression | null {
  const n = xs.length;
  if (n < 2) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let sxx = 0, sxy = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - mx) ** 2;
    sxy += (xs[i] - mx) * (ys[i] - my);
    syy += (ys[i] - my) ** 2;
  }
  if (sxx === 0) return null;
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const ssRes = ys.reduce((acc, y, i) => acc + (y - (intercept + slope * xs[i])) ** 2, 0);
  const r2 = syy === 0 ? 1 : 1 - ssRes / syy;
  const seSlope = n > 2 ? Math.sqrt(ssRes / (n - 2) / sxx) : NaN;
  return { slope, intercept, r2, n, seSlope };
}

export interface ExpFit {
  k: number;        // menit⁻¹
  alphaInf: number; // α∞ hasil fitting (terkoreksi)
  alpha0: number;   // α0 hasil fitting (terkoreksi)
  rmse: number;
  ok: boolean;      // false bila k menempel batas pencarian (data terlalu sedikit melengkung)
}

/**
 * Fitting αt = α∞ + (α0 − α∞)·e^(−kt) tanpa memakai α∞ terukur.
 * Untuk tiap k model linear terhadap (α∞, A), jadi cukup cari k terbaik.
 */
export function exponentialFit(ts: number[], alphas: number[]): ExpFit | null {
  const n = ts.length;
  if (n < 4) return null;
  const solve = (k: number) => {
    const xs = ts.map((t) => Math.exp(-k * t));
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = alphas.reduce((a, b) => a + b, 0) / n;
    let sxx = 0, sxy = 0;
    for (let i = 0; i < n; i++) {
      sxx += (xs[i] - mx) ** 2;
      sxy += (xs[i] - mx) * (alphas[i] - my);
    }
    if (sxx < 1e-14) return null;
    const A = sxy / sxx;
    const c0 = my - A * mx;
    const sse = alphas.reduce((acc, a, i) => acc + (a - (c0 + A * xs[i])) ** 2, 0);
    return { k, alphaInf: c0, alpha0: c0 + A, sse };
  };
  const lo = Math.log(1e-4), hi = Math.log(2);
  const STEPS = 300;
  let best: ReturnType<typeof solve> = null;
  let bestI = -1;
  for (let i = 0; i <= STEPS; i++) {
    const r = solve(Math.exp(lo + ((hi - lo) * i) / STEPS));
    if (r && (!best || r.sse < best.sse)) { best = r; bestI = i; }
  }
  if (!best) return null;
  // Perhalus dengan golden-section di sekitar titik terbaik
  let a = lo + ((hi - lo) * Math.max(0, bestI - 1)) / STEPS;
  let b = lo + ((hi - lo) * Math.min(STEPS, bestI + 1)) / STEPS;
  const g = (Math.sqrt(5) - 1) / 2;
  for (let it = 0; it < 60; it++) {
    const c = b - g * (b - a), d = a + g * (b - a);
    const fc = solve(Math.exp(c))?.sse ?? Infinity;
    const fd = solve(Math.exp(d))?.sse ?? Infinity;
    if (fc < fd) b = d; else a = c;
  }
  const refined = solve(Math.exp((a + b) / 2)) ?? best;
  // Fitting hanya andal bila reaksi sudah teramati cukup jauh (≥ 50 % konversi):
  // bila kurva masih hampir lurus, α∞ dan k tidak bisa dipisahkan.
  const lastAlpha = alphas[ts.indexOf(Math.max(...ts))];
  const observed = (refined.alpha0 - lastAlpha) / (refined.alpha0 - refined.alphaInf);
  return {
    k: refined.k,
    alphaInf: refined.alphaInf,
    alpha0: refined.alpha0,
    rmse: Math.sqrt(refined.sse / n),
    ok: bestI > 2 && bestI < STEPS - 2 && refined.alpha0 > refined.alphaInf && observed >= 0.5,
  };
}

export type PointStatus = 'ok' | 'kosong' | 'tidak-valid';

export interface PointRow {
  index: number;
  scheduled: number;
  t: number | null;          // menit
  alphaRead: number | null;  // °
  alphaT: number | null;     // terkoreksi titik nol
  diff: number | null;       // αt − α∞
  lnDiff: number | null;
  conversion: number | null; // 0–1
  status: PointStatus;
  note?: string;
}

export interface Warning {
  level: 'info' | 'warn';
  text: string;
}

export interface AcidAnalysis {
  key: AcidKey;
  zero: number;
  alphaInf: number | null;   // terkoreksi
  rows: PointRow[];
  used: PointRow[];
  regression: Regression | null;
  k: number | null;          // menit⁻¹
  kErr: number | null;
  tHalf: number | null;      // menit
  alpha0: number | null;     // dari intersep (terkoreksi)
  expFit: ExpFit | null;
  warnings: Warning[];
}

export function analyzeAcid(state: InversiState, key: AcidKey): AcidAnalysis {
  const acid = state.acids[key];
  const zero = state.zeroReading ?? 0;
  const alphaInf = acid.alphaInf === null ? null : acid.alphaInf - zero;
  const warnings: Warning[] = [];

  const rows: PointRow[] = state.schedule.map((scheduled, index) => {
    const t = acid.times[index];
    const alphaRead = acid.alphas[index];
    if (t === null || alphaRead === null) {
      return { index, scheduled, t, alphaRead, alphaT: null, diff: null, lnDiff: null, conversion: null, status: 'kosong' };
    }
    const alphaT = alphaRead - zero;
    const diff = alphaInf === null ? null : alphaT - alphaInf;
    if (diff !== null && diff <= 0) {
      return { index, scheduled, t, alphaRead, alphaT, diff, lnDiff: null, conversion: null, status: 'tidak-valid', note: 'αt ≤ α∞, ln tidak terdefinisi' };
    }
    return { index, scheduled, t, alphaRead, alphaT, diff, lnDiff: diff === null ? null : Math.log(diff), conversion: null, status: 'ok' };
  });

  const used = rows.filter((r) => r.status === 'ok' && r.lnDiff !== null);
  const regression = used.length >= 3 ? linearRegression(used.map((r) => r.t as number), used.map((r) => r.lnDiff as number)) : null;
  const k = regression ? -regression.slope : null;
  const alpha0 = regression && alphaInf !== null ? alphaInf + Math.exp(regression.intercept) : null;

  if (alpha0 !== null && alphaInf !== null) {
    for (const r of rows) {
      if (r.alphaT !== null) r.conversion = (alpha0 - r.alphaT) / (alpha0 - alphaInf);
    }
  }

  // Titik bersama t & α untuk fitting eksponensial (tidak butuh α∞)
  const withAlpha = rows.filter((r) => r.t !== null && r.alphaT !== null);
  const expFit = exponentialFit(withAlpha.map((r) => r.t as number), withAlpha.map((r) => r.alphaT as number));

  // ---- Peringatan
  const label = ACIDS[key].short;
  if (state.zeroReading === null && withAlpha.length) warnings.push({ level: 'info', text: 'Titik nol polarimeter belum diisi — dianggap 0°.' });
  if (acid.alphaInf === null && withAlpha.length) warnings.push({ level: 'warn', text: `α∞ ${label} belum diisi, jadi ln(αt − α∞) belum bisa dihitung.` });
  if (alphaInf !== null && alphaInf >= 0) {
    warnings.push({ level: 'warn', text: `α∞ ${label} terkoreksi bernilai ${alphaInf.toFixed(2)}°. Gula invert seharusnya memutar ke kiri (α∞ negatif). Periksa pembacaan atau kelengkapan pemanasan.` });
  }
  const invalid = rows.filter((r) => r.status === 'tidak-valid');
  if (invalid.length) warnings.push({ level: 'warn', text: `${invalid.length} titik ${label} tidak dipakai karena αt ≤ α∞.` });
  for (let i = 1; i < withAlpha.length; i++) {
    const prev = withAlpha[i - 1], cur = withAlpha[i];
    if ((cur.alphaT as number) > (prev.alphaT as number) + 0.1) {
      cur.note = 'α naik dari titik sebelumnya';
      warnings.push({ level: 'info', text: `${label}: α pada t = ${(cur.t as number).toFixed(1)} menit lebih besar dari titik sebelumnya. Seharusnya α terus menurun.` });
    }
  }
  const late = rows.filter((r) => r.t !== null && r.scheduled > 0 && Math.abs((r.t as number) - r.scheduled) > 2);
  if (late.length) warnings.push({ level: 'info', text: `${label}: ${late.length} pembacaan bergeser lebih dari 2 menit dari jadwal. Tidak masalah — perhitungan memakai waktu aktual.` });
  if (regression && regression.r2 < 0.98) warnings.push({ level: 'warn', text: `R² ${label} = ${regression.r2.toFixed(4)} (< 0,98). Periksa titik yang menyimpang dari garis.` });
  if (k !== null && k <= 0) warnings.push({ level: 'warn', text: `Kemiringan ${label} tidak negatif, sehingga k ≤ 0. Data belum menunjukkan reaksi berjalan.` });
  if (expFit?.ok && alphaInf !== null && Math.abs(expFit.alphaInf - alphaInf) > 1) {
    warnings.push({ level: 'info', text: `${label}: α∞ hasil fitting (${expFit.alphaInf.toFixed(2)}°) berbeda > 1° dari α∞ terukur (${alphaInf.toFixed(2)}°). Bisa jadi pemanasan belum menuntaskan reaksi.` });
  }

  return {
    key,
    zero,
    alphaInf,
    rows,
    used,
    regression,
    k,
    kErr: regression && Number.isFinite(regression.seSlope) ? regression.seSlope : null,
    tHalf: k && k > 0 ? Math.LN2 / k : null,
    alpha0,
    expFit,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Sampel referensi (sukrosa tanpa asam): tidak ada katalis, jadi α diharapkan tetap.
// ---------------------------------------------------------------------------
export interface RefRow {
  index: number;
  scheduled: number;
  t: number | null;
  alphaRead: number | null;
  alphaT: number | null;  // terkoreksi titik nol
  delta: number | null;   // αt − α pembacaan pertama
}

export interface RefAnalysis {
  key: 'ref';
  zero: number;
  rows: RefRow[];
  n: number;
  mean: number | null;
  sd: number | null;
  first: number | null;
  last: number | null;
  change: number | null;        // α terakhir − α pertama
  trend: Regression | null;     // α terhadap t (°/menit)
  warnings: Warning[];
}

/** Perubahan α referensi yang masih dianggap "tetap" (≈ ketelitian baca polarimeter). */
export const REF_TOLERANCE = 0.3;

export function analyzeReference(state: InversiState): RefAnalysis {
  const acid = state.acids.ref;
  const zero = state.zeroReading ?? 0;
  const base = state.schedule.map((scheduled, index) => {
    const t = acid.times[index];
    const alphaRead = acid.alphas[index];
    return { index, scheduled, t, alphaRead, alphaT: alphaRead === null ? null : alphaRead - zero, delta: null as number | null };
  });
  const filled = base.filter((r) => r.t !== null && r.alphaT !== null);
  const first = filled[0]?.alphaT ?? null;
  for (const r of base) if (r.alphaT !== null && first !== null) r.delta = r.alphaT - first;
  const vals = filled.map((r) => r.alphaT as number);
  const n = vals.length;
  const mean = n ? vals.reduce((a, b) => a + b, 0) / n : null;
  const sd = n > 1 && mean !== null ? Math.sqrt(vals.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1)) : null;
  const last = filled[filled.length - 1]?.alphaT ?? null;
  const change = first !== null && last !== null && n > 1 ? last - first : null;
  const trend = n >= 3 ? linearRegression(filled.map((r) => r.t as number), vals) : null;

  const warnings: Warning[] = [];
  if (change !== null && Math.abs(change) > REF_TOLERANCE) {
    warnings.push({
      level: 'warn',
      text: `α referensi berubah ${change.toFixed(2)}° selama pengamatan. Tanpa asam, sukrosa seharusnya hampir tidak terhidrolisis. Periksa kemungkinan wadah/pipet terkontaminasi asam, perubahan suhu, atau gelembung di tabung.`,
    });
  }
  if (mean !== null && mean <= 0) {
    warnings.push({ level: 'warn', text: 'α referensi terkoreksi tidak positif. Larutan sukrosa seharusnya memutar ke kanan (α > 0). Periksa titik nol.' });
  }
  return { key: 'ref', zero, rows: base, n, mean, sd, first, last, change, trend, warnings };
}

export function analyzeAll(state: InversiState) {
  const hcl = analyzeAcid(state, 'hcl');
  const ref = analyzeReference(state);
  // α0 dari intersep HCl dibandingkan dengan α sukrosa tanpa asam (seharusnya mirip:
  // konsentrasi sukrosa sama dan pengenceran sama, hanya tanpa katalis)
  const alpha0Diff = hcl.alpha0 !== null && ref.mean !== null ? hcl.alpha0 - ref.mean : null;
  return { hcl, ref, alpha0Diff };
}

export function isAcidComplete(state: InversiState, key: AcidKey) {
  const a = state.acids[key];
  const n = a.times.filter((v, i) => v !== null && a.alphas[i] !== null).length;
  return ACIDS[key].catalyzed ? a.alphaInf !== null && n >= 3 : n >= 2;
}

// ---------------------------------------------------------------------------
// Data demo (contoh realistis — bukan data praktikum sungguhan)
// ---------------------------------------------------------------------------
export function demoState(): InversiState {
  const schedule = DEFAULT_SCHEDULE;
  const zero = 0.05;
  const round05 = (v: number) => Math.round(v / 0.05) * 0.05;
  const make = (k: number, a0: number, aInf: number | null, seed: number) => {
    const times = schedule.map((m, i) => (m === 0 ? 1.1 : m + ((Math.sin(seed + i * 1.7) + 1) * 0.25)));
    const inf = aInf ?? a0;
    const alphas = times.map((t, i) => round05(zero + inf + (a0 - inf) * Math.exp(-k * t) + Math.sin(seed * 3 + i) * 0.04));
    return {
      startedAt: null,
      times: times.map((t) => Math.round(t * 60) / 60),
      alphas: alphas.map((v) => Number(v.toFixed(2))),
      alphaInf: aInf === null ? null : Number(round05(aInf + zero + 0.05).toFixed(2)),
    };
  };
  return {
    ...INITIAL_STATE,
    schedule,
    zeroReading: zero,
    tubeLength: 2,
    temperatureC: 27,
    acids: {
      hcl: make(0.0249, 13.3, -4.2, 1),
      ref: make(0, 13.3, null, 2),
    },
  };
}

export { ACID_KEYS };
