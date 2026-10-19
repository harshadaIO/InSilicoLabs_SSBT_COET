import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Activity,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Heart,
  Droplet,
  Sparkles,
  ArrowRight,
  Info,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { PatientProfile } from '../types';
import { RiskBadge } from './RiskBadge';

interface ClinicalTitrationSimulatorProps {
  cohort: PatientProfile[];
  selectedPatientId?: string;
  onSelectPatient?: (patientId: string) => void;
  onApplyToProtocol?: (directive: string, targetHbA1c: string) => void;
}

export interface TitrationResult {
  currentHbA1c: number;
  projectedHbA1c: number;
  deltaHbA1c: number;
  currentTir: number;
  projectedTir: number;
  deltaTir: number;
  currentFpg: number;
  projectedFpg: number;
  cardiovascularRiskShift: string;
  tenYearAscvdRiskCurrent?: number;
  tenYearAscvdRiskProjected?: number;
  ckdProgressionRiskReductionPercent?: number;
  ckdProgressionRiskReduction?: string;
  renalProtectionIndex: string;
  hypoglycemiaRisk: 'Negligible' | 'Low' | 'Moderate' | 'Elevated';
  trajectory90Days: Array<{
    day: number;
    hbA1c: number;
    fpg: number;
    tir: number;
  }>;
  clinicalRationale: string;
  safetyPrecautions: string[];
  contraindicationAlerts: string[];
  treatmentAdjustmentText: string;
  modelUsed: string;
}

