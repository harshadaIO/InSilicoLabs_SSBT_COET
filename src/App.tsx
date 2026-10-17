import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  Navbar,
  AuthRole,
  PublicView,
  PatientSubView,
  ClinicianSubView
} from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { ChallengeDetailsPage } from './pages/ChallengeDetailsPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { LoginModal } from './components/LoginModal';

function AppContent() {
  const { logout } = useAuth();

  // STATE 1: authRole strictly defaults to null on load (UNAUTHENTICATED PUBLIC WEBSITE)
  const [authRole, setAuthRole] = useState<AuthRole>(null);

  // Portal view states
  const [publicView, setPublicView] = useState<PublicView>('overview');
  const [patientSubView, setPatientSubView] = useState<PatientSubView>('twin');
  const [clinicianSubView, setClinicianSubView] = useState<ClinicianSubView>('triage');

  // Clinician patient focus
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-ananya-iyer');

  // Authentication Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<'patient' | 'doctor'>('patient');

  // Ensure clean unauthenticated initial state
  useEffect(() => {
    if (authRole === null) {
      localStorage.removeItem('vitatwin_token');
      localStorage.removeItem('vitatwin_user');
      localStorage.removeItem('vitatwin_profile');
    }
  }, [authRole]);

  // Open login modal with role pre-selection
  const handleOpenAuthModal = (role: 'patient' | 'doctor' = 'patient') => {
    setAuthModalInitialRole(role);
    setIsAuthModalOpen(true);
  };

  // Login success -> transitions into the respective portal
  const handleLoginSuccess = (role: 'patient' | 'clinician') => {
    if (role === 'patient') {
      setAuthRole('patient');
      setPatientSubView('twin');
    } else {
      setAuthRole('clinician');
      setClinicianSubView('triage');
    }
    setIsAuthModalOpen(false);
  };

  // Sign out -> sets authRole = null and cleanly returns to public Overview landing page
  const handleSignOut = () => {
    setAuthRole(null);
    setPublicView('overview');
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eef4ed] text-slate-900 font-sans">
      {/* Dynamic RBAC Navbar */}
      <Navbar
        authRole={authRole}
        publicView={publicView}
        onSelectPublicView={setPublicView}
        patientSubView={patientSubView}
        onSelectPatientSubView={setPatientSubView}
        clinicianSubView={clinicianSubView}
        onSelectClinicianSubView={setClinicianSubView}
        onOpenAuthModal={handleOpenAuthModal}
        onSignOut={handleSignOut}
      />

      {/* Main Portal View Orchestrator */}
      <main className="flex-1">
        {/* STATE 1: UNAUTHENTICATED PUBLIC WEBSITE */}
        {authRole === null && (
          <>
            {publicView === 'overview' && (
              <LandingPage
                onOpenLoginModal={handleOpenAuthModal}
                isLoggedIn={false}
              />
            )}
            {publicView === 'challenge' && (
              <ChallengeDetailsPage />
            )}
          </>
        )}

        {/* STATE 2: AUTHENTICATED PATIENT PORTAL */}
        {authRole === 'patient' && (
          <PatientDashboard
            activeSubView={patientSubView}
            onSelectSubView={setPatientSubView}
          />
        )}

        {/* STATE 3: AUTHENTICATED CLINICIAN PORTAL */}
        {authRole === 'clinician' && (
          <DoctorDashboard
            activeSubView={clinicianSubView}
            onSelectSubView={setClinicianSubView}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
          />
        )}
      </main>

      <Footer />

      {/* Authentication Modal with 1-Click Evaluator Access */}
      <LoginModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialRole={authModalInitialRole}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
