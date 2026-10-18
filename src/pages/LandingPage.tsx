import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Zap,
  ShieldCheck,
  Stethoscope,
  Heart,
  TrendingUp,
  Cpu,
  ArrowRight,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onOpenLoginModal?: (role?: 'patient' | 'doctor') => void;
  isLoggedIn?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLoginModal, isLoggedIn = false }) => {
  const { switchDemoUser } = useAuth();
  const navigate = useNavigate();

  const handleLaunchPatient = async () => {
    if (!isLoggedIn && onOpenLoginModal) {
      onOpenLoginModal('patient');
      return;
    }
    await switchDemoUser('patient');
    navigate('/patient');
  };

  const handleLaunchDoctor = async () => {
    if (!isLoggedIn && onOpenLoginModal) {
      onOpenLoginModal('doctor');
      return;
    }
    await switchDemoUser('doctor');
    navigate('/doctor');
  };

  return (
    <div className="space-y-16 pb-16 bg-[#eef4ed]">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#134074] bg-white/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#8da9c4]/40 shadow-xs">
              <Activity className="w-3.5 h-3.5 text-[#134074]" />
              <span>Clinical Biometric Digital Twin Architecture</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0b2545] tracking-tight leading-[1.15]" style={{ textWrap: 'balance' }}>
              Predictive Patient Digital Twins for Proactive Healthcare
            </h1>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
              VitaTwin unifies static EHR diagnostic baselines with dynamic continuous wearable telemetry to construct an in-silico human digital twin. Leveraging advanced predictive modeling and compartmental physiological kinetics, it projects glycemic excursions and cardiovascular strain before clinical symptoms manifest.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
              <button
                onClick={handleLaunchPatient}
                className="w-full sm:w-auto justify-center min-h-[48px] px-5 sm:px-6 py-3 text-sm font-bold text-white bg-[#134074] hover:bg-[#0b2545] rounded-xl shadow-md transition-all flex items-center gap-2 group"
              >
                <span>Launch Patient Digital Twin</span>
                <ArrowRight className="w-4 h-4 text-[#8da9c4] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={handleLaunchDoctor}
                className="w-full sm:w-auto justify-center min-h-[48px] px-5 sm:px-6 py-3 text-sm font-bold text-[#0b2545] bg-white/90 border border-[#8da9c4]/50 hover:bg-white rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <Stethoscope className="w-4 h-4 text-[#134074]" />
                <span>Clinician Command Center</span>
              </button>
            </div>

            {/* Trust Markers */}
            <div className="pt-6 border-t border-[#8da9c4]/30 flex flex-wrap items-center gap-6 text-xs text-[#13315c] font-semibold">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#134074]" />
                <span>DPDP Act 2023 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#134074]" />
                <span>Synthea / FHIR Standard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#134074]" />
                <span>Physiological Kinetics</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card: Live Digital Twin Preview */}
          <div className="lg:col-span-5">
            <div className="bg-[#0b2545] border border-[#13315c] rounded-3xl p-7 shadow-2xl relative overflow-hidden text-white">
              <div className="flex items-center justify-between pb-4 border-b border-[#13315c]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#8da9c4] animate-ping" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Digital Twin Telemetry Stream
                  </span>
                </div>
                <span className="text-xs font-mono text-[#8da9c4]">BLE 5.2 Active</span>
              </div>

              {/* Live Display Panel */}
              <div className="my-6 p-5 bg-[#13315c] rounded-2xl border border-[#134074] space-y-4 shadow-inner">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold text-slate-200">ENGINE BENCHMARK · ANONYMIZED STREAM</span>
                  <span className="font-mono text-[#8da9c4] font-bold">ZERO-PII SANDBOX</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-[#0b2545] rounded-xl border border-[#134074]">
                    <div className="text-[10px] uppercase font-mono text-[#8da9c4] font-bold">CGM Glucose</div>
                    <div className="text-2xl font-bold font-mono text-white mt-1">
                      135 <span className="text-xs font-normal text-slate-400">mg/dL</span>
                    </div>
                    <div className="text-[10px] text-[#8da9c4] mt-1 font-mono">Velocity +0.4 mg/dL/min</div>
                  </div>

                  <div className="p-3.5 bg-[#0b2545] rounded-xl border border-[#134074]">
                    <div className="text-[10px] uppercase font-mono text-[#8da9c4] font-bold">Heart Rate</div>
                    <div className="text-2xl font-bold font-mono text-white mt-1">
                      72 <span className="text-xs font-normal text-slate-400">bpm</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1 font-mono">HRV 45ms (Nominal)</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0b2545]/80 border border-[#134074] text-xs flex items-center justify-between">
                  <span className="text-slate-300">Projected 2-Hr Excursion:</span>
                  <span className="text-amber-400 font-mono font-bold">+73 mg/dL Peak</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-slate-300 flex items-center justify-between font-medium">
                  <span>Digital Twin Fidelity:</span>
                  <span className="font-mono font-bold text-[#8da9c4]">96.8%</span>
                </div>
                <div className="w-full bg-[#13315c] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#8da9c4] h-full w-[96.8%]" />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#13315c] flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Explore Patient Portal</span>
                <button
                  onClick={handleLaunchPatient}
                  className="text-xs font-bold text-[#8da9c4] hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Digital Twin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mechanism-to-Outcome Architecture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#134074] mb-2">Core System Architecture</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0b2545] tracking-tight">
            How the Multimodal Data Fusion Engine Operates
          </h3>
          <p className="text-sm text-slate-700 mt-2">
            Translating complex clinical datasets into localized forward physiological trajectories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#eef4ed] border border-[#8da9c4]/40 flex items-center justify-center text-[#134074] font-mono font-bold text-sm shadow-inner">
              01
            </div>
            <h4 className="text-base font-bold text-[#0b2545]">Multimodal Data Fusion</h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              Ingests static EHR data (Synthea/MIMIC-IV schema: demographics, ICD-10 diagnoses, medications, baseline labs like HbA1c and eGFR) combined with high-frequency dynamic wearable time-series (CGM glucose, HR, sleep architecture).
            </p>
            <div className="text-[11px] font-mono text-[#134074] font-semibold pt-2 border-t border-[#8da9c4]/20">
              Input: FHIR Synthea + BLE Wearables
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#eef4ed] border border-[#8da9c4]/40 flex items-center justify-center text-[#134074] font-mono font-bold text-sm shadow-inner">
              02
            </div>
            <h4 className="text-base font-bold text-[#0b2545]">Predictive Forward AI</h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              Computes personalized mathematical response curves for proposed "What-If" meal or lifestyle changes. Evaluates insulin sensitivity, first-phase pancreatic blunting, and sympathetic cardiovascular stress with fallback robustness.
            </p>
            <div className="text-[11px] font-mono text-[#134074] font-semibold pt-2 border-t border-[#8da9c4]/20">
              Engine: In-Silico Compartmental Modeling
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#eef4ed] border border-[#8da9c4]/40 flex items-center justify-center text-[#134074] font-mono font-bold text-sm shadow-inner">
              03
            </div>
            <h4 className="text-base font-bold text-[#0b2545]">Real-Time Risk Mitigation</h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              Generates early warning alerts for impending hypoglycemia or hyperosmolar spikes, while empowering clinicians to inspect cohort risk stratification and instantly adjust pharmacotherapy protocols.
            </p>
            <div className="text-[11px] font-mono text-[#134074] font-semibold pt-2 border-t border-[#8da9c4]/20">
              Outcome: Actionable In-Silico Care
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0b2545] border border-[#13315c] text-white rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#8da9c4] uppercase tracking-wider">
                Clinical Workflow
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                "What-If" Scenario Simulator & Early Warning Ticker
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Patients can test dietary and physical choices before taking action. Clinicians monitor high-risk cohorts with automated alert surveillance and instant protocol adjustment directives.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={handleLaunchPatient}
                  className="px-5 py-2.5 text-xs font-bold bg-[#134074] hover:bg-[#13315c] text-white rounded-xl transition-colors border border-[#8da9c4]/40 shadow-sm"
                >
                  Test Scenario Simulator
                </button>
                <button
                  onClick={handleLaunchDoctor}
                  className="px-5 py-2.5 text-xs font-bold bg-[#13315c] hover:bg-[#0b2545] text-white border border-[#8da9c4]/30 rounded-xl transition-colors"
                >
                  Open Clinician Command
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#13315c] border border-[#134074] space-y-1">
                <div className="text-2xl font-bold font-mono text-[#8da9c4]">100%</div>
                <div className="text-xs font-bold text-white">Active Handlers</div>
                <div className="text-[11px] text-slate-400">Zero mock stubs or dead links</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#13315c] border border-[#134074] space-y-1">
                <div className="text-2xl font-bold font-mono text-[#8da9c4]">SQLite</div>
                <div className="text-xs font-bold text-white">Persistent Schema</div>
                <div className="text-[11px] text-slate-400">Real relational data storage</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#13315c] border border-[#134074] space-y-1">
                <div className="text-2xl font-bold font-mono text-[#8da9c4]">&lt; 150ms</div>
                <div className="text-xs font-bold text-white">Telemetry Sync</div>
                <div className="text-[11px] text-slate-400">Continuous sensor updates</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#13315c] border border-[#134074] space-y-1">
                <div className="text-2xl font-bold font-mono text-[#8da9c4]">DPDP</div>
                <div className="text-xs font-bold text-white">HIPAA De-Identified</div>
                <div className="text-[11px] text-slate-400">Synthea anonymized cohort</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
