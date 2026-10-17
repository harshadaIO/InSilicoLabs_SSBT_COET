import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PatientProfile, AlertLog } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { EhrDetailModal } from '../components/EhrDetailModal';
import { TreatmentAdjustModal } from '../components/TreatmentAdjustModal';
import { EarlyWarningTicker } from '../components/EarlyWarningTicker';
import { DigitalTwinVisual } from '../components/DigitalTwinVisual';
import {
  Users,
  Search,
  Filter,
  Stethoscope,
  Activity,
  FileText,
  AlertTriangle,
  HeartPulse,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Zap,
  Sliders,
  Save,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

export type ClinicianSubView = 'triage' | 'inspector' | 'alerts' | 'protocol';

interface DoctorDashboardProps {
  activeSubView?: ClinicianSubView;
  onSelectSubView?: (subView: ClinicianSubView) => void;
  selectedPatientId?: string;
  onSelectPatient?: (patientId: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  activeSubView = 'triage',
  onSelectSubView,
  selectedPatientId = 'pat-ananya-iyer',
  onSelectPatient
}) => {
  const { user } = useAuth();

  const [cohort, setCohort] = useState<PatientProfile[]>([]);
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [loading, setLoading] = useState(true);

  // Active subview management
  const [internalSubView, setInternalSubView] = useState<ClinicianSubView>(activeSubView);
  useEffect(() => {
    if (activeSubView) {
      setInternalSubView(activeSubView);
    }
  }, [activeSubView]);

  const currentSubView = activeSubView || internalSubView;
  const handleSelectSubView = (sv: ClinicianSubView) => {
    setInternalSubView(sv);
    if (onSelectSubView) onSelectSubView(sv);
  };

  // Selected patient for inspector or protocol
  const [activePatientId, setActivePatientId] = useState<string>(selectedPatientId);
  useEffect(() => {
    if (selectedPatientId) {
      setActivePatientId(selectedPatientId);
    }
  }, [selectedPatientId]);

  const handleChoosePatient = (id: string) => {
    setActivePatientId(id);
    if (onSelectPatient) onSelectPatient(id);
  };

  // Modals state
  const [selectedPatientForEhr, setSelectedPatientForEhr] = useState<PatientProfile | null>(null);
  const [selectedPatientForTreatment, setSelectedPatientForTreatment] = useState<PatientProfile | null>(null);

  // Success message after action
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Protocol & Rx Form state for in-page Engine
  const [rxTargetPatient, setRxTargetPatient] = useState<PatientProfile | null>(null);
  const [treatmentDirective, setTreatmentDirective] = useState('');
  const [targetHbA1cInput, setTargetHbA1cInput] = useState('< 7.0%');
  const [targetTirInput, setTargetTirInput] = useState('> 70%');
  const [rxClinicalNote, setRxClinicalNote] = useState('');
  const [isSubmittingRx, setIsSubmittingRx] = useState(false);

  useEffect(() => {
    loadDoctorData();
  }, []);

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      // Fetch Cohort
      const cRes = await fetch('/api/cohort');
      if (cRes.ok) {
        const cohortData = await cRes.json();
        setCohort(cohortData);
        if (cohortData.length > 0 && !activePatientId) {
          setActivePatientId(cohortData[0].id);
        }
      }

      // Fetch Alerts
      const aRes = await fetch('/api/alerts');
      if (aRes.ok) {
        setAlerts(await aRes.json());
      }
    } catch (err) {
      console.error('Failed to load doctor dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync protocol target patient when activePatientId changes
  useEffect(() => {
    const found = cohort.find(p => p.id === activePatientId) || cohort[0] || null;
    setRxTargetPatient(found);
    if (found) {
      setTreatmentDirective(
        `Titrate Metformin hydrochloride to 1,000 mg BID with meals; Add Empagliflozin (Jardiance) 10 mg QD for cardioprotective glycemic control in ${found.full_name}`
      );
      setTargetHbA1cInput(found.carePlan?.targetHbA1c || '< 7.0%');
      setTargetTirInput(found.carePlan?.targetTIR || '> 70%');
      setRxClinicalNote(
        `Digital twin simulation and telemetry for ${found.full_name} indicate glycemic lability. SGLT2i and dosage adjustment recommended to protect microvasculature.`
      );
    }
  }, [activePatientId, cohort]);

  // Working [Acknowledge Alert] button
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acknowledgedBy: user?.name || 'Dr. Vikramaditya Rao, MD (Endocrinology)',
          clinicalAction: 'Alert acknowledged, baseline labs verified in Synthea EHR'
        })
      });

      if (res.ok) {
        setActionSuccess('Alert acknowledged and marked in clinical audit trail.');
        setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  };

  const handleDismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    setActionSuccess('Alert dismissed from active feed.');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleOpenProtocolFromAlert = (patientId: string) => {
    handleChoosePatient(patientId);
    handleSelectSubView('protocol');
  };

  const handleInspectPatient = (patient: PatientProfile) => {
    handleChoosePatient(patient.id);
    handleSelectSubView('inspector');
  };

  const handleAdjustPatientProtocol = (patient: PatientProfile) => {
    handleChoosePatient(patient.id);
    handleSelectSubView('protocol');
  };

  const handleSaveProtocolEngine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxTargetPatient) return;
    setIsSubmittingRx(true);

    try {
      const res = await fetch('/api/treatment/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: rxTargetPatient.id,
          doctorId: user?.id || 'usr-dr-vikramaditya',
          doctorName: user?.name || 'Dr. Vikramaditya Rao, MD (Endocrinology)',
          treatmentAdjustment: treatmentDirective,
          noteText: rxClinicalNote,
          updatedMedications: rxTargetPatient.medications || [],
          updatedTargetHbA1c: targetHbA1cInput
        })
      });

      if (res.ok) {
        setActionSuccess(`Treatment protocol updated for ${rxTargetPatient.full_name} and synchronized with In-Silico Twin.`);
        await loadDoctorData();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Failed to submit protocol:', err);
    } finally {
      setIsSubmittingRx(false);
    }
  };

  // Filter cohort
  const filteredCohort = cohort.filter(p => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.synthea_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.primary_condition.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === 'all' || p.risk_level === riskFilter;

    return matchesSearch && matchesRisk;
  });

  const highRiskCount = cohort.filter(p => p.risk_level === 'high').length;
  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const inspectedPatient = cohort.find(p => p.id === activePatientId) || cohort[0];

  return (
    <div className="min-h-screen bg-[#eef4ed] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Clinician Command Header */}
        <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#134074]">Clinician Command Center</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-mono text-[#13315c] font-semibold">Endocrinology & Cardiometabolic Surveillance</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b2545] tracking-tight">
                Patient Cohort Surveillance & Interventions
              </h1>
              <p className="text-xs sm:text-sm text-slate-700 max-w-2xl">
                Continuous surveillance of in-silico patient digital twins synthesizing Synthea EHR diagnostic baselines with live wearable telemetry.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadDoctorData}
                className="px-4 py-2 text-xs font-bold text-[#0b2545] bg-white border border-[#8da9c4]/40 hover:bg-[#eef4ed] rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#134074] ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Cohort</span>
              </button>
            </div>
          </div>

          {actionSuccess && (
            <div className="mt-4 p-3 bg-white border border-[#8da9c4]/50 rounded-xl text-xs text-[#0b2545] flex items-center gap-2 shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{actionSuccess}</span>
            </div>
          )}
        </div>


        {/* 1. COHORT TRIAGE SUB-VIEW */}
        {currentSubView === 'triage' && (
          <div className="space-y-6">
            {/* Key Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white/90 border border-[#8da9c4]/30 rounded-2xl shadow-2xs">
                <div className="text-[11px] font-bold uppercase text-[#134074]">Active Cohort</div>
                <div className="text-2xl font-bold font-mono text-[#0b2545] mt-1">
                  {cohort.length} <span className="text-xs font-normal text-slate-500">Digital Twins</span>
                </div>
                <div className="text-[10px] text-[#13315c] font-semibold mt-1">Synthea Synthetic Profiles</div>
              </div>

              <div className="p-4 bg-white/90 border border-[#8da9c4]/30 rounded-2xl shadow-2xs">
                <div className="text-[11px] font-bold uppercase text-[#134074]">High Risk Stratified</div>
                <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
                  {highRiskCount} <span className="text-xs font-normal text-slate-500">Patients</span>
                </div>
                <div className="text-[10px] text-rose-700 font-semibold mt-1">Priority Attention</div>
              </div>

              <div className="p-4 bg-white/90 border border-[#8da9c4]/30 rounded-2xl shadow-2xs">
                <div className="text-[11px] font-bold uppercase text-[#134074]">Active Anomaly Alerts</div>
                <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
                  {activeAlertsCount} <span className="text-xs font-normal text-slate-500">Alerts</span>
                </div>
                <div className="text-[10px] text-amber-700 font-semibold mt-1">Pending Acknowledgement</div>
              </div>

              <div className="p-4 bg-white/90 border border-[#8da9c4]/30 rounded-2xl shadow-2xs">
                <div className="text-[11px] font-bold uppercase text-[#134074]">Mean Glycemic TIR</div>
                <div className="text-2xl font-bold font-mono text-[#0b2545] mt-1">
                  78.4 <span className="text-xs font-normal text-slate-500">%</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1">Target &gt; 70% in Range</div>
              </div>
            </div>

            {/* Real-Time AI Early Warning Ticker */}
            <EarlyWarningTicker
              alerts={alerts}
              onAcknowledge={handleAcknowledgeAlert}
              onAdjustProtocol={handleOpenProtocolFromAlert}
            />

            {/* Searchable and Filterable Cohort Table */}
            <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl shadow-md overflow-hidden space-y-4 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0b2545]">
                    Patient Cohort Surveillance
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Select any patient to inspect their full multi-organ digital twin or adjust clinical prescriptions.
                  </p>
                </div>

                {/* Search bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, ID, or condition..."
                    className="w-full text-xs pl-9 pr-3.5 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#134074] focus:outline-hidden text-[#0b2545]"
                  />
                </div>
              </div>

              {/* Risk Filter Segmented Controls */}
              <div className="flex items-center gap-1.5 p-1 bg-[#eef4ed] border border-[#8da9c4]/30 rounded-xl w-fit">
                <button
                  onClick={() => setRiskFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    riskFilter === 'all' ? 'bg-[#134074] text-white shadow-xs' : 'text-[#0b2545] hover:bg-white/60'
                  }`}
                >
                  All ({cohort.length})
                </button>
                <button
                  onClick={() => setRiskFilter('high')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    riskFilter === 'high' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  High Risk ({cohort.filter(p => p.risk_level === 'high').length})
                </button>
                <button
                  onClick={() => setRiskFilter('medium')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    riskFilter === 'medium' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Medium Risk ({cohort.filter(p => p.risk_level === 'medium').length})
                </button>
                <button
                  onClick={() => setRiskFilter('low')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    riskFilter === 'low' ? 'bg-[#13315c] text-white shadow-xs' : 'text-slate-700 hover:bg-white/60'
                  }`}
                >
                  Low Risk ({cohort.filter(p => p.risk_level === 'low').length})
                </button>
              </div>

              {/* Cohort Table */}
              <div className="overflow-x-auto border border-[#8da9c4]/30 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#eef4ed] text-[#13315c] uppercase text-[10px] tracking-wider border-b border-[#8da9c4]/30 font-bold">
                    <tr>
                      <th className="py-3.5 px-4">Patient / Synthea ID</th>
                      <th className="py-3.5 px-4">Stratification</th>
                      <th className="py-3.5 px-4">Primary Condition</th>
                      <th className="py-3.5 px-4">HbA1c / Baseline</th>
                      <th className="py-3.5 px-4">Current Telemetry</th>
                      <th className="py-3.5 px-4">Wellness</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredCohort.map(patient => (
                      <tr key={patient.id} className="hover:bg-[#eef4ed]/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#0b2545] text-sm">{patient.full_name}</div>
                          <div className="text-[11px] font-mono text-slate-500">
                            {patient.synthea_id} · {patient.age}y {patient.gender}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <RiskBadge level={patient.risk_level} />
                        </td>

                        <td className="py-3.5 px-4 max-w-xs truncate text-[#0b2545] font-medium">
                          {patient.primary_condition}
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-bold text-[#0b2545]">
                            HbA1c: {patient.baselineLabs?.hba1c}%
                          </div>
                          <div className="text-[11px] text-slate-500">
                            BP: {patient.baselineLabs?.systolicBp}/{patient.baselineLabs?.diastolicBp}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-bold text-[#0b2545]">
                            CGM: {patient.currentGlucose || 135} mg/dL
                          </div>
                          <div className="text-[11px] text-slate-500">
                            HR: {patient.currentHeartRate || 72} bpm
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-[#0b2545]">
                          {patient.wellness_score}/100
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleInspectPatient(patient)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-[#134074] hover:bg-[#0b2545] rounded-lg transition-colors whitespace-nowrap shadow-2xs"
                            >
                              Inspect Twin
                            </button>
                            <button
                              onClick={() => handleAdjustPatientProtocol(patient)}
                              className="px-3 py-1.5 text-xs font-bold text-[#0b2545] bg-[#eef4ed] hover:bg-white border border-[#8da9c4]/40 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
                            >
                              Adjust Rx
                            </button>
                            <button
                              onClick={() => setSelectedPatientForEhr(patient)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#0b2545] transition-colors whitespace-nowrap"
                            >
                              EHR
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. TWIN INSPECTOR SUB-VIEW */}
        {currentSubView === 'inspector' && (
          <div className="space-y-6">
            {/* Patient Selector Bar */}
            <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#134074]">Digital Twin Inspector</span>
                <h3 className="text-lg font-bold text-[#0b2545]">Inspecting Patient Physiological Systems</h3>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Select Patient:</label>
                <select
                  value={activePatientId}
                  onChange={(e) => handleChoosePatient(e.target.value)}
                  className="px-3 py-2 bg-white border border-[#8da9c4]/50 rounded-xl text-xs font-bold text-[#0b2545] focus:outline-hidden focus:ring-2 focus:ring-[#134074]"
                >
                  {cohort.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.synthea_id} - {p.risk_level.toUpperCase()} RISK)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inspected Patient Profile Header Strip */}
            {inspectedPatient && (
              <div className="bg-[#0b2545] border border-[#13315c] rounded-2xl p-6 text-white shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#8da9c4] uppercase font-mono">{inspectedPatient.synthea_id}</span>
                      <span>·</span>
                      <span className="text-xs text-slate-300">{inspectedPatient.age}y {inspectedPatient.gender}</span>
                      <span>·</span>
                      <RiskBadge level={inspectedPatient.risk_level} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{inspectedPatient.full_name}</h2>
                    <p className="text-xs text-slate-300">{inspectedPatient.primary_condition}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#13315c] border border-[#134074] rounded-xl text-center">
                      <div className="text-[10px] text-[#8da9c4] uppercase font-bold">HbA1c</div>
                      <div className="text-xl font-bold font-mono text-white mt-0.5">{inspectedPatient.baselineLabs?.hba1c}%</div>
                    </div>
                    <div className="p-3 bg-[#13315c] border border-[#134074] rounded-xl text-center">
                      <div className="text-[10px] text-[#8da9c4] uppercase font-bold">Fasting Glucose</div>
                      <div className="text-xl font-bold font-mono text-white mt-0.5">{inspectedPatient.baselineLabs?.fastingGlucose} mg/dL</div>
                    </div>
                    <div className="p-3 bg-[#13315c] border border-[#134074] rounded-xl text-center">
                      <div className="text-[10px] text-[#8da9c4] uppercase font-bold">eGFR</div>
                      <div className="text-xl font-bold font-mono text-white mt-0.5">{inspectedPatient.baselineLabs?.egfr}</div>
                    </div>
                    <button
                      onClick={() => handleAdjustPatientProtocol(inspectedPatient)}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#134074] hover:bg-[#13315c] border border-[#8da9c4]/30 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-[#8da9c4]" />
                      <span>Adjust Rx Protocol</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnostic System Grid for Inspected Patient */}
            {inspectedPatient && (
              <DigitalTwinVisual
                profile={inspectedPatient}
                latestGlucose={inspectedPatient.currentGlucose || 135}
                latestHeartRate={inspectedPatient.currentHeartRate || 72}
              />
            )}
          </div>
        )}

        {/* 3. AI EARLY WARNINGS SUB-VIEW */}
        {currentSubView === 'alerts' && (
          <div className="space-y-6">
            <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#8da9c4]/20">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#134074] uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4 text-[#134074]" />
                    <span>Real-Time Predictive Anomaly Surveillance</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#0b2545] mt-1">
                    Continuous Cohort Anomaly Ticker
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Algorithmic early-warning engine identifying nocturnal hypoglycemia dips, sustained postprandial glycemic excursions, and autonomic cardiovascular strain.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/30 rounded-lg">
                    {activeAlertsCount} Active Anomalies
                  </span>
                </div>
              </div>

              {/* Alert Feed List */}
              <div className="mt-6 space-y-4">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      alert.status === 'acknowledged'
                        ? 'bg-slate-50/80 border-slate-200 opacity-75'
                        : alert.severity === 'critical'
                        ? 'bg-white border-rose-300 shadow-sm'
                        : 'bg-white border-amber-300 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                            alert.severity === 'critical'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {alert.severity} Priority
                          </span>
                          <span className="text-xs font-bold text-[#0b2545]">{alert.patient_name || 'Cohort Patient'}</span>
                          <span className="text-xs text-slate-400 font-mono">({alert.synthea_id})</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">{alert.metric}</span>
                        </div>

                        <h4 className="text-sm font-bold text-[#0b2545]">{alert.title}</h4>
                        <p className="text-xs text-slate-600 max-w-3xl">{alert.anomaly_detected}</p>

                        {alert.status === 'acknowledged' && (
                          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 pt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Acknowledged by {alert.acknowledged_by || 'Attending Physician'}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {alert.status !== 'acknowledged' && (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#134074] hover:bg-[#0b2545] rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#8da9c4]" />
                            <span>Acknowledge</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenProtocolFromAlert(alert.patient_id)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#0b2545] bg-[#eef4ed] hover:bg-white border border-[#8da9c4]/40 rounded-xl transition-all flex items-center gap-1"
                        >
                          <Stethoscope className="w-3.5 h-3.5 text-[#134074]" />
                          <span>Adjust Rx</span>
                        </button>
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-600 transition-colors"
                          title="Dismiss"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. PROTOCOL & RX ENGINE SUB-VIEW */}
        {currentSubView === 'protocol' && (
          <div className="space-y-6">
            <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#8da9c4]/20">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#134074] uppercase tracking-wider">
                    <Stethoscope className="w-4 h-4 text-[#134074]" />
                    <span>Clinical Decision Support & Prescription Protocol</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#0b2545] mt-1">
                    Protocol & Rx Engine
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Adjust medication regimens, target glycemic goals, and lifestyle directives with relational database persistence.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-[#0b2545]">Target Patient:</label>
                  <select
                    value={activePatientId}
                    onChange={(e) => handleChoosePatient(e.target.value)}
                    className="px-3.5 py-2 bg-white border border-[#8da9c4]/50 rounded-xl text-xs font-bold text-[#0b2545] focus:ring-2 focus:ring-[#134074]"
                  >
                    {cohort.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.synthea_id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {rxTargetPatient && (
                <form onSubmit={handleSaveProtocolEngine} className="mt-6 space-y-6">
                  {/* Current Diagnostic Context */}
                  <div className="p-4 bg-[#eef4ed] border border-[#8da9c4]/30 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Selected: </span>
                      <strong className="text-[#0b2545] font-bold text-sm">{rxTargetPatient.full_name}</strong>
                      <span className="text-slate-500 font-mono ml-1.5">({rxTargetPatient.synthea_id} · {rxTargetPatient.age}y)</span>
                    </div>
                    <div className="flex items-center gap-4 font-mono font-bold text-[#0b2545]">
                      <span>Baseline HbA1c: {rxTargetPatient.baselineLabs?.hba1c}%</span>
                      <span>Fasting Glucose: {rxTargetPatient.baselineLabs?.fastingGlucose} mg/dL</span>
                      <span>eGFR: {rxTargetPatient.baselineLabs?.egfr} mL/min</span>
                    </div>
                  </div>

                  {/* Primary Directive */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0b2545] uppercase tracking-wider">
                      Pharmacological Adjustment Directive
                    </label>
                    <textarea
                      rows={3}
                      value={treatmentDirective}
                      onChange={(e) => setTreatmentDirective(e.target.value)}
                      placeholder="Specify medication dosage titration or additions..."
                      className="w-full text-xs p-3.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#134074] text-[#0b2545]"
                      required
                    />
                  </div>

                  {/* Glycemic Targets Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0b2545] uppercase tracking-wider">
                        Target Glycated Hemoglobin (HbA1c)
                      </label>
                      <input
                        type="text"
                        value={targetHbA1cInput}
                        onChange={(e) => setTargetHbA1cInput(e.target.value)}
                        placeholder="e.g. < 7.0%"
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#134074] text-[#0b2545]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#0b2545] uppercase tracking-wider">
                        Target Time-In-Range (TIR 70-180 mg/dL)
                      </label>
                      <input
                        type="text"
                        value={targetTirInput}
                        onChange={(e) => setTargetTirInput(e.target.value)}
                        placeholder="e.g. > 70%"
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#134074] text-[#0b2545]"
                      />
                    </div>
                  </div>

                  {/* Clinical Reasoning & Audit Trail */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0b2545] uppercase tracking-wider">
                      Clinical Reasoning & Mechanistic Rationale
                    </label>
                    <textarea
                      rows={3}
                      value={rxClinicalNote}
                      onChange={(e) => setRxClinicalNote(e.target.value)}
                      placeholder="Note clinical rationale for audit trail and digital twin simulation..."
                      className="w-full text-xs p-3.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#134074] text-[#0b2545]"
                    />
                  </div>

                  {/* Signature and Submit */}
                  <div className="pt-4 border-t border-[#8da9c4]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <Stethoscope className="w-4 h-4 text-[#134074]" />
                      <span>Attending Physician Signature: </span>
                      <strong className="text-[#0b2545]">{user?.name || 'Dr. Vikramaditya Rao, MD (Endocrinology)'}</strong>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingRx}
                      className="px-6 py-2.5 text-xs font-bold text-white bg-[#134074] hover:bg-[#0b2545] rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-[#8da9c4]" />
                      <span>{isSubmittingRx ? 'Synchronizing Twin...' : 'Commit Protocol Adjustment'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Synthea EHR Modal */}
        <EhrDetailModal
          patient={selectedPatientForEhr}
          isOpen={!!selectedPatientForEhr}
          onClose={() => setSelectedPatientForEhr(null)}
          onOpenTreatmentAdjust={(p) => {
            handleChoosePatient(p.id);
            handleSelectSubView('protocol');
          }}
        />

        {/* Treatment Protocol Adjustment Modal */}
        <TreatmentAdjustModal
          patient={selectedPatientForTreatment}
          isOpen={!!selectedPatientForTreatment}
          onClose={() => setSelectedPatientForTreatment(null)}
          onSuccess={() => {
            setActionSuccess('Treatment protocol updated and persisted in database.');
            loadDoctorData();
            setTimeout(() => setActionSuccess(null), 3000);
          }}
        />
      </div>
    </div>
  );
};
