import React, { useEffect, useState } from 'react';
import { BrandMark } from '../../platform/ui';
import type { ModuleProps } from '../registry';
import { AnalisisStep } from './AnalisisStep';
import { useCloudSync } from './cloud';
import { EksporStep } from './EksporStep';
import { LembarKerjaStep } from './LembarKerjaStep';
import { InversiReport, InversiSheet } from './PrintViews';
import { ProsedurStep } from './ProsedurStep';
import { StopwatchStep } from './StopwatchStep';
import {
  ACIDS,
  ACID_KEYS,
  formatClock,
  heatRemaining,
  scheduleLabel,
  timerStatus,
  useInversiState,
  useNow,
  useReadingAlerts,
  useStoredStep,
  useWakeLock,
  type AcidKey,
} from './state';
import { TeoriStep } from './TeoriStep';

const STEPS = ['Teori', 'Prosedur', 'Stopwatch', 'Lembar Kerja', 'Analisis', 'Ekspor'];
const STEP_STOPWATCH = 2;
const STEP_WORKSHEET = 3;

export default function InversiGulaModule({ user, onBackToModules, onLogout }: ModuleProps) {
  const [state, setState] = useInversiState();
  const [step, setStep] = useStoredStep(STEPS.length);
  const [acid, setAcid] = useState<AcidKey>('hcl');
  const [printMode, setPrintMode] = useState<'report' | 'sheet' | null>(null);
  const anyRunning = ACID_KEYS.some((k) => state.acids[k].startedAt !== null);
  const heatOn = state.heat.startedAt !== null;
  const now = useNow(anyRunning || heatOn);
  const cloud = useCloudSync(state, setState, user);

  useReadingAlerts(state, now);
  useWakeLock(anyRunning || heatOn);
  const heatLeft = heatRemaining(state, now);

  const goTo = (i: number) => {
    setStep(Math.max(0, Math.min(STEPS.length - 1, i)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStopwatch = (k?: AcidKey) => {
    if (k) setAcid(k);
    setStep(STEP_STOPWATCH);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!printMode) return;
    const id = window.setTimeout(() => window.print(), 150);
    const done = () => setPrintMode(null);
    window.addEventListener('afterprint', done);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('afterprint', done);
    };
  }, [printMode]);

  const cloudLabel =
    cloud.status === 'saving' ? 'Menyimpan…'
    : cloud.status === 'loading' ? 'Memuat…'
    : cloud.status === 'error' ? 'Gagal simpan'
    : cloud.status === 'offline-admin' ? 'Mode aslab'
    : cloud.lastSaved ? `Tersimpan ${cloud.lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
    : 'Belum tersimpan';
  const cloudTone = cloud.status === 'error' ? 'bg-rose-500 text-white' : cloud.status === 'saved' ? 'bg-spek-lime text-spek-indigo' : 'bg-spek-indigo-2 text-spek-mist';

  return (
    <>
      <div className="min-h-screen bg-spek-soft font-ui text-spek-ink flex flex-col print:hidden">
        <div className="sticky top-0 z-40 bg-spek-indigo text-white shadow-lg">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <button type="button" onClick={onBackToModules} className="flex items-center min-h-[44px] cursor-pointer" title="Kembali ke pilihan modul">
              <BrandMark size="sm" label="Inversi Gula" />
            </button>
            <div className="flex flex-wrap items-center gap-2">
              {ACID_KEYS.filter((k) => state.acids[k].startedAt !== null).map((k) => {
                const st = timerStatus(state.acids[k], state.schedule, now);
                const due = st.countdownMs !== null && st.countdownMs <= 0;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => goToStopwatch(k)}
                    className={`min-h-[40px] px-3 rounded-full text-[13px] font-bold flex items-center gap-2 cursor-pointer ${due ? 'bg-spek-lime text-spek-indigo animate-pulse' : 'bg-spek-orange text-white'}`}
                    title={`Buka stopwatch ${ACIDS[k].short}`}
                  >
                    {ACIDS[k].short}
                    <span className="font-mono tabular-nums">{formatClock(st.elapsedMs)}</span>
                    {st.nextMin !== null && (
                      <span className="font-mono text-xs opacity-90">
                        {due ? 'BACA!' : `→ ${scheduleLabel(st.nextMin)} (${formatClock(st.countdownMs as number)})`}
                      </span>
                    )}
                  </button>
                );
              })}
              {heatLeft !== null && (
                <button
                  type="button"
                  onClick={() => goToStopwatch()}
                  className={`min-h-[40px] px-3 rounded-full text-[13px] font-bold flex items-center gap-2 cursor-pointer ${heatLeft <= 0 ? 'bg-spek-lime text-spek-indigo animate-pulse' : 'bg-spek-lime-deep text-white'}`}
                  title="Buka timer pemanasan"
                >
                  Pemanasan
                  <span className="font-mono tabular-nums">{heatLeft <= 0 ? 'SELESAI' : formatClock(heatLeft)}</span>
                </button>
              )}
              <span className={`px-3 py-2 rounded-full text-xs font-bold ${cloudTone}`} title={cloud.message || undefined}>{cloudLabel}</span>
              <span className="hidden sm:inline-flex px-3 py-2 rounded-full bg-spek-indigo-2 text-sm font-semibold">{user.displayName}</span>
              <button type="button" onClick={onLogout} className="min-h-[40px] px-3.5 rounded-full border border-spek-indigo-3 text-sm font-semibold hover:bg-spek-indigo-2 cursor-pointer">
                Keluar
              </button>
            </div>
          </div>
          <nav aria-label="Langkah praktikum" className="max-w-[1240px] mx-auto px-4 sm:px-6 pb-2.5 flex gap-1.5 overflow-x-auto">
            {STEPS.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => goTo(i)}
                aria-current={i === step ? 'step' : undefined}
                className={`shrink-0 min-h-[40px] px-3.5 rounded-full text-[13px] cursor-pointer transition-colors ${
                  i === step ? 'bg-spek-orange-bright text-spek-indigo font-extrabold' : 'bg-spek-indigo-2 text-spek-mist font-semibold hover:bg-spek-indigo-3'
                }`}
              >
                <span className="font-mono mr-1">{i + 1}</span>
                {s}
              </button>
            ))}
          </nav>
        </div>

        <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28">
          {step === 0 && <TeoriStep />}
          {step === 1 && <ProsedurStep onGoToStopwatch={() => goTo(STEP_STOPWATCH)} onGoToWorksheet={() => goTo(STEP_WORKSHEET)} />}
          {step === 2 && (
            <StopwatchStep
              state={state}
              setState={setState}
              now={now}
              acid={acid}
              onSelectAcid={setAcid}
              onGoToProcedure={() => goTo(1)}
              onGoToWorksheet={() => goTo(STEP_WORKSHEET)}
            />
          )}
          {step === 3 && <LembarKerjaStep state={state} setState={setState} now={now} onGoToStopwatch={() => goToStopwatch()} />}
          {step === 4 && <AnalisisStep state={state} />}
          {step === 5 && <EksporStep state={state} user={user} cloud={cloud} onPrint={setPrintMode} />}
        </main>

        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-spek-violet-tint">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => goTo(step - 1)}
              disabled={step === 0}
              className="min-h-[48px] px-4 rounded-2xl border-2 border-spek-violet-tint font-bold disabled:opacity-40 cursor-pointer"
            >
              ← {step > 0 ? STEPS[step - 1] : 'Kembali'}
            </button>
            <div className="hidden sm:flex gap-1.5" aria-hidden="true">
              {STEPS.map((s, i) => (
                <span key={s} className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-spek-orange' : i < step ? 'w-2 bg-spek-violet' : 'w-2 bg-spek-violet-tint'}`} />
              ))}
            </div>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => goTo(step + 1)} className="min-h-[48px] px-5 rounded-2xl bg-spek-indigo text-white font-extrabold cursor-pointer">
                {STEPS[step + 1]} →
              </button>
            ) : (
              <button type="button" onClick={onBackToModules} className="min-h-[48px] px-5 rounded-2xl bg-spek-indigo text-white font-extrabold cursor-pointer">
                Selesai
              </button>
            )}
          </div>
        </div>
      </div>

      {printMode && (
        <div className="hidden print:block bg-white text-black">
          {printMode === 'report' ? <InversiReport state={state} user={user} /> : <InversiSheet state={state} user={user} />}
        </div>
      )}
    </>
  );
}
