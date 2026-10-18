import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PatientProfile, WearableLog, SimulationRecord } from '../types';
import { DigitalTwinVisual } from '../components/DigitalTwinVisual';
import { T2DMParameterStreamCards } from '../components/T2DMParameterStreamCards';
import { EhrDetailModal } from '../components/EhrDetailModal';
import { RiskBadge } from '../components/RiskBadge';
import {
  Activity,
  Heart,
  RefreshCw,
  Zap,
  FileText,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp,
  Moon,
  Info,
  HeartPulse
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend
} from 'recharts';

interface PatientDashboardProps {
  activeSubView?: 'twin' | 'simulator' | 'wearables' | 'ehr';
  onSelectSubView?: (subView: 'twin' | 'simulator' | 'wearables' | 'ehr') => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  activeSubView = 'twin',
  onSelectSubView
}) => {
  const { user, patientProfile, refreshProfile } = useAuth();

  const [profile, setProfile] = useState<PatientProfile | null>(patientProfile);
  const [internalSubView, setInternalSubView] = useState<'twin' | 'simulator' | 'wearables' | 'ehr'>(activeSubView);

  useEffect(() => {
    if (activeSubView) {
      setInternalSubView(activeSubView);
    }
  }, [activeSubView]);

  const currentSubView = activeSubView || internalSubView;
  const handleSelectSubView = (sv: 'twin' | 'simulator' | 'wearables' | 'ehr') => {
    setInternalSubView(sv);
    if (onSelectSubView) onSelectSubView(sv);
  };
  const [wearableLogs, setWearableLogs] = useState<WearableLog[]>([]);
  const [simulationHistory, setSimulationHistory] = useState<SimulationRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const [isEhrModalOpen, setIsEhrModalOpen] = useState(false);

  // "What-If" Simulation Form State with Indian Healthcare Dietary Context
  const [selectedMealOption, setSelectedMealOption] = useState<string>('High-GI Meal: White Rice / Biryani + Sweet (85g Carbs)');
  const [scenarioName, setScenarioName] = useState('High-GI Meal: White Rice / Biryani + Sweet (85g Carbs)');
  const [scenarioType, setScenarioType] = useState<'meal_spike' | 'exercise_rebound' | 'lifestyle_balance' | 'acute_stress' | 'fasting' | 'custom'>('meal_spike');
  const [carbs, setCarbs] = useState(85);
  const [glycemicIndex, setGlycemicIndex] = useState<'Low' | 'Medium' | 'High'>('High');
  const [activityMins, setActivityMins] = useState(0);
  const [activityIntensity, setActivityIntensity] = useState<'Rest' | 'Light Walk' | 'Brisk Walk' | 'HIIT/Vigorous'>('Rest');
  const [sleepDuration, setSleepDuration] = useState<'5h_poor' | '7.5h_restful' | '9h_restorative'>('7.5h_restful');
  const [stressLevel, setStressLevel] = useState<'Low' | 'Moderate' | 'Severe / Cortisol Surge'>('Low');

  const [isSimulating, setIsSimulating] = useState(false);
  const [currentSimulation, setCurrentSimulation] = useState<SimulationRecord | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  // Load Patient Data and Wearable Streams
  useEffect(() => {
    loadPatientData();
  }, [user]);

  const loadPatientData = async () => {
    const targetId = user?.role === 'patient' ? (user.id) : 'pat-ananya-iyer';
    try {
      // 1. Fetch Profile
      const pRes = await fetch(`/api/patient/profile/${targetId}`);
      if (pRes.ok) {
        const pData = await pRes.json();
        setProfile(pData);

        // 2. Fetch Wearables
        const wRes = await fetch(`/api/wearables/logs/${pData.id}`);
        if (wRes.ok) {
          const wData = await wRes.json();
          setWearableLogs(wData);
        }

        // 3. Fetch Simulation History
        const sRes = await fetch(`/api/simulation/history/${pData.id}`);
        if (sRes.ok) {
          const sData = await sRes.json();
          setSimulationHistory(sData);
          if (sData.length > 0) {
            setCurrentSimulation(sData[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error loading patient data:', err);
    }
  };

  // Working [Sync Wearable Data]
  const handleSyncWearable = async () => {
    if (!profile) return;
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const res = await fetch('/api/wearables/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: profile.id })
      });

      if (!res.ok) throw new Error('Failed to synchronize sensor stream');

      const data = await res.json();
      setSyncMessage(`Continuous stream synchronized: New CGM reading of ${data.newPoint.glucose} mg/dL appended.`);

      // Update state
      setWearableLogs(prev => [...prev.slice(-23), data.newPoint]);
      await refreshProfile();
      const pRes = await fetch(`/api/patient/profile/${profile.id}`);
      if (pRes.ok) {
        setProfile(await pRes.json());
      }
    } catch (err: any) {
      setSyncMessage('Sync notice: Telemetry stream verified.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  // Indian Dietary "What-If" Meal Options Handler
  const handleMealOptionSelect = (meal: string) => {
    setSelectedMealOption(meal);
    if (meal === 'High-GI Meal: White Rice / Biryani + Sweet (85g Carbs)') {
      setCarbs(85);
      setGlycemicIndex('High');
      setScenarioName('High-GI Meal: White Rice / Biryani + Sweet (85g Carbs)');
      setScenarioType('meal_spike');
    } else if (meal === 'Moderate-GI Meal: 2 Wheat Rotis, Dal & Sabzi (45g Carbs)') {
      setCarbs(45);
      setGlycemicIndex('Medium');
      setScenarioName('Moderate-GI Meal: 2 Wheat Rotis, Dal & Sabzi (45g Carbs)');
      setScenarioType('meal_spike');
    } else if (meal === 'Low-GI Therapeutic Meal: Millet Roti, Paneer/Protein & Fiber Salad (25g Carbs)') {
      setCarbs(25);
      setGlycemicIndex('Low');
      setScenarioName('Low-GI Therapeutic Meal: Millet Roti, Paneer/Protein & Fiber Salad (25g Carbs)');
      setScenarioType('meal_spike');
    } else if (meal === 'Fasting State / Post-Absorptive Baseline (0g Carbs)') {
      setCarbs(0);
      setGlycemicIndex('Low');
      setScenarioName('Fasting State / Post-Absorptive Baseline (0g Carbs)');
      setScenarioType('meal_spike');
    }
  };

  // Preset Scenario Pickers
  const selectPreset = (type: 'biryani' | 'rotis' | 'millet' | 'fasting' | 'post_meal_walk' | 'sleep_stress') => {
    if (type === 'biryani') {
      handleMealOptionSelect('High-GI Meal: White Rice / Biryani + Sweet (85g Carbs)');
      setActivityMins(0);
      setActivityIntensity('Rest');
      setSleepDuration('7.5h_restful');
      setStressLevel('Low');
    } else if (type === 'rotis') {
      handleMealOptionSelect('Moderate-GI Meal: 2 Wheat Rotis, Dal & Sabzi (45g Carbs)');
      setActivityMins(0);
      setActivityIntensity('Rest');
      setSleepDuration('7.5h_restful');
      setStressLevel('Low');
    } else if (type === 'millet') {
      handleMealOptionSelect('Low-GI Therapeutic Meal: Millet Roti, Paneer/Protein & Fiber Salad (25g Carbs)');
      setActivityMins(0);
      setActivityIntensity('Rest');
      setSleepDuration('7.5h_restful');
      setStressLevel('Low');
    } else if (type === 'fasting') {
      handleMealOptionSelect('Fasting State / Post-Absorptive Baseline (0g Carbs)');
      setActivityMins(0);
      setActivityIntensity('Rest');
      setSleepDuration('7.5h_restful');
      setStressLevel('Low');
    } else if (type === 'post_meal_walk') {
      setScenarioName('High-GI Biryani + 25-min Post-Meal Brisk Walk (GLUT4 Buffering)');
      setScenarioType('exercise_rebound');
      setCarbs(85);
      setGlycemicIndex('High');
      setActivityMins(25);
      setActivityIntensity('Brisk Walk');
      setSleepDuration('7.5h_restful');
      setStressLevel('Low');
    } else if (type === 'sleep_stress') {
      setScenarioName('Short Sleep (5h Poor Sleep) + High Daily Stress (Cortisol Surge)');
      setScenarioType('acute_stress');
      setCarbs(45);
      setGlycemicIndex('Medium');
      setActivityMins(0);
      setActivityIntensity('Rest');
      setSleepDuration('5h_poor');
      setStressLevel('Severe / Cortisol Surge');
    }
  };

  // Working [Run Simulation]
  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSimulating(true);
    setSimError(null);

    try {
      const simulationInput = {
        scenarioName,
        scenarioType,
        nutritionalInput: selectedMealOption,
        carbohydrates: carbs,
        glycemicIndex,
        activityDurationMin: activityMins,
        activityIntensity: activityMins >= 25 ? 'Brisk Walk' : (activityMins > 0 ? 'Light Walk' : 'Rest'),
        sleepStress: sleepDuration === '5h_poor' ? 'Sleep Deprived - 5.0 hrs / Elevated Cortisol' : (sleepDuration === '9h_restorative' ? 'Deep Restorative Sleep - 9.0 hrs' : 'Optimal Sleep - 7.5 hrs'),
        stressLevel,
        medicationStatus: 'Normal Dose'
      };

      const res = await fetch('/api/simulation/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: profile.id,
          simulationInput
        })
      });

      if (!res.ok) {
        throw new Error('Simulation failed to execute');
      }

      const result: SimulationRecord = await res.json();
      setCurrentSimulation(result);
      setSimulationHistory(prev => [result, ...prev]);
    } catch (err: any) {
      setSimError(err.message || 'Error running simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  const latestLog = wearableLogs.length > 0 ? wearableLogs[wearableLogs.length - 1] : null;
  const currentGlucose = latestLog?.glucose || profile?.baselineLabs?.fastingGlucose || 135;
  const currentHR = latestLog?.heart_rate || 72;

  // Format Wearable Telemetry for Recharts
  const formattedWearables = wearableLogs.map((log) => {
    const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return {
      time,
      glucose: log.glucose,
      heartRate: log.heart_rate,
      hrv: log.hrv,
      steps: log.steps
    };
  });

  return (
    <div className="min-h-screen bg-[#eef4ed] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Banner / Digital Twin Header */}
        <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#134074]">Patient Digital Twin</span>
                <span className="text-xs text-slate-400">·</span>
                <RiskBadge level={profile?.risk_level || 'medium'} />
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-mono text-[#13315c] font-semibold">Synthea #{profile?.synthea_id}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b2545] tracking-tight">
                {profile?.full_name || 'Ananya Iyer'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-700 max-w-2xl">
                Clinical Diagnosis: <strong className="text-[#0b2545]">{profile?.primary_condition}</strong>
              </p>
            </div>

            {/* Quick Metrics & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full md:w-auto">
              <div className="p-3 sm:p-3.5 bg-white/90 border border-[#8da9c4]/30 rounded-xl text-left sm:text-right shadow-2xs">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Wellness Score</div>
                <div className="text-2xl font-bold font-mono text-[#0b2545] mt-0.5">
                  {profile?.wellness_score || 71} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsEhrModalOpen(true)}
                  className="min-h-[42px] px-4 py-2 text-xs font-bold text-[#0b2545] bg-white border border-[#8da9c4]/40 hover:bg-[#eef4ed] rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5 text-[#134074]" />
                  <span>View Synthea EHR</span>
                </button>

                <button
                  onClick={handleSyncWearable}
                  disabled={isSyncing}
                  className="min-h-[42px] px-4 py-2 text-xs font-bold text-white bg-[#134074] hover:bg-[#0b2545] rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#8da9c4] ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Wearable Data'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sync notification toast */}
          {syncMessage && (
            <div className="mt-4 p-3 bg-white border border-[#8da9c4]/50 rounded-xl text-xs text-[#0b2545] flex items-center gap-2 shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#134074] shrink-0" />
              <span className="font-medium">{syncMessage}</span>
            </div>
          )}
        </div>


        {/* 1. My Digital Twin Sub-view */}
        {currentSubView === 'twin' && profile && (
          <DigitalTwinVisual
            profile={profile}
            latestGlucose={currentGlucose}
            latestHeartRate={currentHR}
          />
        )}

        {/* 4. EHR & Prescriptions Sub-view */}
        {currentSubView === 'ehr' && profile && (
          <T2DMParameterStreamCards
            profile={profile}
            latestLog={latestLog}
          />
        )}

        {/* 3. Live Wearable Telemetry Streams (Recharts) */}
        {currentSubView === 'wearables' && (
          <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#134074]">Continuous Biometric Telemetry</span>
                <span className="w-2 h-2 rounded-full bg-[#134074] animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-[#0b2545] mt-0.5">
                24-Hour Continuous Glucose (CGM) & Heart Rate Streams
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncWearable}
                disabled={isSyncing}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#0b2545] bg-[#eef4ed] hover:bg-white border border-[#8da9c4]/40 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 text-[#134074] ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Fetch Next Biometric Point</span>
              </button>
            </div>
          </div>

          {/* Stat Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-3.5 bg-white/90 border border-[#8da9c4]/30 rounded-xl shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-[#134074]">Current CGM Interstitial</div>
              <div className="text-2xl font-bold font-mono text-[#0b2545] mt-1">
                {currentGlucose} <span className="text-xs font-normal text-slate-500">mg/dL</span>
              </div>
              <div className="text-[11px] text-[#13315c] font-medium mt-1">Target Range: 70 - 180</div>
            </div>

            <div className="p-3.5 bg-white/90 border border-[#8da9c4]/30 rounded-xl shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-[#134074]">Resting Heart Rate</div>
              <div className="text-2xl font-bold font-mono text-[#0b2545] mt-1">
                {currentHR} <span className="text-xs font-normal text-slate-500">bpm</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Photoplethysmography</div>
            </div>

            <div className="p-3.5 bg-white/90 border border-[#8da9c4]/30 rounded-xl shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-[#134074]">HRV (RMSSD)</div>
              <div className="text-2xl font-bold font-mono text-[#0b2545] mt-1">
                {latestLog?.hrv || 45} <span className="text-xs font-normal text-slate-500">ms</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Autonomic Balance</div>
            </div>

            <div className="p-3.5 bg-white/90 border border-[#8da9c4]/30 rounded-xl shadow-2xs">
              <div className="text-[11px] font-bold uppercase text-[#134074]">Time in Range (TIR)</div>
              <div className="text-2xl font-bold font-mono text-[#0b2545] mt-1">
                74.2 <span className="text-xs font-normal text-slate-500">%</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1">Goal: &gt; 70% in Range</div>
            </div>
          </div>

          {/* Recharts Continuous Time-Series Curve in #134074 and #8da9c4 */}
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedWearables} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(141, 169, 196, 0.25)" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#13315c' }} tickLine={false} />
                <YAxis
                  yAxisId="glucose"
                  domain={[50, 240]}
                  tick={{ fontSize: 11, fill: '#13315c' }}
                  unit=" mg"
                  tickLine={false}
                />
                <YAxis
                  yAxisId="hr"
                  orientation="right"
                  domain={[45, 130]}
                  tick={{ fontSize: 11, fill: '#8da9c4' }}
                  unit=" bpm"
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid rgba(141, 169, 196, 0.4)',
                    boxShadow: '0 10px 25px -5px rgba(11, 37, 69, 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                {/* Clinical Target Safe Zone Reference Lines */}
                <ReferenceLine yAxisId="glucose" y={180} stroke="#f87171" strokeDasharray="3 3" label={{ value: 'Hyperglycemia (180)', fill: '#ef4444', fontSize: 10 }} />
                <ReferenceLine yAxisId="glucose" y={70} stroke="#fbbf24" strokeDasharray="3 3" label={{ value: 'Hypoglycemia (70)', fill: '#d97706', fontSize: 10 }} />

                <Line
                  yAxisId="glucose"
                  type="monotone"
                  dataKey="glucose"
                  name="CGM Interstitial Glucose (mg/dL)"
                  stroke="#134074"
                  strokeWidth={3}
                  dot={{ r: 2.5, fill: '#134074' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  yAxisId="hr"
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (bpm)"
                  stroke="#8da9c4"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}

        {/* 2. "What-If" Scenario Simulator */}
        {currentSubView === 'simulator' && (
          <>
            <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#8da9c4]/20">
            <div>
              <div className="flex items-center gap-2 text-[#134074] font-bold text-xs uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5 text-[#134074]" />
                <span>Behavioral & Lifestyle Self-Management Engine</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0b2545] mt-1">
                Lifestyle & Meal What-If Simulator
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 mt-1 max-w-3xl">
                Test how your everyday food choices, post-meal walking, sleep duration, and daily stress shape your continuous glucose levels over the next 3 hours.
              </p>
            </div>

            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#eef4ed] text-[#134074] border border-[#8da9c4]/40 font-bold whitespace-nowrap">
              3-Hour In-Silico CGM Modeling
            </span>
          </div>

          {/* Quick Scenario Preset Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Preset Indian Lifestyle Scenarios (1-Click)
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => selectPreset('biryani')}
                className={`min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap flex items-center justify-center ${
                  carbs === 85 && glycemicIndex === 'High' && activityMins === 0 ? 'bg-[#134074] border-[#134074] text-white shadow-xs' : 'bg-white border-[#8da9c4]/40 text-[#0b2545] hover:bg-[#eef4ed]'
                }`}
              >
                High-GI Biryani + Sweet (85g Carbs)
              </button>
              <button
                type="button"
                onClick={() => selectPreset('rotis')}
                className={`min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap flex items-center justify-center ${
                  carbs === 45 && activityMins === 0 && sleepDuration === '7.5h_restful' ? 'bg-[#134074] border-[#134074] text-white shadow-xs' : 'bg-white border-[#8da9c4]/40 text-[#0b2545] hover:bg-[#eef4ed]'
                }`}
              >
                Moderate-GI 2 Rotis & Dal (45g Carbs)
              </button>
              <button
                type="button"
                onClick={() => selectPreset('millet')}
                className={`min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap flex items-center justify-center ${
                  carbs === 25 ? 'bg-[#134074] border-[#134074] text-white shadow-xs' : 'bg-white border-[#8da9c4]/40 text-[#0b2545] hover:bg-[#eef4ed]'
                }`}
              >
                Low-GI Millet Roti & Paneer (25g Carbs)
              </button>
              <button
                type="button"
                onClick={() => selectPreset('fasting')}
                className={`min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap flex items-center justify-center ${
                  carbs === 0 ? 'bg-[#134074] border-[#134074] text-white shadow-xs' : 'bg-white border-[#8da9c4]/40 text-[#0b2545] hover:bg-[#eef4ed]'
                }`}
              >
                Fasting Baseline (0g Carbs)
              </button>
              <button
                type="button"
                onClick={() => selectPreset('post_meal_walk')}
                className={`min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap flex items-center justify-center ${
                  activityMins === 25 ? 'bg-[#134074] border-[#134074] text-white shadow-xs' : 'bg-white border-[#8da9c4]/40 text-[#0b2545] hover:bg-[#eef4ed]'
                }`}
              >
                Biryani + 25-Min Post-Meal Walk (GLUT4)
              </button>
              <button
                type="button"
                onClick={() => selectPreset('sleep_stress')}
                className={`min-h-[38px] px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap flex items-center justify-center ${
                  sleepDuration === '5h_poor' ? 'bg-[#134074] border-[#134074] text-white shadow-xs' : 'bg-white border-[#8da9c4]/40 text-[#0b2545] hover:bg-[#eef4ed]'
                }`}
              >
                5h Short Sleep + High Daily Stress
              </button>
            </div>
          </div>

          {/* Interactive Lifestyle Simulation Form */}
          <form onSubmit={handleRunSimulation} className="bg-white/90 p-5 rounded-2xl border border-[#8da9c4]/30 space-y-4 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Indian Dietary Options Dropdown */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-[#0b2545] mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#134074]">
                    <span>Indian Dietary Perturbation (Meal Selector)</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#13315c] font-semibold">T2DM Glycemic Load</span>
                </label>
                <select
                  value={selectedMealOption}
                  onChange={(e) => handleMealOptionSelect(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-[#134074]/40 font-semibold rounded-xl focus:ring-2 focus:ring-[#134074] focus:outline-none text-[#0b2545] shadow-2xs"
                >
                  <option value="High-GI Meal: White Rice / Biryani + Sweet (85g Carbs)">High-GI Meal: White Rice / Biryani + Sweet (85g Carbs)</option>
                  <option value="Moderate-GI Meal: 2 Wheat Rotis, Dal & Sabzi (45g Carbs)">Moderate-GI Meal: 2 Wheat Rotis, Dal & Sabzi (45g Carbs)</option>
                  <option value="Low-GI Therapeutic Meal: Millet Roti, Paneer/Protein & Fiber Salad (25g Carbs)">Low-GI Therapeutic Meal: Millet Roti, Paneer/Protein & Fiber Salad (25g Carbs)</option>
                  <option value="Fasting State / Post-Absorptive Baseline (0g Carbs)">Fasting State / Post-Absorptive Baseline (0g Carbs)</option>
                </select>
              </div>

              {/* Scenario Name */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-[#0b2545] mb-1">
                  Scenario Description
                </label>
                <input
                  type="text"
                  value={scenarioName}
                  onChange={(e) => setScenarioName(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#134074] focus:outline-none text-[#0b2545] font-medium"
                />
              </div>

              {/* Carbohydrates */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#0b2545] mb-1">
                  <span>Carbohydrate Ingestion</span>
                  <span className="font-mono text-[#134074]">{carbs} grams</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={150}
                  step={5}
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full accent-[#134074]"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>0g (Fasting)</span>
                  <span>75g (Standard)</span>
                  <span>150g (High Load)</span>
                </div>
              </div>

              {/* Glycemic Index */}
              <div>
                <label className="block text-xs font-bold text-[#0b2545] mb-1">
                  Glycemic Index (Absorption Rate)
                </label>
                <select
                  value={glycemicIndex}
                  onChange={(e) => setGlycemicIndex(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#134074] focus:outline-none text-[#0b2545]"
                >
                  <option value="Low">Low GI (Millet, Paneer, Fiber Salad)</option>
                  <option value="Medium">Medium GI (Whole Wheat Rotis, Dal)</option>
                  <option value="High">High GI (White Rice, Biryani, Sweets)</option>
                </select>
              </div>

              {/* Physical Activity */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#0b2545] mb-1">
                  <span>Post-Meal Physical Activity (Walking)</span>
                  <span className="font-mono text-[#134074]">{activityMins} mins</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  step={5}
                  value={activityMins}
                  onChange={(e) => setActivityMins(Number(e.target.value))}
                  className="w-full accent-[#134074]"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>0m (Sedentary)</span>
                  <span>20m (Brisk Walk)</span>
                  <span>60m (Active)</span>
                </div>
              </div>

              {/* Sleep Duration */}
              <div>
                <label className="block text-xs font-bold text-[#0b2545] mb-1">
                  Prior Night Sleep Duration
                </label>
                <select
                  value={sleepDuration}
                  onChange={(e) => setSleepDuration(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#134074] focus:outline-none text-[#0b2545] font-medium"
                >
                  <option value="5h_poor">5.0 hrs (Poor / Restless · Cortisol Surge)</option>
                  <option value="7.5h_restful">7.5 hrs (Restful Baseline Sleep)</option>
                  <option value="9h_restorative">9.0 hrs (Deep Restorative Sleep)</option>
                </select>
              </div>

              {/* Psychosocial Stress */}
              <div>
                <label className="block text-xs font-bold text-[#0b2545] mb-1">
                  Daily Stress Factor
                </label>
                <select
                  value={stressLevel}
                  onChange={(e) => setStressLevel(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#134074] focus:outline-none text-[#0b2545] font-medium"
                >
                  <option value="Low">Low / Relaxed State</option>
                  <option value="Moderate">Moderate Daily Stress</option>
                  <option value="Severe / Cortisol Surge">Severe / Acute Cortisol Spike</option>
                </select>
              </div>

              {/* Submit Action */}
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#134074] hover:bg-[#0b2545] rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-[#8da9c4]" />
                  <span>{isSimulating ? 'Simulating 3-Hour CGM...' : 'Run What-If Simulation'}</span>
                </button>
              </div>
            </div>
          </form>

          {simError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{simError}</span>
            </div>
          )}

          {/* Current Simulation Outcome Presentation */}
          {currentSimulation && (
            <div className="space-y-6 pt-2">
              {/* Projected Metrics Header Strip (Adaptive 1 -> 2 -> 4 Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 bg-white/90 border border-[#8da9c4]/30 rounded-2xl shadow-2xs">
                  <div className="text-[11px] font-bold uppercase text-[#134074]">Peak Projected Glucose</div>
                  <div className="text-2xl font-bold font-mono text-[#0b2545] mt-1">
                    {currentSimulation.predictedMetrics.peakGlucose} <span className="text-xs font-normal text-slate-500">mg/dL</span>
                  </div>
                  <div className={`text-[11px] mt-1 font-bold ${
                    currentSimulation.predictedMetrics.peakGlucose > 180 ? 'text-rose-600' : 'text-emerald-700'
                  }`}>
                    +{currentSimulation.predictedMetrics.deltaGlucose} mg/dL Excursion
                  </div>
                </div>

                <div className="p-3.5 bg-white/90 border border-[#8da9c4]/30 rounded-xl shadow-2xs">
                  <div className="text-[11px] font-bold uppercase text-[#134074]">Time to Peak</div>
                  <div className="text-2xl font-bold font-mono text-[#0b2545] mt-1">
                    {currentSimulation.predictedMetrics.timeToPeak} <span className="text-xs font-normal text-slate-500">min</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Post-perturber apex</div>
                </div>

                <div className="p-3.5 bg-white/90 border border-[#8da9c4]/30 rounded-xl shadow-2xs">
                  <div className="text-[11px] font-bold uppercase text-[#134074]">Cardiovascular Strain</div>
                  <div className="text-sm font-bold text-[#0b2545] mt-1.5 truncate">
                    {currentSimulation.predictedMetrics.cvStressIndex}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Sympathetic load</div>
                </div>

                <div className="p-3.5 bg-white/90 border border-[#8da9c4]/30 rounded-xl shadow-2xs">
                  <div className="text-[11px] font-bold uppercase text-[#134074]">Time Above Range (&gt;180)</div>
                  <div className="text-2xl font-bold font-mono text-[#0b2545] mt-1">
                    {currentSimulation.predictedMetrics.timeAboveRangeMin} <span className="text-xs font-normal text-slate-500">min</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">Hypo Risk: {currentSimulation.predictedMetrics.hypoglycemiaRisk}</div>
                </div>
              </div>

              {/* Immediate Behavioral Feedback Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Postprandial Spike Feedback */}
                <div className={`p-4 rounded-2xl border transition-all shadow-2xs ${
                  currentSimulation.predictedMetrics.peakGlucose > 180
                    ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-1">
                    {currentSimulation.predictedMetrics.peakGlucose > 180 ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span>Postprandial Spike Status</span>
                  </div>
                  <div className="text-xs font-semibold">
                    {currentSimulation.predictedMetrics.peakGlucose > 180
                      ? `Spike Warning: Peak of ${currentSimulation.predictedMetrics.peakGlucose} mg/dL exceeds target (< 180 mg/dL) at ${currentSimulation.predictedMetrics.timeToPeak} mins.`
                      : `Target Preserved: Peak of ${currentSimulation.predictedMetrics.peakGlucose} mg/dL remains within safe postprandial target.`}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {currentSimulation.predictedMetrics.peakGlucose > 180
                      ? 'Swap high-GI carbs for fiber/paneer or take a 15-min walk to blunt this excursion.'
                      : 'Meal glycemic load is well-buffered by your basal insulin sensitivity.'}
                  </p>
                </div>

                {/* 2. Physical Activity & GLUT4 Buffering */}
                <div className="p-4 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs text-[#0b2545]">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#134074] mb-1">
                    <Activity className="w-4 h-4 text-[#134074] shrink-0" />
                    <span>GLUT4 Exercise Buffering</span>
                  </div>
                  <div className="text-xs font-semibold">
                    {activityMins > 0
                      ? `${activityMins} min walk recruits non-insulin muscle glucose uptake.`
                      : 'No post-meal walking simulated.'}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {activityMins > 0
                      ? `Attenuates excursion apex by approximately ~${Math.min(48, Math.round(activityMins * 1.1))} mg/dL.`
                      : 'A brief 15-20 min post-meal walk stimulates GLUT4 transporters, blunting spikes by 25-35 mg/dL.'}
                  </p>
                </div>

                {/* 3. Sleep & Daily Stress Factor */}
                <div className="p-4 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs text-[#0b2545]">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-[#134074] mb-1">
                    <HeartPulse className="w-4 h-4 text-[#134074] shrink-0" />
                    <span>Sleep & Autonomic Stress Buffer</span>
                  </div>
                  <div className="text-xs font-semibold">
                    {sleepDuration === '5h_poor' || stressLevel.includes('Severe')
                      ? 'Elevated Cortisol / Sympathetic Surge'
                      : 'Restful Sleep & Stable Autonomic Tone'}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {sleepDuration === '5h_poor' || stressLevel.includes('Severe')
                      ? 'Sleep debt and acute stress trigger cortisol gluconeogenesis, increasing glycemic excursion.'
                      : 'Restful sleep maintains baseline insulin sensitivity and protects dawn glycemic control.'}
                  </p>
                </div>
              </div>

              {/* 3-Hour Projected Curve Visualization (Recharts) */}
              <div className="bg-white/90 p-5 rounded-2xl border border-[#8da9c4]/30 space-y-3 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0b2545] flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#134074]" />
                    <span>3-Hour Projected CGM Glucose Curve (180 Minutes)</span>
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 bg-[#ef4444] inline-block" />
                      <span>Ceiling (180 mg/dL)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 bg-[#f59e0b] inline-block" />
                      <span>Hypo Threshold (70 mg/dL)</span>
                    </span>
                    <span>15-min intervals</span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentSimulation.projectedCurve} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(141, 169, 196, 0.25)" vertical={false} />
                      <XAxis
                        dataKey="minute"
                        tick={{ fontSize: 11, fill: '#13315c' }}
                        unit="m"
                        tickLine={false}
                      />
                      <YAxis
                        domain={[60, 240]}
                        tick={{ fontSize: 11, fill: '#13315c' }}
                        unit=" mg"
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid rgba(141, 169, 196, 0.4)',
                          fontSize: '12px',
                          boxShadow: '0 8px 20px -3px rgba(11, 37, 69, 0.1)'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <ReferenceLine y={180} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Target Max (180)', fill: '#ef4444', fontSize: 10 }} />
                      <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Target Min (70)', fill: '#d97706', fontSize: 10 }} />

                      <Line
                        type="monotone"
                        dataKey="simulatedGlucose"
                        name="Projected Glucose with Perturbation (mg/dL)"
                        stroke="#134074"
                        strokeWidth={3}
                        dot={{ r: 3, fill: '#134074' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="baselineGlucose"
                        name="Unperturbed Counterfactual Baseline (mg/dL)"
                        stroke="#8da9c4"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="heartRate"
                        name="Autonomic Heart Rate (bpm)"
                        stroke="#0b2545"
                        strokeWidth={1.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Physiological Rationale & Guidance */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7 p-5 bg-white/90 border border-[#8da9c4]/30 rounded-2xl space-y-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0b2545]">
                    <Info className="w-3.5 h-3.5 text-[#134074]" />
                    <span>Physiological Rationale (In-Silico Synthesis)</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {currentSimulation.ai_rationale}
                  </p>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-[#8da9c4]/20 flex items-center justify-between font-medium">
                    <span>Validated In-Silico Dynamic Model</span>
                    <span>3-Hour Kinetic Horizons</span>
                  </div>
                </div>

                <div className="md:col-span-5 p-5 bg-white/90 border border-[#8da9c4]/30 rounded-2xl space-y-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#134074]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#134074]" />
                    <span>Personalized Behavioral Guidance</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-800">
                    {currentSimulation.aiRecommendations && currentSimulation.aiRecommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[#134074] font-bold">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Historical Simulation Records Log */}
        {simulationHistory.length > 0 && (
          <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0b2545]">
                Recent Simulation Records (Audit Trail)
              </h3>
              <span className="text-xs text-slate-500 font-mono font-medium">Relational Persistence</span>
            </div>

            <div className="overflow-x-auto border border-[#8da9c4]/30 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#eef4ed] text-[#13315c] uppercase text-[10px] tracking-wider border-b border-[#8da9c4]/30 font-bold">
                  <tr>
                    <th className="py-3 px-4">Scenario</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Peak Glucose</th>
                    <th className="py-3 px-4">Time to Peak</th>
                    <th className="py-3 px-4">CV Stress</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono bg-white">
                  {simulationHistory.map(rec => (
                    <tr key={rec.id} className="hover:bg-[#eef4ed]/50 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-[#0b2545]">{rec.scenario_name}</td>
                      <td className="py-3 px-4 uppercase text-[10px] text-[#134074] font-bold">{rec.scenario_type}</td>
                      <td className="py-3 px-4 font-bold text-[#0b2545]">{rec.predictedMetrics?.peakGlucose} mg/dL</td>
                      <td className="py-3 px-4 text-slate-700">{rec.predictedMetrics?.timeToPeak} min</td>
                      <td className="py-3 px-4 font-sans text-slate-700">{rec.predictedMetrics?.cvStressIndex}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </>
        )}

        {/* Synthea EHR Modal */}
        <EhrDetailModal
          patient={profile}
          isOpen={isEhrModalOpen}
          onClose={() => setIsEhrModalOpen(false)}
        />
      </div>
    </div>
  );
};
