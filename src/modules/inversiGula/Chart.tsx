import React from 'react';

export interface ChartSeries {
  label: string;
  color: string;
  points: { x: number; y: number }[];
  /** Garis regresi y = intercept + slope·x */
  fit?: { slope: number; intercept: number };
  /** Kurva model (mis. eksponensial) */
  curve?: (x: number) => number;
  connect?: boolean;
  hollow?: boolean;
}

interface ChartProps {
  title?: string;
  subtitle?: string;
  xLabel: string;
  yLabel: string;
  series: ChartSeries[];
  width?: number;
  height?: number;
  xMin?: number;
  yZeroLine?: boolean;
  /** Font yang tersedia saat dicetak/diekspor */
  fontFamily?: string;
  /** Ukuran piksel tetap + xmlns (untuk diubah menjadi gambar PNG) */
  standalone?: boolean;
}

function niceStep(range: number, target = 5) {
  const raw = range / target;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * pow;
}

function ticks(min: number, max: number) {
  if (min === max) { min -= 1; max += 1; }
  const step = niceStep(max - min);
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = start; v <= end + step / 2; v += step) out.push(Number(v.toFixed(10)));
  return { values: out, min: start, max: end, step };
}

const fmt = (v: number, step: number) => {
  const decimals = Math.max(0, -Math.floor(Math.log10(step)));
  return v.toFixed(decimals).replace('.', ',').replace('-', '−');
};

/** Grafik sebar sederhana (SVG murni) — aman untuk cetak & ekspor gambar. */
export const Chart = React.forwardRef<SVGSVGElement, ChartProps>(function Chart(
  { title, subtitle, xLabel, yLabel, series, width = 640, height = 400, xMin, yZeroLine, fontFamily = 'Figtree, Arial, sans-serif', standalone },
  ref
) {
  const pts = series.flatMap((s) => s.points);
  const left = 64, right = 20, top = title ? (subtitle ? 62 : 44) : 18, bottom = 56;
  const W = width - left - right, H = height - top - bottom;

  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const xt = ticks(xMin ?? Math.min(0, ...(xs.length ? xs : [0])), xs.length ? Math.max(...xs) : 1);
  const yt = ticks(ys.length ? Math.min(...ys) : 0, ys.length ? Math.max(...ys) : 1);
  const sx = (x: number) => left + ((x - xt.min) / (xt.max - xt.min)) * W;
  const sy = (y: number) => top + H - ((y - yt.min) / (yt.max - yt.min)) * H;
  const clipId = 'clip' + React.useId().replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      width={standalone ? width : '100%'}
      height={standalone ? height : undefined}
      xmlns={standalone ? 'http://www.w3.org/2000/svg' : undefined}
      role="img" aria-label={`${title ?? ''} ${yLabel} terhadap ${xLabel}`} style={{ display: 'block', background: '#FFFFFF', fontFamily }}>
      <rect x="0" y="0" width={width} height={height} fill="#FFFFFF" />
      {title && <text x={width / 2} y={24} textAnchor="middle" fontSize="16" fontWeight="700" fill="#17153B">{title}</text>}
      {subtitle && <text x={width / 2} y={44} textAnchor="middle" fontSize="12" fill="#5B5A7A">{subtitle}</text>}
      <defs>
        <clipPath id={clipId}><rect x={left} y={top} width={W} height={H} /></clipPath>
      </defs>
      {yt.values.map((v) => (
        <g key={`y${v}`}>
          <line x1={left} x2={left + W} y1={sy(v)} y2={sy(v)} stroke="#ECEAFB" />
          <text x={left - 8} y={sy(v) + 4} textAnchor="end" fontSize="11" fill="#5B5A7A">{fmt(v, yt.step)}</text>
        </g>
      ))}
      {xt.values.map((v) => (
        <g key={`x${v}`}>
          <line x1={sx(v)} x2={sx(v)} y1={top} y2={top + H} stroke="#F3F2FC" />
          <text x={sx(v)} y={top + H + 18} textAnchor="middle" fontSize="11" fill="#5B5A7A">{fmt(v, xt.step)}</text>
        </g>
      ))}
      {yZeroLine && yt.min < 0 && yt.max > 0 && <line x1={left} x2={left + W} y1={sy(0)} y2={sy(0)} stroke="#8C8AA8" strokeDasharray="4 3" />}
      <rect x={left} y={top} width={W} height={H} fill="none" stroke="#B9B6D9" />
      <text x={left + W / 2} y={height - 12} textAnchor="middle" fontSize="13" fontWeight="600" fill="#17153B">{xLabel}</text>
      <text x={16} y={top + H / 2} textAnchor="middle" fontSize="13" fontWeight="600" fill="#17153B" transform={`rotate(-90 16 ${top + H / 2})`}>{yLabel}</text>

      <g clipPath={`url(#${clipId})`}>
        {series.map((s) => (
          <g key={s.label}>
            {s.fit && (
              <line x1={sx(xt.min)} y1={sy(s.fit.intercept + s.fit.slope * xt.min)} x2={sx(xt.max)} y2={sy(s.fit.intercept + s.fit.slope * xt.max)} stroke={s.color} strokeWidth="2" strokeDasharray="7 5" />
            )}
            {s.curve && (
              <polyline
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeDasharray="7 5"
                points={Array.from({ length: 61 }, (_, i) => {
                  const x = xt.min + ((xt.max - xt.min) * i) / 60;
                  return `${sx(x).toFixed(1)},${sy(s.curve!(x)).toFixed(1)}`;
                }).join(' ')}
              />
            )}
            {s.connect && s.points.length > 1 && (
              <polyline fill="none" stroke={s.color} strokeWidth="2" points={s.points.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')} />
            )}
          </g>
        ))}
      </g>
      {series.map((s) =>
        s.points.map((p, i) => (
          <circle key={`${s.label}${i}`} cx={sx(p.x)} cy={sy(p.y)} r="5" fill={s.hollow ? '#FFFFFF' : s.color} stroke={s.hollow ? s.color : '#FFFFFF'} strokeWidth="2" />
        ))
      )}
      {series.length > 1 && (
        <g>
          {series.map((s, i) => (
            <g key={s.label} transform={`translate(${left + 12 + i * 170}, ${top + 14})`}>
              <rect x="-6" y="-11" width="160" height="20" rx="4" fill="#FFFFFF" opacity="0.9" />
              <circle cx="2" cy="-1" r="5" fill={s.color} />
              <text x="14" y="3" fontSize="12" fill="#17153B">{s.label}</text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
});
