export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor';
}

export interface Anthropometrics {
  waistToHipRatio: number;
  familyHistory: string;
  weightKg: number;
  heightCm: number;
}

export interface BaselineLabs {
  hba1c: number;
  hba1cUnit: string;
  fastingGlucose: number;
  fastingGlucoseUnit: string;
  homaIr: number;
  fastingInsulin?: number;
  egfr: number;
  egfrUnit: string;
  ldl: number;
  ldlUnit: string;
  hdl: number;
  hdlUnit: string;
  triglycerides: number;
  triglyceridesUnit: string;
  systolicBp: number;
  diastolicBp: number;
  creatinine?: number;
  creatinineUnit?: string;
}

export interface CarePlan {
  targetHbA1c?: string;
  targetTIR?: string;
  dailyStepGoal?: number;
  carbCapDaily?: number;
  postMealStepTarget?: number;
  dietaryGuidance?: string;
}

export interface WearableStats {
  tirPercent: number;
  cvPercent: number;
  activeCalories: number;
  sleepHours: number;
  deepSleepHours: number;
  remSleepHours: number;
  carbIntakeToday: number;
}

export interface PatientProfile {
  id: string;
  user_id?: string | null;
  synthea_id: string;
  full_name: string;
  age: number;
  gender: string;
  dob: string;
  phone?: string;
  blood_type: string;
  primary_condition: string;
  risk_level: 'high' | 'medium' | 'low';
  wellness_score: number;
  bmi: number;
  anthropometrics: Anthropometrics;
  conditions: string[];
  medications: string[];
  allergies: string[];
  baselineLabs: BaselineLabs;
  carePlan: CarePlan;
  wearableStats?: WearableStats;
  currentGlucose?: number;
  currentHeartRate?: number;
  lastTelemetryAt?: string;
  activeAlertsCount?: number;
}

export interface WearableLog {
  id: string;
  patient_id: string;
  timestamp: string;
  glucose: number;
  heart_rate: number;
  hrv: number;
  spo2: number;
  steps: number;
  sleep_stage: string;
  activity: string;
}

export interface SimulationCurvePoint {
  minute: number;
  baselineGlucose: number;
  simulatedGlucose: number;
  heartRate: number;
}

export interface SimulationRecord {
  id: string;
  patient_id: string;
  scenario_name: string;
  scenario_type: string;
  inputParams: any;
  predictedMetrics: {
    peakGlucose: number;
    timeToPeak: number;
    deltaGlucose: number;
    cvStressIndex: string;
    timeAboveRangeMin: number;
    hypoglycemiaRisk: string;
  };
  projectedCurve: SimulationCurvePoint[];
  ai_rationale: string;
  aiRecommendations: string[];
  created_at: string;
  modelUsed?: string;
  isFallback?: boolean;
}

export interface AlertLog {
  id: string;
  patient_id: string;
  patient_name?: string;
  synthea_id?: string;
  patient_risk?: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  metric: string;
  anomaly_detected: string;
  status: 'active' | 'acknowledged' | 'dismissed' | 'resolved';
  clinical_action?: string | null;
  acknowledged_by?: string | null;
  timestamp: string;
}
