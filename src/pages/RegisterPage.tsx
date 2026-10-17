import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, User, ArrowRight, AlertCircle, Heart } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [primaryCondition, setPrimaryCondition] = useState('Type 2 Diabetes Mellitus');
  const [age, setAge] = useState(48);
  const [gender, setGender] = useState('Female');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register({
        name,
        email,
        password,
        role,
        primaryCondition,
        age: Number(age),
        gender
      });

      if (role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/patient');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#eef4ed]">
      <div className="max-w-lg w-full bg-white/90 backdrop-blur-md border border-[#8da9c4]/30 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0b2545] border border-[#134074] flex items-center justify-center text-white mx-auto shadow-md">
            <Activity className="w-6 h-6 text-[#8da9c4]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#0b2545] tracking-tight">
            Create VitaTwin Account
          </h2>
          <p className="text-xs text-slate-600">
            Generate an in-silico patient digital twin or join as a clinician
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Segmented Selector */}
          <div>
            <label className="block text-xs font-bold text-[#0b2545] mb-1.5">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#eef4ed] border border-[#8da9c4]/30 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                  role === 'patient'
                    ? 'bg-[#134074] text-white shadow-xs'
                    : 'text-[#0b2545] hover:bg-white/60'
                }`}
              >
                Patient (Digital Twin)
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                  role === 'doctor'
                    ? 'bg-[#134074] text-white shadow-xs'
                    : 'text-[#0b2545] hover:bg-white/60'
                }`}
              >
                Clinician / Physician
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0b2545] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Jordan Taylor or Maria Gonzalez"
                required
                className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#134074] focus:outline-none text-[#0b2545] font-medium"
              />
            </div>
          </div>

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
                placeholder="At least 6 characters"
                required
                className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#134074] focus:outline-none font-mono text-[#0b2545]"
              />
            </div>
          </div>

          {/* Patient-specific parameters */}
          {role === 'patient' && (
            <div className="p-4 bg-[#eef4ed]/70 border border-[#8da9c4]/30 rounded-2xl space-y-3">
              <div className="text-[11px] font-bold uppercase text-[#134074] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#134074]" />
                <span>Initial Digital Twin Baseline</span>
              </div>

              <div>
                <label className="block text-xs text-[#0b2545] font-semibold mb-1">
                  Primary Metabolic Diagnosis
                </label>
                <select
                  value={primaryCondition}
                  onChange={(e) => setPrimaryCondition(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#134074] focus:outline-none text-[#0b2545]"
                >
                  <option value="Type 2 Diabetes Mellitus">Type 2 Diabetes Mellitus</option>
                  <option value="Prediabetes & Insulin Resistance">Prediabetes & Insulin Resistance</option>
                  <option value="Essential Hypertension Stage 1">Essential Hypertension Stage 1</option>
                  <option value="Metabolic Syndrome & Dyslipidemia">Metabolic Syndrome & Dyslipidemia</option>
                  <option value="Gestational Diabetes History">Gestational Diabetes History</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#0b2545] font-semibold mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    min={18}
                    max={95}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white font-mono text-[#0b2545]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#0b2545] font-semibold mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white text-[#0b2545]"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 text-xs font-bold text-white bg-[#134074] hover:bg-[#0b2545] rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
          >
            <span>{isLoading ? 'Initializing Digital Twin...' : 'Register Profile'}</span>
            <ArrowRight className="w-4 h-4 text-[#8da9c4]" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-600">
          <span>Already have an account? </span>
          <Link to="/login" className="text-[#134074] font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
