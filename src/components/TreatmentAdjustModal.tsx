import React, { useState } from 'react';
import { PatientProfile } from '../types';
import { X, Stethoscope, CheckCircle2, AlertCircle, Save } from 'lucide-react';

interface TreatmentAdjustModalProps {
  patient: PatientProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TreatmentAdjustModal: React.FC<TreatmentAdjustModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!isOpen || !patient) return null;

  const [treatmentAdjustment, setTreatmentAdjustment] = useState<string>(
    'Titrate Metformin hydrochloride to 1,000 mg BID with meals; Add Empagliflozin (Jardiance) 10 mg daily for cardioprotective glycemic control'
  );
  const [selectedMeds, setSelectedMeds] = useState<string[]>(patient.medications || []);
  const [newMedInput, setNewMedInput] = useState<string>('');
  const [targetHbA1c, setTargetHbA1c] = useState<string>(patient.carePlan?.targetHbA1c || '< 7.0%');
  const [clinicalNote, setClinicalNote] = useState<string>(
    'Patient digital twin simulation and continuous glucose telemetry demonstrate recurrent postprandial excursions exceeding 200 mg/dL with current 850mg Metformin dose. Adding SGLT2i recommended based on preserved eGFR (68 mL/min) and mild hypertension.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddMedication = () => {
    if (!newMedInput.trim()) return;
    setSelectedMeds([...selectedMeds, newMedInput.trim()]);
    setNewMedInput('');
  };

  const handleRemoveMedication = (index: number) => {
    setSelectedMeds(selectedMeds.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treatmentAdjustment.trim()) {
      setError('Please provide a treatment adjustment directive');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/treatment/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          doctorId: 'usr-dr-marcus',
          doctorName: 'Dr. Marcus Chen, MD',
          treatmentAdjustment,
          noteText: clinicalNote,
          updatedMedications: selectedMeds,
          updatedTargetHbA1c: targetHbA1c
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update treatment protocol');
      }

      setSuccessMessage('Treatment protocol updated and persisted to clinical database.');
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccessMessage(null);
        onSuccess();
        onClose();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Error updating protocol');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b2545]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#8da9c4]/40 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 bg-[#0b2545] border-b border-[#13315c] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#134074] border border-[#8da9c4]/30 flex items-center justify-center text-white shadow-inner">
              <Stethoscope className="w-5 h-5 text-[#8da9c4]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Adjust Treatment Protocol</h3>
              <div className="text-xs text-slate-300 mt-0.5">
                Patient: <span className="font-semibold text-white">{patient.full_name}</span> · {patient.synthea_id}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-[#eef4ed]/20">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-[#0b2545] uppercase tracking-wider mb-2">
              Clinical Directive & Pharmacotherapy Revision
            </label>
            <textarea
              rows={3}
              value={treatmentAdjustment}
              onChange={(e) => setTreatmentAdjustment(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#134074] focus:outline-none font-sans"
              placeholder="e.g. Increase Metformin to 1000mg BID, initiate Empagliflozin..."
            />
          </div>

          {/* Medication List Modifier */}
          <div>
            <label className="block text-xs font-bold text-[#0b2545] uppercase tracking-wider mb-1.5">
              Active Formulations in Patient Profile
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto mb-2">
              {selectedMeds.map((med, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#8da9c4]/30 text-xs">
                  <span className="text-[#0b2545] font-semibold">{med}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedication(idx)}
                    className="text-rose-600 hover:text-rose-800 text-xs font-medium px-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMedInput}
                onChange={(e) => setNewMedInput(e.target.value)}
                placeholder="Add new medication formulation (e.g. Empagliflozin 10 mg daily)..."
                className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#134074] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddMedication}
                className="px-4 py-2 text-xs font-semibold bg-[#13315c] hover:bg-[#0b2545] text-white rounded-xl transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Target HbA1c */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0b2545] mb-1">
                Updated Target HbA1c
              </label>
              <input
                type="text"
                value={targetHbA1c}
                onChange={(e) => setTargetHbA1c(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#134074] focus:outline-none font-mono font-bold text-[#0b2545]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0b2545] mb-1">
                Attending Physician
              </label>
              <input
                type="text"
                disabled
                value="Dr. Marcus Chen, MD (Endocrinology)"
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl bg-slate-100 text-slate-600 font-medium"
              />
            </div>
          </div>

          {/* Physician Rationale Note */}
          <div>
            <label className="block text-xs font-bold text-[#0b2545] uppercase tracking-wider mb-1.5">
              EHR Clinical Note & Directive
            </label>
            <textarea
              rows={2}
              value={clinicalNote}
              onChange={(e) => setClinicalNote(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#134074] focus:outline-none text-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#134074] hover:bg-[#0b2545] rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
            >
              <Save className="w-3.5 h-3.5 text-[#8da9c4]" />
              <span>{isSubmitting ? 'Updating Database...' : 'Save & Enforce Protocol'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
