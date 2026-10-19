import React, { useEffect } from 'react';
import { X, ShieldCheck, Lock, Server } from 'lucide-react';
import { PatientProfile } from '../types';
import { DpdpConsentAuditView } from './DpdpConsentAuditView';

interface DpdpConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: PatientProfile | null;
}

const DEFAULT_DPDP_PATIENT: PatientProfile = {
  id: 'pat-ananya-iyer',
  synthea_id: 'SYN-IND-4921',
  full_name: 'Ananya Iyer',
  age: 48,
  gender: 'Female',
  dob: '1978-04-12',
  blood_type: 'B+',
  primary_condition: 'Type 2 Diabetes Mellitus with Insulin Resistance',
  risk_level: 'medium',
  wellness_score: 72,
  bmi: 27.8,
  anthropometrics: {
    waistToHipRatio: 0.88,
    familyHistory: 'Paternal T2DM, Maternal Hypertension',
    weightKg: 68,
    heightCm: 156
  },
  conditions: ['Type 2 Diabetes Mellitus', 'Essential Hypertension', 'Dyslipidemia'],
  medications: ['Metformin 850mg BID', 'Teneligliptin 20mg QD', 'Atorvastatin 10mg QD'],
  allergies: ['Sulfonamides (mild cutaneous rash)'],
  baselineLabs: {
    hba1c: 7.8,
    hba1cUnit: '%',
    fastingGlucose: 142,
    fastingGlucoseUnit: 'mg/dL',
    homaIr: 3.4,
    egfr: 76,
    egfrUnit: 'mL/min/1.73m²',
    ldl: 128,
    ldlUnit: 'mg/dL',
    hdl: 46,
    hdlUnit: 'mg/dL',
    triglycerides: 184,
    triglyceridesUnit: 'mg/dL',
    systolicBp: 132,
    diastolicBp: 84
  },
  carePlan: {
    targetHbA1c: '< 7.0%',
    targetTIR: '> 75%',
    dailyStepGoal: 8500,
    carbCapDaily: 130
  }
};

export const DpdpConsentModal: React.FC<DpdpConsentModalProps> = ({
  isOpen,
  onClose,
  patient
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const effectivePatient = patient || DEFAULT_DPDP_PATIENT;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dpdp-modal-title"
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#eef4ed] border border-[#8da9c4]/50 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Header */}
        <div className="px-4 sm:px-6 py-4 bg-[#0b2545] border-b border-[#13315c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#134074] border border-[#8da9c4]/30 flex items-center justify-center text-white shadow-inner shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="dpdp-modal-title" className="text-sm sm:text-base font-bold text-white truncate">
                  DPDP Act 2023 Compliance & Consent Audit
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Section 6 Active Gateway
                </span>
              </div>
              <p className="text-xs text-[#8da9c4] truncate mt-0.5">
                Data Principal Digital Rights · AES-256 & TLS 1.3 Telemetry · Mumbai Sovereign Residency
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-slate-300 bg-[#13315c]/80 rounded-lg border border-[#134074]">
              <Lock className="w-3 h-3 text-[#8da9c4]" />
              <span>AES-256-GCM</span>
              <span className="text-slate-500">·</span>
              <Server className="w-3 h-3 text-[#8da9c4]" />
              <span>India Central</span>
            </span>

            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-[#13315c] transition-colors focus:outline-hidden min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Close DPDP consent modal"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          <DpdpConsentAuditView patient={effectivePatient} />
        </div>

        {/* Sticky Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-white/90 border-t border-[#8da9c4]/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Regulated by Data Protection Board of India (DPB) · Statutory Act No. 22 of 2023</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-[#0b2545] bg-[#eef4ed] hover:bg-[#8da9c4]/30 border border-[#8da9c4]/40 rounded-xl transition-colors min-h-[38px]"
          >
            Done / Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
