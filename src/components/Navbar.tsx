import React from 'react';
import { Activity, LogOut, ShieldCheck, Stethoscope, User } from 'lucide-react';

export type AuthRole = 'patient' | 'clinician' | null;
export type PublicView = 'overview' | 'challenge';
export type PatientSubView = 'twin' | 'simulator' | 'wearables' | 'ehr';
export type ClinicianSubView = 'triage' | 'inspector' | 'alerts' | 'protocol';

interface NavbarProps {
  authRole: AuthRole;
  publicView: PublicView;
  onSelectPublicView: (view: PublicView) => void;
  patientSubView: PatientSubView;
  onSelectPatientSubView: (subView: PatientSubView) => void;
  clinicianSubView: ClinicianSubView;
  onSelectClinicianSubView: (subView: ClinicianSubView) => void;
  onOpenAuthModal: (role?: 'patient' | 'doctor') => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  authRole,
  publicView,
  onSelectPublicView,
  patientSubView,
  onSelectPatientSubView,
  clinicianSubView,
  onSelectClinicianSubView,
  onOpenAuthModal,
  onSignOut
}) => {
  const handleLogoClick = () => {
    if (authRole === 'patient') {
      onSelectPatientSubView('twin');
    } else if (authRole === 'clinician') {
      onSelectClinicianSubView('triage');
    } else {
      onSelectPublicView('overview');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0b2545] border-b border-[#13315c] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 text-white font-bold tracking-tight text-xl whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity focus:outline-hidden"
          title={
            authRole === 'patient'
              ? 'Go to My Digital Twin'
              : authRole === 'clinician'
              ? 'Go to Cohort Triage'
              : 'Go to VitaTwin Overview'
          }
        >
          <div className="w-8 h-8 rounded-lg bg-[#134074] border border-[#8da9c4]/30 flex items-center justify-center text-white shadow-inner">
            <Activity className="w-5 h-5 text-[#8da9c4]" />
          </div>
          <span className="tracking-tight text-white font-extrabold">VitaTwin</span>
        </button>

        {/* Zone 2: Navigation Links (Strictly separated per RBAC portal state) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {/* STATE 1: UNAUTHENTICATED PUBLIC PORTAL */}
          {authRole === null && (
            <>
              <button
                onClick={() => onSelectPublicView('overview')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 rounded-md ${
                  publicView === 'overview'
                    ? 'text-[#8da9c4] font-semibold border-b-2 border-[#8da9c4]'
                    : 'text-slate-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => onSelectPublicView('challenge')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 rounded-md ${
                  publicView === 'challenge'
                    ? 'text-[#8da9c4] font-semibold border-b-2 border-[#8da9c4]'
                    : 'text-slate-300'
                }`}
              >
                System Architecture
              </button>
            </>
          )}

          {/* STATE 2: AUTHENTICATED PATIENT PORTAL */}
          {authRole === 'patient' && (
            <>
              <button
                onClick={() => onSelectPatientSubView('twin')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 rounded-md ${
                  patientSubView === 'twin'
                    ? 'text-[#8da9c4] font-semibold border-b-2 border-[#8da9c4]'
                    : 'text-slate-300'
                }`}
              >
                My Digital Twin
              </button>
              <button
                onClick={() => onSelectPatientSubView('simulator')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 rounded-md ${
                  patientSubView === 'simulator'
                    ? 'text-[#8da9c4] font-semibold border-b-2 border-[#8da9c4]'
                    : 'text-slate-300'
                }`}
              >
                What-If Simulator
              </button>
              <button
                onClick={() => onSelectPatientSubView('wearables')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 rounded-md ${
                  patientSubView === 'wearables'
                    ? 'text-[#8da9c4] font-semibold border-b-2 border-[#8da9c4]'
                    : 'text-slate-300'
                }`}
              >
                Wearable Streams
              </button>
              <button
                onClick={() => onSelectPatientSubView('ehr')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 rounded-md ${
                  patientSubView === 'ehr'
                    ? 'text-[#8da9c4] font-semibold border-b-2 border-[#8da9c4]'
                    : 'text-slate-300'
                }`}
              >
                EHR & Prescriptions
              </button>
            </>
          )}

          {/* STATE 3: AUTHENTICATED CLINICIAN PORTAL */}
          {authRole === 'clinician' && (
            <>
              <button
                onClick={() => onSelectClinicianSubView('triage')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 rounded-md ${
                  clinicianSubView === 'triage'
                    ? 'text-[#8da9c4] font-semibold border-b-2 border-[#8da9c4]'
                    : 'text-slate-300'
                }`}
              >
                Cohort Triage
              </button>
              <button
                onClick={() => onSelectClinicianSubView('inspector')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 rounded-md ${
                  clinicianSubView === 'inspector'
                    ? 'text-[#8da9c4] font-semibold border-b-2 border-[#8da9c4]'
                    : 'text-slate-300'
                }`}
              >
                Twin Inspector
              </button>
              <button
                onClick={() => onSelectClinicianSubView('alerts')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 rounded-md ${
                  clinicianSubView === 'alerts'
                    ? 'text-[#8da9c4] font-semibold border-b-2 border-[#8da9c4]'
                    : 'text-slate-300'
                }`}
              >
                AI Early Warnings
              </button>
              <button
                onClick={() => onSelectClinicianSubView('protocol')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 rounded-md ${
                  clinicianSubView === 'protocol'
                    ? 'text-[#8da9c4] font-semibold border-b-2 border-[#8da9c4]'
                    : 'text-slate-300'
                }`}
              >
                Protocol & Rx Engine
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Action & Session State */}
        <div className="flex items-center gap-3 shrink-0">
          {/* STATE 1: Unauthenticated -> Show ONLY [ Portal Sign In ] button */}
          {authRole === null && (
            <button
              onClick={() => onOpenAuthModal('patient')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#134074] hover:bg-[#0b2545] border border-[#8da9c4]/40 rounded-xl transition-colors whitespace-nowrap shadow-sm"
            >
              Portal Sign In
            </button>
          )}

          {/* STATE 2: Authenticated Patient -> Role badge & working Sign Out */}
          {authRole === 'patient' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#13315c] border border-[#8da9c4]/30 rounded-xl text-xs font-semibold text-[#8da9c4]">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-white font-medium">Patient Portal · Ananya Iyer</span>
              </div>
              <button
                onClick={onSignOut}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors flex items-center gap-1.5"
                title="Sign out to Overview"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}

          {/* STATE 3: Authenticated Clinician -> Role badge & working Sign Out */}
          {authRole === 'clinician' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#13315c] border border-[#8da9c4]/30 rounded-xl text-xs font-semibold text-[#8da9c4]">
                <Stethoscope className="w-3.5 h-3.5 text-[#8da9c4]" />
                <span className="text-white font-medium">Clinician Command · Dr. Vikramaditya Rao, MD</span>
              </div>
              <button
                onClick={onSignOut}
                className="px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors flex items-center gap-1.5"
                title="Sign out to Overview"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
