import React, { useState } from 'react';
import { GlobalCalibration, SubstanceKey, AnalysisMode, SubstanceInfo } from './types';
import {
  INITIAL_CALIBRATION,
  INITIAL_SUBSTANCES,
  calculateRhoAir,
  getStandardWaterGamma,
  computeAnalysis,
} from './utils/physics';
import { Header } from './components/Header';
import { SubNavRibbon } from './components/SubNavRibbon';
import { Section1Theory } from './components/Section1Theory';
import { Section2Procedure } from './components/Section2Procedure';
import { Section3Worksheet } from './components/Section3Worksheet';
import { Section4Analysis } from './components/Section4Analysis';
import { Section5Export } from './components/Section5Export';
import { Footer } from './components/Footer';

export default function App() {
  const [calibration, setCalibration] = useState<GlobalCalibration>(INITIAL_CALIBRATION);
  const [currentSubstanceKey, setCurrentSubstanceKey] = useState<SubstanceKey>('mgcl2');
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('alurA');
  const [substances, setSubstances] = useState<Record<string, SubstanceInfo>>(INITIAL_SUBSTANCES);
  const [activeSection, setActiveSection] = useState<string>('pendahuluan');

  const handleCalibrationChange = (field: keyof GlobalCalibration, value: number) => {
    setCalibration((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDataChange = (
    subKey: SubstanceKey,
    index: number,
    field: 'mPikno' | 'hCapillary',
    value: number
  ) => {
    setSubstances((prev) => {
      const sub = prev[subKey];
      const updatedField = [...sub[field]];
      updatedField[index] = value;
      return {
        ...prev,
        [subKey]: {
          ...sub,
          [field]: updatedField,
        },
      };
    });
  };

  const handleAutofillDemo = () => {
    setCalibration({ ...INITIAL_CALIBRATION });
    setSubstances({
      mgcl2: {
        ...INITIAL_SUBSTANCES.mgcl2,
        mPikno: [19.3190, 19.3325, 19.3458, 19.3592, 19.3730],
        hCapillary: [2.95, 2.96, 2.97, 2.98, 2.99],
      },
      detergen: {
        ...INITIAL_SUBSTANCES.detergen,
        mPikno: [19.3080, 19.3105, 19.3130, 19.3155, 19.3180],
        hCapillary: [2.15, 1.82, 1.58, 1.45, 1.38],
      },
      sds: {
        ...INITIAL_SUBSTANCES.sds,
        mPikno: [19.3090, 19.3120, 19.3145, 19.3175, 19.3200],
        hCapillary: [1.98, 1.62, 1.35, 1.22, 1.15],
      },
    });
  };

  const handleResetData = () => {
    setSubstances((prev) => {
      const sub = prev[currentSubstanceKey];
      return {
        ...prev,
        [currentSubstanceKey]: {
          ...sub,
          mPikno: [19.30, 19.30, 19.30, 19.30, 19.30],
          hCapillary: [2.5, 2.5, 2.5, 2.5, 2.5],
        },
      };
    });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Real-time computations
  const rhoAir = calculateRhoAir(calibration);
  const gammaAir = (calibration.gammaAir !== undefined && calibration.gammaAir > 0)
    ? calibration.gammaAir
    : getStandardWaterGamma(calibration.tKelvin);
  const currentSub = substances[currentSubstanceKey];
  const { rows: calculatedRows, regression, maxExcess } = computeAnalysis(
    currentSub,
    calibration,
    analysisMode
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-[#dce9ff] selection:text-[#003159]">
      <Header
        activeSection={activeSection}
        onAutofillDemo={handleAutofillDemo}
        onNavigate={scrollToSection}
        temperatureKelvin={calibration.tKelvin}
      />

      <main className="w-full pt-20 bg-[#F8FAFC]">
        <SubNavRibbon activeSection={activeSection} onNavigate={scrollToSection} />

        <div className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col gap-16">
          <Section1Theory temperatureKelvin={calibration.tKelvin} />

          <Section2Procedure />

          <Section3Worksheet
            calculatedRows={calculatedRows}
            calibration={calibration}
            currentSubstanceKey={currentSubstanceKey}
            gammaAir={gammaAir}
            onAutofillDemo={handleAutofillDemo}
            onCalibrationChange={handleCalibrationChange}
            onDataChange={handleDataChange}
            onResetData={handleResetData}
            onSubstanceKeyChange={setCurrentSubstanceKey}
            rhoAir={rhoAir}
            substances={substances}
          />

          <Section4Analysis
            analysisMode={analysisMode}
            calculatedRows={calculatedRows}
            currentSubstance={currentSub}
            maxExcess={maxExcess}
            onAnalysisModeChange={setAnalysisMode}
            regression={regression}
          />

          <Section5Export
            calculatedRows={calculatedRows}
            calibration={calibration}
            currentSubstance={currentSub}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
