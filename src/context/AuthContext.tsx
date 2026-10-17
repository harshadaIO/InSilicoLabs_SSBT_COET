import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, PatientProfile } from '../types';

interface AuthContextType {
  user: User | null;
  patientProfile: PatientProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  switchDemoUser: (role: 'patient' | 'doctor') => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check localStorage
    const savedToken = localStorage.getItem('vitatwin_token');
    const savedUser = localStorage.getItem('vitatwin_user');
    const savedProfile = localStorage.getItem('vitatwin_profile');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      if (savedProfile) {
        setPatientProfile(JSON.parse(savedProfile));
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
      setPatientProfile(data.patientProfile || null);

      localStorage.setItem('vitatwin_token', data.token);
      localStorage.setItem('vitatwin_user', JSON.stringify(data.user));
      if (data.patientProfile) {
        localStorage.setItem('vitatwin_profile', JSON.stringify(data.patientProfile));
      } else {
        localStorage.removeItem('vitatwin_profile');
      }

      return true;
    } catch (err) {
      console.error('[AuthContext] Login error:', err);
      throw err;
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const resData = await res.json();
      setToken(resData.token);
      setUser(resData.user);
      setPatientProfile(resData.patientProfile || null);

      localStorage.setItem('vitatwin_token', resData.token);
      localStorage.setItem('vitatwin_user', JSON.stringify(resData.user));
      if (resData.patientProfile) {
        localStorage.setItem('vitatwin_profile', JSON.stringify(resData.patientProfile));
      }

      return true;
    } catch (err) {
      console.error('[AuthContext] Register error:', err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setPatientProfile(null);
    setToken(null);
    localStorage.removeItem('vitatwin_token');
    localStorage.removeItem('vitatwin_user');
    localStorage.removeItem('vitatwin_profile');
  };

  const switchDemoUser = async (role: 'patient' | 'doctor') => {
    if (role === 'patient') {
      try {
        await login('ananya.iyer@example.com', 'patient123');
      } catch {
        await login('elena.vance@example.com', 'patient123');
      }
    } else {
      try {
        await login('dr.vikramaditya.rao@hospital.org', 'doctor123');
      } catch {
        await login('dr.aris.thorne@hospital.org', 'doctor123');
      }
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const targetId = user.role === 'patient' ? (patientProfile?.id || user.id) : '';
      const res = await fetch(`/api/patient/profile/${targetId}`);
      if (res.ok) {
        const prof = await res.json();
        setPatientProfile(prof);
        localStorage.setItem('vitatwin_profile', JSON.stringify(prof));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patientProfile,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoUser,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
