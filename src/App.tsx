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
import { StepNavigation } from './components/StepNavigation';
import { Section1Theory } from './components/Section1Theory';
import { Section2Procedure } from './components/Section2Procedure';
import { Section3Worksheet } from './components/Section3Worksheet';
import { Section4Analysis } from './components/Section4Analysis';
import { Section5Export } from './components/Section5Export';
import { CalculationReport } from './components/CalculationReport';
import { GraphicsReport } from './components/GraphicsReport';
import { Footer } from './components/Footer';
import { CloudSavePanel } from './components/CloudSavePanel';
import { LoginScreen } from './components/LoginScreen';
import { AdminPanel } from './components/AdminPanel';

const TOTAL_STEPS = 5;

export default function App() {
  const [calibration, setCalibration] = useState<GlobalCalibration>(INITIAL_CALIBRATION);
  const [currentSubstanceKey, setCurrentSubstanceKey] = useState<SubstanceKey>('mgcl2');
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('alurA');
  const [substances, setSubstances] = useState<Record<string, SubstanceInfo>>(INITIAL_SUBSTANCES);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [printMode, setPrintMode] = useState<'report' | 'graphics'>('report');
  const [auth, setAuth] = useState<{isLoggedIn: boolean, role: string, username: string}>({ isLoggedIn: false, role: '', username: '' });
  const [view, setView] = useState<'kalkulator' | 'admin'>('kalkulator');

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
          mPikno: [0, 0, 0, 0, 0],
          hCapillary: [0, 0, 0, 0, 0],
        },
      };
    });
  };

  const goToStep = (step: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, step));
    setCurrentStep(clamped);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDataIncomplete = () => {
    if (calibration.mKosong === 0 || calibration.mAir === 0 || calibration.hAir === 0) return true;
    for (const key of ['mgcl2', 'detergen', 'sds']) {
      const sub = substances[key];
      if (sub.mPikno.some(v => v === 0) || sub.hCapillary.some(v => v === 0)) return true;
    }
    return false;
  };

  const handleNext = () => {
    if (currentStep === 2 && isDataIncomplete()) {
      alert("⚠️ Mohon lengkapi seluruh data input (Massa Kosong, Massa Air, h Air, serta data tiap larutan) di Bagian 3 sebelum melanjutkan ke Analisis Data!");
      return;
    }
    goToStep(currentStep + 1);
  };
  
  const handlePrev = () => goToStep(currentStep - 1);

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


  if (!auth.isLoggedIn) {
    return <LoginScreen onLoginSuccess={(role, username) => { setAuth({ isLoggedIn: true, role, username }); if (role === 'admin') setView('admin'); }} />;
  }

  return (
    <>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-[#dce9ff] selection:text-[#003159] print:hidden">
        <Header
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onAutofillDemo={handleAutofillDemo}
          temperatureKelvin={calibration.tKelvin}
          role={auth.role}
          view={view}
          onToggleView={() => setView(view === 'admin' ? 'kalkulator' : 'admin')}
        />

        <SubNavRibbon
          currentStep={currentStep}
          onNavigate={goToStep}
        />

                <main className="w-full pt-[calc(14px+56px)] pb-6 bg-[#F8FAFC] flex-1">
          {view === 'admin' ? (
             <AdminPanel />
          ) : (
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
            {currentStep === 0 && <Section1Theory temperatureKelvin={calibration.tKelvin} />}
            {currentStep === 1 && <Section2Procedure />}
            {currentStep === 2 && (
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
            )}
            {currentStep === 3 && (
              <Section4Analysis
                analysisMode={analysisMode}
                calculatedRows={calculatedRows}
                currentSubstance={currentSub}
                maxExcess={maxExcess}
                onAnalysisModeChange={setAnalysisMode}
                regression={regression}
                onSubstanceChange={setCurrentSubstanceKey}
              />
            )}
            {currentStep === 4 && (
              <Section5Export
                calculatedRows={calculatedRows}
                calibration={calibration}
                currentSubstance={currentSub}
                substances={substances}
                analysisMode={analysisMode}
                onPrintReport={() => {
                  setPrintMode('report');
                  setTimeout(() => window.print(), 100);
                }}
                onPrintGraphics={() => {
                  setPrintMode('graphics');
                  setTimeout(() => window.print(), 100);
                }}
              />
            )}
          </div>
          )}
        </main>

        {view === 'kalkulator' && (
          <StepNavigation
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}

        <Footer />
      </div>

      <div className="hidden print:block text-black bg-white">
        {printMode === 'report' ? (
          <CalculationReport substances={substances} cal={calibration} mode={analysisMode} />
        ) : (
          <GraphicsReport substances={substances} cal={calibration} mode={analysisMode} />
        )}
      </div>

      {view === 'kalkulator' && (
        <CloudSavePanel 
          username={auth.username}
          currentData={{
            substances,
            waterCalibration: {
              Wpikno: calibration.Wpikno,
              Wpikno_air: calibration.Wpikno_air
            },
            waterDensity: calibration.rhoAir,
            waterSurfaceTension: calibration.gammaAir,
            ambientTemp: calibration.T,
            pycnometerVolume: calibration.Vpikno
          }}
          onLoadData={(data) => {
            if (data.substances) setSubstances(data.substances);
            if (data.ambientTemp || data.pycnometerVolume) {
              setCalibration(prev => ({
                ...prev,
                Wpikno: data.waterCalibration?.Wpikno || prev.Wpikno,
                Wpikno_air: data.waterCalibration?.Wpikno_air || prev.Wpikno_air,
                rhoAir: data.waterDensity || prev.rhoAir,
                gammaAir: data.waterSurfaceTension || prev.gammaAir,
                T: data.ambientTemp || prev.T,
                Vpikno: data.pycnometerVolume || prev.Vpikno
              }));
            }
          }}
        />
      )}
    </>
  );
}
