import React from 'react';
import { analyzeAcid, analyzeSucrose, demoState } from './analysis';
import { NumberField, TimeField } from './NumberField';
import { ACIDS, INITIAL_STATE, SUCROSE_COLOR, scheduleLabel, timerStatus, type InversiState } from './state';
import { Card, Note } from './ui';

interface LembarKerjaStepProps {
  state: InversiState;
  setState: React.Dispatch<React.SetStateAction<InversiState>>;
  now: number;
  onGoToStopwatch: () => void;
}

const num = (v: number | null | undefined, d = 2) => (v === null || v === undefined || !Number.isFinite(v) ? '—' : v.toFixed(d).replace('.', ',').replace('-', '−'));

export const LembarKerjaStep: React.FC<LembarKerjaStepProps> = ({ state, setState, now, onGoToStopwatch }) => {
  const data = state.acids.hcl;
  const a = analyzeAcid(state, 'hcl');
  const sucrose = analyzeSucrose(state);
  const timer = timerStatus(data, state.schedule, now);
  const warnings = [...sucrose.warnings, ...a.warnings];

  const setAcidField = (patch: Partial<typeof data>) =>
    setState((s) => ({ ...s, acids: { ...s.acids, hcl: { ...s.acids.hcl, ...patch } } }));
  const setRow = (field: 'times' | 'alphas', i: number, v: number | null) => {
    const arr = [...data[field]];
    arr[i] = v;
    setAcidField({ [field]: arr } as Partial<typeof data>);
  };

  const fillDemo = () => {
    const anyData = data.alphas.some((v) => v !== null) || state.sucroseReading !== null;
    if (anyData && !window.confirm('Isi data demo akan menimpa data yang sudah ada. Lanjutkan?')) return;
    setState(demoState());
  };
  const resetAcid = () => {
    if (!window.confirm('Hapus semua data sukrosa + HCl (waktu, sudut putar, α∞)? Titik nol dan α sukrosa tetap disimpan.')) return;
    setAcidField({ ...INITIAL_STATE.acids.hcl, times: data.times.map(() => null), alphas: data.alphas.map(() => null) });
  };

  const filled = a.rows.filter((r) => r.t !== null && r.alphaRead !== null).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-extrabold tracking-wider text-spek-orange">LANGKAH 4 DARI 6</span>
          <h1 className="m-0 font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Lembar kerja</h1>
          <p className="m-0 text-spek-muted text-[16px] max-w-[680px] leading-relaxed">
            Isi pembacaan polarimeter. Waktu dari stopwatch terisi otomatis; boleh juga diketik manual (format mm:ss). Semua data tersimpan otomatis.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={fillDemo} className="min-h-[46px] px-4 rounded-full bg-spek-lime text-spek-indigo text-sm font-extrabold hover:bg-[#BEF264] cursor-pointer">
            Isi data demo
          </button>
          <button type="button" onClick={resetAcid} className="min-h-[46px] px-4 rounded-full border-2 border-spek-violet-tint bg-white text-sm font-bold text-spek-ink hover:bg-spek-soft cursor-pointer">
            Kosongkan data HCl
          </button>
        </div>
      </div>

      <Card>
        <h2 className="m-0 font-heading text-xl font-extrabold">1 · Air suling &amp; 2 · Sukrosa murni</h2>
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))]">
          <NumberField label="Titik nol — air suling" value={state.zeroReading} onChange={(v) => setState((s) => ({ ...s, zeroReading: v }))} unit="°" tone="highlight" />
          <NumberField label="α sukrosa murni (sekali, sebelum HCl)" value={state.sucroseReading} onChange={(v) => setState((s) => ({ ...s, sucroseReading: v }))} unit="°" tone="highlight" />
          <label className="flex flex-col gap-1.5 text-[13px] font-bold text-[#3B3A5C]">
            Larutan sukrosa yang diukur
            <select
              value={state.sucroseDiluted ? 'encer' : 'stok'}
              onChange={(e) => setState((s) => ({ ...s, sucroseDiluted: e.target.value === 'encer' }))}
              className="min-h-[46px] px-3 rounded-xl border-2 border-spek-violet-tint bg-spek-soft font-ui text-[15px] font-semibold text-spek-ink outline-none focus:border-spek-violet cursor-pointer"
            >
              <option value="stok">Larutan 10 g/50 mL (belum diencerkan)</option>
              <option value="encer">Diencerkan 1 : 1 dengan air</option>
            </select>
          </label>
        </div>
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(190px,100%),1fr))]">
          <NumberField label="Panjang tabung" value={state.tubeLength} onChange={(v) => setState((s) => ({ ...s, tubeLength: v }))} unit="dm" placeholder="2" />
          <NumberField label="Suhu ruang" value={state.temperatureC} onChange={(v) => setState((s) => ({ ...s, temperatureC: v }))} unit="°C" placeholder="27" />
          <div className="rounded-xl px-4 py-2.5 flex flex-col justify-center gap-0.5 text-white" style={{ background: SUCROSE_COLOR }}>
            <span className="text-xs font-extrabold tracking-wider opacity-85">α₀ YANG DIHARAPKAN (CAMPURAN)</span>
            <span className="font-mono text-xl font-bold">{num(sucrose.expectedAlpha0)}°</span>
          </div>
        </div>
        <p className="m-0 text-sm text-spek-muted leading-relaxed">
          Semua sudut dikoreksi: <span className="font-mono">α = α baca − titik nol</span>.{' '}
          {state.sucroseDiluted
            ? 'Sukrosa diukur dengan pengenceran yang sama seperti campuran reaksi, jadi α sukrosa langsung menjadi α₀ yang diharapkan.'
            : 'Larutan stok diencerkan menjadi setengahnya saat dicampur HCl 1 : 1, jadi α₀ yang diharapkan = ½ × α sukrosa terkoreksi.'}
        </p>
      </Card>

      <Card>
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h2 className="m-0 font-heading text-xl font-extrabold flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full" style={{ background: ACIDS.hcl.color }} />
            3 · {ACIDS.hcl.label} (variasi waktu)
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {timer.running && (
              <button type="button" onClick={onGoToStopwatch} className="min-h-[40px] px-3.5 rounded-full bg-spek-orange text-white text-sm font-bold cursor-pointer">
                Stopwatch berjalan — buka
              </button>
            )}
            <span className="text-sm text-spek-muted">{filled} dari {state.schedule.length} baris terisi</span>
          </div>
        </div>

        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full border-separate border-spacing-0 text-[14px] min-w-[760px]">
            <thead>
              <tr className="text-left text-xs font-bold text-white">
                <th className="bg-spek-indigo px-3 py-3 rounded-l-xl">No</th>
                <th className="bg-spek-indigo px-3 py-3 whitespace-nowrap">t jadwal (menit)</th>
                <th className="bg-spek-indigo px-3 py-3 whitespace-nowrap">t aktual (mm:ss)</th>
                <th className="bg-spek-indigo px-3 py-3 whitespace-nowrap">α baca (°)</th>
                <th className="bg-spek-indigo px-3 py-3 whitespace-nowrap">αₜ terkoreksi (°)</th>
                <th className="bg-spek-indigo px-3 py-3 whitespace-nowrap">αₜ − α∞ (°)</th>
                <th className="bg-spek-indigo px-3 py-3 whitespace-nowrap rounded-r-xl">ln(αₜ − α∞)</th>
              </tr>
            </thead>
            <tbody>
              {a.rows.map((r) => {
                const isNext = timer.running && r.index === timer.nextIndex;
                return (
                  <tr key={r.index} className={isNext ? 'bg-[#FFF7ED]' : ''}>
                    <td className="px-3 py-2 border-b border-spek-violet-tint font-mono text-spek-muted">{r.index + 1}</td>
                    <td className="px-3 py-2 border-b border-spek-violet-tint font-mono font-bold">{scheduleLabel(r.scheduled)}</td>
                    <td className="px-2 py-1.5 border-b border-spek-violet-tint w-[130px]">
                      <TimeField label={`t aktual baris ${r.index + 1}`} hideLabel value={r.t} onChange={(v) => setRow('times', r.index, v)} tone={isNext ? 'highlight' : 'normal'} />
                    </td>
                    <td className="px-2 py-1.5 border-b border-spek-violet-tint w-[130px]">
                      <NumberField label={`α baca baris ${r.index + 1}`} hideLabel value={r.alphaRead} onChange={(v) => setRow('alphas', r.index, v)} tone={isNext ? 'highlight' : 'normal'} />
                    </td>
                    <td className="px-3 py-2 border-b border-spek-violet-tint font-mono font-semibold">{num(r.alphaT)}</td>
                    <td className="px-3 py-2 border-b border-spek-violet-tint font-mono">{num(r.diff)}</td>
                    <td className={`px-3 py-2 border-b border-spek-violet-tint font-mono font-bold ${r.status === 'tidak-valid' ? 'text-rose-600' : ''}`} style={r.status === 'ok' ? { color: ACIDS.hcl.color } : undefined}>
                      {r.status === 'tidak-valid' ? 'tak terdefinisi' : num(r.lnDiff, 4)}
                      {r.note && r.status !== 'tidak-valid' && <span className="block text-[11px] font-sans font-semibold text-amber-700">{r.note}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl bg-spek-lime-tint border-2 border-[#D9F99D] p-4 flex flex-wrap items-end gap-4">
          <NumberField label="α∞ baca (setelah pemanasan)" value={data.alphaInf} onChange={(v) => setAcidField({ alphaInf: v })} unit="°" tone="highlight" className="w-56" />
          <div className="flex flex-col gap-1 text-[15px]">
            <span className="text-xs font-extrabold tracking-wider text-spek-lime-deep">α∞ TERKOREKSI</span>
            <span className="font-mono text-xl font-bold">{num(a.alphaInf)}°</span>
          </div>
          <p className="m-0 flex-[1_1_240px] text-sm text-[#1A2E05] leading-relaxed">
            α∞ diukur setelah pemanasan ±40 °C selama 20 menit (Tahap D). Nilainya seharusnya negatif karena gula invert memutar ke kiri.
          </p>
        </div>
      </Card>

      {warnings.length > 0 && (
        <div className="flex flex-col gap-2">
          {warnings.map((w, i) => (
            <Note key={i} kind={w.level === 'warn' ? 'warn' : 'info'} title={w.level === 'warn' ? 'PERIKSA DATA' : 'CATATAN'}>
              {w.text}
            </Note>
          ))}
        </div>
      )}
    </div>
  );
};
