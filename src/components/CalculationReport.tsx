import React from 'react';
import { GlobalCalibration, SubstanceInfo, AnalysisMode } from '../types';
import { calculateRhoAir, computeAnalysis } from '../utils/physics';

interface CalculationReportProps {
  substances: Record<string, SubstanceInfo>;
  cal: GlobalCalibration;
  mode: AnalysisMode;
}

const Fraction = ({ num, den }: { num: React.ReactNode; den: React.ReactNode }) => (
  <span className="inline-flex flex-col items-center justify-center align-middle mx-1">
    <span className="px-1 leading-tight">{num}</span>
    <span className="w-full border-t border-black"></span>
    <span className="px-1 leading-tight">{den}</span>
  </span>
);

export const CalculationReport: React.FC<CalculationReportProps> = ({ substances, cal, mode }) => {
  const mAir = cal.mAir - cal.mKosong;
  const rhoAir = calculateRhoAir(cal);
  const gammaAir = cal.gammaAir;

  const renderSubstance = (sub: SubstanceInfo, index: number) => {
    const { rows } = computeAnalysis(sub, cal, mode);
    
    return (
      <div key={sub.id} className="mb-8 break-inside-avoid">
        <h3 className="text-lg font-bold border-b border-gray-400 mb-4 pb-1">
          {index + 1}. {sub.name}
        </h3>
        
        <div className="ml-4 space-y-6">
          {/* Densitas */}
          <div>
            <h4 className="font-bold text-md mb-2">a. Perhitungan Densitas (ρ)</h4>
            <div className="bg-gray-50 border border-gray-300 p-3 rounded mb-3 font-['JetBrains_Mono'] text-sm inline-block print:border-gray-400">
              <span className="font-bold text-gray-700">Rumus:</span> ρ = <Fraction num={<>m<sub>larutan</sub></>} den={<>V<sub>pikno</sub></>} /> 
              = <Fraction num={<>m<sub>wadah+larutan</sub> - m<sub>kosong</sub></>} den={<>V<sub>pikno</sub></>} />
            </div>
            <ul className="list-disc ml-6 text-sm space-y-4 font-['JetBrains_Mono']">
              {rows.map((r, i) => {
                const mWadahLarutan = sub.mPikno[i];
                return (
                  <li key={i} className="leading-loose">
                    Konsentrasi <strong>{r.concentration.toFixed(2)} M</strong>: 
                    <span className="mx-2">
                      ρ = <Fraction num={`${mWadahLarutan.toFixed(4)} g - ${cal.mKosong.toFixed(4)} g`} den={`${cal.vPikno.toFixed(2)} mL`} /> 
                      = <strong>{r.rho.toFixed(4)} g/cm³</strong>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Tegangan Permukaan */}
          <div>
            <h4 className="font-bold text-md mb-2">b. Perhitungan Tegangan Permukaan (γ)</h4>
            <div className="bg-gray-50 border border-gray-300 p-3 rounded mb-3 font-['JetBrains_Mono'] text-sm inline-block print:border-gray-400">
              <span className="font-bold text-gray-700">Rumus:</span> γ = 
              <Fraction num={<>ρ × h</>} den={<>ρ<sub>air</sub> × h<sub>air</sub></>} /> 
              × γ<sub>air</sub>
            </div>
            <ul className="list-disc ml-6 text-sm space-y-4 font-['JetBrains_Mono']">
              {rows.map((r, i) => {
                return (
                  <li key={i} className="leading-loose">
                    Konsentrasi <strong>{r.concentration.toFixed(2)} M</strong>: 
                    <span className="mx-2">
                      γ = <Fraction num={`${r.rho.toFixed(4)} g/cm³ × ${r.hCapillary.toFixed(2)} cm`} den={`${rhoAir.toFixed(4)} g/cm³ × ${cal.hAir.toFixed(2)} cm`} /> 
                      × {gammaAir.toFixed(2)} mN/m = <strong>{r.gamma.toFixed(2)} mN/m</strong>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* dGamma/dC */}
          <div>
            <h4 className="font-bold text-md mb-2">c. Penentuan Gradien (dγ/dC)</h4>
            <p className="text-sm text-gray-700 mb-2">
              <em>Catatan:</em> Nilai dγ/dC umumnya diperoleh secara grafis dengan menarik garis singgung pada kurva γ terhadap C. Berikut adalah hasil komputasi sistem:
            </p>
            <ul className="list-disc ml-6 text-sm space-y-1 font-['JetBrains_Mono']">
              {rows.map((r, i) => (
                <li key={i}>
                  Konsentrasi <strong>{r.concentration.toFixed(2)} M</strong>: 
                  dγ/dC = <strong>{r.dGammaDC.toFixed(2)}</strong> (mN·L / m·mol)
                </li>
              ))}
            </ul>
          </div>

          {/* Surface Excess */}
          <div>
            <h4 className="font-bold text-md mb-2">d. Perhitungan Surface Excess (Γ)</h4>
            <div className="bg-gray-50 border border-gray-300 p-3 rounded mb-3 font-['JetBrains_Mono'] text-sm inline-block print:border-gray-400">
              <span className="font-bold text-gray-700">Rumus:</span> Γ = - 
              <Fraction num="C" den="R × T" /> × <Fraction num="dγ" den="dC" /> × 10⁻⁶
              <br/><span className="text-gray-500 mt-2 block text-xs">Dengan R = 8.314 J/(mol·K) dan T = {cal.tKelvin} K</span>
            </div>
            <ul className="list-disc ml-6 text-sm space-y-4 font-['JetBrains_Mono']">
              {rows.map((r, i) => {
                return (
                  <li key={i} className="leading-loose">
                    Konsentrasi <strong>{r.concentration.toFixed(2)} M</strong>: 
                    <span className="mx-2">
                      Γ = - <Fraction num={`${r.concentration.toFixed(2)} M`} den={`8.314 J/(mol·K) × ${cal.tKelvin} K`} /> 
                      × ({r.dGammaDC.toFixed(2)} mN·L/m·mol) × 10⁻⁶ = 
                      <strong> {r.surfaceExcessMicro.toFixed(3)} × 10⁻⁶ mol/m²</strong>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans text-black max-w-4xl mx-auto bg-white p-8 [print-color-adjust:exact]">
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wide">Lampiran Pengolahan Data</h1>
        <h2 className="text-lg">Praktikum Tegangan Permukaan Cairan</h2>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold border-b border-gray-400 mb-4 pb-1">1. Air (Pelarut)</h3>
        <div className="ml-4 space-y-6">
          <div>
            <h4 className="font-bold text-md mb-2">a. Perhitungan Massa Air (m<sub>air</sub>)</h4>
            <div className="bg-gray-50 border border-gray-300 p-3 rounded mb-2 font-['JetBrains_Mono'] text-sm inline-block print:border-gray-400">
              <span className="font-bold text-gray-700">Rumus:</span> m<sub>air</sub> = m<sub>pikno+air</sub> - m<sub>kosong</sub>
            </div>
            <p className="text-sm font-['JetBrains_Mono'] ml-2">
              m<sub>air</sub> = {cal.mAir.toFixed(4)} g - {cal.mKosong.toFixed(4)} g = <strong>{mAir.toFixed(4)} g</strong>
            </p>
          </div>
          <div>
            <h4 className="font-bold text-md mb-2">b. Perhitungan Densitas Air (ρ<sub>air</sub>)</h4>
            <div className="bg-gray-50 border border-gray-300 p-3 rounded mb-2 font-['JetBrains_Mono'] text-sm inline-block print:border-gray-400">
              <span className="font-bold text-gray-700">Rumus:</span> ρ<sub>air</sub> = <Fraction num={<>m<sub>air</sub></>} den={<>V<sub>pikno</sub></>} />
            </div>
            <p className="text-sm font-['JetBrains_Mono'] ml-2 mt-2 leading-loose">
              ρ<sub>air</sub> = <Fraction num={`${mAir.toFixed(4)} g`} den={`${cal.vPikno.toFixed(2)} mL`} /> = <strong>{rhoAir.toFixed(4)} g/cm³</strong>
            </p>
          </div>
          <div>
            <h4 className="font-bold text-md mb-2">c. Tegangan Permukaan Air Baku (γ<sub>air</sub>)</h4>
            <div className="bg-gray-50 border border-gray-300 p-3 rounded font-['JetBrains_Mono'] text-sm inline-block print:border-gray-400">
              Suhu Ruang: {cal.tKelvin} K<br/>
              γ<sub>air</sub> = <strong>{gammaAir.toFixed(2)} mN/m</strong>
            </div>
          </div>
        </div>
      </div>

      {renderSubstance(substances.mgcl2, 1)}
      {renderSubstance(substances.detergen, 2)}
      {renderSubstance(substances.sds, 3)}
      
      <div className="mt-12 text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
        Laporan Hasil Komputasi Praktikum Kimia Fisika
      </div>
    </div>
  );
};
