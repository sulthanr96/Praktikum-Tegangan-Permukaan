import React from 'react';
import { NumberField } from './NumberField';
import { formatClock, heatRemaining, unlockAudio, type InversiState } from './state';

interface HeatTimerProps {
  state: InversiState;
  setState: React.Dispatch<React.SetStateAction<InversiState>>;
  now: number;
}

const R = 92;
const CIRC = 2 * Math.PI * R;

/** Timer hitung mundur pemanasan (±40 °C) untuk penentuan α∞. */
export const HeatTimer: React.FC<HeatTimerProps> = ({ state, setState, now }) => {
  const { heat } = state;
  const remaining = heatRemaining(state, now);
  const running = remaining !== null && remaining > 0;
  const done = remaining !== null && remaining <= 0;
  const total = heat.minutes * 60000;
  const shown = remaining === null ? total : Math.max(0, remaining);
  const frac = remaining === null ? 0 : Math.min(1, 1 - Math.max(0, remaining) / total);

  const setHeat = (patch: Partial<InversiState['heat']>) => setState((s) => ({ ...s, heat: { ...s.heat, ...patch } }));
  const start = () => {
    unlockAudio();
    setHeat({ startedAt: Date.now() });
  };
  const reset = () => {
    if (running && !window.confirm('Hentikan dan atur ulang timer pemanasan?')) return;
    setHeat({ startedAt: null });
  };

  return (
    <section className={`rounded-[28px] p-5 sm:p-6 flex flex-wrap gap-6 items-center text-white ${done ? 'bg-spek-indigo' : 'bg-spek-lime-deep'}`}>
      <svg width="100%" viewBox="0 0 220 220" role="img" aria-label={`Timer pemanasan, sisa ${formatClock(shown)}`} className="max-w-[220px] shrink-0">
        <circle cx="110" cy="110" r="104" fill="#FFFFFF" />
        <circle cx="110" cy="110" r={R} fill="none" stroke="#ECFCCB" strokeWidth="14" />
        <circle
          cx="110"
          cy="110"
          r={R}
          fill="none"
          stroke={done ? '#C2410C' : '#65A30D'}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${frac * CIRC} ${CIRC}`}
          transform="rotate(-90 110 110)"
        />
        <text x="110" y="108" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="36" fontWeight="700" fill="#1A2E05">
          {formatClock(shown)}
        </text>
        <text x="110" y="136" textAnchor="middle" fontFamily="Figtree, sans-serif" fontSize="13" fontWeight="700" fill="#3F6212">
          {done ? 'selesai' : running ? 'sisa waktu' : `${heat.minutes} menit`}
        </text>
      </svg>

      <div className="flex-[1_1_260px] min-w-0 flex flex-col gap-3">
        <span className="text-[13px] font-extrabold tracking-wider text-[#D9F99D]">TIMER PEMANASAN · ±40 °C</span>
        <p className="m-0 text-[15px] leading-relaxed text-[#ECFCCB]">
          {done
            ? 'Pemanasan selesai. Dinginkan larutan hingga suhu ruang, kemudian ukur sudut putarnya sebagai α∞.'
            : running
            ? 'Larutan sedang dipanaskan dalam penangas air. Jaga suhu sekitar 40 °C agar larutan tidak berubah cokelat.'
            : 'Mulai timer saat Erlenmeyer berisi sisa larutan dimasukkan ke penangas air ±40 °C.'}
        </p>

        <div className="flex flex-wrap items-end gap-2.5">
          {!running && !done && (
            <label className="flex flex-col gap-1 text-[13px] font-bold text-[#D9F99D]">
              Lama pemanasan
              <select
                value={heat.minutes}
                onChange={(e) => setHeat({ minutes: Number(e.target.value) })}
                className="min-h-[50px] px-3 rounded-2xl bg-white text-spek-ink font-ui text-[15px] font-bold cursor-pointer"
              >
                {[10, 15, 20, 25, 30].map((m) => (
                  <option key={m} value={m}>{m} menit</option>
                ))}
              </select>
            </label>
          )}
          {!running && (
            <button type="button" onClick={start} className="flex-1 min-h-[52px] px-5 rounded-2xl bg-white text-spek-lime-deep text-base font-extrabold hover:bg-spek-lime-tint cursor-pointer">
              {done ? 'Mulai ulang' : 'Mulai pemanasan'}
            </button>
          )}
          {(running || done) && (
            <button type="button" onClick={reset} className="min-h-[52px] px-5 rounded-2xl border-2 border-[#D9F99D] text-white font-bold hover:bg-white/10 cursor-pointer">
              Atur ulang
            </button>
          )}
        </div>

        {done && (
          <div className="rounded-2xl bg-white p-3.5 flex flex-wrap items-end gap-3 text-spek-ink">
            <NumberField
              label="α∞ terbaca (setelah didinginkan)"
              value={state.acids.hcl.alphaInf}
              onChange={(v) => setState((s) => ({ ...s, acids: { ...s.acids, hcl: { ...s.acids.hcl, alphaInf: v } } }))}
              unit="°"
              tone="highlight"
              className="w-56"
            />
            <span className="text-sm text-spek-muted flex-[1_1_160px]">Nilai ini langsung tercatat di Lembar Kerja.</span>
          </div>
        )}
      </div>
    </section>
  );
};
