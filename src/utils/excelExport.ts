import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { SubstanceInfo, GlobalCalibration, AnalysisMode } from '../types';
import { getStandardWaterGamma, computeAnalysis, calculateRhoAir } from './physics';

export const exportExcel = async (
  substances: Record<string, SubstanceInfo>,
  cal: GlobalCalibration,
  mode: AnalysisMode
) => {
  const gammaAir = (cal.gammaAir !== undefined && cal.gammaAir > 0)
    ? cal.gammaAir
    : getStandardWaterGamma(cal.tKelvin);
  const mAir = cal.mAir - cal.mKosong;
  const rhoAir = calculateRhoAir(cal);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Praktikum Kimia';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Data Praktikum');

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin' }, left: { style: 'thin' },
    bottom: { style: 'thin' }, right: { style: 'thin' }
  };

  const applyOuterBorder = (startRow: number, endRow: number, startCol: number, endCol: number) => {
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cell = sheet.getCell(r, c);
        const border: Partial<ExcelJS.Borders> = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' }
        };
        if (r === startRow) border.top = { style: 'medium' };
        if (r === endRow) border.bottom = { style: 'medium' };
        if (c === startCol) border.left = { style: 'medium' };
        if (c === endCol) border.right = { style: 'medium' };
        cell.border = border;
      }
    }
  };

  const rich = (parts: { t: string, sub?: boolean, b?: boolean }[]): ExcelJS.CellRichTextValue => {
    return {
      richText: parts.map(p => ({
        text: p.t,
        font: {
          name: 'Calibri',
          size: 11,
          bold: p.b || false,
          ...(p.sub ? { vertAlign: 'subscript' as const } : {})
        }
      }))
    };
  };

  sheet.addRow(['kalibrasi']).font = { name: 'Calibri', size: 11, bold: true };
  sheet.addRow([]);

  const rKal1 = sheet.addRow(['Parameter Kalibrasi', '', 'Suhu (K)', cal.tKelvin]);
  sheet.mergeCells(`A${rKal1.number}:B${rKal1.number}`);
  rKal1.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF63C5EA' } };
  rKal1.getCell(1).font = { name: 'Calibri', size: 11, bold: true };
  rKal1.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
  rKal1.getCell(3).font = { name: 'Calibri', size: 11, bold: true };
  
  const rKal2 = sheet.addRow([
    '', cal.vPikno, '', cal.mAir
  ]);
  rKal2.getCell(1).value = rich([
    { t: 'V', b: true }, { t: 'pikno', b: true, sub: true }, { t: ' (mL)', b: true }
  ]);
  rKal2.getCell(3).value = rich([
    { t: 'm', b: true }, { t: 'pikno+air', b: true, sub: true }, { t: ' (g)', b: true }
  ]);
  rKal2.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF63C5EA' } };
  rKal2.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF63C5EA' } };

  const rKal3 = sheet.addRow([
    '', cal.mKosong, '', cal.hAir
  ]);
  rKal3.getCell(1).value = rich([
    { t: 'm', b: true }, { t: 'pikno', b: true, sub: true }, { t: ' (g)', b: true }
  ]);
  rKal3.getCell(3).value = rich([
    { t: 'h', b: true }, { t: 'air', b: true, sub: true }, { t: ' (cm)', b: true }
  ]);
  rKal3.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF63C5EA' } };
  rKal3.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF63C5EA' } };

  [rKal1, rKal2, rKal3].forEach(r => {
    [1, 2, 3, 4].forEach(c => {
      r.getCell(c).alignment = { horizontal: 'center', vertical: 'middle' };
      if (!r.getCell(c).font) {
        r.getCell(c).font = { name: 'Calibri', size: 11 };
      }
    });
  });
  applyOuterBorder(rKal1.number, rKal3.number, 1, 4);

  sheet.addRow([]);
  sheet.addRow([]);

  sheet.addRow(['tabel pengamatan']).font = { name: 'Calibri', size: 11, bold: true };
  sheet.addRow([]);

  const substanceList = [substances.mgcl2, substances.sds, substances.detergen];
  const colors = {
    mgcl2: { main: 'FF5CD65C', light: 'FF99E699' },
    sds: { main: 'FFE6B89C', light: 'FFF2D8C9' },
    detergen: { main: 'FFFF99CC', light: 'FFFFCCE6' }
  };

  substanceList.forEach(sub => {
    const c = colors[sub.id as keyof typeof colors];
    const rTitle = sheet.addRow([`Larutan ${sub.name}`]);
    sheet.mergeCells(`A${rTitle.number}:C${rTitle.number}`);
    rTitle.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.main } };
    rTitle.getCell(1).font = { name: 'Calibri', size: 11, bold: true };
    rTitle.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    const rHead = sheet.addRow(['Konsentrasi (M)', '', 'h (cm)']);
    rHead.getCell(2).value = rich([
      { t: 'm', b: true }, { t: 'wadah + larutan', b: true, sub: true }, { t: ' (g)', b: true }
    ]);
    
    [1, 2, 3].forEach(col => {
      rHead.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.light } };
      rHead.getCell(col).font = rHead.getCell(col).font || { name: 'Calibri', size: 11, bold: true };
      rHead.getCell(col).alignment = { horizontal: 'center', vertical: 'middle' };
    });

    let lastRow = rHead.number;
    sub.concentrations.forEach((conc, idx) => {
      const rData = sheet.addRow([conc, sub.mPikno[idx], sub.hCapillary[idx]]);
      [1, 2, 3].forEach(col => {
        rData.getCell(col).alignment = { horizontal: 'center', vertical: 'middle' };
        rData.getCell(col).font = { name: 'Calibri', size: 11 };
      });
      lastRow = rData.number;
    });
    
    applyOuterBorder(rTitle.number, lastRow, 1, 3);
    sheet.addRow([]);
  });

  sheet.addRow([]);

  sheet.addRow(['pengolahan data']).font = { name: 'Calibri', size: 11, bold: true };
  sheet.addRow([]);

  const rOlahKal1 = sheet.addRow(['Kalibrasi Air']);
  sheet.mergeCells(`A${rOlahKal1.number}:F${rOlahKal1.number}`);
  rOlahKal1.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5B9BD5' } };
  rOlahKal1.getCell(1).font = { name: 'Calibri', size: 11, bold: true };
  rOlahKal1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

  const rOlahKal2 = sheet.addRow(['', mAir, 'ρ (g/cm³)', rhoAir, '', gammaAir]);
  rOlahKal2.getCell(1).value = rich([
    { t: 'm', b: true }, { t: 'air', b: true, sub: true }, { t: ' (g)', b: true }
  ]);
  rOlahKal2.getCell(3).font = { name: 'Calibri', size: 11, bold: true };
  rOlahKal2.getCell(5).value = rich([
    { t: 'γ', b: true }, { t: 'air', b: true, sub: true }, { t: ' (mN/m)', b: true }
  ]);
  
  [1, 3, 5].forEach(col => {
    rOlahKal2.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: col === 5 ? { argb: 'FFFFFF00' } : { argb: 'FF9CC2E5' } };
    rOlahKal2.getCell(col).alignment = { horizontal: 'center', vertical: 'middle' };
  });
  for(let i=1; i<=6; i++) {
    if(i % 2 === 0) {
      rOlahKal2.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
      rOlahKal2.getCell(i).font = { name: 'Calibri', size: 11 };
    }
  }
  applyOuterBorder(rOlahKal1.number, rOlahKal2.number, 1, 6);

  sheet.addRow([]);

  substanceList.forEach(sub => {
    const c = colors[sub.id as keyof typeof colors];
    const { rows: calcRows } = computeAnalysis(sub, cal, mode);

    const rTitle = sheet.addRow([`Larutan ${sub.name}`]);
    sheet.mergeCells(`A${rTitle.number}:G${rTitle.number}`);
    rTitle.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.main } };
    rTitle.getCell(1).font = { name: 'Calibri', size: 11, bold: true };
    rTitle.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    const rHead = sheet.addRow(['Konsentrasi (M)', '', 'ρ (g/cm³)', 'h (cm)', 'γ (mN/m)', 'dγ/dC (mN·L / m·mol)', 'Γ (× 10⁻⁶ mol/m²)']);
    rHead.getCell(2).value = rich([
      { t: 'm', b: true }, { t: 'larutan', b: true, sub: true }, { t: ' (g)', b: true }
    ]);

    for(let i=1; i<=7; i++) {
      rHead.getCell(i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: c.light } };
      rHead.getCell(i).font = rHead.getCell(i).font || { name: 'Calibri', size: 11, bold: true };
      rHead.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
    }

    let lastRow = rHead.number;
    calcRows.forEach((r) => {
      const mLarutan = r.mPikno - cal.mKosong;
      const rData = sheet.addRow([
        r.concentration, mLarutan, r.rho, r.hCapillary, r.gamma, r.dGammaDC, r.surfaceExcessMicro
      ]);
      for(let i=1; i<=7; i++) {
        rData.getCell(i).alignment = { horizontal: 'center', vertical: 'middle' };
        rData.getCell(i).font = { name: 'Calibri', size: 11 };
      }
      rData.getCell(1).numFmt = '0.00';
      rData.getCell(2).numFmt = '0.0000';
      rData.getCell(3).numFmt = '0.0000';
      rData.getCell(4).numFmt = '0.00';
      rData.getCell(5).numFmt = '0.00';
      rData.getCell(6).numFmt = '0.00';
      rData.getCell(7).numFmt = '0.000';
      lastRow = rData.number;
    });
    applyOuterBorder(rTitle.number, lastRow, 1, 7);
    sheet.addRow([]);
  });

  sheet.columns.forEach((column) => {
    column.width = 20;
  });
      sheet.getColumn(6).width = 25;
    sheet.getColumn(7).width = 25;

    // --- ADD GRAPHICS SHEET ---
    const { generateChart1Svg, generateChart2Svg, svgToPngBase64 } = await import('./chartRenderer');
    const graphSheet = workbook.addWorksheet('Grafik Lengkap');
    graphSheet.columns = [{ width: 5 }, { width: 45 }, { width: 5 }, { width: 45 }];
    
    let currentRow = 2;
    for (const key of ['mgcl2', 'sds', 'detergen']) {
      const sub = substances[key];
      const { rows, regression } = computeAnalysis(sub, cal, mode);
      const concs = rows.map(r => r.concentration);
      const gammas = rows.map(r => r.gamma);
      const excesses = rows.map(r => r.surfaceExcessMicro);
      const maxExcess = Math.max(...excesses, 0);
      
      const chart1Svg = generateChart1Svg(sub, concs, gammas, regression);
      const chart2Svg = generateChart2Svg(sub, concs, excesses, maxExcess);
      
      try {
        const b64_1 = await svgToPngBase64(chart1Svg);
        const b64_2 = await svgToPngBase64(chart2Svg);
        
        const imgId1 = workbook.addImage({ base64: b64_1, extension: 'png' });
        const imgId2 = workbook.addImage({ base64: b64_2, extension: 'png' });
        
        graphSheet.getCell(`B${currentRow}`).value = `Grafik ${sub.name}`;
        graphSheet.getCell(`B${currentRow}`).font = { bold: true, size: 14 };
        
        graphSheet.addImage(imgId1, {
          tl: { col: 1, row: currentRow },
          ext: { width: 450, height: 330 }
        });
        
        graphSheet.addImage(imgId2, {
          tl: { col: 3, row: currentRow },
          ext: { width: 450, height: 330 }
        });
        
        currentRow += 20; 
      } catch (err) {
        console.error('Failed to generate chart image for excel:', err);
      }
    }


  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Laporan_Lengkap_TeganganPermukaan.xlsx`);
};
