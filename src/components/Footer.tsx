import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0b2545] border-t border-[#13315c] mt-20 text-slate-300 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 text-white font-bold text-base">
              <div className="w-7 h-7 rounded-lg bg-[#134074] border border-[#8da9c4]/30 flex items-center justify-center text-white">
                <Activity className="w-4 h-4 text-[#8da9c4]" />
              </div>
              <span className="tracking-tight text-lg">VitaTwin</span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed text-xs">
              Next-generation clinical digital twin platform uniting static EHR diagnostic profiles and high-frequency wearable telemetry for proactive metabolic and cardiovascular care.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 uppercase tracking-wider text-[11px] text-[#8da9c4]">
              Platform Architecture
            </h4>
            <ul className="space-y-2 text-slate-300">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Overview</Link>
              </li>
              <li>
                <Link to="/patient" className="hover:text-white transition-colors">Patient Digital Twin</Link>
              </li>
              <li>
                <Link to="/doctor" className="hover:text-white transition-colors">Clinician Command Center</Link>
              </li>
              <li>
                <Link to="/challenge" className="hover:text-white transition-colors">System Specifications</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 uppercase tracking-wider text-[11px] text-[#8da9c4]">
              Data Standards & Privacy
            </h4>
            <div className="space-y-2 text-slate-400 text-xs">
              <div className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8da9c4] shrink-0 mt-0.5" />
                <span className="text-slate-300">DPDP Act 2023 Compliant Sandbox</span>
              </div>
              <div className="flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#8da9c4] shrink-0 mt-0.5" />
                <span className="text-slate-300">HIPAA Safe Harbor De-identified Schema</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Synthea / FHIR standard patient modeling with compartmental physiological kinetics.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#13315c] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs">
          <div>
            © 2026 VitaTwin Systems · Clinical Digital Twin Architecture.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Continuous Physiological Biometric Surveillance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
