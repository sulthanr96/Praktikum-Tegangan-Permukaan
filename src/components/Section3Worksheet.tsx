import React from 'react';
import { GlobalCalibration, SubstanceInfo, SubstanceKey, CalculatedDataRow } from '../types';
import { NumericInput } from './NumericInput';
import { getStandardWaterGamma } from '../utils/physics';

interface Section3WorksheetProps {
  calibration: GlobalCalibration;
  onCalibrationChange: (field: keyof GlobalCalibration, value: number) => void;
  currentSubstanceKey: SubstanceKey;
  onSubstanceKeyChange: (key: SubstanceKey) => void;
  substances: Record<string, SubstanceInfo>;
  onDataChange: (substanceKey: SubstanceKey, index: number, field: 'mPikno' | 'hCapillary', value: number) => void;
  onAutofillDemo: () => void;
  onResetData: () => void;
  calculatedRows: CalculatedDataRow[];
  rhoAir: number;
  gammaAir: number;
}

export const Section3Worksheet: React.FC<Section3WorksheetProps> = ({
  calibration,
  onCalibrationChange,
  currentSubstanceKey,
  onSubstanceKeyChange,
  substances,
  onDataChange,
  onAutofillDemo,
  onResetData,
  calculatedRows,
  rhoAir,
  gammaAir,
}) => {
  const currentSub = substances[currentSubstanceKey];
  const theoreticalGammaAir = getStandardWaterGamma(calibration.tKelvin);

  return (
    <section className="flex flex-col gap-8 scroll-mt-28" id="lembar-kerja">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#7C3AED] font-['JetBrains_Mono'] text-xs uppercase font-semibold">
            <span className="material-symbols-outlined text-base">edit_note</span>
            Matriks Observasi Eksperimental
          </div>
          <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-[#003159] tracking-tight mt-1">
            3. Lembar Kerja Input Data Pengamatan
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAutofillDemo}
            className="px-4 py-2 rounded-lg bg-[#e5eeff] text-[#003159] font-['JetBrains_Mono'] text-xs font-semibold hover:bg-[#dce9ff] transition-all flex items-center gap-2 shadow-sm border border-[#cbd5e1]/50 active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-base text-[#0D9488]">auto_fix_high</span>
            Isi Data Demo Lab (Realistis)
          </button>
          <button
            onClick={onResetData}
            className="px-3 py-2 rounded-lg bg-[#eff4ff] text-[#42474f] font-['JetBrains_Mono'] text-xs hover:bg-[#e5eeff] transition-all flex items-center gap-1 border border-[#cbd5e1]/40"
            type="button"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            Reset
          </button>
        </div>
      </div>

      {/* Global Calibration Parameters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#cbd5e1]/60">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#003159]">tune</span>
            <h3 className="font-['Space_Grotesk'] font-bold text-lg text-[#003159]">
              Parameter Kalibrasi &amp; Lingkungan Global
            </h3>
          </div>
          <span className="font-['JetBrains_Mono'] text-xs text-[#42474f]">
            γ air dapat diatur manual atau disesuaikan dengan standar suhu
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
          {/* V_pikno */}
          <div className="flex flex-col gap-1">
            <label className="font-['JetBrains_Mono'] text-xs text-[#42474f] font-semibold" htmlFor="cal-vpikno">
              V<sub>pikno</sub> (mL)
            </label>
            <div className="flex items-center bg-[#eff4ff] px-3 py-2 rounded-lg border border-[#cbd5e1]/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0D9488]/40 transition-all">
              <NumericInput
                className="w-full bg-transparent font-['JetBrains_Mono'] text-sm text-[#003159] font-bold focus:outline-none"
                fallbackValue={5.0}
                id="cal-vpikno"
                onChange={(val) => onCalibrationChange('vPikno', val)}
                placeholder="5.0"
                value={calibration.vPikno}
              />
              <span className="font-['JetBrains_Mono'] text-xs text-[#42474f] shrink-0">mL</span>
            </div>
          </div>

          {/* Massa Pikno Kosong */}
          <div className="flex flex-col gap-1">
            <label className="font-['JetBrains_Mono'] text-xs text-[#42474f] font-semibold" htmlFor="cal-mkosong">
              Massa Pikno Kosong (g)
            </label>
            <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-400 focus-within:bg-yellow-100 focus-within:ring-2 focus-within:ring-yellow-500 transition-all">
              <NumericInput
                className="w-full bg-transparent font-['JetBrains_Mono'] text-sm text-[#003159] font-bold focus:outline-none"
                fallbackValue={14.3210}
                id="cal-mkosong"
                onChange={(val) => onCalibrationChange('mKosong', val)}
                placeholder="14.3210"
                value={calibration.mKosong}
              />
              <span className="font-['JetBrains_Mono'] text-xs text-[#42474f] shrink-0">g</span>
            </div>
          </div>

          {/* Massa Pikno + Air */}
          <div className="flex flex-col gap-1">
            <label className="font-['JetBrains_Mono'] text-xs text-[#42474f] font-semibold" htmlFor="cal-mair">
              Massa Pikno + Air (g)
            </label>
            <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-400 focus-within:bg-yellow-100 focus-within:ring-2 focus-within:ring-yellow-500 transition-all">
              <NumericInput
                className="w-full bg-transparent font-['JetBrains_Mono'] text-sm text-[#003159] font-bold focus:outline-none"
                fallbackValue={19.3060}
                id="cal-mair"
                onChange={(val) => onCalibrationChange('mAir', val)}
                placeholder="19.3060"
                value={calibration.mAir}
              />
              <span className="font-['JetBrains_Mono'] text-xs text-[#42474f] shrink-0">g</span>
            </div>
          </div>

          {/* Tinggi Kapiler Air h_air */}
          <div className="flex flex-col gap-1">
            <label className="font-['JetBrains_Mono'] text-xs text-[#42474f] font-semibold" htmlFor="cal-hair">
              Tinggi Kapiler h<sub>air</sub> (cm)
            </label>
            <div className="flex items-center bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-400 focus-within:bg-yellow-100 focus-within:ring-2 focus-within:ring-yellow-500 transition-all">
              <NumericInput
                className="w-full bg-transparent font-['JetBrains_Mono'] text-sm text-[#003159] font-bold focus:outline-none"
                fallbackValue={2.95}
                id="cal-hair"
                onChange={(val) => onCalibrationChange('hAir', val)}
                placeholder="2.95"
                value={calibration.hAir}
              />
              <span className="font-['JetBrains_Mono'] text-xs text-[#42474f] shrink-0">cm</span>
            </div>
          </div>

          {/* Suhu T */}
          <div className="flex flex-col gap-1">
            <label className="font-['JetBrains_Mono'] text-xs text-[#42474f] font-semibold" htmlFor="cal-tkelvin">
              Suhu T (K)
            </label>
            <div className="flex items-center bg-[#eff4ff] px-3 py-2 rounded-lg border border-[#cbd5e1]/40 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0D9488]/40 transition-all">
              <NumericInput
                className="w-full bg-transparent font-['JetBrains_Mono'] text-sm text-[#003159] font-bold focus:outline-none"
                fallbackValue={298.15}
                id="cal-tkelvin"
                onChange={(val) => onCalibrationChange('tKelvin', val)}
                placeholder="298.15"
                value={calibration.tKelvin}
              />
              <span className="font-['JetBrains_Mono'] text-xs text-[#42474f] shrink-0">K</span>
            </div>
          </div>

          {/* Editable Gamma Air Baku (with default value) */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="font-['JetBrains_Mono'] text-xs text-[#003159] font-bold" htmlFor="cal-gamma-air">
                γ<sub>air</sub> Baku (mN/m)
              </label>
              <button
                type="button"
                title={`Kembalikan ke nilai teoritis standar pada ${calibration.tKelvin} K (${theoreticalGammaAir.toFixed(2)} mN/m)`}
                onClick={() => onCalibrationChange('gammaAir', parseFloat(theoreticalGammaAir.toFixed(2)))}
                className="text-[10px] text-[#00687a] hover:underline font-['JetBrains_Mono']"
              >
                Reset Default
              </button>
            </div>
            <div className="flex items-center bg-[#eff4ff] px-3 py-2 rounded-lg border border-[#003159]/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#003159]/40 transition-all">
              <NumericInput
                className="w-full bg-transparent font-['JetBrains_Mono'] text-sm text-[#003159] font-bold focus:outline-none"
                fallbackValue={theoreticalGammaAir}
                id="cal-gamma-air"
                onChange={(val) => onCalibrationChange('gammaAir', val)}
                placeholder={theoreticalGammaAir.toFixed(2)}
                value={calibration.gammaAir}
              />
              <span className="font-['JetBrains_Mono'] text-xs text-[#42474f] shrink-0">mN/m</span>
            </div>
          </div>
        </div>

        {/* Live Reference Footer */}
        <div className="mt-4 pt-3 border-t border-[#cbd5e1]/40 flex flex-wrap items-center justify-between gap-3 text-[#42474f] font-['JetBrains_Mono'] text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span>
              ρ<sub>air</sub> Terhitung:{' '}
              <strong className="text-[#003159] font-bold">{rhoAir.toFixed(4)} g/cm³</strong>
            </span>
            <span>
              γ<sub>air</sub> Aktif:{' '}
              <strong className="text-[#003159] font-bold">{calibration.gammaAir.toFixed(2)} mN/m</strong>
              <span className="text-[#727780] text-[11px] ml-1">
                (standar T: {theoreticalGammaAir.toFixed(2)} mN/m)
              </span>
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-[#eff4ff] text-[#059669] font-bold border border-[#059669]/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669]"></span>
            Status Kalibrasi: Terverifikasi
          </span>
        </div>
      </div>

      {/* Substance Data Tabs & Matrix */}
      <div className="bg-white rounded-xl shadow-sm border border-[#cbd5e1]/60 p-6 flex flex-col gap-4">
        {/* Substance Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cbd5e1]/40 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto -mx-6 px-6 sm:mx-0 sm:px-0">
            <button
              onClick={() => onSubstanceKeyChange('mgcl2')}
              className={`px-4 py-2 rounded-lg font-['JetBrains_Mono'] text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                currentSubstanceKey === 'mgcl2'
                  ? 'bg-[#003159] text-white shadow-sm'
                  : 'bg-[#eff4ff] text-[#42474f] hover:bg-[#dce9ff]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
              <span className="hidden sm:inline">1. Magnesium Klorida (MgCl₂)</span>
              <span className="sm:hidden">MgCl₂</span>
            </button>

            <button
              onClick={() => onSubstanceKeyChange('detergen')}
              className={`px-4 py-2 rounded-lg font-['JetBrains_Mono'] text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                currentSubstanceKey === 'detergen'
                  ? 'bg-[#003159] text-white shadow-sm'
                  : 'bg-[#eff4ff] text-[#42474f] hover:bg-[#dce9ff]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#0D9488]"></span>
              <span className="hidden sm:inline">2. Deterjen Komersial</span>
              <span className="sm:hidden">Deterjen</span>
            </button>

            <button
              onClick={() => onSubstanceKeyChange('sds')}
              className={`px-4 py-2 rounded-lg font-['JetBrains_Mono'] text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                currentSubstanceKey === 'sds'
                  ? 'bg-[#003159] text-white shadow-sm'
                  : 'bg-[#eff4ff] text-[#42474f] hover:bg-[#dce9ff]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#7C3AED]"></span>
              <span className="hidden sm:inline">3. Natrium Dodesil Sulfat (SDS)</span>
              <span className="sm:hidden">SDS</span>
            </button>
          </div>

          <div className="font-['JetBrains_Mono'] text-xs text-[#42474f] flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-[#0D9488]">save_alt</span>
            <span>Data tersimpan otomatis di memori browser</span>
          </div>
        </div>

        {/* Selected Substance Description Banner */}
        <div className="bg-[#eff4ff] p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-[#0b1c30] border border-[#cbd5e1]/40 gap-3">
          <div className="flex items-start gap-2">
            <span
              className={`material-symbols-outlined text-lg ${
                currentSubstanceKey === 'mgcl2'
                  ? 'text-[#D97706]'
                  : currentSubstanceKey === 'sds'
                  ? 'text-[#7C3AED]'
                  : 'text-[#0D9488]'
              }`}
            >
              {currentSub.icon}
            </span>
            <span className="leading-relaxed">
              <strong>{currentSub.name}:</strong> <span className="hidden sm:inline">{currentSub.description}</span><span className="sm:hidden">{currentSub.description.substring(0, 70)}...</span>
            </span>
          </div>
          <span className="font-['JetBrains_Mono'] text-xs px-2.5 py-0.5 rounded bg-white text-[#003159] font-bold border border-[#cbd5e1]/40 shrink-0 self-start sm:self-auto">
            5 Titik Konsentrasi
          </span>
        </div>

        {/* Tabular Matrix: Removed "Koreksi Suhu" Column per user instruction */}
        <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0 pb-4 sm:pb-0">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-[#eff4ff] font-['JetBrains_Mono'] text-xs font-semibold text-[#003159] border-b border-[#cbd5e1]/40">
                <th className="py-3 px-4 whitespace-nowrap">Konsentrasi (M)</th>
                <th className="py-3 px-4 whitespace-nowrap">Massa Pikno + Larutan (g)</th>
                <th className="py-3 px-4 whitespace-nowrap">Tinggi Kapiler h (cm)</th>
              </tr>
            </thead>
            <tbody className="font-['JetBrains_Mono'] text-sm divide-y divide-[#cbd5e1]/30">
              {calculatedRows.map((row, idx) => (
                <tr key={`${currentSubstanceKey}-${row.concentration}`} className="hover:bg-[#eff4ff]/60 transition-colors border-b border-[#cbd5e1]/40">
                  <td className="py-3 px-4 font-bold text-[#003159]">{row.concentration.toFixed(2)} M</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center bg-yellow-50 px-2.5 py-2 rounded-md border border-yellow-400 focus-within:bg-yellow-100 focus-within:ring-1 focus-within:ring-yellow-500 transition-all min-w-[120px] max-w-[150px]">
                      <NumericInput
                        className="w-full bg-transparent font-['JetBrains_Mono'] text-xs sm:text-sm text-[#003159] font-semibold focus:outline-none"
                        fallbackValue={0}
                        onChange={(val) =>
                          onDataChange(currentSubstanceKey, idx, 'mPikno', val)
                        }
                        placeholder="0.0000"
                        value={row.mPikno}
                      />
                      <span className="font-['JetBrains_Mono'] text-[11px] text-[#42474f] shrink-0 ml-1">g</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center bg-yellow-50 px-2.5 py-2 rounded-md border border-yellow-400 focus-within:bg-yellow-100 focus-within:ring-1 focus-within:ring-yellow-500 transition-all min-w-[120px] max-w-[130px]">
                      <NumericInput
                        className="w-full bg-transparent font-['JetBrains_Mono'] text-xs sm:text-sm text-[#003159] font-semibold focus:outline-none"
                        fallbackValue={0}
                        onChange={(val) =>
                          onDataChange(currentSubstanceKey, idx, 'hCapillary', val)
                        }
                        placeholder="0.00"
                        value={row.hCapillary}
                      />
                      <span className="font-['JetBrains_Mono'] text-[11px] text-[#42474f] shrink-0 ml-1">cm</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-[11px] font-['JetBrains_Mono'] text-[#727780] pt-2 border-t border-[#cbd5e1]/30">
          <span>
            * Nilai densitas dihitung otomatis dari (Massa Pikno + Larutan - Massa Pikno Kosong) / V<sub>pikno</sub>.
          </span>
          <span className="text-[#003159] font-medium">
            Perhitungan tegangan permukaan γ dan isoterm adsorpsi Gibbs ditampilkan lengkap pada Bagian 4.
          </span>
        </div>
      </div>
    </section>
  );
};
