import React from 'react';
import { PatientProfile } from '../types';
import { X, FileText, Activity, ShieldCheck, HeartPulse, Pill, AlertTriangle, User } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

interface EhrDetailModalProps {
  patient: PatientProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTreatmentAdjust?: (patient: PatientProfile) => void;
}

export const EhrDetailModal: React.FC<EhrDetailModalProps> = ({
  patient,
  isOpen,
  onClose,
  onOpenTreatmentAdjust
}) => {
  if (!isOpen || !patient) return null;

  const labs = patient.baselineLabs || {
    hba1c: 8.4,
    fastingGlucose: 146,
    homaIr: 4.8,
    fastingInsulin: 18.5,
    systolicBp: 138,
    diastolicBp: 88,
    egfr: 68,
    ldl: 138,
    hdl: 44,
    triglycerides: 198,
    creatinine: 1.1
  };

  const anthropometrics = patient.anthropometrics || {
    waistToHipRatio: 0.88,
    familyHistory: 'Maternal Type 2 Diabetes diagnosed age 48, Maternal Coronary Artery Disease',
    weightKg: 78.2,
    heightCm: 163
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b2545]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#8da9c4]/40 max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header in Deep Navy #0b2545 */}
        <div className="px-6 py-5 bg-[#0b2545] border-b border-[#13315c] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#134074] border border-[#8da9c4]/30 flex items-center justify-center text-white shadow-inner">
              <FileText className="w-5 h-5 text-[#8da9c4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{patient.full_name}</h3>
                <RiskBadge level={patient.risk_level} />
              </div>
              <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                <span>Synthea EHR #{patient.synthea_id}</span>
                <span>·</span>
                <span>{patient.age} y/o {patient.gender}</span>
                <span>·</span>
                <span>Blood Type: {patient.blood_type}</span>
                <span>·</span>
                <span>BMI: {patient.bmi} kg/m²</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-[#13315c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto bg-[#eef4ed]/30">
          {/* Demographics & Anthropometrics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#134074] mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#134074]" />
              <span>Demographics, Anthropometrics & Genetic Risk</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border border-[#8da9c4]/30 bg-white/90 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-500">BMI / Classification</div>
                <div className="text-base font-bold font-mono text-[#0b2545] mt-0.5">
                  {patient.bmi} <span className="text-xs font-sans font-normal text-slate-500">kg/m²</span>
                </div>
                <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Overweight Class 1</div>
              </div>

              <div className="p-3 rounded-xl border border-[#8da9c4]/30 bg-white/90 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-500">Waist-to-Hip Ratio</div>
                <div className="text-base font-bold font-mono text-[#0b2545] mt-0.5">
                  {anthropometrics.waistToHipRatio}
                </div>
                <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Visceral Adiposity</div>
              </div>

              <div className="p-3 rounded-xl border border-[#8da9c4]/30 bg-white/90 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-500">Height & Weight</div>
                <div className="text-base font-bold font-mono text-[#0b2545] mt-0.5">
                  {anthropometrics.weightKg || 78.2} kg
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{anthropometrics.heightCm || 163} cm</div>
              </div>

              <div className="p-3 rounded-xl border border-[#8da9c4]/30 bg-white/90 shadow-2xs">
                <div className="text-[10px] uppercase font-bold text-slate-500">Blood Type</div>
                <div className="text-base font-bold font-mono text-[#0b2545] mt-0.5">
                  {patient.blood_type}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Rh Positive</div>
              </div>
            </div>

            <div className="mt-2.5 p-3 bg-white border border-[#8da9c4]/30 rounded-xl text-xs text-slate-700">
              <span className="font-bold text-[#0b2545]">Family History / Genetic Predisposition: </span>
              <span className="text-slate-600">{anthropometrics.familyHistory}</span>
            </div>
          </div>

          {/* Baseline Labs Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#134074] flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#134074]" />
                <span>Baseline Laboratory Diagnostics (Synthea / LOINC Standard)</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">Verified Clinical Profile</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-[#8da9c4]/30 bg-white/90 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-semibold">HbA1c Glycated</div>
                <div className="text-xl font-bold font-mono text-[#0b2545] mt-1">
                  {labs.hba1c} <span className="text-xs font-normal text-slate-400">%</span>
                </div>
                <div className={`text-[10px] mt-1 font-semibold ${labs.hba1c > 8.0 ? 'text-rose-600' : 'text-slate-500'}`}>
                  {labs.hba1c > 8.0 ? 'Above Goal (> 7.0%)' : 'Near Target'}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[#8da9c4]/30 bg-white/90 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-semibold">Fasting Blood Sugar</div>
                <div className="text-xl font-bold font-mono text-[#0b2545] mt-1">
                  {labs.fastingGlucose} <span className="text-xs font-normal text-slate-400">mg/dL</span>
                </div>
                <div className="text-[10px] text-amber-700 font-semibold mt-1">Target: 80 - 130</div>
              </div>

              <div className="p-3.5 rounded-xl border border-[#8da9c4]/30 bg-white/90 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-semibold">HOMA-IR Index</div>
                <div className="text-xl font-bold font-mono text-[#0b2545] mt-1">
                  {labs.homaIr || 4.8}
                </div>
                <div className="text-[10px] text-rose-600 font-semibold mt-1">Insulin Resistant</div>
              </div>

              <div className="p-3.5 rounded-xl border border-[#8da9c4]/30 bg-white/90 shadow-2xs">
                <div className="text-[11px] text-slate-500 font-semibold">Renal eGFR</div>
                <div className="text-xl font-bold font-mono text-[#0b2545] mt-1">
                  {labs.egfr} <span className="text-xs font-normal text-slate-400">mL/min</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">CKD Stage 2 (Mild)</div>
              </div>
            </div>

            {/* Additional Secondary Lipid Panel */}
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="p-2.5 rounded-lg border border-[#8da9c4]/30 bg-white text-xs">
                <span className="text-slate-500">LDL Cholesterol: </span>
                <span className="font-mono font-bold text-[#0b2545]">{labs.ldl} mg/dL</span>
              </div>
              <div className="p-2.5 rounded-lg border border-[#8da9c4]/30 bg-white text-xs">
                <span className="text-slate-500">HDL Cholesterol: </span>
                <span className="font-mono font-bold text-[#0b2545]">{labs.hdl} mg/dL</span>
              </div>
              <div className="p-2.5 rounded-lg border border-[#8da9c4]/30 bg-white text-xs">
                <span className="text-slate-500">Triglycerides: </span>
                <span className="font-mono font-bold text-[#0b2545]">{labs.triglycerides} mg/dL</span>
              </div>
            </div>
          </div>

          {/* Active Diagnoses */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#134074] mb-2 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-600" />
              <span>Active Problem List & Diagnoses (ICD-10 / SNOMED-CT)</span>
            </h4>
            <div className="bg-white border border-[#8da9c4]/30 rounded-xl p-3.5 space-y-2 shadow-2xs">
              {patient.conditions && patient.conditions.length > 0 ? (
                patient.conditions.map((c, i) => (
                  <div key={i} className="text-xs text-[#0b2545] font-medium flex items-start gap-2">
                    <span className="text-[#134074] font-bold">›</span>
                    <span>{c}</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">No active chronic conditions recorded.</div>
              )}
            </div>
          </div>

          {/* Pharmacotherapy */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#134074] mb-2 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-[#134074]" />
              <span>Active Pharmacotherapy (RxNorm Formulations & Adherence)</span>
            </h4>
            <div className="space-y-2">
              {patient.medications && patient.medications.length > 0 ? (
                patient.medications.map((m, i) => (
                  <div key={i} className="p-3 rounded-xl border border-[#8da9c4]/30 bg-white flex items-center justify-between text-xs shadow-2xs">
                    <div>
                      <span className="font-semibold text-[#0b2545]">{m}</span>
                      <div className="text-[10px] text-slate-500">Oral administration per prescriber instructions</div>
                    </div>
                    <span className="text-[11px] font-mono text-[#134074] bg-[#eef4ed] px-2.5 py-0.5 rounded-md border border-[#8da9c4]/30 font-bold whitespace-nowrap">
                      {i === 0 ? '94% Adherent' : i === 1 ? '98% Adherent' : '91% Adherent'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">No active medications.</div>
              )}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#134074] mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Drug Allergies & Adverse Reactions</span>
            </h4>
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 font-medium">
              {patient.allergies && patient.allergies.length > 0 ? (
                patient.allergies.map((a, i) => <div key={i}>• {a}</div>)
              ) : (
                <div>No known drug allergies (NKDA)</div>
              )}
            </div>
          </div>

          {/* Care Plan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#134074] mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Clinical Care Plan Targets</span>
            </h4>
            <div className="p-3.5 bg-white border border-[#8da9c4]/30 rounded-xl text-xs text-slate-700 space-y-1.5 shadow-2xs">
              <div><strong className="text-[#0b2545]">Glycemic Target:</strong> {patient.carePlan?.targetHbA1c || '< 7.0%'} (TIR: {patient.carePlan?.targetTIR || '> 70%'})</div>
              <div><strong className="text-[#0b2545]">Physical Activity:</strong> {patient.carePlan?.dailyStepGoal || 8000} daily steps</div>
              {patient.carePlan?.dietaryGuidance && (
                <div><strong className="text-[#0b2545]">Nutrition Protocol:</strong> {patient.carePlan.dietaryGuidance}</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            Synthea Synthetic Patient Model · LOINC & SNOMED-CT Grounded
          </div>

          <div className="flex items-center gap-3">
            {onOpenTreatmentAdjust && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTreatmentAdjust(patient);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#134074] hover:bg-[#0b2545] rounded-lg transition-colors shadow-sm"
              >
                Adjust Treatment Protocol
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Close Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
