import React from 'react';
import { HeatTimer } from './HeatTimer';
import { Stopwatch } from './Stopwatch';
import type { AcidKey, InversiState } from './state';
import { Card } from './ui';

interface StopwatchStepProps {
  state: InversiState;
  setState: React.Dispatch<React.SetStateAction<InversiState>>;
  now: number;
  acid: AcidKey;
  onSelectAcid: (k: AcidKey) => void;
  onGoToProcedure: () => void;
  onGoToWorksheet: () => void;
}

export const StopwatchStep: React.FC<StopwatchStepProps> = ({ state, setState, now, acid, onSelectAcid, onGoToProcedure, onGoToWorksheet }) => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-wrap justify-between items-end gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-extrabold tracking-wider text-spek-orange">LANGKAH 3 DARI 6</span>
        <h1 className="m-0 font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Stopwatch &amp; pemanasan</h1>
        <p className="m-0 text-spek-muted text-[16px] max-w-[720px] leading-relaxed">
          Tekan <strong>Mulai</strong> tepat saat HCl dicampurkan ke larutan sukrosa (t = 0). Tekan <strong>Catat waktu baca</strong> setiap kali sudut putar
          dibaca, lalu isikan nilainya. Setelah pengamatan 30 menit selesai, gunakan timer pemanasan untuk penentuan α∞.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onGoToProcedure} className="min-h-[46px] px-4 rounded-full border-2 border-spek-violet-tint bg-white text-sm font-bold cursor-pointer hover:bg-spek-soft">
          Lihat prosedur
        </button>
        <button type="button" onClick={onGoToWorksheet} className="min-h-[46px] px-4 rounded-full bg-spek-indigo text-white text-sm font-bold cursor-pointer">
          Buka Lembar Kerja
        </button>
      </div>
    </div>

    <Card className="gap-3">
      <h2 className="m-0 font-heading text-xl font-extrabold">1 · Pengamatan sudut putar (0–30 menit)</h2>
      <Stopwatch state={state} setState={setState} now={now} acid={acid} onSelectAcid={onSelectAcid} />
    </Card>

    <Card className="gap-3">
      <h2 className="m-0 font-heading text-xl font-extrabold">2 · Pemanasan untuk α∞</h2>
      <HeatTimer state={state} setState={setState} now={now} />
    </Card>
  </div>
);
