import React from 'react';
import { Activity, LogOut, ShieldCheck, Stethoscope, User } from 'lucide-react';

export type AuthRole = 'patient' | 'clinician' | null;
export type PublicView = 'overview' | 'challenge';
export type PatientSubView = 'twin' | 'simulator' | 'wearables' | 'ehr' | 'consent';
export type ClinicianSubView = 'triage' | 'inspector' | 'titration' | 'alerts' | 'protocol';

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
    <header className="sticky top-0 z-40 bg-[#0b2545] border-b border-[#13315c] text-white shadow-md w-full max-w-full overflow-x-clip">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-8 min-h-14 sm:min-h-16 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-x-2 sm:gap-x-4 gap-y-2">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-1.5 sm:gap-2.5 text-white font-bold tracking-tight text-base sm:text-lg lg:text-xl whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity focus:outline-hidden"
          title={
            authRole === 'patient'
              ? 'Go to My Digital Twin'
              : authRole === 'clinician'
              ? 'Go to Cohort Triage'
              : 'Go to VitaTwin Overview'
          }
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-lg bg-[#134074] border border-[#8da9c4]/30 flex items-center justify-center text-white shadow-inner shrink-0">
            <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-[#8da9c4]" />
          </div>
          <span className="tracking-tight text-white font-extrabold">VitaTwin</span>
        </button>

        {/* Zone 2: Navigation Links (Responsive layout: wraps cleanly into a secondary bar on md-xl screens, centers inline on xl+ screens) */}
        <nav className="hidden md:flex items-center flex-wrap justify-center xl:justify-center gap-1 sm:gap-1.5 lg:gap-2 xl:gap-2.5 text-xs lg:text-sm font-medium w-full xl:w-auto order-last xl:order-none pt-2 xl:pt-0 mt-1 xl:mt-0 border-t border-[#13315c]/60 xl:border-0 min-w-0">
          {/* STATE 1: UNAUTHENTICATED PUBLIC PORTAL */}
          {authRole === null && (
            <>
              <button
                onClick={() => onSelectPublicView('overview')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2.5 py-1 rounded-lg ${
                  publicView === 'overview'
                    ? 'text-[#8da9c4] font-semibold bg-[#13315c]/60 border-b-2 border-[#8da9c4]'
                    : 'text-slate-300 hover:bg-[#13315c]/30'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => onSelectPublicView('challenge')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2.5 py-1 rounded-lg ${
                  publicView === 'challenge'
                    ? 'text-[#8da9c4] font-semibold bg-[#13315c]/60 border-b-2 border-[#8da9c4]'
                    : 'text-slate-300 hover:bg-[#13315c]/30'
                }`}
              >
                Architecture
              </button>
            </>
          )}

          {/* STATE 2: AUTHENTICATED PATIENT PORTAL */}
          {authRole === 'patient' && (
            <>
              <button
                onClick={() => onSelectPatientSubView('twin')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 xl:px-2.5 rounded-lg ${
                  patientSubView === 'twin'
                    ? 'text-[#8da9c4] font-semibold bg-[#13315c]/60 border-b-2 border-[#8da9c4]'
                    : 'text-slate-300 hover:bg-[#13315c]/30'
                }`}
              >
                My Digital Twin
              </button>
              <button
                onClick={() => onSelectPatientSubView('simulator')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 xl:px-2.5 rounded-lg ${
                  patientSubView === 'simulator'
                    ? 'text-[#8da9c4] font-semibold bg-[#13315c]/60 border-b-2 border-[#8da9c4]'
                    : 'text-slate-300 hover:bg-[#13315c]/30'
                }`}
              >
                Lifestyle & Meal Simulator
              </button>
              <button
                onClick={() => onSelectPatientSubView('wearables')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 xl:px-2.5 rounded-lg ${
                  patientSubView === 'wearables'
                    ? 'text-[#8da9c4] font-semibold bg-[#13315c]/60 border-b-2 border-[#8da9c4]'
                    : 'text-slate-300 hover:bg-[#13315c]/30'
                }`}
              >
                Wearable Streams
              </button>
              <button
                onClick={() => onSelectPatientSubView('ehr')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 xl:px-2.5 rounded-lg ${
                  patientSubView === 'ehr'
                    ? 'text-[#8da9c4] font-semibold bg-[#13315c]/60 border-b-2 border-[#8da9c4]'
                    : 'text-slate-300 hover:bg-[#13315c]/30'
                }`}
              >
                EHR & Prescriptions
              </button>
              <button
                onClick={() => onSelectPatientSubView('consent')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 xl:px-2.5 rounded-lg flex items-center gap-1.5 ${
                  patientSubView === 'consent'
                    ? 'text-emerald-300 font-semibold bg-[#13315c]/60 border-b-2 border-emerald-400'
                    : 'text-slate-300 hover:bg-[#13315c]/30'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>DPDP Consent & Privacy</span>
              </button>
            </>
          )}

          {/* STATE 3: AUTHENTICATED CLINICIAN PORTAL */}
          {authRole === 'clinician' && (
            <>
              <button
                onClick={() => onSelectClinicianSubView('triage')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 xl:px-2.5 rounded-lg ${
                  clinicianSubView === 'triage'
                    ? 'text-[#8da9c4] font-semibold bg-[#13315c]/60 border-b-2 border-[#8da9c4]'
                    : 'text-slate-300 hover:bg-[#13315c]/30'
                }`}
              >
                Cohort Triage
              </button>
              <button
                onClick={() => onSelectClinicianSubView('inspector')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 xl:px-2.5 rounded-lg ${
                  clinicianSubView === 'inspector'
                    ? 'text-[#8da9c4] font-semibold bg-[#13315c]/60 border-b-2 border-[#8da9c4]'
                    : 'text-slate-300 hover:bg-[#13315c]/30'
                }`}
              >
                Twin Inspector
              </button>
              <button
                onClick={() => onSelectClinicianSubView('titration')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 xl:px-2.5 rounded-lg ${
                  clinicianSubView === 'titration'
                    ? 'text-[#8da9c4] font-semibold bg-[#13315c]/60 border-b-2 border-[#8da9c4]'
                    : 'text-slate-300 hover:bg-[#13315c]/30'
                }`}
              >
                Titration Simulator
              </button>
              <button
                onClick={() => onSelectClinicianSubView('alerts')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 xl:px-2.5 rounded-lg ${
                  clinicianSubView === 'alerts'
                    ? 'text-[#8da9c4] font-semibold bg-[#13315c]/60 border-b-2 border-[#8da9c4]'
                    : 'text-slate-300 hover:bg-[#13315c]/30'
                }`}
              >
                AI Early Warnings
              </button>
              <button
                onClick={() => onSelectClinicianSubView('protocol')}
                className={`whitespace-nowrap transition-colors hover:text-white px-2 py-1 xl:px-2.5 rounded-lg ${
                  clinicianSubView === 'protocol'
                    ? 'text-[#8da9c4] font-semibold bg-[#13315c]/60 border-b-2 border-[#8da9c4]'
                    : 'text-slate-300 hover:bg-[#13315c]/30'
                }`}
              >
                Protocol & Rx Engine
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Action & Session State */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
          {/* STATE 1: Unauthenticated -> Show ONLY [ Portal Sign In ] button */}
          {authRole === null && (
            <button
              onClick={() => onOpenAuthModal('patient')}
              className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white bg-[#134074] hover:bg-[#0b2545] border border-[#8da9c4]/40 rounded-xl transition-colors whitespace-nowrap shadow-sm shrink-0"
            >
              Portal Sign In
            </button>
          )}

          {/* STATE 2: Authenticated Patient -> Role badge & working Sign Out */}
          {authRole === 'patient' && (
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-[#13315c] border border-[#8da9c4]/30 rounded-xl text-xs font-semibold text-[#8da9c4] min-w-0 max-w-[100px] min-[380px]:max-w-[140px] sm:max-w-[220px] xl:max-w-none overflow-hidden">
                <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-white font-medium truncate block">
                  <span className="hidden xl:inline">Patient Portal · </span>
                  <span className="hidden sm:inline">Ananya Iyer</span>
                  <span className="sm:hidden">Ananya</span>
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors flex items-center gap-1 sm:gap-1.5 shrink-0"
                title="Sign out to Overview"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}

          {/* STATE 3: Authenticated Clinician -> Role badge & working Sign Out */}
          {authRole === 'clinician' && (
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 bg-[#13315c] border border-[#8da9c4]/30 rounded-xl text-xs font-semibold text-[#8da9c4] min-w-0 max-w-[105px] min-[380px]:max-w-[150px] sm:max-w-[260px] xl:max-w-none overflow-hidden">
                <Stethoscope className="w-3.5 h-3.5 text-[#8da9c4] shrink-0" />
                <span className="text-white font-medium truncate block">
                  <span className="hidden xl:inline">Clinician Command · </span>
                  <span className="hidden sm:inline">Dr. Vikramaditya Rao, MD</span>
                  <span className="sm:hidden">Dr. Rao</span>
                </span>
              </div>
              <button
                onClick={onSignOut}
                className="min-h-[36px] sm:min-h-[38px] px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors flex items-center gap-1 sm:gap-1.5 shrink-0"
                title="Sign out to Overview"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar (< md screens) */}
      <div className="md:hidden border-t border-[#13315c]/70 bg-[#0b2545]/95 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {authRole === null && (
          <>
            <button
              onClick={() => onSelectPublicView('overview')}
              className={`text-xs min-h-[40px] px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-colors flex items-center justify-center shrink-0 ${
                publicView === 'overview' ? 'bg-[#134074] text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => onSelectPublicView('challenge')}
              className={`text-xs min-h-[40px] px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-colors flex items-center justify-center shrink-0 ${
                publicView === 'challenge' ? 'bg-[#134074] text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Architecture
            </button>
          </>
        )}
        {authRole === 'patient' && (
          <>
            <button
              onClick={() => onSelectPatientSubView('twin')}
              className={`text-xs min-h-[40px] px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-colors flex items-center justify-center shrink-0 ${
                patientSubView === 'twin' ? 'bg-[#134074] text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Digital Twin
            </button>
            <button
              onClick={() => onSelectPatientSubView('simulator')}
              className={`text-xs min-h-[40px] px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-colors flex items-center justify-center shrink-0 ${
                patientSubView === 'simulator' ? 'bg-[#134074] text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              What-If Simulator
            </button>
            <button
              onClick={() => onSelectPatientSubView('wearables')}
              className={`text-xs min-h-[40px] px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-colors flex items-center justify-center shrink-0 ${
                patientSubView === 'wearables' ? 'bg-[#134074] text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Wearables
            </button>
            <button
              onClick={() => onSelectPatientSubView('ehr')}
              className={`text-xs min-h-[40px] px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-colors flex items-center justify-center shrink-0 ${
                patientSubView === 'ehr' ? 'bg-[#134074] text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              EHR & Rx
            </button>
            <button
              onClick={() => onSelectPatientSubView('consent')}
              className={`text-xs min-h-[40px] px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-colors flex items-center justify-center gap-1.5 shrink-0 ${
                patientSubView === 'consent' ? 'bg-[#134074] text-emerald-300 font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>DPDP Consent</span>
            </button>
          </>
        )}
        {authRole === 'clinician' && (
          <>
            <button
              onClick={() => onSelectClinicianSubView('triage')}
              className={`text-xs min-h-[40px] px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-colors flex items-center justify-center shrink-0 ${
                clinicianSubView === 'triage' ? 'bg-[#134074] text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Cohort Triage
            </button>
            <button
              onClick={() => onSelectClinicianSubView('inspector')}
              className={`text-xs min-h-[40px] px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-colors flex items-center justify-center shrink-0 ${
                clinicianSubView === 'inspector' ? 'bg-[#134074] text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Twin Inspector
            </button>
            <button
              onClick={() => onSelectClinicianSubView('titration')}
              className={`text-xs min-h-[40px] px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-colors flex items-center justify-center shrink-0 ${
                clinicianSubView === 'titration' ? 'bg-[#134074] text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Titration Sim
            </button>
            <button
              onClick={() => onSelectClinicianSubView('alerts')}
              className={`text-xs min-h-[40px] px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-colors flex items-center justify-center shrink-0 ${
                clinicianSubView === 'alerts' ? 'bg-[#134074] text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Early Warnings
            </button>
            <button
              onClick={() => onSelectClinicianSubView('protocol')}
              className={`text-xs min-h-[40px] px-3.5 py-2 rounded-xl whitespace-nowrap font-medium transition-colors flex items-center justify-center shrink-0 ${
                clinicianSubView === 'protocol' ? 'bg-[#134074] text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Protocol & Rx
            </button>
          </>
        )}
      </div>
    </header>
  );
};
