import React, { useState } from 'react';
import { analyzeAll, type AcidAnalysis } from './analysis';
import { Chart } from './Chart';
import { ACIDS, ACID_KEYS, type InversiState } from './state';
import { Tex } from './Tex';
import { Card, Note } from './ui';

export const fmt = (v: number | null | undefined, d = 4) =>
  v === null || v === undefined || !Number.isFinite(v) ? '—' : v.toFixed(d).replace('.', ',').replace('-', '−');

/** Notasi ilmiah ringkas: 2,49 × 10⁻² */
export function sci(v: number | null | undefined, digits = 3) {
  if (v === null || v === undefined || !Number.isFinite(v) || v === 0) return fmt(v, digits);
  const exp = Math.floor(Math.log10(Math.abs(v)));
  const mant = v / Math.pow(10, exp);
  const sup = String(exp).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]);
  return `${fmt(mant, digits - 1)} × 10${sup}`;
}

export function lnChartSeries(a: AcidAnalysis) {
  return [
    {
      label: ACIDS[a.key].short,
      color: ACIDS[a.key].color,
      points: a.used.map((r) => ({ x: r.t as number, y: r.lnDiff as number })),
      fit: a.regression ? { slope: a.regression.slope, intercept: a.regression.intercept } : undefined,
    },
  ];
}

export function alphaChartSeries(analyses: AcidAnalysis[], withCurve: boolean) {
  return analyses.map((a) => ({
    label: ACIDS[a.key].short,
    color: ACIDS[a.key].color,
    points: a.rows.filter((r) => r.t !== null && r.alphaT !== null).map((r) => ({ x: r.t as number, y: r.alphaT as number })),
    curve:
      withCurve && a.expFit?.ok
        ? ((fit) => (t: number) => fit.alphaInf + (fit.alpha0 - fit.alphaInf) * Math.exp(-fit.k * t))(a.expFit)
        : undefined,
  }));
}

const Stat: React.FC<{ label: string; value: React.ReactNode; unit?: string; big?: boolean; tone?: string }> = ({ label, value, unit, big, tone }) => (
  <div className={`rounded-2xl p-4 flex flex-col gap-1 ${tone ?? 'bg-spek-soft'}`}>
    <span className="text-xs font-extrabold tracking-wider opacity-80">{label}</span>
    <span className={`font-mono font-bold leading-tight ${big ? 'text-[26px]' : 'text-xl'}`}>
      {value}
      {unit && <span className="text-sm font-semibold opacity-70 ml-1">{unit}</span>}
    </span>
  </div>
);

