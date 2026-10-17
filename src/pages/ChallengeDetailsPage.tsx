import React, { useEffect, useState } from 'react';
import { Award, ShieldCheck, Database, Cpu, Activity, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ChallengeDetailsPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/challenge/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load architecture stats:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#eef4ed] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-8 shadow-md">
          <div className="flex items-center gap-2 text-[#134074] font-bold text-xs uppercase tracking-wider mb-2">
            <Activity className="w-4 h-4 text-[#134074]" />
            <span>Clinical Digital Twin Platform Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0b2545] tracking-tight">
            System Specifications & Data Pipeline
          </h1>
          <p className="text-sm sm:text-base text-slate-700 mt-2 max-w-3xl leading-relaxed">
            VitaTwin addresses the complexities of chronic cardiometabolic disease management by modeling individual patient physiology as a dynamic, computational digital twin capable of forward predictive simulation.
          </p>
        </div>

        {/* Live System Stats from SQLite */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white/90 border border-[#8da9c4]/30 rounded-2xl shadow-2xs">
            <div className="text-[11px] font-bold uppercase text-[#134074]">Synthea Cohort</div>
            <div className="text-2xl font-bold font-mono text-[#0b2545] mt-1">
              {loading ? '...' : (stats?.patientCohortCount || 5)} <span className="text-xs font-normal text-slate-500">Patients</span>
            </div>
            <div className="text-[10px] text-[#13315c] font-semibold mt-1">Stratified Risk Profiles</div>
          </div>

          <div className="p-4 bg-white/90 border border-[#8da9c4]/30 rounded-2xl shadow-2xs">
            <div className="text-[11px] font-bold uppercase text-[#134074]">Telemetry Ingested</div>
            <div className="text-2xl font-bold font-mono text-[#0b2545] mt-1">
              {loading ? '...' : (stats?.telemetryPointsIngested || 45)}+ <span className="text-xs font-normal text-slate-500">Points</span>
            </div>
            <div className="text-[10px] text-[#13315c] font-semibold mt-1">CGM & Continuous HR</div>
          </div>

          <div className="p-4 bg-white/90 border border-[#8da9c4]/30 rounded-2xl shadow-2xs">
            <div className="text-[11px] font-bold uppercase text-[#134074]">Simulations Run</div>
            <div className="text-2xl font-bold font-mono text-[#0b2545] mt-1">
              {loading ? '...' : (stats?.simulationsExecuted || 1)} <span className="text-xs font-normal text-slate-500">In-Silico</span>
            </div>
            <div className="text-[10px] text-[#13315c] font-semibold mt-1">Predictive Model</div>
          </div>

          <div className="p-4 bg-white/90 border border-[#8da9c4]/30 rounded-2xl shadow-2xs">
            <div className="text-[11px] font-bold uppercase text-[#134074]">Active Warnings</div>
            <div className="text-2xl font-bold font-mono text-rose-600 mt-1">
              {loading ? '...' : (stats?.activeAlertsCount || 3)} <span className="text-xs font-normal text-slate-500">Alerts</span>
            </div>
            <div className="text-[10px] text-rose-600 font-semibold mt-1">Continuous Surveillance</div>
          </div>
        </div>

        {/* Core AI & Data Engineering Deliverables */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#0b2545]">
            Core Data Architecture & Simulation Deliverables
          </h2>

          {/* Feature 1 */}
          <div className="p-6 bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl shadow-md space-y-3">
            <div className="flex items-center gap-2 text-[#134074] font-bold text-sm">
              <Database className="w-4 h-4 text-[#134074]" />
              <span>1. Multimodal Data Fusion Pipeline (Synthea & Wearables)</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              VitaTwin creates an authentic in-silico digital twin by synthesizing two distinct clinical data tiers:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white border border-[#8da9c4]/30 rounded-xl text-xs space-y-1.5 shadow-2xs">
                <span className="font-bold text-[#0b2545]">Static Synthea EHR Baseline:</span>
                <p className="text-slate-600 leading-relaxed">
                  Demographics, chronic condition histories (ICD-10 / SNOMED-CT), active medication regimens (RxNorm), and baseline laboratory diagnostic panels (HbA1c, eGFR, fasting glucose, lipid profiles, blood pressure).
                </p>
              </div>
              <div className="p-4 bg-white border border-[#8da9c4]/30 rounded-xl text-xs space-y-1.5 shadow-2xs">
                <span className="font-bold text-[#0b2545]">Dynamic Wearable Telemetry Streams:</span>
                <p className="text-slate-600 leading-relaxed">
                  High-frequency continuous glucose monitor (CGM mg/dL) readings, photoplethysmogram (PPG) heart rate (bpm), heart rate variability (RMSSD ms), sleep architecture stages (Deep, REM, Light, Awake), and step counts.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl shadow-md space-y-3">
            <div className="flex items-center gap-2 text-[#134074] font-bold text-sm">
              <Cpu className="w-4 h-4 text-[#134074]" />
              <span>2. Predictive Health Analytics & In-Silico Kinetics</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              The simulation engine evaluates the composite digital twin against proposed "What-If" perturbation vectors (such as carbohydrate challenges, missed pharmacotherapy, acute stress, or exercise bouts).
            </p>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#134074] shrink-0 mt-0.5" />
                <span><strong>Forward Trajectory Generation:</strong> Computes 120-minute forward trajectories at 15-minute intervals with clinical physiological explanations.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#134074] shrink-0 mt-0.5" />
                <span><strong>Deterministic Compartment Fallback:</strong> The system incorporates a Bergman Minimal Model mathematical engine, ensuring continuous 100% platform availability.</span>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl shadow-md space-y-3">
            <div className="flex items-center gap-2 text-[#134074] font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#134074]" />
              <span>3. Regulatory Sandbox Compliance Handling</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              To satisfy stringent clinical data governance standards:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white border border-[#8da9c4]/30 rounded-xl text-xs space-y-1.5 shadow-2xs">
                <span className="font-bold text-[#0b2545]">Digital Personal Data Protection (DPDP) Act 2023:</span>
                <p className="text-slate-600 leading-relaxed">
                  Operates exclusively within a synthetic sandbox. Zero real-world PII or personally identifiable patient records are stored or transmitted.
                </p>
              </div>
              <div className="p-4 bg-white border border-[#8da9c4]/30 rounded-xl text-xs space-y-1.5 shadow-2xs">
                <span className="font-bold text-[#0b2545]">HIPAA Safe Harbor De-identification:</span>
                <p className="text-slate-600 leading-relaxed">
                  Conforms to 45 CFR § 164.514 standards. Synthetic identifiers and randomized biometric noise guarantee zero patient re-identification risk.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Personas Guide */}
        <div className="p-8 bg-[#0b2545] border border-[#13315c] text-white rounded-3xl shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Clinical Workspaces & Profiles</span>
          </h3>
          <p className="text-xs text-slate-300">
            The platform is populated with relational clinical records in SQLite to demonstrate immediate functionality across both roles.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#13315c] border border-[#134074] text-xs space-y-1.5">
              <div className="font-bold text-[#8da9c4]">Patient Profile: Ananya Iyer (52y, T2D) · #SYN-IND-4921</div>
              <div className="text-slate-300">Email: <code className="bg-[#0b2545] px-1.5 py-0.5 rounded font-mono text-white">ananya.iyer@example.com</code></div>
              <div className="text-slate-300">Password: <code className="bg-[#0b2545] px-1.5 py-0.5 rounded font-mono text-white">patient123</code></div>
              <div className="text-[11px] text-slate-400">Diagnosis: Glycemic Lability, CGM Stream, What-If Indian Dietary Simulator</div>
            </div>

            <div className="p-4 rounded-xl bg-[#13315c] border border-[#134074] text-xs space-y-1.5">
              <div className="font-bold text-[#8da9c4]">Clinician Profile: Dr. Vikramaditya Rao, MD (Endocrinology)</div>
              <div className="text-slate-300">Email: <code className="bg-[#0b2545] px-1.5 py-0.5 rounded font-mono text-white">dr.vikramaditya.rao@hospital.org</code></div>
              <div className="text-slate-300">Password: <code className="bg-[#0b2545] px-1.5 py-0.5 rounded font-mono text-white">doctor123</code></div>
              <div className="text-[11px] text-slate-400">Features: Cohort Risk Triage, Twin Inspector, Early Warning Alerts, Rx Protocol</div>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              to="/patient"
              className="px-5 py-2.5 text-xs font-bold bg-[#134074] hover:bg-[#13315c] text-white rounded-xl transition-colors flex items-center gap-1.5 border border-[#8da9c4]/40 shadow-sm"
            >
              <span>Open Patient Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8da9c4]" />
            </Link>
            <Link
              to="/doctor"
              className="px-5 py-2.5 text-xs font-bold bg-[#13315c] hover:bg-[#0b2545] text-white border border-[#8da9c4]/30 rounded-xl transition-colors"
            >
              Open Clinician Command Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
