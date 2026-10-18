import React from 'react';
import { PatientProfile, WearableLog } from '../types';
import {
  FileText,
  Activity,
  Heart,
  Moon,
  Footprints,
  Pill,
  ShieldCheck,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  User,
  Zap,
  Flame,
  Radio
} from 'lucide-react';

interface T2DMParameterStreamCardsProps {
  profile: PatientProfile;
  latestLog?: WearableLog | null;
}

export const T2DMParameterStreamCards: React.FC<T2DMParameterStreamCardsProps> = ({
  profile,
  latestLog
}) => {
  const labs = profile.baselineLabs || {
    hba1c: 8.4,
    fastingGlucose: 146,
    homaIr: 4.8,
    fastingInsulin: 18.5,
    egfr: 68,
    ldl: 138,
    hdl: 44,
    triglycerides: 198,
    systolicBp: 138,
    diastolicBp: 88,
    creatinine: 1.1
  };

  const anthropometrics = profile.anthropometrics || {
    waistToHipRatio: 0.88,
    familyHistory: 'Maternal Type 2 Diabetes diagnosed age 48, Maternal Coronary Artery Disease',
    weightKg: 78.2,
    heightCm: 163
  };

  const wearableStats = profile.wearableStats || {
    tirPercent: 74.2,
    cvPercent: 34.6,
    activeCalories: 420,
    sleepHours: 7.23, // 7h 14m
    deepSleepHours: 1.3,
    remSleepHours: 1.6,
    carbIntakeToday: 165
  };

  const currentGlucose = latestLog?.glucose || profile.currentGlucose || 135;
  const currentHeartRate = latestLog?.heart_rate || profile.currentHeartRate || 72;
  const currentHrv = latestLog?.hrv || 45;
  const currentSpo2 = latestLog?.spo2 || 98;
  const currentSteps = latestLog?.steps || 8420;

  // TIR breakdown calculations
  const tir = wearableStats.tirPercent || 74.2;
  const tar = 21.8; // Time above range > 180
  const tbr = 4.0;  // Time below range < 70

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#134074]">
            Comprehensive T2DM Multi-Stream Telemetry
          </span>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#0b2545] mt-0.5">
            Static EHR Baseline Diagnostics vs Dynamic Wearable Streams
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#13315c] bg-white/80 px-3 py-1.5 rounded-xl border border-[#8da9c4]/30 w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>Synthea FHIR & BLE Fusion Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
        {/* CARD 1: Static EHR Baseline Card */}
        <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-4 sm:p-6 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#8da9c4]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0b2545] border border-[#134074] flex items-center justify-center text-[#8da9c4] shadow-sm shrink-0">
                  <FileText className="w-5 h-5 text-[#8da9c4]" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#0b2545]">Static EHR Baseline Profile</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#eef4ed] text-[#134074] rounded font-bold border border-[#8da9c4]/40">
                      LOINC & SNOMED
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Baseline clinical parameters & verified laboratory diagnostics
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-[#13315c] bg-white px-2.5 py-1 rounded-lg border border-[#8da9c4]/30 shrink-0">
                #{profile.synthea_id}
              </span>
            </div>

            {/* Section 1: Demographics & Anthropometrics */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#134074] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#134074]" />
                <span>Demographics & Anthropometrics</span>
              </div>
              <div className="grid grid-cols-1 min-[440px]:grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-[#eef4ed]/70 border border-[#8da9c4]/30 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Age & Gender</div>
                  <div className="text-sm font-extrabold font-mono text-[#0b2545] mt-0.5">
                    {profile.age} yrs <span className="text-xs font-sans font-normal text-slate-600">· {profile.gender}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">DOB: {profile.dob}</div>
                </div>

                <div className="p-3 bg-[#eef4ed]/70 border border-[#8da9c4]/30 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-500">BMI & Weight</div>
                  <div className="text-sm font-extrabold font-mono text-[#0b2545] mt-0.5">
                    {profile.bmi} <span className="text-xs font-sans font-normal text-slate-500">kg/m²</span>
                  </div>
                  <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Overweight Class 1</div>
                </div>

                <div className="p-3 bg-[#eef4ed]/70 border border-[#8da9c4]/30 rounded-xl col-span-1 min-[440px]:col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Waist-to-Hip Ratio</div>
                  <div className="text-sm font-extrabold font-mono text-[#0b2545] mt-0.5">
                    {anthropometrics.waistToHipRatio}
                  </div>
                  <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Elevated Visceral Risk</div>
                </div>
              </div>

              {/* Family History */}
              <div className="p-2.5 bg-white border border-[#8da9c4]/30 rounded-xl text-xs text-slate-700">
                <span className="font-bold text-[#0b2545]">Family History: </span>
                <span className="text-slate-600">{anthropometrics.familyHistory}</span>
              </div>
            </div>

            {/* Section 2: Clinical Lab Markers */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#134074] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#134074]" />
                <span>Clinical Laboratory Markers (LOINC Standards)</span>
              </div>
              <div className="grid grid-cols-1 min-[440px]:grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Baseline HbA1c</div>
                  <div className="text-lg font-extrabold font-mono text-[#0b2545] mt-0.5">
                    {labs.hba1c}%
                  </div>
                  <div className="text-[10px] font-bold text-rose-600 mt-0.5">Target &lt; 7.0% (Above Goal)</div>
                </div>

                <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Fasting Glucose</div>
                  <div className="text-lg font-extrabold font-mono text-[#0b2545] mt-0.5">
                    {labs.fastingGlucose} <span className="text-xs font-normal text-slate-400">mg/dL</span>
                  </div>
                  <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Target: 80 - 130 mg/dL</div>
                </div>

                <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">HOMA-IR Index</div>
                  <div className="text-lg font-extrabold font-mono text-[#0b2545] mt-0.5">
                    {labs.homaIr || 4.8}
                  </div>
                  <div className="text-[10px] text-rose-600 font-bold mt-0.5">Marked Resistance (&gt;2.0)</div>
                </div>

                <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Renal eGFR</div>
                  <div className="text-lg font-extrabold font-mono text-[#0b2545] mt-0.5">
                    {labs.egfr} <span className="text-xs font-normal text-slate-400">mL/min</span>
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">Stage 2 CKD (Mild)</div>
                </div>

                <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Serum Triglycerides</div>
                  <div className="text-lg font-extrabold font-mono text-[#0b2545] mt-0.5">
                    {labs.triglycerides} <span className="text-xs font-normal text-slate-400">mg/dL</span>
                  </div>
                  <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Target &lt; 150 mg/dL</div>
                </div>

                <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">LDL Cholesterol</div>
                  <div className="text-lg font-extrabold font-mono text-[#0b2545] mt-0.5">
                    {labs.ldl} <span className="text-xs font-normal text-slate-400">mg/dL</span>
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">Target &lt; 100 mg/dL</div>
                </div>
              </div>
            </div>

            {/* Section 3: Active Medication Protocol */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#134074] flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-[#134074]" />
                <span>Active Medication Protocol & Adherence Status</span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 bg-white border border-[#8da9c4]/30 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#0b2545]">Metformin HCl 850 mg Tablet</div>
                    <div className="text-[11px] text-slate-500">Oral BID with morning & evening meals</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded font-mono text-[10px] font-bold">
                      94% Adherence
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-white border border-[#8da9c4]/30 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#0b2545]">Lisinopril 10 mg Tablet</div>
                    <div className="text-[11px] text-slate-500">Oral Daily in morning (ACE inhibitor)</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded font-mono text-[10px] font-bold">
                      98% Adherence
                    </span>
                  </div>
                </div>

                <div className="p-2.5 bg-white border border-[#8da9c4]/30 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#0b2545]">Atorvastatin 20 mg Tablet</div>
                    <div className="text-[11px] text-slate-500">Oral Nightly (HMG-CoA reductase inhibitor)</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded font-mono text-[10px] font-bold">
                      91% Adherence
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#8da9c4]/20 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Synthea Clinical Registry</span>
            <span className="font-mono text-[#134074] font-semibold">ICD-10: E11.9, I10, E78.5</span>
          </div>
        </div>

        {/* CARD 2: Dynamic Wearable & Behavioral Streams Card */}
        <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#8da9c4]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#134074] border border-[#8da9c4]/40 flex items-center justify-center text-[#8da9c4] shadow-sm">
                  <Radio className="w-5 h-5 text-[#8da9c4]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#0b2545]">Dynamic Wearable & Behavioral Streams</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-xs text-slate-500">
                    High-frequency CGM, PPG hemodynamics, sleep architecture & activity
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 font-bold">
                Live Sensor Feed
              </span>
            </div>

            {/* Section 1: CGM & Glycemic Distribution */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-[#134074] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#134074]" />
                  <span>Continuous Glucose Monitoring (CGM) Telemetry</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#0b2545]">
                  Live: {currentGlucose} mg/dL
                </span>
              </div>

              {/* Glycemic Distribution Multi-Segment Bar */}
              <div className="p-3.5 bg-white border border-[#8da9c4]/30 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0b2545]">Time in Range Profile</span>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">
                    TIR Goal: &gt; 70% in Range
                  </span>
                </div>

                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${tbr}%` }}
                    className="bg-amber-400 h-full transition-all"
                    title={`Time Below Range (<70 mg/dL): ${tbr}%`}
                  />
                  <div
                    style={{ width: `${tir}%` }}
                    className="bg-[#134074] h-full transition-all"
                    title={`Time in Range (70-180 mg/dL): ${tir}%`}
                  />
                  <div
                    style={{ width: `${tar}%` }}
                    className="bg-rose-400 h-full transition-all"
                    title={`Time Above Range (>180 mg/dL): ${tar}%`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1 text-[11px]">
                  <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-200/60">
                    <div className="text-[10px] text-amber-800 font-semibold">TBR (&lt;70)</div>
                    <div className="font-mono font-bold text-amber-900">{tbr}%</div>
                    <div className="text-[9px] text-amber-700">&lt; 4% Goal</div>
                  </div>
                  <div className="p-1.5 bg-[#eef4ed] rounded-lg border border-[#8da9c4]/40">
                    <div className="text-[10px] text-[#134074] font-semibold">TIR (70-180)</div>
                    <div className="font-mono font-bold text-[#0b2545]">{tir}%</div>
                    <div className="text-[9px] text-emerald-700">&gt; 70% Goal</div>
                  </div>
                  <div className="p-1.5 bg-rose-50 rounded-lg border border-rose-200/60">
                    <div className="text-[10px] text-rose-800 font-semibold">TAR (&gt;180)</div>
                    <div className="font-mono font-bold text-rose-900">{tar}%</div>
                    <div className="text-[9px] text-rose-700">&lt; 25% Goal</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Autonomic & Cardiovascular Tone */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#134074] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#134074]" />
                <span>Autonomic & Hemodynamic Tone</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Resting HR</div>
                  <div className="text-lg font-extrabold font-mono text-[#0b2545] mt-0.5">
                    {currentHeartRate} <span className="text-xs font-normal text-slate-400">bpm</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">PPG Sensor Stream</div>
                </div>

                <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">HRV (rMSSD)</div>
                  <div className="text-lg font-extrabold font-mono text-[#0b2545] mt-0.5">
                    {currentHrv} <span className="text-xs font-normal text-slate-400">ms</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Nominal Vagal Tone</div>
                </div>

                <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl shadow-2xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Pulse Oximetry</div>
                  <div className="text-lg font-extrabold font-mono text-[#0b2545] mt-0.5">
                    {currentSpo2}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Optimal Perfusion</div>
                </div>
              </div>
            </div>

            {/* Section 3: Sleep Architecture & Physical Activity */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#134074] flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-[#134074]" />
                <span>Sleep Architecture & Activity Telemetry</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 bg-[#eef4ed]/70 border border-[#8da9c4]/30 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0b2545]">Sleep Stages (7h 14m)</span>
                    <span className="text-[10px] font-mono text-[#134074] font-bold">88% Efficiency</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Deep Sleep: <strong>1h 18m (18%)</strong> · REM: <strong>1h 36m (22%)</strong>
                  </div>
                  <div className="text-[10px] text-slate-500">Restorative slow-wave architecture</div>
                </div>

                <div className="p-3 bg-[#eef4ed]/70 border border-[#8da9c4]/30 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0b2545]">Active Ambulation</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">105% of Goal</span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    Steps: <strong>{currentSteps.toLocaleString()} / 8,000</strong> · Energy: <strong>{wearableStats.activeCalories} kcal</strong>
                  </div>
                  <div className="text-[10px] text-[#134074] font-semibold">Carbs logged today: {wearableStats.carbIntakeToday}g</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#8da9c4]/20 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>BLE Sensor Integration</span>
            <span className="font-mono text-emerald-700 font-semibold">5-Minute Discrete Ingestion</span>
          </div>
        </div>
      </div>
    </div>
  );
};