const AcidResult: React.FC<{ a: AcidAnalysis; method: 'A' | 'B' }> = ({ a, method }) => {
  const info = ACIDS[a.key];
  const k = method === 'A' ? a.k : a.expFit?.ok ? a.expFit.k : null;
  const tHalf = k && k > 0 ? Math.LN2 / k : null;
  const hasData = a.used.length >= 3 || (method === 'B' && a.expFit);

  return (
    <Card>
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="m-0 font-heading text-2xl font-extrabold flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full" style={{ background: info.color }} />
          {info.label}
        </h2>
        <span className="text-sm text-spek-muted">
          {method === 'A' ? `${a.used.length} titik dipakai dalam regresi` : `${a.rows.filter((r) => r.alphaT !== null && r.t !== null).length} titik dipakai dalam fitting`}
        </span>
      </div>

      {!hasData ? (
        <Note kind="info">Belum cukup data. Isi minimal 3 pembacaan dan α∞ di Lembar Kerja{method === 'B' ? ' (metode B butuh minimal 4 pembacaan)' : ''}.</Note>
      ) : (
        <>
          <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(170px,100%),1fr))]">
            <div className="text-white rounded-2xl" style={{ background: info.color }}>
              <Stat label="TETAPAN LAJU k" value={sci(k)} unit="menit⁻¹" big tone="bg-transparent" />
            </div>
            <Stat label="k (DALAM DETIK)" value={sci(k !== null ? k / 60 : null)} unit="s⁻¹" />
            <Stat label="WAKTU PARUH t½" value={fmt(tHalf, 1)} unit="menit" />
            {method === 'A' ? (
              <>
                <Stat label="R²" value={fmt(a.regression?.r2, 4)} />
                <Stat label="α₀ DARI INTERSEP" value={fmt(a.alpha0, 2)} unit="°" />
              </>
            ) : (
              <>
                <Stat label="α∞ HASIL FITTING" value={fmt(a.expFit?.alphaInf, 2)} unit="°" />
                <Stat label="RMSE" value={fmt(a.expFit?.rmse, 3)} unit="°" />
              </>
            )}
          </div>

          {method === 'A' && a.regression && (
            <div className="rounded-2xl bg-spek-soft px-4 py-3 text-[15px] flex flex-col gap-1">
              <span className="text-xs font-extrabold tracking-wider text-spek-violet-deep">PERSAMAAN GARIS</span>
              <Tex>{`\\ln(\\alpha_t-\\alpha_\\infty) = ${a.regression.intercept.toFixed(4)} ${a.regression.slope >= 0 ? '+' : '-'} ${Math.abs(a.regression.slope).toFixed(5)}\\,t`}</Tex>
              <span className="text-sm text-spek-muted">
                k = −kemiringan = {sci(a.k)} menit⁻¹{a.kErr !== null ? ` (± ${sci(a.kErr, 2)})` : ''}
              </span>
            </div>
          )}
          {method === 'B' && a.expFit && !a.expFit.ok && (
            <Note kind="warn">
              Fitting eksponensial tidak andal untuk asam ini: selama waktu pengamatan reaksi belum berjalan sampai separuhnya, sehingga kurva masih hampir lurus
              dan α∞ tidak bisa diperkirakan dari data saja. Gunakan metode A (dengan α∞ terukur).
            </Note>
          )}

          <div className="rounded-2xl border border-spek-violet-tint overflow-hidden w-full max-w-[820px] mx-auto">
            {method === 'A' ? (
              <Chart
                title={`ln(αₜ − α∞) terhadap t — ${info.short}`}
                subtitle={a.regression ? `kemiringan = ${fmt(a.regression.slope, 5)} · R² = ${fmt(a.regression.r2, 4)}` : undefined}
                xLabel="t (menit)"
                yLabel="ln(αₜ − α∞)"
                series={lnChartSeries(a)}
              />
            ) : (
              <Chart
                title={`αₜ terhadap t — ${info.short}`}
                subtitle="titik = data, garis putus = model αₜ = α∞ + (α₀ − α∞)e^(−kt)"
                xLabel="t (menit)"
                yLabel="αₜ terkoreksi (°)"
                series={alphaChartSeries([a], true)}
                yZeroLine
              />
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export const AnalisisStep: React.FC<{ state: InversiState }> = ({ state }) => {
  const [method, setMethod] = useState<'A' | 'B'>('A');
  const { hcl, mca, ratio } = analyzeAll(state);
  const warnings = [...hcl.warnings, ...mca.warnings].filter((w) => w.level === 'warn');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-extrabold tracking-wider text-spek-orange">LANGKAH 4 DARI 5</span>
          <h1 className="m-0 font-heading text-3xl sm:text-4xl font-extrabold tracking-tight">Analisis data</h1>
          <p className="m-0 text-spek-muted text-[16px] max-w-[680px] leading-relaxed">Dihitung langsung dari Lembar Kerja. Ubah data di sana, hasil di sini ikut berubah.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl gap-1" role="tablist" aria-label="Metode perhitungan">
          {([
            ['A', 'Metode A · Regresi ln (modul)'],
            ['B', 'Metode B · Fitting eksponensial'],
          ] as const).map(([m, label]) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={method === m}
              onClick={() => setMethod(m)}
              className={`min-h-[44px] px-4 rounded-xl text-sm font-bold cursor-pointer transition-colors ${method === m ? 'bg-spek-indigo text-white' : 'text-spek-muted hover:bg-spek-soft'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {method === 'B' && (
        <Note kind="info" title="TENTANG METODE B">
          Metode B mencocokkan langsung <Tex>{String.raw`\alpha_t = \alpha_\infty + (\alpha_0-\alpha_\infty)e^{-kt}`}</Tex> ke data, sehingga α∞ ikut
          diperkirakan dan <strong>tidak bergantung pada α∞ hasil pemanasan</strong>. Berguna sebagai pembanding bila α∞ terukur diragukan. Metode yang diminta
          modul tetap metode A.
        </Note>
      )}

      {warnings.length > 0 && (
        <div className="flex flex-col gap-2">
          {warnings.map((w, i) => (
            <Note key={i} kind="warn" title="PERIKSA DATA">{w.text}</Note>
          ))}
        </div>
      )}

      {ACID_KEYS.map((k) => (
        <AcidResult key={k} a={k === 'hcl' ? hcl : mca} method={method} />
      ))}

      <Card className="bg-spek-indigo text-white">
        <h2 className="m-0 font-heading text-2xl font-extrabold">Pengaruh katalis asam</h2>
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] text-spek-ink">
          <Stat label="k HCl" value={sci(hcl.k)} unit="menit⁻¹" tone="bg-spek-orange-tint" />
          <Stat label="k MONOKLOROASETAT" value={sci(mca.k)} unit="menit⁻¹" tone="bg-spek-violet-tint" />
          <Stat label="RASIO k HCl / k MCA" value={ratio ? `${fmt(ratio, 1)}×` : '—'} tone="bg-spek-lime-tint" />
        </div>
        <p className="m-0 text-[16px] leading-relaxed text-spek-mist">
          {ratio
            ? ratio > 1
              ? `Reaksi dengan HCl ${fmt(ratio, 1)} kali lebih cepat. Sesuai teori: HCl asam kuat (terionisasi sempurna, [H⁺] ≈ 2 M setelah pencampuran), sedangkan asam monokloroasetat asam lemah (Ka ≈ 1,4 × 10⁻³, [H⁺] ≈ 0,05 M). Karena k = k′[H⁺]ᶜ, [H⁺] yang lebih besar menghasilkan k yang lebih besar.`
              : 'Reaksi dengan HCl tidak lebih cepat — hasil ini bertentangan dengan teori. Periksa kembali data, terutama α∞ dan titik nol.'
            : 'Perbandingan muncul setelah data kedua asam lengkap (minimal 3 titik dan α∞ masing-masing).'}
        </p>
      </Card>
    </div>
  );
};
