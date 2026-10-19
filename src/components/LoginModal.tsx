import React, { useState, useEffect } from 'react';
import { X, UserCheck, Stethoscope, Lock, Mail, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'patient' | 'clinician' | 'doctor';
  onSuccess: (role: 'patient' | 'clinician') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'patient',
  onSuccess
}) => {
  const { login } = useAuth();
  const [activeRole, setActiveRole] = useState<'patient' | 'doctor'>(
    initialRole === 'clinician' || initialRole === 'doctor' ? 'doctor' : 'patient'
  );
  const [email, setEmail] = useState('ananya.iyer@example.com');
  const [password, setPassword] = useState('patient123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const targetRole = initialRole === 'clinician' || initialRole === 'doctor' ? 'doctor' : 'patient';
    setActiveRole(targetRole);
    if (targetRole === 'doctor') {
      setEmail('dr.vikramaditya.rao@hospital.org');
      setPassword('doctor123');
    } else {
      setEmail('ananya.iyer@example.com');
      setPassword('patient123');
    }
    setError(null);
  }, [initialRole, isOpen]);

  const handleRoleToggle = (role: 'patient' | 'doctor') => {
    setActiveRole(role);
    setError(null);
    if (role === 'doctor') {
      setEmail('dr.vikramaditya.rao@hospital.org');
      setPassword('doctor123');
    } else {
      setEmail('ananya.iyer@example.com');
      setPassword('patient123');
    }
  };

  const handlePatientInstantLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      try {
        await login('ananya.iyer@example.com', 'patient123');
      } catch {
        await login('elena.vance@example.com', 'patient123');
      }
      onSuccess('patient');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRajeshInstantLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login('rajesh.sharma@example.com', 'patient123');
      onSuccess('patient');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorInstantLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      try {
        await login('dr.vikramaditya.rao@hospital.org', 'doctor123');
      } catch {
        await login('dr.aris.thorne@hospital.org', 'doctor123');
      }
      onSuccess('clinician');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      onSuccess(activeRole === 'doctor' ? 'clinician' : 'patient');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b2545]/70 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-[#0b2545] border border-[#8da9c4]/40 rounded-3xl shadow-2xl overflow-hidden text-white relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-5 border-b border-[#13315c] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#134074] border border-[#8da9c4]/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#8da9c4]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Clinical Portal Authentication</h2>
              <p className="text-[11px] text-[#8da9c4]">DPDP Act 2023 Compliant In-Silico Architecture</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#13315c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Role Toggle Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#13315c] rounded-xl border border-[#134074]">
            <button
              type="button"
              onClick={() => handleRoleToggle('patient')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeRole === 'patient'
                  ? 'bg-[#134074] text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-[#8da9c4]" />
              <span>Patient Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleToggle('doctor')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                activeRole === 'doctor'
                  ? 'bg-[#134074] text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#8da9c4]" />
              <span>Clinician Command</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#8da9c4]" />
                <span>Clinical ID / Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@clinical.org"
                className="w-full px-3.5 py-2.5 bg-[#13315c] border border-[#134074] focus:border-[#8da9c4] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#8da9c4]" />
                <span>Authorization Passcode</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#13315c] border border-[#134074] focus:border-[#8da9c4] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-hidden transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#134074] hover:bg-[#0b2545] border border-[#8da9c4]/30 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Authenticating...' : 'Authenticate & Launch'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#8da9c4]" />
            </button>
          </form>

          {/* Instant Judge / Evaluator Access Buttons */}
          <div className="pt-4 border-t border-[#13315c] space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8da9c4] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#8da9c4]" />
              <span>Hackathon Evaluator Quick-Access</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={handlePatientInstantLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-3.5 bg-[#13315c] hover:bg-[#134074] border border-[#8da9c4]/40 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#8da9c4]" />
                  <span>1-Click Patient Login (Ananya Iyer)</span>
                </div>
                <span className="text-[10px] text-[#8da9c4] font-mono group-hover:text-white transition-colors">
                  #SYN-IND-4921 →
                </span>
              </button>

              <button
                type="button"
                onClick={handleRajeshInstantLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-3.5 bg-[#13315c] hover:bg-[#134074] border border-[#8da9c4]/40 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#8da9c4]" />
                  <span>1-Click Patient Login (Rajesh Sharma)</span>
                </div>
                <span className="text-[10px] text-[#8da9c4] font-mono group-hover:text-white transition-colors">
                  #SYN-IND-5192 →
                </span>
              </button>

              <button
                type="button"
                onClick={handleDoctorInstantLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-3.5 bg-[#13315c] hover:bg-[#134074] border border-[#8da9c4]/40 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-between group shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#8da9c4]" />
                  <span>1-Click Clinician Login (Dr. Vikramaditya Rao)</span>
                </div>
                <span className="text-[10px] text-[#8da9c4] font-mono group-hover:text-white transition-colors">
                  Endocrinology MD →
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
