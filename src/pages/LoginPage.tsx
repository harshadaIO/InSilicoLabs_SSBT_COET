import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, UserCheck, Stethoscope, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      if (email.includes('hospital.org') || email.includes('doctor')) {
        navigate('/doctor');
      } else {
        navigate('/patient');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofillPatient = () => {
    setEmail('ananya.iyer@example.com');
    setPassword('patient123');
    setError(null);
  };

  const handleAutofillDoctor = () => {
    setEmail('dr.vikramaditya.rao@hospital.org');
    setPassword('doctor123');
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#eef4ed]">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-md border border-[#8da9c4]/30 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0b2545] border border-[#134074] flex items-center justify-center text-white mx-auto shadow-md">
            <Activity className="w-6 h-6 text-[#8da9c4]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#0b2545] tracking-tight">
            Sign in to VitaTwin
          </h2>
          <p className="text-xs text-slate-600">
            Clinical Digital Twin & Biometric Simulation Engine
          </p>
        </div>

        {/* Quick Demo Access */}
        <div className="p-3.5 bg-[#eef4ed]/70 border border-[#8da9c4]/30 rounded-2xl space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#134074] text-center">
            Quick Persona Autofill
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAutofillPatient}
              className="px-3 py-2 text-xs font-bold text-[#0b2545] bg-white hover:bg-[#eef4ed] border border-[#8da9c4]/40 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#134074]" />
              <span>Patient (Ananya)</span>
            </button>
            <button
              type="button"
              onClick={handleAutofillDoctor}
              className="px-3 py-2 text-xs font-bold text-[#0b2545] bg-white hover:bg-[#eef4ed] border border-[#8da9c4]/40 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#134074]" />
              <span>Clinician (Dr. Rao)</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0b2545] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#134074] focus:outline-none text-[#0b2545] font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0b2545] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#134074] focus:outline-none font-mono text-[#0b2545]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 text-xs font-bold text-white bg-[#134074] hover:bg-[#0b2545] rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-[#8da9c4]" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-600">
          <span>Need an account? </span>
          <Link to="/register" className="text-[#134074] font-bold hover:underline">
            Register new profile
          </Link>
        </div>
      </div>
    </div>
  );
};
