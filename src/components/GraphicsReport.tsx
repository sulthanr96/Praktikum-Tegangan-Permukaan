import React from 'react';
import { SubstanceInfo, GlobalCalibration, AnalysisMode } from '../types';
import { computeAnalysis, calculateRhoAir } from '../utils/physics';
import { generateChart1Svg, generateChart2Svg } from '../utils/chartRenderer';

interface GraphicsReportProps {
  substances: Record<string, SubstanceInfo>;
  cal: GlobalCalibration;
  mode: AnalysisMode;
}

export const GraphicsReport: React.FC<GraphicsReportProps> = ({ substances, cal, mode }) => {
  const substanceKeys: ('mgcl2' | 'detergen' | 'sds')[] = ['mgcl2', 'detergen', 'sds'];

  return (
    <div className="bg-white text-black p-8 max-w-[1050px] mx-auto font-sans [print-color-adjust:exact]">
      {/* Header Halaman Cetak */}
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold font-['Space_Grotesk'] uppercase tracking-widest text-slate-900">
          Lampiran Tabel &amp; Grafik
        </h1>
        <p className="text-xs font-mono text-slate-600 mt-1">
          Praktikum Kimia Fisik · Penentuan Tegangan Permukaan &amp; Isoterm Adsorpsi Gibbs · SRS Lab
        </p>
      </div>

      {/* ========================================================================= */}
      {/* BAGIAN I: TABEL-TABEL KALIBRASI & PENGAMATAN                              */}
      {/* ========================================================================= */}
      <div className="mb-10">
        {/* Tabel 1: Kalibrasi Air Baku */}
        <div className="mb-8 break-inside-avoid">
          <h3 className="font-bold uppercase mb-2 font-['Calibri',sans-serif] text-[15px]">KALIBRASI</h3>
          <table className="w-full text-[15px] text-center border-collapse border border-black font-['Calibri',sans-serif]">
            <tbody>
              <tr>
                <td colSpan={2} className="border border-black font-bold p-1" style={{ backgroundColor: '#63C5EA' }}>Parameter Kalibrasi</td>
                <td className="border border-black font-bold p-1" style={{ backgroundColor: '#FFFF00' }}>Suhu (K)</td>
                <td className="border border-black p-1">{cal.tKelvin.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-black font-bold p-1" style={{ backgroundColor: '#63C5EA' }}>V<sub>pikno</sub> (mL)</td>
                <td className="border border-black p-1">{cal.vPikno.toFixed(2)}</td>
                <td className="border border-black font-bold p-1" style={{ backgroundColor: '#63C5EA' }}>m<sub>pikno+air</sub> (g)</td>
                <td className="border border-black p-1">{cal.mAir.toFixed(4)}</td>
              </tr>
              <tr>
                <td className="border border-black font-bold p-1" style={{ backgroundColor: '#63C5EA' }}>m<sub>kosong</sub> (g)</td>
                <td className="border border-black p-1">{cal.mKosong.toFixed(4)}</td>
                <td className="border border-black font-bold p-1" style={{ backgroundColor: '#63C5EA' }}>h<sub>air</sub> (cm)</td>
                <td className="border border-black p-1">{cal.hAir.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabel 2, 3, 4: Data Pengamatan */}
        <div className="mb-8">
          <h3 className="font-bold uppercase mb-2 font-['Calibri',sans-serif] text-[15px]">TABEL PENGAMATAN</h3>
          <div className="flex flex-col gap-6">
            {substanceKeys.map((key) => {
              const sub = substances[key];
              
              let mainColor = '';
              let lightColor = '';
              if (key === 'mgcl2') {
                mainColor = '#5CD65C'; lightColor = '#99E699';
              } else if (key === 'sds') {
                mainColor = '#E6B89C'; lightColor = '#F2D8C9';
              } else {
                mainColor = '#FF99CC'; lightColor = '#FFCCE6';
              }

              return (
                <div key={key} className="break-inside-avoid">
                  <table className="w-full max-w-2xl text-[15px] text-center border-collapse border border-black font-['Calibri',sans-serif]">
                    <tbody>
                      <tr>
                        <td colSpan={3} className="border border-black font-bold p-1" style={{ backgroundColor: mainColor }}>
                          Larutan {sub.name}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-black font-bold p-1 w-1/3" style={{ backgroundColor: lightColor }}>Konsentrasi (M)</td>
                        <td className="border border-black font-bold p-1 w-1/3" style={{ backgroundColor: lightColor }}>m<sub>wadah + larutan</sub> (g)</td>
                        <td className="border border-black font-bold p-1 w-1/3" style={{ backgroundColor: lightColor }}>h (cm)</td>
                      </tr>
                      {sub.concentrations.map((conc, idx) => (
                        <tr key={idx}>
                          <td className="border border-black p-1">{conc.toFixed(2)}</td>
                          <td className="border border-black p-1">{sub.mPikno[idx].toFixed(4)}</td>
                          <td className="border border-black p-1">{sub.hCapillary[idx].toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>

        {/* PENGOLAHAN DATA */}
        <div className="mb-8">
          <h3 className="font-bold uppercase mb-2 font-['Calibri',sans-serif] text-[15px]">PENGOLAHAN DATA</h3>
          
          {/* Kalibrasi Air Baku */}
          <div className="mb-6 break-inside-avoid">
            <table className="w-full max-w-4xl text-[15px] text-center border-collapse border border-black font-['Calibri',sans-serif]">
              <tbody>
                <tr>
                  <td colSpan={6} className="border border-black font-bold p-1" style={{ backgroundColor: '#5B9BD5' }}>
                    Kalibrasi Air
                  </td>
                </tr>
                <tr>
                  <td className="border border-black font-bold p-1" style={{ backgroundColor: '#9CC2E5' }}>m<sub>air</sub> (g)</td>
                  <td className="border border-black p-1">{(cal.mAir - cal.mKosong).toFixed(4)}</td>
                  <td className="border border-black font-bold p-1" style={{ backgroundColor: '#9CC2E5' }}>ρ (g/cm³)</td>
                  <td className="border border-black p-1">{calculateRhoAir(cal).toFixed(4)}</td>
                  <td className="border border-black font-bold p-1" style={{ backgroundColor: '#FFFF00' }}>γ<sub>air</sub> (mN/m)</td>
                  <td className="border border-black p-1">{cal.gammaAir.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-6">
            {substanceKeys.map((key) => {
              const sub = substances[key];
              const { rows } = computeAnalysis(sub, cal, mode);
              
              let mainColor = '';
              let lightColor = '';
              if (key === 'mgcl2') {
                mainColor = '#5CD65C'; lightColor = '#99E699';
              } else if (key === 'sds') {
                mainColor = '#E6B89C'; lightColor = '#F2D8C9';
              } else {
                mainColor = '#FF99CC'; lightColor = '#FFCCE6';
              }

              return (
                <div key={key} className="break-inside-avoid">
                  <table className="w-full text-[15px] text-center border-collapse border border-black font-['Calibri',sans-serif]">
                    <tbody>
                      <tr>
                        <td colSpan={7} className="border border-black font-bold p-1" style={{ backgroundColor: mainColor }}>
                          Larutan {sub.name}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: lightColor }}>
                        <td className="border border-black font-bold p-1">Konsentrasi (M)</td>
                        <td className="border border-black font-bold p-1">m<sub>larutan</sub> (g)</td>
                        <td className="border border-black font-bold p-1">ρ (g/cm³)</td>
                        <td className="border border-black font-bold p-1">h (cm)</td>
                        <td className="border border-black font-bold p-1">γ (mN/m)</td>
                        <td className="border border-black font-bold p-1">dγ/dC (mN·L/m·mol)</td>
                        <td className="border border-black font-bold p-1">Γ (× 10⁻⁶ mol/m²)</td>
                      </tr>
                      {rows.map((r, idx) => {
                        const mLarutan = sub.mPikno[idx] - cal.mKosong;
                        return (
                          <tr key={idx}>
                            <td className="border border-black p-1">{r.concentration.toFixed(2)}</td>
                            <td className="border border-black p-1">{mLarutan.toFixed(4)}</td>
                            <td className="border border-black p-1">{r.rho.toFixed(4)}</td>
                            <td className="border border-black p-1">{r.hCapillary.toFixed(2)}</td>
                            <td className="border border-black p-1">{r.gamma.toFixed(2)}</td>
                            <td className="border border-black p-1">{r.dGammaDC.toFixed(2)}</td>
                            <td className="border border-black p-1">{r.surfaceExcessMicro.toFixed(3)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="my-10 border-t-2 border-slate-300"></div>

      {/* ========================================================================= */}
      {/* BAGIAN II: 6 GRAFIK PRAKTIKUM                                             */}
      {/* ========================================================================= */}
      <div className="mb-12">
        <h3 className="font-bold uppercase mb-4 font-['Calibri',sans-serif] text-[15px]">GRAFIK</h3>
        <div className="flex flex-col gap-10">
          {substanceKeys.map((key, idx) => {
            const sub = substances[key];
            const { rows, regression } = computeAnalysis(sub, cal, mode);
            const concs = rows.map(r => r.concentration);
            const gammas = rows.map(r => r.gamma);
            const excesses = rows.map(r => r.surfaceExcessMicro);
            const maxExcess = Math.max(...excesses, 0);

            const chart1 = generateChart1Svg(sub, concs, gammas, regression);
            const chart2 = generateChart2Svg(sub, concs, excesses, maxExcess);

            return (
              <div key={key} className="break-inside-avoid">
                <h4 className="font-bold mb-2 font-['Calibri',sans-serif] text-[14px]">Grafik Sistem {sub.name}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <div 
                      className="w-full aspect-[450/330] rounded overflow-hidden border border-black"
                      dangerouslySetInnerHTML={{ __html: chart1 }} 
                    />
                  </div>
                  <div className="flex flex-col">
                    <div 
                      className="w-full aspect-[450/330] rounded overflow-hidden border border-black"
                      dangerouslySetInnerHTML={{ __html: chart2 }} 
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-12 text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3 font-mono">
        Lembar Lampiran Resmi · SRS Lab
      </div>
    </div>
  );
};

