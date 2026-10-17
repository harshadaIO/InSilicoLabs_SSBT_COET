import React, { useState } from 'react';
import { PatientProfile } from '../types';
import {
  Heart,
  Activity,
  Shield,
  Zap,
  Radio,
  Flame,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface DigitalTwinVisualProps {
  profile: PatientProfile;
  latestGlucose?: number;
  latestHeartRate?: number;
  onRunQuickSimulation?: () => void;
}

export type BodySystem =
  | 'pancreas'
  | 'hepatic'
  | 'vascular'
  | 'cgm'
  | 'skeletal_muscle';

export const DigitalTwinVisual: React.FC<DigitalTwinVisualProps> = ({
  profile,
  latestGlucose = 135,
  latestHeartRate = 72,
  onRunQuickSimulation
}) => {
  const [activeSystem, setActiveSystem] = useState<BodySystem>('pancreas');

  const labs = profile.baselineLabs || {
    hba1c: 8.4,
    fastingGlucose: 146,
    homaIr: 4.8,
    fastingInsulin: 18.5,
    systolicBp: 138,
    diastolicBp: 88,
    egfr: 68,
    triglycerides: 198,
    ldl: 138,
    hdl: 44
  };

  // 5 Medically-grounded physiological systems for the Diagnostic Grid
  const systemsData = {
    pancreas: {
      name: 'Pancreas & Beta-Cell Function',
      shortName: 'Pancreas & Beta-Cells',
      statusBadge: 'Glycemic Lability · 1st-Phase Blunted',
      statusType: 'danger' as const,
      icon: Zap,
      aiInsight:
        'Digital twin kinetic modeling reveals blunted first-phase beta-cell insulin secretion characteristic of baseline HbA1c 8.4%. Interstitial CGM velocity confirms delayed postprandial glucose clearance, requiring accelerated skeletal GLUT4 translocation.',
      riskAssessment: 'High Glycemic Excursion Risk',
      primaryMetric: '38%',
      primaryLabel: 'Est. Beta-Cell Reserve (HOMA2-B)',
      metrics: [
        {
          label: 'Estimated Beta-Cell Reserve',
          value: '38',
          unit: '%',
          trend: 'First-Phase Blunted',
          trendType: 'danger' as const,
          subtext: 'HOMA2-B computational modeling index',
          target: '> 70 %'
        },
        {
          label: 'Fasting Plasma Glucose',
          value: `${labs.fastingGlucose || 146}`,
          unit: 'mg/dL',
          trend: 'Elevated Baseline',
          trendType: 'warning' as const,
          subtext: 'Preprandial steady state (LOINC 1558-6)',
          target: '80 - 130 mg/dL'
        },
        {
          label: 'Glycated Hemoglobin (HbA1c)',
          value: `${labs.hba1c || 8.4}`,
          unit: '%',
          trend: 'Above Clinical Goal',
          trendType: 'danger' as const,
          subtext: 'Synthea LOINC 4548-4 diagnostic record',
          target: '< 7.0 %'
        },
        {
          label: 'HOMA-IR Insulin Resistance',
          value: `${labs.homaIr || 4.8}`,
          unit: 'index',
          trend: 'Marked Resistance',
          trendType: 'danger' as const,
          subtext: 'Calculated from fasting glucose & insulin',
          target: '< 2.0'
        }
      ]
    },
    hepatic: {
      name: 'Hepatic / Liver Synthesis',
      shortName: 'Hepatic / Liver',
      statusBadge: 'Regulated · Metformin Modulated',
      statusType: 'positive' as const,
      icon: Shield,
      aiInsight:
        'Hepatic gluconeogenesis is partially constrained by ongoing Metformin therapy (850mg BID), suppressing mitochondrial complex I and lowering overnight basal glucose release by ~22%. Lipid parameters reflect mild atherogenic dyslipidemia.',
      riskAssessment: 'Stabilized Fasting Glycemia',
      primaryMetric: '124 mg/dL',
      primaryLabel: 'Nocturnal Basal Flux',
      metrics: [
        {
          label: 'Nocturnal Hepatic Flux',
          value: '124',
          unit: 'mg/dL',
          trend: '-22% Suppressed',
          trendType: 'positive' as const,
          subtext: 'Modulated by Metformin hydrochloride BID',
          target: '90 - 120 mg/dL'
        },
        {
          label: 'Fasting Serum Insulin',
          value: `${labs.fastingInsulin || 18.5}`,
          unit: 'µIU/mL',
          trend: 'Hyperinsulinemia',
          trendType: 'warning' as const,
          subtext: 'Compensatory basal pancreatic secretion',
          target: '2.6 - 12.0 µIU/mL'
        },
        {
          label: 'Serum Triglycerides',
          value: `${labs.triglycerides || 198}`,
          unit: 'mg/dL',
          trend: 'Mild Dyslipidemia',
          trendType: 'warning' as const,
          subtext: 'Lipoprotein particle distribution',
          target: '< 150 mg/dL'
        },
        {
          label: 'Hepatic Steatosis Risk',
          value: 'Grade 1',
          unit: 'Mild',
          trend: 'Metabolic Correlated',
          trendType: 'neutral' as const,
          subtext: 'Synthea baseline ultrasound fatty liver index',
          target: 'Normal / Zero'
        }
      ]
    },
    vascular: {
      name: 'Vascular & Endothelial',
      shortName: 'Vascular & Endothelial',
      statusBadge: 'Stage 1 Elevated · Arterial Strain',
      statusType: 'warning' as const,
      icon: Heart,
      aiInsight:
        'Continuous photoplethysmogram (PPG) and baseline hemodynamics demonstrate mild arterial stiffness with preserved cardiac output. Sympathovagal balance reflects sympathetic dominance during postprandial glycemic excursions, elevating myocardial workload.',
      riskAssessment: 'Moderate Cardiovascular Load',
      primaryMetric: `${labs.systolicBp || 138}/${labs.diastolicBp || 88} mmHg`,
      primaryLabel: 'Baseline Arterial BP',
      metrics: [
        {
          label: 'Blood Pressure Profile',
          value: `${labs.systolicBp || 138}/${labs.diastolicBp || 88}`,
          unit: 'mmHg',
          trend: 'Stage 1 Hypertensive',
          trendType: 'warning' as const,
          subtext: 'Lisinopril 10mg daily modulated',
          target: '< 130/80 mmHg'
        },
        {
          label: 'Mean Arterial Pressure (MAP)',
          value: `${Math.round((2 * (labs.diastolicBp || 88) + (labs.systolicBp || 138)) / 3)}`,
          unit: 'mmHg',
          trend: 'Mild Arterial Strain',
          trendType: 'warning' as const,
          subtext: 'Organ perfusion pressure index',
          target: '70 - 100 mmHg'
        },
        {
          label: 'Resting Heart Rate',
          value: `${latestHeartRate}`,
          unit: 'bpm',
          trend: 'Autonomic Nominal',
          trendType: 'neutral' as const,
          subtext: 'Continuous photoplethysmography sensor',
          target: '60 - 80 bpm'
        },
        {
          label: 'Heart Rate Variability (HRV)',
          value: '45',
          unit: 'ms',
          trend: 'RMSSD Nominal',
          trendType: 'positive' as const,
          subtext: 'Vagal nerve tone & parasympathetic index',
          target: '> 40 ms'
        }
      ]
    },
    cgm: {
      name: 'CGM Sensor Feed',
      shortName: 'CGM Sensor Feed',
      statusBadge: 'Active Electrochemical Stream',
      statusType: 'positive' as const,
      icon: Radio,
      aiInsight:
        'Continuous subcutaneous glucose sensing operating at 5-minute sampling resolution with mean absolute relative difference (MARD) < 9.2%. Velocity vector shows moderate postprandial excursion rate with stable sensor signal-to-noise ratio.',
      riskAssessment: 'Continuous Interstitial Surveillance',
      primaryMetric: `${latestGlucose} mg/dL`,
      primaryLabel: 'Live Interstitial Glucose',
      metrics: [
        {
          label: 'Live Interstitial Glucose',
          value: `${latestGlucose}`,
          unit: 'mg/dL',
          trend: '+0.4 mg/dL/min',
          trendType: 'neutral' as const,
          subtext: 'Calibrated electrochemical enzyme sensor',
          target: '70 - 180 mg/dL'
        },
        {
          label: 'Time in Range (TIR)',
          value: '74.2',
          unit: '%',
          trend: 'Goal Achieved',
          trendType: 'positive' as const,
          subtext: 'Percent of day within 70 - 180 mg/dL',
          target: '> 70 %'
        },
        {
          label: 'Time Above Range (TAR)',
          value: '21.8',
          unit: '%',
          trend: 'Postprandial Spikes',
          trendType: 'warning' as const,
          subtext: 'Readings > 180 mg/dL',
          target: '< 25 %'
        },
        {
          label: 'Glycemic Variability (%CV)',
          value: '34.6',
          unit: '%',
          trend: 'Within Target',
          trendType: 'positive' as const,
          subtext: 'Coefficient of variation index',
          target: '< 36 %'
        }
      ]
    },
    skeletal_muscle: {
      name: 'Skeletal Muscle GLUT4',
      shortName: 'Skeletal Muscle GLUT4',
      statusBadge: 'Exercise-Sensitive · Latent Uptake',
      statusType: 'positive' as const,
      icon: Flame,
      aiInsight:
        'Skeletal muscle peripheral insulin sensitivity exhibits moderate post-absorptive downregulation. Simulation data confirms that 20-30 minutes of moderate postprandial ambulation triggers AMPK-dependent non-insulin mediated GLUT4 translocation, blunting glucose peak by ~38 mg/dL.',
      riskAssessment: 'Stimulatable Peripheral Clearance',
      primaryMetric: '62%',
      primaryLabel: 'GLUT4 Translocation Index',
      metrics: [
        {
          label: 'Non-Insulin Glucose Clearance',
          value: '1.8',
          unit: 'mg/kg/min',
          trend: 'Postprandial Resting',
          trendType: 'neutral' as const,
          subtext: 'Basal muscle compartment glucose uptake',
          target: '2.5 - 4.0'
        },
        {
          label: 'Exercise Stimulated Uptake',
          value: '4.2',
          unit: 'mg/kg/min',
          trend: 'Stimulated (+133%)',
          trendType: 'positive' as const,
          subtext: 'Achieved with 25-min brisk walk',
          target: '> 3.5'
        },
        {
          label: 'Daily Physical Activity',
          value: '8,420',
          unit: 'steps',
          trend: 'Goal Exceeded',
          trendType: 'positive' as const,
          subtext: 'Wearable pedometer step accumulation',
          target: '> 8,000 steps'
        },
        {
          label: 'Metabolic Equivalent (METs)',
          value: '1.4',
          unit: 'METs',
          trend: 'Resting State',
          trendType: 'neutral' as const,
          subtext: 'Target 3.0 - 5.0 METs postprandially',
          target: '3.0 - 5.0 METs'
        }
      ]
    }
  };

  const current = systemsData[activeSystem];
  const IconComponent = current.icon;

  return (
    <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md space-y-6">
      {/* Header with Digital Twin Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#8da9c4]/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#134074]">Diagnostic System Grid</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-mono text-[#13315c] font-semibold">Model #{profile.synthea_id}</span>
          </div>
          <h3 className="text-lg font-bold text-[#0b2545] mt-0.5">
            Multi-Organ In-Silico Diagnostic Architecture
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Digital Wellness Score</div>
            <div className="text-2xl font-bold font-mono text-[#0b2545] flex items-center justify-end gap-1">
              <span>{profile.wellness_score}</span>
              <span className="text-xs font-normal text-slate-400">/100</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl border border-[#8da9c4]/40 p-1 flex items-center justify-center bg-[#eef4ed] shadow-inner">
            <Activity className="w-6 h-6 text-[#134074]" />
          </div>
        </div>
      </div>

      {/* 1. Horizontal Row of Sleek Navigation Tabs (All 5 Systems) */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#eef4ed] border border-[#8da9c4]/30 rounded-xl">
        <button
          onClick={() => setActiveSystem('pancreas')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeSystem === 'pancreas'
              ? 'bg-[#134074] text-white shadow-sm'
              : 'text-[#0b2545] hover:bg-white/70'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${activeSystem === 'pancreas' ? 'text-[#8da9c4]' : 'text-[#134074]'}`} />
          <span>Pancreas & Beta-Cells</span>
        </button>

        <button
          onClick={() => setActiveSystem('hepatic')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeSystem === 'hepatic'
              ? 'bg-[#134074] text-white shadow-sm'
              : 'text-[#0b2545] hover:bg-white/70'
          }`}
        >
          <Shield className={`w-3.5 h-3.5 ${activeSystem === 'hepatic' ? 'text-[#8da9c4]' : 'text-[#134074]'}`} />
          <span>Hepatic / Liver</span>
        </button>

        <button
          onClick={() => setActiveSystem('vascular')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeSystem === 'vascular'
              ? 'bg-[#134074] text-white shadow-sm'
              : 'text-[#0b2545] hover:bg-white/70'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${activeSystem === 'vascular' ? 'text-[#8da9c4]' : 'text-[#134074]'}`} />
          <span>Vascular & Endothelial</span>
        </button>

        <button
          onClick={() => setActiveSystem('cgm')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeSystem === 'cgm'
              ? 'bg-[#134074] text-white shadow-sm'
              : 'text-[#0b2545] hover:bg-white/70'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${activeSystem === 'cgm' ? 'text-[#8da9c4]' : 'text-[#134074]'}`} />
          <span>CGM Sensor Feed</span>
        </button>

        <button
          onClick={() => setActiveSystem('skeletal_muscle')}
          className={`flex-1 min-w-[140px] py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeSystem === 'skeletal_muscle'
              ? 'bg-[#134074] text-white shadow-sm'
              : 'text-[#0b2545] hover:bg-white/70'
          }`}
        >
          <Flame className={`w-3.5 h-3.5 ${activeSystem === 'skeletal_muscle' ? 'text-[#8da9c4]' : 'text-[#134074]'}`} />
          <span>Skeletal Muscle GLUT4</span>
        </button>
      </div>

      {/* 2 & 3: Split Grid - Summary Card (Left) + Metric Grid (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Frosted Glassmorphic Summary Card */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#0b2545] border border-[#134074] flex items-center justify-center text-[#8da9c4] shadow-md">
                <IconComponent className="w-6 h-6 text-[#8da9c4]" />
              </div>

              {/* Status Badge */}
              <span className={`text-[11px] font-mono px-3 py-1 rounded-full font-bold border ${
                current.statusType === 'danger'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : current.statusType === 'warning'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-teal-50 text-teal-800 border-teal-200'
              }`}>
                {current.statusBadge}
              </span>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-wider font-bold text-[#134074]">
                Active Physiological Subsystem
              </div>
              <h4 className="text-xl font-extrabold text-[#0b2545] mt-0.5">
                {current.name}
              </h4>
            </div>

            {/* Primary Biomarker Reading */}
            <div className="p-3 bg-[#eef4ed] border border-[#8da9c4]/30 rounded-xl flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">{current.primaryLabel}:</span>
              <span className="text-base font-bold font-mono text-[#0b2545]">{current.primaryMetric}</span>
            </div>

            {/* AI Clinical Insight */}
            <div className="p-4 bg-[#eef4ed]/70 rounded-xl border border-[#8da9c4]/30 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#134074] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#134074]" />
                <span>AI Physiological Assessment</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {current.aiInsight}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-[#8da9c4]/20 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Subsystem Risk:</span>
            <span className="font-bold text-[#134074]">{current.riskAssessment}</span>
          </div>
        </div>

        {/* Right Side: Clean Structured Metric Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {current.metrics.map((metric, idx) => (
            <div
              key={idx}
              className="p-4 bg-white/90 border border-[#8da9c4]/30 rounded-2xl shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#134074] uppercase tracking-wider">
                  {metric.label}
                </span>

                {/* Trend Badge */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  metric.trendType === 'danger'
                    ? 'bg-rose-50 text-rose-700'
                    : metric.trendType === 'warning'
                    ? 'bg-amber-50 text-amber-800'
                    : 'bg-[#eef4ed] text-[#134074]'
                }`}>
                  {metric.trend}
                </span>
              </div>

              <div>
                <div className="text-2xl font-extrabold font-mono text-[#0b2545] tracking-tight">
                  {metric.value} <span className="text-xs font-normal text-slate-500 font-sans">{metric.unit}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {metric.subtext}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span>Clinical Target:</span>
                <span className="font-mono font-bold text-[#0b2545]">{metric.target}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