export const ClinicalTitrationSimulator: React.FC<ClinicalTitrationSimulatorProps> = ({
  cohort,
  selectedPatientId,
  onSelectPatient,
  onApplyToProtocol
}) => {
  const [patientId, setPatientId] = useState<string>(selectedPatientId || cohort[0]?.id || 'pat-ananya-iyer');
  const [metforminDose, setMetforminDose] = useState<'none' | '500mg' | '850mg_bid' | '1000mg_bid'>('1000mg_bid');
  const [secondLineAgent, setSecondLineAgent] = useState<'none' | 'sglt2i_empa' | 'sglt2i_empa_25' | 'dpp4i_teneli' | 'glp1_sema' | 'dual_sglt2_glp1'>('sglt2i_empa');
  const [insulinRegimen, setInsulinRegimen] = useState<'none' | 'basal_10u' | 'basal_20u' | 'basal_bolus'>('none');
  const [targetHbA1c, setTargetHbA1c] = useState<string>('< 6.8%');
  const [clinicalConstraints, setClinicalConstraints] = useState<string>('Indian consensus RSSDI/ADA 2026: Strict adherence to renal eGFR threshold and postprandial glycemic spike attenuation.');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TitrationResult | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const currentPatient = cohort.find(p => p.id === patientId) || cohort[0];

  useEffect(() => {
    if (selectedPatientId && selectedPatientId !== patientId) {
      setPatientId(selectedPatientId);
    }
  }, [selectedPatientId]);

  // Run simulation on patient or parameter change initially
  useEffect(() => {
    if (currentPatient) {
      runSimulation();
    }
  }, [patientId]);

  const handlePatientChange = (newId: string) => {
    setPatientId(newId);
    if (onSelectPatient) onSelectPatient(newId);
  };

  const runSimulation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setAppliedNotice(null);

    try {
      const res = await fetch('/api/simulation/clinical-titration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          titrationInput: {
            metforminDose,
            secondLineAgent,
            insulinRegimen,
            targetHbA1c,
            clinicalConstraints
          }
        })
      });

      if (!res.ok) {
        throw new Error('Simulation failed to evaluate pharmacotherapy parameters.');
      }

      const data: TitrationResult = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error executing clinical titration simulation.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyToProtocol = () => {
    if (!result) return;
    if (onApplyToProtocol) {
      onApplyToProtocol(result.treatmentAdjustmentText, targetHbA1c);
      setAppliedNotice('Prescription and 90-day titration parameters pushed into Protocol & Rx Engine.');
      setTimeout(() => setAppliedNotice(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header */}
      <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#8da9c4]/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#134074] uppercase tracking-wider">
              <Stethoscope className="w-4 h-4 text-[#134074]" />
              <span>In-Silico Therapeutic Modeling · Attending Endocrinologist Workspace</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#0b2545] mt-1">
              Clinical Titration & Pharmacotherapy Simulator
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-3xl">
              Virtual pharmacological titration engine for Dr. Vikramaditya Rao. Simulates 90-day receptor-level responses, projected HbA1c reduction, Time-in-Range gains, and cardiorenal outcome shifts before committing prescription changes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            <span className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-[#eef4ed] text-[#134074] border border-[#8da9c4]/40 font-bold whitespace-nowrap">
              ADA / RSSDI 2026 Grounded
            </span>
          </div>
        </div>

        {/* Patient Selection Ribbon */}
        <div className="mt-4 pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <label className="text-xs font-bold text-[#0b2545] whitespace-nowrap">Focus Patient:</label>
            <select
              value={patientId}
              onChange={(e) => handlePatientChange(e.target.value)}
              className="text-xs font-bold py-2.5 px-3.5 bg-white border border-[#8da9c4]/50 rounded-xl text-[#0b2545] shadow-2xs focus:ring-2 focus:ring-[#134074] w-full sm:w-auto min-h-[40px]"
            >
              {cohort.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.synthea_id} · {p.age}y {p.gender} · {p.risk_level.toUpperCase()} RISK)
                </option>
              ))}
            </select>
          </div>

          {currentPatient && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
              <div className="px-3 py-1.5 bg-white border border-[#8da9c4]/30 rounded-lg shadow-2xs">
                <span className="text-slate-500">Baseline HbA1c: </span>
                <strong className="text-[#0b2545]">{currentPatient.baselineLabs?.hba1c}%</strong>
              </div>
              <div className="px-3 py-1.5 bg-white border border-[#8da9c4]/30 rounded-lg shadow-2xs">
                <span className="text-slate-500">eGFR: </span>
                <strong className="text-[#0b2545]">{currentPatient.baselineLabs?.egfr} mL/min</strong>
              </div>
              <RiskBadge level={currentPatient.risk_level} />
            </div>
          )}
        </div>
      </div>

      {/* Interactive Titration Control Grid */}
      <form onSubmit={runSimulation} className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md space-y-6">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#134074] flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-[#134074]" />
            <span>Pharmacotherapy Intervention Variables</span>
          </h4>
          <p className="text-xs text-slate-600">
            Select medication dosages and clinical constraints to evaluate comparative therapeutic trajectories against baseline digital twin parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Metformin Titration */}
          <div className="p-4 bg-white border border-[#8da9c4]/30 rounded-xl shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-[#0b2545]">
              1. Biguanide / Metformin Titration
            </label>
            <p className="text-[11px] text-slate-500">
              Inhibits hepatic gluconeogenesis via mitochondrial complex-I & AMPK activation.
            </p>
            <select
              value={metforminDose}
              onChange={(e) => setMetforminDose(e.target.value as any)}
              className="w-full text-xs p-2.5 bg-[#eef4ed]/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#134074] text-[#0b2545] font-semibold"
            >
              <option value="none">Omit Metformin (0 mg / Discontinued)</option>
              <option value="500mg">Metformin 500 mg Daily (Dose Reduction)</option>
              <option value="850mg_bid">Metformin 850 mg BID (Maintenance Baseline)</option>
              <option value="1000mg_bid">Metformin 1,000 mg BID with Meals (Intensification)</option>
            </select>
          </div>

          {/* Incretin / SGLT2 Axis */}
          <div className="p-4 bg-white border border-[#8da9c4]/30 rounded-xl shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-[#0b2545]">
              2. Second-Line Agent (Cardiorenal / Incretin Axis)
            </label>
            <p className="text-[11px] text-slate-500">
              Glucosuric SGLT2 inhibition or GLP-1 receptor satiety and cardiorenal signaling.
            </p>
            <select
              value={secondLineAgent}
              onChange={(e) => setSecondLineAgent(e.target.value as any)}
              className="w-full text-xs p-2.5 bg-[#eef4ed]/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#134074] text-[#0b2545] font-semibold"
            >
              <option value="none">None (Monotherapy)</option>
              <option value="dpp4i_teneli">Teneligliptin 20 mg Daily (DPP-4i Baseline)</option>
              <option value="sglt2i_empa">Empagliflozin 10 mg Daily (SGLT2i Cardioprotective)</option>
              <option value="sglt2i_empa_25">Empagliflozin 25 mg Daily (Max SGLT2i)</option>
              <option value="glp1_sema">Semaglutide 0.5 mg QW Subcutaneous (GLP-1 RA)</option>
              <option value="dual_sglt2_glp1">Dual Empagliflozin 10mg + Semaglutide 0.5mg QW</option>
            </select>
          </div>

          {/* Insulin Regimen */}
          <div className="p-4 bg-white border border-[#8da9c4]/30 rounded-xl shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-[#0b2545]">
              3. Exogenous Insulin Regimen
            </label>
            <p className="text-[11px] text-slate-500">
              Supplements compromised beta-cell reserve; requires nocturnal hypo surveillance.
            </p>
            <select
              value={insulinRegimen}
              onChange={(e) => setInsulinRegimen(e.target.value as any)}
              className="w-full text-xs p-2.5 bg-[#eef4ed]/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#134074] text-[#0b2545] font-semibold"
            >
              <option value="none">No Exogenous Insulin (Oral / GLP-1 only)</option>
              <option value="basal_10u">Basal Insulin Glargine U-100: 10 Units Nightly</option>
              <option value="basal_20u">Basal Insulin Glargine U-100: 20 Units Nightly</option>
              <option value="basal_bolus">Intensive Basal-Bolus (Glargine 24u + Aspart TID)</option>
            </select>
          </div>
        </div>

        {/* Clinical Constraints & Target Input */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-[#0b2545] mb-1">
              Target HbA1c Goal
            </label>
            <input
              type="text"
              value={targetHbA1c}
              onChange={(e) => setTargetHbA1c(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#134074] text-[#0b2545] font-semibold"
              placeholder="e.g. < 6.8%"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[#0b2545] mb-1">
              Clinical Constraints & Directives
            </label>
            <input
              type="text"
              value={clinicalConstraints}
              onChange={(e) => setClinicalConstraints(e.target.value)}
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#134074] text-[#0b2545]"
              placeholder="Specify clinical constraints or comorbidities..."
            />
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#134074] hover:bg-[#0b2545] rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#8da9c4]" />
              <span>{loading ? 'Simulating Kinetics...' : 'Simulate Trajectory'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {appliedNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{appliedNotice}</span>
          </div>
        )}
      </form>

      {/* Simulation Results Presentation */}
      {result && (
        <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#8da9c4]/20">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#134074] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#134074]" />
                <span>90-Day Projected Trajectory & Outcomes</span>
              </span>
              <h4 className="text-xl font-bold text-[#0b2545] mt-0.5">
                Therapeutic Efficacy & Cardiorenal Shift for {currentPatient?.full_name}
              </h4>
            </div>

            <button
              type="button"
              onClick={handleApplyToProtocol}
              className="px-4 py-2 text-xs font-bold text-white bg-[#134074] hover:bg-[#0b2545] rounded-xl transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
            >
              <span>Apply to Patient Protocol</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8da9c4]" />
            </button>
          </div>

          {/* Primary Metric Scorecards (Adaptive 1 -> 2 -> 4 Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Projected HbA1c */}
            <div className="p-4 sm:p-5 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-[#134074]">Projected 90-Day HbA1c</div>
              <div className="text-2xl font-bold font-mono text-[#0b2545] mt-1 flex items-baseline gap-1">
                {result.projectedHbA1c}%
                <span className="text-xs text-slate-400 font-normal">from {result.currentHbA1c}%</span>
              </div>
              <div className={`text-[11px] font-bold mt-1 flex items-center gap-1 ${
                result.deltaHbA1c < 0 ? 'text-emerald-700' : 'text-slate-500'
              }`}>
                <TrendingDown className="w-3 h-3" />
                <span>{result.deltaHbA1c}% absolute reduction</span>
              </div>
            </div>

            {/* Time in Range */}
            <div className="p-4 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-[#134074]">Glycemic Time-in-Range (TIR)</div>
              <div className="text-2xl font-bold font-mono text-[#0b2545] mt-1 flex items-baseline gap-1">
                {result.projectedTir}%
                <span className="text-xs text-slate-400 font-normal">from {result.currentTir}%</span>
              </div>
              <div className="text-[11px] font-bold text-emerald-700 mt-1">
                +{result.deltaTir}% expansion in target
              </div>
            </div>

            {/* Fasting Plasma Glucose */}
            <div className="p-4 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-[#134074]">Fasting Plasma Glucose</div>
              <div className="text-2xl font-bold font-mono text-[#0b2545] mt-1 flex items-baseline gap-1">
                {result.projectedFpg} <span className="text-xs text-slate-500 font-normal">mg/dL</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Down from {result.currentFpg} mg/dL
              </div>
            </div>

            {/* Hypoglycemia Safety Tier */}
            <div className="p-4 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-[#134074]">Hypoglycemia Safety Tier</div>
              <div className="mt-1.5">
                <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg border ${
                  result.hypoglycemiaRisk === 'Negligible' || result.hypoglycemiaRisk === 'Low'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : result.hypoglycemiaRisk === 'Moderate'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {result.hypoglycemiaRisk} Risk Profile
                </span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Non-secretagogue profile</div>
            </div>
          </div>

          {/* 90-Day Trajectory Graph (Recharts) */}
          <div className="p-5 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#0b2545] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#134074]" />
                <span>90-Day Longitudinal Pharmacodynamic Trajectory</span>
              </h5>
              <span className="text-[11px] text-slate-500 font-medium">15-day clinical checkpoints</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.trajectory90Days} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(141, 169, 196, 0.25)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#13315c' }}
                    unit="d"
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[5.0, 9.5]}
                    tick={{ fontSize: 11, fill: '#13315c' }}
                    unit="%"
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[50, 100]}
                    tick={{ fontSize: 11, fill: '#134074' }}
                    unit="%"
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid rgba(141, 169, 196, 0.4)',
                      fontSize: '12px',
                      boxShadow: '0 8px 20px -3px rgba(11, 37, 69, 0.1)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <ReferenceLine yAxisId="left" y={7.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Target HbA1c 7.0%', fill: '#ef4444', fontSize: 10 }} />
                  <ReferenceLine yAxisId="right" y={70} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target TIR 70%', fill: '#10b981', fontSize: 10 }} />

                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="hbA1c"
                    name="Projected HbA1c (%)"
                    stroke="#134074"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#134074' }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="tir"
                    name="Glycemic Time-In-Range (%)"
                    stroke="#0b2545"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#0b2545' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cardiorenal Prognosis & Evidence Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-[#8da9c4]/30 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#134074]">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Cardiovascular Risk & 10-Yr ASCVD</span>
                </div>
                {result.tenYearAscvdRiskCurrent !== undefined && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    10-Yr ASCVD: {result.tenYearAscvdRiskCurrent}% → {result.tenYearAscvdRiskProjected}%
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-[#0b2545]">{result.cardiovascularRiskShift}</div>
              <p className="text-[11px] text-slate-500">
                Validated against EMPA-REG, SUSTAIN-6, and LEADER cardiorenal outcome trial registries.
              </p>
            </div>

            <div className="p-4 bg-white border border-[#8da9c4]/30 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#134074]">
                  <Droplet className="w-4 h-4 text-[#134074]" />
                  <span>Renal & Microvascular Protection</span>
                </div>
                {result.ckdProgressionRiskReductionPercent !== undefined && result.ckdProgressionRiskReductionPercent > 0 && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    -{result.ckdProgressionRiskReductionPercent}% CKD Progression
                  </span>
                )}
              </div>
              <div className="text-xs font-semibold text-[#0b2545]">
                {result.ckdProgressionRiskReduction || result.renalProtectionIndex}
              </div>
              <p className="text-[11px] text-slate-500">
                Intraglomerular hemodynamic modulation attenuating hyperfiltration injury (EMPA-KIDNEY / CREDENCE).
              </p>
            </div>
          </div>

          {/* Clinical Rationale & Safety Precautions */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 p-4 bg-white border border-[#8da9c4]/30 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#0b2545]">
                <Info className="w-4 h-4 text-[#134074]" />
                <span>Endocrinology Decision Rationale</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {result.clinicalRationale}
              </p>
              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-100 font-mono">
                Model: {result.modelUsed}
              </div>
            </div>

            <div className="md:col-span-5 p-4 bg-white border border-[#8da9c4]/30 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Clinical Precautions & Directives</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                {result.safetyPrecautions.map((prec, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold shrink-0">•</span>
                    <span>{prec}</span>
                  </div>
                ))}
              </div>

              {result.contraindicationAlerts.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100 space-y-1 text-xs text-rose-700">
                  {result.contraindicationAlerts.map((contra, i) => (
                    <div key={i} className="flex items-start gap-1.5 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{contra}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
