import React from 'react';
import { SubstanceInfo, GlobalCalibration, AnalysisMode } from '../types';
import { computeAnalysis } from '../utils/physics';
import { generateChart1Svg, generateChart2Svg } from '../utils/chartRenderer';

interface GraphicsReportProps {
  substances: Record<string, SubstanceInfo>;
  cal: GlobalCalibration;
  mode: AnalysisMode;
}

export const GraphicsReport: React.FC<GraphicsReportProps> = ({ substances, cal, mode }) => {
  const substanceKeys = ['mgcl2', 'sds', 'detergen'];

  return (
    <div className="bg-white text-black p-8 max-w-[1000px] mx-auto font-['Inter']">
      <div className="text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-bold font-['Space_Grotesk'] uppercase tracking-widest">
          Lampiran Grafik Praktikum
        </h1>
        <p className="text-sm font-['JetBrains_Mono'] mt-2">
          Analisis Komparatif & Isoterm Adsorpsi Gibbs
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {substanceKeys.map((key) => {
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
              <h2 className="text-xl font-bold font-['Space_Grotesk'] text-center mb-6 underline decoration-2 underline-offset-4">
                Sistem {sub.name}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className="w-full aspect-[450/330]"
                  dangerouslySetInnerHTML={{ __html: chart1 }} 
                />
                <div 
                  className="w-full aspect-[450/330]"
                  dangerouslySetInnerHTML={{ __html: chart2 }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
