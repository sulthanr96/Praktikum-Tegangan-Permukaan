import React, { useEffect, useState } from 'react';
import { formatMinutes, parseMinutes } from './state';

const parseNumber = (text: string): number | null => {
  const t = text.trim().replace(/−/g, '-').replace(',', '.');
  if (t === '' || t === '-' || t === '.') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

const showNumber = (v: number | null) => (v === null ? '' : String(v).replace('.', ','));

interface FieldProps {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  unit?: string;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  hideLabel?: boolean;
  tone?: Tone;
}

type Tone = 'normal' | 'highlight';

const box = (tone: Tone | undefined, invalid: boolean) =>
  `flex items-center gap-1.5 min-h-[46px] px-3 rounded-xl border-2 transition-colors focus-within:bg-white ${
    invalid ? 'border-rose-400 bg-rose-50' : tone === 'highlight' ? 'border-[#FDBA74] bg-[#FFF7ED] focus-within:border-spek-orange' : 'border-spek-violet-tint bg-spek-soft focus-within:border-spek-violet'
  }`;

/** Input angka desimal: menerima koma, titik, dan tanda minus "−". */
export const NumberField: React.FC<FieldProps> = ({ label, value, onChange, unit, placeholder = '0,00', className = '', autoFocus, hideLabel, tone = 'normal' }) => {
  const [text, setText] = useState(showNumber(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(showNumber(value));
  }, [value, focused]);
  const invalid = text.trim() !== '' && parseNumber(text) === null && !['-', '−'].includes(text.trim());

  return (
    <label className={`flex flex-col gap-1.5 text-[13px] font-bold text-[#3B3A5C] ${className}`}>
      <span className={hideLabel ? 'sr-only' : ''}>{label}</span>
      <span className={box(tone as Tone, invalid)}>
        <input
          inputMode="decimal"
          autoFocus={autoFocus}
          value={text}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setText(showNumber(parseNumber(text)));
          }}
          onChange={(e) => {
            setText(e.target.value);
            const n = parseNumber(e.target.value);
            if (n !== null || e.target.value.trim() === '') onChange(n);
          }}
          className="w-full min-w-0 bg-transparent outline-none font-mono text-[15px] font-semibold text-spek-ink placeholder:text-[#A8A6C4]"
        />
        {unit && <span className="font-mono text-xs text-spek-muted shrink-0">{unit}</span>}
      </span>
    </label>
  );
};

/** Input waktu: "mm:ss" atau menit desimal. */
export const TimeField: React.FC<Omit<FieldProps, 'unit'>> = ({ label, value, onChange, placeholder = 'mm:ss', className = '', hideLabel, tone = 'normal' }) => {
  const [text, setText] = useState(value === null ? '' : formatMinutes(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(value === null ? '' : formatMinutes(value));
  }, [value, focused]);
  const invalid = text.trim() !== '' && parseMinutes(text) === null;

  return (
    <label className={`flex flex-col gap-1.5 text-[13px] font-bold text-[#3B3A5C] ${className}`}>
      <span className={hideLabel ? 'sr-only' : ''}>{label}</span>
      <span className={box(tone as Tone, invalid)}>
        <input
          inputMode="text"
          value={text}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            setText(e.target.value);
            const m = parseMinutes(e.target.value);
            if (m !== null || e.target.value.trim() === '') onChange(m);
          }}
          className="w-full min-w-0 bg-transparent outline-none font-mono text-[15px] font-semibold text-spek-ink placeholder:text-[#A8A6C4]"
        />
      </span>
    </label>
  );
};
