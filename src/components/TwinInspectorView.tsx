import React, { useState } from 'react';
import { PatientProfile } from '../types';
import { RiskBadge } from './RiskBadge';
import { DigitalTwinVisual } from './DigitalTwinVisual';
import { FhirExportModal } from './FhirExportModal';
import {
  User,
  ShieldCheck,
  Activity,
  Heart,
  Droplet,
  FileCode,
  Stethoscope,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  TrendingUp,
  Scale,
  Ruler,
  Dna,
  Pill,
  Calendar,
  Zap,
  ArrowRight
} from 'lucide-react';

interface TwinInspectorViewProps {
  patient: PatientProfile;
  cohort: PatientProfile[];
  onSelectPatient: (patientId: string) => void;
  onAdjustProtocol: (patient: PatientProfile) => void;
  onRunClinicalSimulation: (patientId: string) => void;
}

export const TwinInspectorView: React.FC<TwinInspectorViewProps> = ({
  patient,
  cohort,
  onSelectPatient,
  onAdjustProtocol,
  onRunClinicalSimulation
}) => {
  const [isFhirModalOpen, setIsFhirModalOpen] = useState(false);

  // ABHA ID resolution
  const abhaId = patient.abha_id || (
    patient.id.includes('ananya')
      ? '91-4921-8302-1194'
      : patient.id.includes('rajesh')
      ? '91-5192-3401-8821'
      : patient.id.includes('siddharth')
      ? '91-8832-7719-4450'
      : patient.id.includes('priya')
      ? '91-7401-2290-6632'
      : '91-6284-9012-3341'
  );

  const syntheaFormatted = patient.synthea_id.endsWith('-T2D')
    ? patient.synthea_id
    : `${patient.synthea_id}-T2D`;

  const labs = patient.baselineLabs || {
    hba1c: 7.8,
    fastingGlucose: 142,
    homaIr: 3.4,
    fastingInsulin: 16.5,
    systolicBp: 132,
    diastolicBp: 84,
    egfr: 76,
    ldl: 128,
    hdl: 46,
    triglycerides: 182,
    creatinine: 0.98
  };

  const anthropometrics = patient.anthropometrics || {
    waistToHipRatio: 0.86,
    familyHistory: 'Maternal Type 2 Diabetes diagnosed age 48, Maternal Coronary Artery Disease',
    weightKg: 68.5,
    heightCm: 157
  };

  const wearableStats = patient.wearableStats || {
    tirPercent: 71.2,
    cvPercent: 33.4,
    activeCalories: 430,
    sleepHours: 7.0,
    deepSleepHours: 1.3,
    remSleepHours: 1.5,
    carbIntakeToday: 145
  };

  const currentGlucose = patient.currentGlucose || labs.fastingGlucose || 148;
  const currentHeartRate = patient.currentHeartRate || 74;

  // Lab calculations & derived values
  const totalCholesterol = labs.totalCholesterol || Math.round(labs.ldl + labs.hdl + labs.triglycerides / 5);
  const altValue = labs.alt || (patient.id.includes('rajesh') ? 48 : (patient.id.includes('siddharth') ? 38 : 34));
  const astValue = labs.ast || (patient.id.includes('rajesh') ? 38 : (patient.id.includes('siddharth') ? 31 : 28));
  const uacrValue = labs.uacr || (patient.id.includes('rajesh') ? 85 : 38);
  const adherenceScore = patient.adherencePercent || 94;

  return (
    <div className="space-y-6">
      {/* Patient Selector Ribbon & Quick Actions */}
      <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#134074] border border-[#8da9c4]/30 flex items-center justify-center text-white shadow-inner">
            <User className="w-5 h-5 text-[#8da9c4]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#134074]">
                Digital Twin In-Silico Inspector
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono text-[#0b2545] font-semibold">Active Physiological Session</span>
            </div>
            <h3 className="text-lg font-extrabold text-[#0b2545] tracking-tight">
              Comprehensive Multi-Organ Telemetry & Diagnostic EHR
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="text-xs font-bold text-slate-600 whitespace-nowrap">Focus Patient:</label>
          <select
            value={patient.id}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="px-3.5 py-2 bg-white border border-[#8da9c4]/50 rounded-xl text-xs font-bold text-[#0b2545] focus:outline-hidden focus:ring-2 focus:ring-[#134074] shadow-2xs"
          >
            {cohort.map(p => (
              <option key={p.id} value={p.id}>
                {p.full_name} ({p.synthea_id} · {p.risk_level.toUpperCase()} RISK)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. COMPLETE CLINICAL PROFILE HEADER CARD */}
      <div className="bg-[#0b2545] border border-[#13315c] rounded-2xl p-6 sm:p-7 text-white shadow-lg space-y-6">
        {/* Top Demographics Bar & Doctor Controls */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#13315c]/80">
          <div className="space-y-3">
            {/* Badges strip */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 text-xs font-mono font-bold text-[#8da9c4] bg-[#13315c] border border-[#134074] rounded-lg">
                #{syntheaFormatted}
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ABHA ID: {abhaId}</span>
              </span>
              <RiskBadge level={patient.risk_level} />
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-300 bg-[#13315c]/60 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Synced 4 mins ago · Live Wearables Active</span>
              </div>
            </div>

            {/* Patient Name & Primary Condition */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {patient.full_name}
              </h1>
              <p className="text-xs sm:text-sm text-[#8da9c4] font-medium mt-1">
                {patient.age}y {patient.gender} · DOB: {patient.dob} · Blood Group: {patient.blood_type || 'O+'} · Phone: {patient.phone || '+91 98201 34921'}
              </p>
              <div className="inline-block mt-2 px-3 py-1 bg-[#134074]/50 border border-[#8da9c4]/30 rounded-lg text-xs font-semibold text-slate-200">
                Primary Phenotype: <strong className="text-white">{patient.primary_condition}</strong>
              </div>
            </div>

            {/* Assigned Physician */}
            <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
              <Stethoscope className="w-3.5 h-3.5 text-[#8da9c4]" />
              <span>Attending Endocrinologist: </span>
              <strong className="text-white font-semibold">Dr. Vikramaditya Rao, MD (Endocrinology)</strong>
              <span className="text-slate-400">· AIIMS Digital Twin Network</span>
            </div>
          </div>

          {/* 4. DOCTOR ACTION CONTROLS */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full sm:w-auto lg:w-64">
            <button
              onClick={() => onAdjustProtocol(patient)}
              className="min-h-[44px] px-3.5 sm:px-4 py-2.5 text-xs font-bold text-white bg-[#134074] hover:bg-[#13315c] border border-[#8da9c4]/40 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-center leading-snug w-full"
            >
              <Stethoscope className="w-4 h-4 text-[#8da9c4] shrink-0" />
              <span>Adjust Medication / Titrate Protocol</span>
            </button>

            <button
              onClick={() => onRunClinicalSimulation(patient.id)}
              className="min-h-[44px] px-3.5 sm:px-4 py-2.5 text-xs font-bold text-[#0b2545] bg-[#eef4ed] hover:bg-white rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 text-center leading-snug w-full"
            >
              <Sparkles className="w-4 h-4 text-[#134074] shrink-0" />
              <span>Run Clinical Simulation</span>
            </button>

            <button
              onClick={() => setIsFhirModalOpen(true)}
              className="min-h-[44px] px-3.5 sm:px-4 py-2 text-xs font-semibold text-slate-200 bg-[#13315c]/80 hover:bg-[#13315c] border border-[#8da9c4]/30 rounded-xl transition-all flex items-center justify-center gap-2 text-center leading-snug w-full"
            >
              <FileCode className="w-4 h-4 text-[#8da9c4] shrink-0" />
              <span>Export FHIR Clinical Report</span>
            </button>
          </div>
        </div>

        {/* Baseline Anthropometrics Ribbon */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#8da9c4] mb-3 flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#8da9c4]" />
            <span>Baseline Anthropometrics & Hemodynamics</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            <div className="p-3 bg-[#13315c]/70 border border-[#134074] rounded-xl text-center">
              <div className="text-[10px] text-[#8da9c4] uppercase font-bold">Height</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {anthropometrics.heightCm} <span className="text-xs text-slate-400 font-normal">cm</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {(anthropometrics.heightCm / 30.48).toFixed(1)} ft
              </div>
            </div>

            <div className="p-3 bg-[#13315c]/70 border border-[#134074] rounded-xl text-center">
              <div className="text-[10px] text-[#8da9c4] uppercase font-bold">Weight</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {anthropometrics.weightKg} <span className="text-xs text-slate-400 font-normal">kg</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {Math.round(anthropometrics.weightKg * 2.20462)} lbs
              </div>
            </div>

            <div className="p-3 bg-[#13315c]/70 border border-[#134074] rounded-xl text-center">
              <div className="text-[10px] text-[#8da9c4] uppercase font-bold">Body Mass Index</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {patient.bmi} <span className="text-xs text-slate-400 font-normal">kg/m²</span>
              </div>
              <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                {patient.bmi >= 30 ? 'Class 1 Obese' : 'Overweight (S-Asian)'}
              </div>
            </div>

            <div className="p-3 bg-[#13315c]/70 border border-[#134074] rounded-xl text-center">
              <div className="text-[10px] text-[#8da9c4] uppercase font-bold">Waist-to-Hip Ratio</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {anthropometrics.waistToHipRatio}
              </div>
              <div className="text-[10px] text-rose-300 font-semibold mt-0.5">
                {anthropometrics.waistToHipRatio > 0.85 ? 'Central Adiposity' : 'Normal WHR'}
              </div>
            </div>

            <div className="p-3 bg-[#13315c]/70 border border-[#134074] rounded-xl text-center col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="text-[10px] text-[#8da9c4] uppercase font-bold">Blood Pressure</div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {labs.systolicBp}/{labs.diastolicBp}
              </div>
              <div className="text-[10px] text-slate-300 mt-0.5">
                mm Hg (Resting)
              </div>
            </div>
          </div>

          {anthropometrics.familyHistory && (
            <div className="mt-3 p-2.5 bg-[#13315c]/40 border border-[#134074]/50 rounded-xl text-xs text-slate-300 flex items-center gap-2">
              <Dna className="w-4 h-4 text-[#8da9c4] shrink-0" />
              <span>Familial Heritability: <strong className="text-white">{anthropometrics.familyHistory}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* 2. COMPREHENSIVE BASELINE LAB PANELS (EHR DATA) */}
      <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#134074]">
            <Activity className="w-4 h-4 text-[#134074]" />
            <span>Diagnostic EHR Baseline Laboratory Panels</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#0b2545] mt-1">
            Standardized Biomarker Panels & Organ Function Screening
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Synchronized with Synthea EHR diagnostic baselines, LOINC standardized codes, and ADA/RSSDI clinical thresholds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Panel 1: Glycemic Markers */}
          <div className="p-5 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0b2545] uppercase">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>1. Glycemic Markers</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#134074] bg-[#eef4ed] px-2 py-0.5 rounded">
                LOINC Harmonized
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <div>
                  <div className="font-bold text-[#0b2545]">Baseline HbA1c</div>
                  <div className="text-[10px] text-slate-500 font-mono">LOINC 4548-4</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold font-mono text-rose-600">{labs.hba1c}%</div>
                  <div className="text-[10px] text-rose-700 font-semibold">Goal &lt; 7.0%</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <div>
                  <div className="font-bold text-[#0b2545]">Fasting Blood Glucose</div>
                  <div className="text-[10px] text-slate-500 font-mono">LOINC 1558-6</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold font-mono text-amber-600">{labs.fastingGlucose} mg/dL</div>
                  <div className="text-[10px] text-slate-500">Ref: 70–100 mg/dL</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <div>
                  <div className="font-bold text-[#0b2545]">HOMA-IR Resistance Score</div>
                  <div className="text-[10px] text-slate-500 font-mono">Glucose x Insulin / 405</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold font-mono text-rose-600">{labs.homaIr}</div>
                  <div className="text-[10px] text-rose-700 font-semibold">Marked Resistance (&gt;2.0)</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <div>
                  <div className="font-bold text-[#0b2545]">Fasting Serum Insulin</div>
                  <div className="text-[10px] text-slate-500 font-mono">LOINC 20448-7</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold font-mono text-[#0b2545]">{labs.fastingInsulin || 16.5} µIU/mL</div>
                  <div className="text-[10px] text-slate-500">Compensatory output</div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Lipid Profile */}
          <div className="p-5 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0b2545] uppercase">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>2. Lipid Profile</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#134074] bg-[#eef4ed] px-2 py-0.5 rounded">
                Dyslipidemia Panel
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <div>
                  <div className="font-bold text-[#0b2545]">Total Serum Cholesterol</div>
                  <div className="text-[10px] text-slate-500 font-mono">LOINC 2093-3</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold font-mono text-amber-600">{totalCholesterol} mg/dL</div>
                  <div className="text-[10px] text-slate-500">Desirable: &lt; 200 mg/dL</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <div>
                  <div className="font-bold text-[#0b2545]">LDL Cholesterol (Atherogenic)</div>
                  <div className="text-[10px] text-slate-500 font-mono">LOINC 13457-7</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold font-mono text-rose-600">{labs.ldl} mg/dL</div>
                  <div className="text-[10px] text-rose-700 font-semibold">T2D Target: &lt; 70-100</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <div>
                  <div className="font-bold text-[#0b2545]">HDL Cholesterol (Cardioprotective)</div>
                  <div className="text-[10px] text-slate-500 font-mono">LOINC 2085-9</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold font-mono text-[#0b2545]">{labs.hdl} mg/dL</div>
                  <div className="text-[10px] text-slate-500">Goal &gt; 50 mg/dL</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <div>
                  <div className="font-bold text-[#0b2545]">Serum Triglycerides</div>
                  <div className="text-[10px] text-slate-500 font-mono">LOINC 2571-8</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold font-mono text-rose-600">{labs.triglycerides} mg/dL</div>
                  <div className="text-[10px] text-rose-700 font-semibold">Elevated (&gt;150 mg/dL)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 3: Renal & Hepatic Function */}
          <div className="p-5 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0b2545] uppercase">
                <Droplet className="w-4 h-4 text-[#134074]" />
                <span>3. Renal & Hepatic Function</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#134074] bg-[#eef4ed] px-2 py-0.5 rounded">
                Nephro / Liver Surveillance
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <div>
                  <div className="font-bold text-[#0b2545]">eGFR (CKD-EPI 2021)</div>
                  <div className="text-[10px] text-slate-500 font-mono">LOINC 33914-3</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold font-mono text-[#0b2545]">{labs.egfr}</div>
                  <div className="text-[10px] text-slate-500">mL/min/1.73m² (Stage 2 CKD)</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <div>
                  <div className="font-bold text-[#0b2545]">Serum Creatinine</div>
                  <div className="text-[10px] text-slate-500 font-mono">LOINC 2160-0</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold font-mono text-[#0b2545]">{labs.creatinine || 0.98} mg/dL</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Normal Glomerular Load</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <div>
                  <div className="font-bold text-[#0b2545]">Liver Enzymes (ALT / AST)</div>
                  <div className="text-[10px] text-slate-500 font-mono">LOINC 1742-6 / 1920-8</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold font-mono text-[#0b2545]">{altValue} / {astValue} U/L</div>
                  <div className="text-[10px] text-slate-500">MASLD / Steatosis Screening</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50/70 rounded-xl border border-slate-100">
                <div>
                  <div className="font-bold text-[#0b2545]">Urine Albumin-to-Creatinine</div>
                  <div className="text-[10px] text-slate-500 font-mono">UACR Screening</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold font-mono text-amber-600">{uacrValue} mg/g</div>
                  <div className="text-[10px] text-amber-700 font-semibold">Microalbuminuria Tier A2</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. REAL-TIME MULTI-ORGAN TELEMETRY & DIGITAL TWIN METRICS */}
      <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#134074]">
            <HeartPulse className="w-4 h-4 text-[#134074]" />
            <span>Continuous Biosensor Telemetry & Multi-Organ In-Silico State</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#0b2545] mt-1">
            Real-Time Physiological Telemetry & Pharmacotherapy Adherence
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Streaming interstitial glucose sensor velocity, continuous photoplethysmography (PPG), autonomic heart rate variability, and prescription verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* CGM Feed Card */}
          <div className="p-5 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-[#134074] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#134074]" />
                <span>Continuous Glucose (CGM)</span>
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-extrabold font-mono text-[#0b2545]">
                    {currentGlucose} <span className="text-sm font-normal text-slate-500">mg/dL</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                    <span>Rate of Change: +1.2 mg/dL/min (Slight Ascent)</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-[#134074]">
                    CV: {wearableStats.cvPercent}%
                  </div>
                  <div className="text-[10px] text-slate-400">Target &le; 36%</div>
                </div>
              </div>

              {/* Time-in-Range Segmented Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#0b2545] mb-1.5">
                  <span>Time-in-Range (70-180 mg/dL)</span>
                  <span className="font-mono text-emerald-700">{wearableStats.tirPercent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${wearableStats.tirPercent}%` }}
                    className="bg-emerald-500 h-full"
                    title={`In Target: ${wearableStats.tirPercent}%`}
                  />
                  <div
                    style={{ width: `${Math.max(0, 100 - wearableStats.tirPercent - 4)}%` }}
                    className="bg-amber-400 h-full"
                    title="Time Above Range >180"
                  />
                  <div
                    style={{ width: '4%' }}
                    className="bg-rose-500 h-full"
                    title="Time Below Range <70"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span className="text-emerald-700 font-semibold">TIR {wearableStats.tirPercent}%</span>
                  <span className="text-amber-600 font-semibold">TAR ~24%</span>
                  <span className="text-rose-600 font-semibold">TBR ~4%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cardiovascular & Endothelial Health Card */}
          <div className="p-5 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-[#134074] flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>Cardiovascular & Endothelial</span>
              </span>
              <span className="text-[10px] font-mono text-[#134074] font-semibold">PPG Sensor</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Resting HR</div>
                  <div className="text-xl font-bold font-mono text-[#0b2545] mt-0.5">
                    {currentHeartRate} <span className="text-xs font-normal text-slate-500">bpm</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Sinus Rhythm</div>
                </div>

                <div className="p-2.5 bg-slate-50/70 border border-slate-100 rounded-xl">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">RMSSD HRV</div>
                  <div className="text-xl font-bold font-mono text-[#0b2545] mt-0.5">
                    42 <span className="text-xs font-normal text-slate-500">ms</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Vagal Tone Buffer</div>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl space-y-1">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Endothelial Shear Stress Rating</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  Postprandial glycemic excursions generate transient glycocalyx shear stress (Augmentation Index: 24%).
                </p>
              </div>
            </div>
          </div>

          {/* Active Prescription Protocol Card */}
          <div className="p-5 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-[#134074] flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-[#134074]" />
                <span>Active Prescription Protocol</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                {adherenceScore}% Adherence
              </span>
            </div>

            <div className="space-y-2.5">
              {(patient.medications || []).map((med, idx) => (
                <div key={idx} className="p-2.5 bg-[#eef4ed]/50 border border-[#8da9c4]/30 rounded-xl text-xs text-[#0b2545]">
                  <div className="font-bold flex items-center justify-between">
                    <span>{med}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">Active</span>
                  </div>
                </div>
              ))}

              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>30-Day Smart Blister Verification:</span>
                <span className="text-emerald-700 font-bold">28 / 30 Doses Confirmed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MULTI-SYSTEM ORGAN KINETIC VISUALIZER */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#134074] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#134074]" />
            <span>Interactive Multi-Organ Physiological System Explorer</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">Click organs below for mechanistic insights</span>
        </div>

        <DigitalTwinVisual
          profile={patient}
          latestGlucose={currentGlucose}
          latestHeartRate={currentHeartRate}
        />
      </div>

      {/* FHIR R4 Clinical Report Modal */}
      <FhirExportModal
        patient={patient}
        isOpen={isFhirModalOpen}
        onClose={() => setIsFhirModalOpen(false)}
      />
    </div>
  );
};
