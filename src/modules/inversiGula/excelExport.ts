import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { analyzeAll, type AcidAnalysis } from './analysis';
import { alphaChartSeries, lnChartSeries } from './AnalisisStep';
import { Chart } from './Chart';
import { ACIDS, scheduleLabel, type InversiState } from './state';

/** Gambar SVG (string) → PNG base64 lewat canvas. */
function svgToPng(svg: string, width: number, height: number, scale = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas tidak tersedia'));
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png').split(',')[1]);
    };
    img.onerror = () => reject(new Error('Gagal merender grafik'));
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  });
}

const CHART_W = 720, CHART_H = 440;
const chartSvg = (props: React.ComponentProps<typeof Chart>) =>
  renderToStaticMarkup(React.createElement(Chart, { ...props, width: CHART_W, height: CHART_H, fontFamily: 'Arial, sans-serif', standalone: true }));

export async function exportInversiExcel(state: InversiState, groupName: string) {
  const { hcl, ref, alpha0Diff } = analyzeAll(state);
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SRS Lab';
  wb.created = new Date();
  const ws = wb.addWorksheet('Data & Perhitungan', { views: [{ showGridLines: false }] });
  ws.columns = [{ width: 8 }, { width: 14 }, { width: 14 }, { width: 13 }, { width: 15 }, { width: 14 }, { width: 15 }, { width: 13 }];

  const thin = { style: 'thin' as const, color: { argb: 'FFB9B6D9' } };
  const border = { top: thin, left: thin, bottom: thin, right: thin };
  const head = (row: ExcelJS.Row, argb = 'FF1E1B4B') =>
    row.eachCell((c) => {
      c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
      c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      c.border = border;
    });
  const body = (row: ExcelJS.Row) => row.eachCell({ includeEmpty: true }, (c) => { c.border = border; c.alignment = { horizontal: 'center' }; });

  ws.addRow(['Praktikum Kimia Fisik — Laju Inversi Gula']).font = { bold: true, size: 14 };
  ws.addRow([`Kelompok: ${groupName}`, '', '', `Dibuat: ${new Date().toLocaleString('id-ID')}`]);
  ws.addRow([]);

  head(ws.addRow(['Parameter', '', 'Nilai', 'Satuan']));
  ws.mergeCells(`A${ws.rowCount}:B${ws.rowCount}`);
  [
    ['Titik nol (air suling)', state.zeroReading, '°'],
    ['Panjang tabung', state.tubeLength, 'dm'],
    ['Suhu ruang', state.temperatureC, '°C'],
    ['Sukrosa awal', 0.584, 'M (20 g/100 mL)'],
    ['Asam setelah pencampuran', 2, 'N'],
  ].forEach(([label, value, unit]) => {
    const r = ws.addRow([label, '', value ?? '—', unit]);
    ws.mergeCells(`A${r.number}:B${r.number}`);
    body(r);
    r.getCell(1).alignment = { horizontal: 'left' };
  });
  ws.addRow([]);

  const acidTable = (a: AcidAnalysis, n: number) => {
    const info = ACIDS[a.key];
    const argb = 'FF' + info.color.slice(1);
    ws.addRow([`Tabel ${n}. Data pengamatan & perhitungan — ${info.label}`]).font = { bold: true, size: 12, color: { argb } };
    head(ws.addRow(['No', 't jadwal (menit)', 't aktual (menit)', 'α baca (°)', 'αt terkoreksi (°)', 'αt − α∞ (°)', 'ln(αt − α∞)', 'Konversi (%)']), argb);
    a.rows.forEach((r) => {
      const row = ws.addRow([
        r.index + 1,
        scheduleLabel(r.scheduled),
        r.t ?? '',
        r.alphaRead ?? '',
        r.alphaT ?? '',
        r.diff ?? '',
        r.lnDiff ?? (r.status === 'tidak-valid' ? 'tak terdefinisi' : ''),
        r.conversion !== null ? r.conversion * 100 : '',
      ]);
      body(row);
      row.getCell(3).numFmt = '0.00';
      [4, 5, 6].forEach((c) => (row.getCell(c).numFmt = '0.00'));
      row.getCell(7).numFmt = '0.0000';
      row.getCell(8).numFmt = '0.0';
    });
    const inf = ws.addRow(['α∞ baca', '', '', a.alphaInf === null ? '—' : (state.acids[a.key].alphaInf as number), 'α∞ terkoreksi', a.alphaInf ?? '—']);
    body(inf);
    ws.mergeCells(`A${inf.number}:C${inf.number}`);
    ws.addRow([]);

    head(ws.addRow(['Hasil', '', 'Metode A (regresi ln)', '', 'Metode B (fitting eksponensial)', '']), argb);
    const res: [string, any, any][] = [
      ['Kemiringan', a.regression?.slope ?? '—', '—'],
      ['Intersep', a.regression?.intercept ?? '—', '—'],
      ['R²', a.regression?.r2 ?? '—', '—'],
      ['k (menit⁻¹)', a.k ?? '—', a.expFit?.ok ? a.expFit.k : '—'],
      ['k (s⁻¹)', a.k !== null ? a.k / 60 : '—', a.expFit?.ok ? a.expFit.k / 60 : '—'],
      ['t½ (menit)', a.tHalf ?? '—', a.expFit?.ok ? Math.LN2 / a.expFit.k : '—'],
      ['α₀ (°)', a.alpha0 ?? '—', a.expFit?.ok ? a.expFit.alpha0 : '—'],
      ['α∞ (°)', a.alphaInf ?? '—', a.expFit?.ok ? a.expFit.alphaInf : '—'],
    ];
    res.forEach(([label, A, B]) => {
      const r = ws.addRow([label, '', A, '', B, '']);
      ws.mergeCells(`A${r.number}:B${r.number}`);
      ws.mergeCells(`C${r.number}:D${r.number}`);
      ws.mergeCells(`E${r.number}:F${r.number}`);
      body(r);
      r.getCell(1).alignment = { horizontal: 'left' };
      [3, 5].forEach((c) => (r.getCell(c).numFmt = label.startsWith('k') ? '0.000E+00' : '0.0000'));
    });
    ws.addRow([]);
  };
  acidTable(hcl, 1);

  // Tabel referensi (tanpa asam)
  {
    const info = ACIDS.ref;
    const argb = 'FF' + info.color.slice(1);
    ws.addRow([`Tabel 2. Data pengamatan — ${info.label}`]).font = { bold: true, size: 12, color: { argb } };
    head(ws.addRow(['No', 't jadwal (menit)', 't aktual (menit)', 'α baca (°)', 'αt terkoreksi (°)', 'Δα dari awal (°)']), argb);
    ref.rows.filter((r) => r.t !== null || r.alphaRead !== null).forEach((r) => {
      const row = ws.addRow([r.index + 1, scheduleLabel(r.scheduled), r.t ?? '', r.alphaRead ?? '', r.alphaT ?? '', r.delta ?? '']);
      body(row);
      [3, 4, 5, 6].forEach((c) => (row.getCell(c).numFmt = '0.00'));
    });
    ws.addRow([]);
    head(ws.addRow(['Ringkasan referensi', '', 'Nilai']), argb);
    ws.mergeCells(`A${ws.rowCount}:B${ws.rowCount}`);
    ([
      ['Jumlah pembacaan', ref.n, '0'],
      ['α rata-rata (°)', ref.mean ?? '—', '0.00'],
      ['Simpangan baku (°)', ref.sd ?? '—', '0.000'],
      ['Perubahan Δα (°)', ref.change ?? '—', '0.00'],
      ['Kemiringan α vs t (°/menit)', ref.trend?.slope ?? '—', '0.000E+00'],
    ] as [string, any, string][]).forEach(([label, v, f]) => {
      const r = ws.addRow([label, '', v]);
      ws.mergeCells(`A${r.number}:B${r.number}`);
      body(r);
      r.getCell(1).alignment = { horizontal: 'left' };
      r.getCell(3).numFmt = f;
    });
    ws.addRow([]);
  }

  head(ws.addRow(['Pengaruh katalis', '', 'Nilai']));
  ws.mergeCells(`A${ws.rowCount}:B${ws.rowCount}`);
  ([
    ['k dengan HCl (menit⁻¹)', hcl.k ?? '—', '0.000E+00'],
    ['Δα referensi tanpa asam (°)', ref.change ?? '—', '0.00'],
    ['α₀ HCl (intersep) − α referensi (°)', alpha0Diff ?? '—', '0.00'],
  ] as [string, any, string][]).forEach(([label, v, f]) => {
    const r = ws.addRow([label, '', v]);
    ws.mergeCells(`A${r.number}:B${r.number}`);
    body(r);
    r.getCell(1).alignment = { horizontal: 'left' };
    r.getCell(3).numFmt = f;
  });

  // Grafik
  const gs = wb.addWorksheet('Grafik', { views: [{ showGridLines: false }] });
  const charts: React.ComponentProps<typeof Chart>[] = [
    {
      title: 'ln(αt − α∞) terhadap t — Sukrosa + HCl 4 N',
      subtitle: hcl.regression ? `y = ${hcl.regression.intercept.toFixed(4)} ${hcl.regression.slope >= 0 ? '+' : '−'} ${Math.abs(hcl.regression.slope).toFixed(5)}t · R² = ${hcl.regression.r2.toFixed(4)}` : undefined,
      xLabel: 't (menit)',
      yLabel: 'ln(αt − α∞)',
      series: lnChartSeries(hcl),
    },
    { title: 'αt terhadap t', subtitle: 'dengan HCl dan referensi tanpa asam', xLabel: 't (menit)', yLabel: 'αt terkoreksi (°)', series: alphaChartSeries([hcl, ref], false), yZeroLine: true },
  ];
  let rowAt = 1;
  for (const c of charts) {
    if (!c.series.some((s) => s.points.length)) continue;
    try {
      const png = await svgToPng(chartSvg(c), CHART_W, CHART_H);
      const id = wb.addImage({ base64: png, extension: 'png' });
      gs.addImage(id, { tl: { col: 0.2, row: rowAt }, ext: { width: CHART_W, height: CHART_H } });
      rowAt += 24;
    } catch {
      // grafik gagal dirender: lewati, tabel tetap tersedia
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  const safe = groupName.replace(/[^\w\- ]+/g, '').trim() || 'kelompok';
  saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Inversi_Gula_${safe}.xlsx`);
}
