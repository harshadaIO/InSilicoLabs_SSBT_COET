import fs from 'fs';
import path from 'path';
import initSqlJs, { Database } from 'sql.js';

let dbInstance: Database | null = null;
const dbDir = path.resolve(process.cwd(), 'data');
const dbPath = path.resolve(dbDir, 'vitatwin.sqlite');

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    try {
      const filebuffer = fs.readFileSync(dbPath);
      dbInstance = new SQL.Database(filebuffer);
      console.log('[DB] Loaded existing SQLite database from', dbPath);
    } catch (err) {
      console.warn('[DB] Failed to load existing database file, creating fresh:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    console.log('[DB] Initializing new SQLite database');
    dbInstance = new SQL.Database();
  }

  initSchemaAndSeeds(dbInstance);
  saveDb();
  return dbInstance;
}

export function saveDb(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  } catch (err) {
    console.error('[DB] Error saving database to disk:', err);
  }
}

function initSchemaAndSeeds(db: Database) {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Patient Profiles table (Synthea EHR based)
  db.run(`
    CREATE TABLE IF NOT EXISTS patient_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      synthea_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      dob TEXT NOT NULL,
      phone TEXT,
      blood_type TEXT NOT NULL,
      primary_condition TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      wellness_score INTEGER NOT NULL,
      bmi REAL NOT NULL,
      anthropometrics_json TEXT,
      conditions_json TEXT NOT NULL,
      medications_json TEXT NOT NULL,
      allergies_json TEXT NOT NULL,
      baseline_labs_json TEXT NOT NULL,
      care_plan_json TEXT NOT NULL,
      wearable_stats_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Ensure new columns exist if table was previously created without them
  try {
    db.run(`ALTER TABLE patient_profiles ADD COLUMN anthropometrics_json TEXT;`);
  } catch (e) {}
  try {
    db.run(`ALTER TABLE patient_profiles ADD COLUMN wearable_stats_json TEXT;`);
  } catch (e) {}

  // Wearable Logs (Continuous Time-series: CGM, HR, HRV, Sleep)
  db.run(`
    CREATE TABLE IF NOT EXISTS wearable_logs (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      glucose REAL NOT NULL,
      heart_rate INTEGER NOT NULL,
      hrv INTEGER NOT NULL,
      spo2 REAL NOT NULL,
      steps INTEGER NOT NULL,
      sleep_stage TEXT NOT NULL,
      activity TEXT NOT NULL
    );
  `);

  // Simulation Records (What-If predictions)
  db.run(`
    CREATE TABLE IF NOT EXISTS simulation_records (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      scenario_name TEXT NOT NULL,
      scenario_type TEXT NOT NULL,
      input_params_json TEXT NOT NULL,
      predicted_metrics_json TEXT NOT NULL,
      projected_curve_json TEXT NOT NULL,
      ai_rationale TEXT NOT NULL,
      ai_recommendations_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Alert Logs (AI Early Warnings)
  db.run(`
    CREATE TABLE IF NOT EXISTS alert_logs (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      metric TEXT NOT NULL,
      anomaly_detected TEXT NOT NULL,
      status TEXT NOT NULL,
      clinical_action TEXT,
      acknowledged_by TEXT,
      timestamp TEXT NOT NULL
    );
  `);

  // Clinical Directives & Protocol Adjustments
  db.run(`
    CREATE TABLE IF NOT EXISTS clinical_notes (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      doctor_name TEXT NOT NULL,
      treatment_adjustment TEXT NOT NULL,
      note_text TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  // DPDP Act 2023 Active Digital Consents Table (Section 6 Compliance)
  db.run(`
    CREATE TABLE IF NOT EXISTS dpdp_consents (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      purpose_code TEXT NOT NULL,
      purpose_title TEXT NOT NULL,
      purpose_description TEXT NOT NULL,
      legal_basis TEXT NOT NULL,
      is_granted INTEGER NOT NULL,
      encryption_at_rest TEXT NOT NULL,
      encryption_in_transit TEXT NOT NULL,
      data_localization_region TEXT NOT NULL,
      retention_period TEXT NOT NULL,
      consent_manager TEXT NOT NULL,
      last_updated_at TEXT NOT NULL
    );
  `);

  // DPDP Act 2023 Immutable Audit Logs Table
  db.run(`
    CREATE TABLE IF NOT EXISTS dpdp_audit_logs (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      action TEXT NOT NULL,
      purpose_code TEXT NOT NULL,
      purpose_title TEXT NOT NULL,
      section_reference TEXT NOT NULL,
      details TEXT NOT NULL,
      ip_address_hash TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  // Ensure demo users exist
  db.run(`
    INSERT OR IGNORE INTO users (id, email, password_hash, name, role, created_at)
    VALUES (
      'usr-dr-vikramaditya',
      'dr.vikramaditya.rao@hospital.org',
      '$2a$10$9GfO8fP5M3eE1w8g6l2uOuyN9Wv0B3kM0XkL8P7R5q3s2e1w0q.a.',
      'Dr. Vikramaditya Rao, MD (Endocrinology)',
      'doctor',
      '2026-01-01T00:00:00.000Z'
    );

    INSERT OR IGNORE INTO users (id, email, password_hash, name, role, created_at)
    VALUES (
      'usr-dr-aris',
      'dr.aris.thorne@hospital.org',
      '$2a$10$9GfO8fP5M3eE1w8g6l2uOuyN9Wv0B3kM0XkL8P7R5q3s2e1w0q.a.',
      'Dr. Vikramaditya Rao, MD (Endocrinology)',
      'doctor',
      '2026-01-01T00:00:00.000Z'
    );
  `);

  // Check if Indian Healthcare & Endocrinology cohort data exists
  const res = db.exec("SELECT COUNT(*) as count FROM patient_profiles WHERE id = 'pat-ananya-iyer';");
  const count = res[0]?.values[0]?.[0] as number;

  if (!count || count === 0) {
    console.log('[DB] Seeding Indian Healthcare & Endocrinology cohort, demo profiles, and telemetry...');
    seedDatabase(db);
  }
}

function seedDatabase(db: Database) {
  const patientHash = "$2a$10$w09ZkC2h.ZfP9sP9G5y3EOC0GeqeXk4bUqMcmrJ7.77W1j.sYgq0m"; // patient123
  const doctorHash = "$2a$10$9GfO8fP5M3eE1w8g6l2uOuyN9Wv0B3kM0XkL8P7R5q3s2e1w0q.a."; // doctor123
  
  const now = new Date();
  const dateStr = now.toISOString();

  // 1. Seed Users
  db.run(`
    INSERT OR REPLACE INTO users (id, email, password_hash, name, role, created_at)
    VALUES (
      'usr-ananya-iyer',
      'ananya.iyer@example.com',
      '${patientHash}',
      'Ananya Iyer',
      'patient',
      '${dateStr}'
    );

    INSERT OR REPLACE INTO users (id, email, password_hash, name, role, created_at)
    VALUES (
      'usr-elena-vance',
      'elena.vance@example.com',
      '${patientHash}',
      'Ananya Iyer',
      'patient',
      '${dateStr}'
    );

    INSERT OR REPLACE INTO users (id, email, password_hash, name, role, created_at)
    VALUES (
      'usr-dr-vikramaditya',
      'dr.vikramaditya.rao@hospital.org',
      '${doctorHash}',
      'Dr. Vikramaditya Rao, MD (Endocrinology)',
      'doctor',
      '${dateStr}'
    );

    INSERT OR REPLACE INTO users (id, email, password_hash, name, role, created_at)
    VALUES (
      'usr-dr-aris',
      'dr.aris.thorne@hospital.org',
      '${doctorHash}',
      'Dr. Vikramaditya Rao, MD (Endocrinology)',
      'doctor',
      '${dateStr}'
    );

    INSERT OR REPLACE INTO users (id, email, password_hash, name, role, created_at)
    VALUES (
      'usr-dr-marcus',
      'dr.marcus.chen@hospital.org',
      '${doctorHash}',
      'Dr. Vikramaditya Rao, MD (Endocrinology)',
      'doctor',
      '${dateStr}'
    );
  `);

  // 2. Comprehensive Indian Healthcare T2DM Patient Cohort
  const cohort = [
    {
      id: 'pat-ananya-iyer',
      userId: 'usr-ananya-iyer',
      syntheaId: 'SYN-IND-4921',
      fullName: 'Ananya Iyer',
      age: 52,
      gender: 'Female',
      dob: '1974-06-12',
      phone: '+91 98201 34921',
      bloodType: 'A+',
      primaryCondition: 'Glycemic Lability / Medium Risk',
      riskLevel: 'medium',
      wellnessScore: 74,
      bmi: 27.8,
      anthropometrics: {
        waistToHipRatio: 0.86,
        familyHistory: 'Maternal Type 2 Diabetes diagnosed age 48, Maternal Coronary Artery Disease',
        weightKg: 68.5,
        heightCm: 157
      },
      conditions: [
        'E11.9 Type 2 diabetes mellitus with glycemic lability',
        'I10 Essential (primary) hypertension, Stage 1',
        'E78.5 Hyperlipidemia, mixed dyslipidemia'
      ],
      medications: [
        'Metformin hydrochloride 850 mg oral tablet (BID with meals)',
        'Teneligliptin 20 mg oral tablet (daily morning)',
        'Atorvastatin 10 mg oral tablet (nightly)'
      ],
      allergies: [
        'Penicillin V Potassium - Skin Rash / Urticaria (Moderate)'
      ],
      baselineLabs: {
        hba1c: 7.8,
        hba1cUnit: '%',
        fastingGlucose: 142,
        fastingGlucoseUnit: 'mg/dL',
        homaIr: 3.4,
        fastingInsulin: 16.5,
        egfr: 76,
        egfrUnit: 'mL/min/1.73m²',
        ldl: 128,
        ldlUnit: 'mg/dL',
        hdl: 46,
        hdlUnit: 'mg/dL',
        triglycerides: 182,
        triglyceridesUnit: 'mg/dL',
        systolicBp: 132,
        diastolicBp: 84,
        creatinine: 0.98,
        creatinineUnit: 'mg/dL'
      },
      carePlan: {
        targetHbA1c: '< 7.0%',
        targetTIR: '> 70% in 70-180 mg/dL',
        dailyStepGoal: 8500,
        carbCapDaily: 125,
        postMealStepTarget: 2000,
        dietaryGuidance: 'Consistent carbohydrate counting (max 40g/meal), Indian whole-grain & millet emphasis'
      },
      wearableStats: {
        tirPercent: 71.2,
        cvPercent: 33.4,
        activeCalories: 430,
        sleepHours: 7.0,
        deepSleepHours: 1.3,
        remSleepHours: 1.5,
        carbIntakeToday: 145
      }
    },
    {
      id: 'pat-rajesh-sharma',
      userId: null,
      syntheaId: 'SYN-IND-5192',
      fullName: 'Rajesh Sharma',
      age: 58,
      gender: 'Male',
      dob: '1968-04-19',
      phone: '+91 98112 55192',
      bloodType: 'B+',
      primaryCondition: 'Severe Postprandial Spikes / High Risk',
      riskLevel: 'high',
      wellnessScore: 65,
      bmi: 28.4,
      anthropometrics: {
        waistToHipRatio: 0.95,
        familyHistory: 'Paternal Type 2 Diabetes & early myocardial infarction (age 54)',
        weightKg: 82.0,
        heightCm: 170
      },
      conditions: [
        'E11.65 Type 2 diabetes mellitus with severe postprandial hyperglycemia',
        'N18.2 Chronic kidney disease, Stage 2 (microalbuminuria)',
        'I10 Essential hypertension'
      ],
      medications: [
        'Glimepiride 2 mg oral tablet (daily before breakfast)',
        'Metformin hydrochloride 1000 mg oral tablet (BID)',
        'Telmisartan 40 mg oral tablet (daily)'
      ],
      allergies: [
        'Sulfa drugs - Mild pruritus'
      ],
      baselineLabs: {
        hba1c: 8.6,
        hba1cUnit: '%',
        fastingGlucose: 158,
        fastingGlucoseUnit: 'mg/dL',
        homaIr: 4.1,
        fastingInsulin: 19.5,
        egfr: 62,
        egfrUnit: 'mL/min/1.73m²',
        ldl: 142,
        ldlUnit: 'mg/dL',
        hdl: 40,
        hdlUnit: 'mg/dL',
        triglycerides: 220,
        triglyceridesUnit: 'mg/dL',
        systolicBp: 142,
        diastolicBp: 90,
        creatinine: 1.25,
        creatinineUnit: 'mg/dL'
      },
      carePlan: {
        targetHbA1c: '< 7.0%',
        targetTIR: '> 70%',
        dailyStepGoal: 7500,
        carbCapDaily: 130,
        postMealStepTarget: 1500,
        dietaryGuidance: 'Reduce high-GI white rice/sweets, replace with multigrain roties, postprandial walk'
      },
      wearableStats: {
        tirPercent: 58.4,
        cvPercent: 41.2,
        activeCalories: 380,
        sleepHours: 6.2,
        deepSleepHours: 1.0,
        remSleepHours: 1.1,
        carbIntakeToday: 185
      }
    },
    {
      id: 'pat-siddharth-deshmukh',
      userId: null,
      syntheaId: 'SYN-IND-8832',
      fullName: 'Siddharth Deshmukh',
      age: 61,
      gender: 'Male',
      dob: '1965-09-24',
      phone: '+91 98220 88832',
      bloodType: 'O+',
      primaryCondition: 'Nocturnal Hypoglycemia Risk / High Risk',
      riskLevel: 'high',
      wellnessScore: 61,
      bmi: 29.5,
      anthropometrics: {
        waistToHipRatio: 0.97,
        familyHistory: 'Bilateral Type 2 Diabetes & Ischemic Stroke',
        weightKg: 88.0,
        heightCm: 173
      },
      conditions: [
        'E11.649 Type 2 diabetes with nocturnal hypoglycemia episodes',
        'I11.9 Hypertensive heart disease without heart failure',
        'G47.33 Obstructive sleep apnea'
      ],
      medications: [
        'Gliclazide MR 60 mg oral tablet (daily morning)',
        'Metformin hydrochloride 500 mg oral tablet (BID)',
        'Amlodipine besylate 5 mg tablet (daily)',
        'Aspirin 75 mg enteric coated tablet (daily)'
      ],
      allergies: [
        'Codeine - Nausea/Dysphoria'
      ],
      baselineLabs: {
        hba1c: 7.2,
        hba1cUnit: '%',
        fastingGlucose: 104,
        fastingGlucoseUnit: 'mg/dL',
        homaIr: 3.1,
        fastingInsulin: 15.0,
        egfr: 58,
        egfrUnit: 'mL/min/1.73m²',
        ldl: 122,
        ldlUnit: 'mg/dL',
        hdl: 41,
        hdlUnit: 'mg/dL',
        triglycerides: 195,
        triglyceridesUnit: 'mg/dL',
        systolicBp: 136,
        diastolicBp: 86,
        creatinine: 1.28,
        creatinineUnit: 'mg/dL'
      },
      carePlan: {
        targetHbA1c: '< 7.0%',
        targetTIR: '> 75%',
        dailyStepGoal: 6500,
        carbCapDaily: 140,
        postMealStepTarget: 1500,
        dietaryGuidance: 'Bedtime complex protein snack (paneer / warm milk) to prevent nocturnal glucose drops'
      },
      wearableStats: {
        tirPercent: 69.5,
        cvPercent: 39.8,
        activeCalories: 320,
        sleepHours: 5.9,
        deepSleepHours: 0.9,
        remSleepHours: 1.1,
        carbIntakeToday: 170
      }
    },
    {
      id: 'pat-priya-nair',
      userId: null,
      syntheaId: 'SYN-IND-1094',
      fullName: 'Priya Nair',
      age: 46,
      gender: 'Female',
      dob: '1980-03-18',
      phone: '+91 98480 11094',
      bloodType: 'B+',
      primaryCondition: 'Dawn Phenomenon / Medium Risk',
      riskLevel: 'medium',
      wellnessScore: 80,
      bmi: 25.8,
      anthropometrics: {
        waistToHipRatio: 0.83,
        familyHistory: 'Maternal Type 2 Diabetes diagnosed age 50',
        weightKg: 64.0,
        heightCm: 158
      },
      conditions: [
        'E11.9 Type 2 diabetes mellitus with early-morning dawn phenomenon',
        'E78.2 Mixed hyperlipidemia',
        'E03.9 Hypothyroidism'
      ],
      medications: [
        'Metformin hydrochloride 1000 mg oral tablet (nightly with meal)',
        'Vildagliptin 50 mg oral tablet (BID)'
      ],
      allergies: [
        'None reported (NKDA)'
      ],
      baselineLabs: {
        hba1c: 7.1,
        hba1cUnit: '%',
        fastingGlucose: 136,
        fastingGlucoseUnit: 'mg/dL',
        homaIr: 2.7,
        fastingInsulin: 13.0,
        egfr: 86,
        egfrUnit: 'mL/min/1.73m²',
        ldl: 116,
        ldlUnit: 'mg/dL',
        hdl: 50,
        hdlUnit: 'mg/dL',
        triglycerides: 158,
        triglyceridesUnit: 'mg/dL',
        systolicBp: 126,
        diastolicBp: 80,
        creatinine: 0.88,
        creatinineUnit: 'mg/dL'
      },
      carePlan: {
        targetHbA1c: '< 6.8%',
        targetTIR: '> 80%',
        dailyStepGoal: 9000,
        carbCapDaily: 120,
        postMealStepTarget: 2000,
        dietaryGuidance: 'Low glycemic index Indian foods, bedtime apple cider / high-protein snack for dawn surge'
      },
      wearableStats: {
        tirPercent: 79.2,
        cvPercent: 28.6,
        activeCalories: 480,
        sleepHours: 7.2,
        deepSleepHours: 1.5,
        remSleepHours: 1.7,
        carbIntakeToday: 135
      }
    },
    {
      id: 'pat-vikram-patel',
      userId: null,
      syntheaId: 'SYN-IND-6102',
      fullName: 'Vikram Patel',
      age: 44,
      gender: 'Male',
      dob: '1982-11-05',
      phone: '+91 98790 66102',
      bloodType: 'O+',
      primaryCondition: 'Optimal Glycemic Control / Stable',
      riskLevel: 'low',
      wellnessScore: 91,
      bmi: 24.6,
      anthropometrics: {
        waistToHipRatio: 0.88,
        familyHistory: 'Paternal Type 2 Diabetes',
        weightKg: 72.0,
        heightCm: 171
      },
      conditions: [
        'E11.9 Type 2 diabetes mellitus - well-controlled on lifestyle & monotherapy',
        'Z71.3 Dietary surveillance and counseling'
      ],
      medications: [
        'Metformin hydrochloride 500 mg oral tablet (daily with dinner)'
      ],
      allergies: [
        'Latex - Contact Dermatitis (Mild)'
      ],
      baselineLabs: {
        hba1c: 6.2,
        hba1cUnit: '%',
        fastingGlucose: 106,
        fastingGlucoseUnit: 'mg/dL',
        homaIr: 1.9,
        fastingInsulin: 9.2,
        egfr: 96,
        egfrUnit: 'mL/min/1.73m²',
        ldl: 98,
        ldlUnit: 'mg/dL',
        hdl: 54,
        hdlUnit: 'mg/dL',
        triglycerides: 132,
        triglyceridesUnit: 'mg/dL',
        systolicBp: 118,
        diastolicBp: 76,
        creatinine: 0.82,
        creatinineUnit: 'mg/dL'
      },
      carePlan: {
        targetHbA1c: '< 6.5%',
        targetTIR: '> 85%',
        dailyStepGoal: 10000,
        carbCapDaily: 130,
        postMealStepTarget: 2500,
        dietaryGuidance: 'Sustained low-GI balanced Indian vegetarian nutrition, regular yogasana and brisk walking'
      },
      wearableStats: {
        tirPercent: 88.6,
        cvPercent: 21.4,
        activeCalories: 520,
        sleepHours: 7.5,
        deepSleepHours: 1.7,
        remSleepHours: 1.8,
        carbIntakeToday: 130
      }
    }
  ];

  cohort.forEach(p => {
    db.run(`
      INSERT OR REPLACE INTO patient_profiles (
        id, user_id, synthea_id, full_name, age, gender, dob, phone, blood_type,
        primary_condition, risk_level, wellness_score, bmi, anthropometrics_json, conditions_json,
        medications_json, allergies_json, baseline_labs_json, care_plan_json, wearable_stats_json,
        created_at, updated_at
      ) VALUES (
        '${p.id}',
        ${p.userId ? `'${p.userId}'` : 'NULL'},
        '${p.syntheaId}',
        '${p.fullName}',
        ${p.age},
        '${p.gender}',
        '${p.dob}',
        '${p.phone}',
        '${p.bloodType}',
        '${p.primaryCondition}',
        '${p.riskLevel}',
        ${p.wellnessScore},
        ${p.bmi},
        '${JSON.stringify(p.anthropometrics).replace(/'/g, "''")}',
        '${JSON.stringify(p.conditions).replace(/'/g, "''")}',
        '${JSON.stringify(p.medications).replace(/'/g, "''")}',
        '${JSON.stringify(p.allergies).replace(/'/g, "''")}',
        '${JSON.stringify(p.baselineLabs).replace(/'/g, "''")}',
        '${JSON.stringify(p.carePlan).replace(/'/g, "''")}',
        '${JSON.stringify(p.wearableStats).replace(/'/g, "''")}',
        '${dateStr}',
        '${dateStr}'
      );
    `);
  });

  // 3. Seed Wearable Logs for Ananya Iyer (24 hours) - Dual seed for pat-ananya-iyer & pat-elena-vance
  const baseTime = Date.now();
  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(baseTime - i * 3600 * 1000).toISOString();
    const hour = new Date(timestamp).getHours();

    let glucose = 125;
    let heartRate = 72;
    let hrv = 45;
    let spo2 = 98.2;
    let steps = 0;
    let sleepStage = 'Awake';
    let activity = 'Sedentary';

    if (hour >= 23 || hour < 6) {
      sleepStage = hour >= 1 && hour <= 4 ? 'Deep' : (hour === 5 ? 'REM' : 'Light');
      activity = 'Resting';
      glucose = Math.round(108 + Math.sin(hour) * 8);
      heartRate = 60 + Math.round(Math.random() * 4);
      hrv = 58 + Math.round(Math.random() * 8);
      spo2 = 98.0;
    } else if (hour >= 7 && hour <= 9) {
      activity = 'Postprandial';
      glucose = 162 + (hour === 8 ? 24 : 0);
      heartRate = 84;
      hrv = 38;
      spo2 = 98.6;
      steps = 1400;
    } else if (hour >= 12 && hour <= 14) {
      activity = 'Postprandial';
      glucose = 170 + (hour === 13 ? 20 : 0);
      heartRate = 80;
      hrv = 40;
      spo2 = 98.4;
      steps = 950;
    } else if (hour >= 18 && hour <= 20) {
      activity = 'Walking';
      glucose = 154;
      heartRate = 96;
      hrv = 44;
      spo2 = 98.8;
      steps = 2200;
    } else {
      activity = 'Sedentary';
      glucose = 130 + Math.round(Math.sin(hour) * 6);
      heartRate = 74;
      hrv = 46;
      spo2 = 98.5;
      steps = 450;
    }

    // Insert for pat-ananya-iyer
    db.run(`
      INSERT OR REPLACE INTO wearable_logs (
        id, patient_id, timestamp, glucose, heart_rate, hrv, spo2, steps, sleep_stage, activity
      ) VALUES (
        'wlog-ananya-${i}',
        'pat-ananya-iyer',
        '${timestamp}',
        ${glucose},
        ${heartRate},
        ${hrv},
        ${spo2},
        ${steps},
        '${sleepStage}',
        '${activity}'
      );
    `);

    // Dual-insert for pat-elena-vance alias
    db.run(`
      INSERT OR REPLACE INTO wearable_logs (
        id, patient_id, timestamp, glucose, heart_rate, hrv, spo2, steps, sleep_stage, activity
      ) VALUES (
        'wlog-${i}',
        'pat-elena-vance',
        '${timestamp}',
        ${glucose},
        ${heartRate},
        ${hrv},
        ${spo2},
        ${steps},
        '${sleepStage}',
        '${activity}'
      );
    `);
  }

  // Baseline telemetry for other cohort members
  cohort.slice(1).forEach(p => {
    for (let i = 6; i >= 0; i--) {
      const timestamp = new Date(baseTime - i * 3600 * 1000).toISOString();
      const glucose = p.id === 'pat-siddharth-deshmukh' ? (i === 1 ? 64 : 108) : (p.id === 'pat-rajesh-sharma' ? (i === 2 ? 195 : 142) : 120 + (i % 3) * 6);
      const heartRate = 72 + (i % 4) * 2;
      db.run(`
        INSERT OR REPLACE INTO wearable_logs (
          id, patient_id, timestamp, glucose, heart_rate, hrv, spo2, steps, sleep_stage, activity
        ) VALUES (
          'wlog-${p.id}-${i}',
          '${p.id}',
          '${timestamp}',
          ${glucose},
          ${heartRate},
          46,
          98.2,
          500,
          'Active',
          'Sedentary'
        );
      `);
    }
  });

  // 4. Real-Time AI Early Warning Alerts across Indian Cohort
  const initialAlerts: Array<{
    id: string;
    patientId: string;
    title: string;
    severity: string;
    metric: string;
    anomalyDetected: string;
    status: string;
    clinicalAction: string | null;
    acknowledgedBy: string | null;
    timestamp: string;
  }> = [
    {
      id: 'alt-101',
      patientId: 'pat-ananya-iyer',
      title: 'Postprandial Hyperglycemia Spike Imminent',
      severity: 'warning',
      metric: 'CGM Interstitial Glucose',
      anomalyDetected: '84% probability of postprandial hyperglycemia >210 mg/dL in 90 mins based on carbohydrate velocity (+2.1 mg/dL/min).',
      status: 'active',
      clinicalAction: null,
      acknowledgedBy: null,
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
    },
    {
      id: 'alt-102',
      patientId: 'pat-rajesh-sharma',
      title: 'Severe Postprandial Glucose Surge & Glycemic Lability',
      severity: 'critical',
      metric: 'Glycemic Rate of Change',
      anomalyDetected: 'Severe postprandial glycemic surge (+3.2 mg/dL/min) detected following high-GI dinner. Peak excursion forecasted at 235 mg/dL.',
      status: 'active',
      clinicalAction: null,
      acknowledgedBy: null,
      timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString()
    },
    {
      id: 'alt-103',
      patientId: 'pat-siddharth-deshmukh',
      title: 'Nocturnal Hypoglycemia Alert Predicted',
      severity: 'critical',
      metric: 'Glycemic Slope & Sulfonylurea Clearance',
      anomalyDetected: 'Nocturnal hypoglycemia risk <65 mg/dL detected. CGM slope -1.9 mg/dL/min while on Gliclazide MR therapy.',
      status: 'active',
      clinicalAction: null,
      acknowledgedBy: null,
      timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString()
    },
    {
      id: 'alt-104',
      patientId: 'pat-priya-nair',
      title: 'Dawn Phenomenon Hepatic Glucose Surge',
      severity: 'warning',
      metric: 'Circadian Hepatic Glucose Output',
      anomalyDetected: 'Early morning hepatic glucose rise (04:00 - 07:00 AM) projected +35 mg/dL excursion without overnight caloric intake.',
      status: 'active',
      clinicalAction: null,
      acknowledgedBy: null,
      timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString()
    }
  ];

  initialAlerts.forEach(a => {
    db.run(`
      INSERT OR REPLACE INTO alert_logs (
        id, patient_id, title, severity, metric, anomaly_detected, status, clinical_action, acknowledged_by, timestamp
      ) VALUES (
        '${a.id}',
        '${a.patientId}',
        '${a.title}',
        '${a.severity}',
        '${a.metric}',
        '${a.anomalyDetected.replace(/'/g, "''")}',
        '${a.status}',
        ${a.clinicalAction ? `'${a.clinicalAction.replace(/'/g, "''")}'` : 'NULL'},
        ${a.acknowledgedBy ? `'${a.acknowledgedBy.replace(/'/g, "''")}'` : 'NULL'},
        '${a.timestamp}'
      );
    `);
  });

  // 5. Initial 3-Hour Simulation Record for Ananya Iyer
  const initial3HrCurve = [
    { minute: 0, baselineGlucose: 135, simulatedGlucose: 135, heartRate: 72 },
    { minute: 15, baselineGlucose: 136, simulatedGlucose: 148, heartRate: 75 },
    { minute: 30, baselineGlucose: 134, simulatedGlucose: 172, heartRate: 78 },
    { minute: 45, baselineGlucose: 135, simulatedGlucose: 198, heartRate: 82 },
    { minute: 60, baselineGlucose: 133, simulatedGlucose: 215, heartRate: 85 },
    { minute: 75, baselineGlucose: 132, simulatedGlucose: 202, heartRate: 82 },
    { minute: 90, baselineGlucose: 134, simulatedGlucose: 184, heartRate: 78 },
    { minute: 105, baselineGlucose: 135, simulatedGlucose: 168, heartRate: 76 },
    { minute: 120, baselineGlucose: 133, simulatedGlucose: 154, heartRate: 74 },
    { minute: 135, baselineGlucose: 134, simulatedGlucose: 144, heartRate: 73 },
    { minute: 150, baselineGlucose: 135, simulatedGlucose: 138, heartRate: 72 },
    { minute: 165, baselineGlucose: 134, simulatedGlucose: 136, heartRate: 72 },
    { minute: 180, baselineGlucose: 133, simulatedGlucose: 134, heartRate: 72 }
  ];

  const simDataInsert = (patientId: string, simId: string) => {
    db.run(`
      INSERT OR REPLACE INTO simulation_records (
        id, patient_id, scenario_name, scenario_type, input_params_json, predicted_metrics_json,
        projected_curve_json, ai_rationale, ai_recommendations_json, created_at
      ) VALUES (
        '${simId}',
        '${patientId}',
        'High-GI Meal: White Rice / Biryani + Sweet (85g Carbs)',
        'meal_spike',
        '${JSON.stringify({ nutritionalInput: "High-GI Meal: White Rice / Biryani + Sweet (85g Carbs)", carbohydrates: 85, glycemicIndex: "High", physicalActivity: "Sedentary / Rest" }).replace(/'/g, "''")}',
        '${JSON.stringify({ peakGlucose: 215, timeToPeak: 60, deltaGlucose: 80, cvStressIndex: "Elevated (Level 2)", timeAboveRangeMin: 75, hypoglycemiaRisk: "Minimal", endothelialRisk: "Acute Postprandial Endothelial Stress (Hyperglycemic Spike > 200 mg/dL)" }).replace(/'/g, "''")}',
        '${JSON.stringify(initial3HrCurve).replace(/'/g, "''")}',
        '${"Digital Twin in-silico simulation demonstrates impaired first-phase insulin response characteristic of Ananya''s Type 2 Diabetes (baseline HbA1c 7.8%). Peripheral insulin resistance slows glucose uptake in skeletal muscle, causing postprandial hyperosmolar stress peaking at 215 mg/dL.".replace(/'/g, "''")}',
        '${JSON.stringify([
          "Engage in a 20-minute postprandial brisk walk to recruit non-insulin-mediated GLUT4 transporters.",
          "Replace refined white rice/biryani with low-GI therapeutic choices (millet roti, dal, paneer salad) to flatten the peak excursion.",
          "Maintain current Metformin 850mg BID and Teneligliptin 20mg schedule; monitor postprandial 2-hr levels."
        ]).replace(/'/g, "''")}',
        '${new Date(Date.now() - 2 * 3600 * 1000).toISOString()}'
      );
    `);
  };

  simDataInsert('pat-ananya-iyer', 'sim-init-ananya-01');
  simDataInsert('pat-elena-vance', 'sim-init-01');

  // 6. DPDP Act 2023 Digital Consents Seeding (Section 6 Compliance)
  const defaultConsents = [
    {
      code: 'cgm_telemetry',
      title: 'Continuous CGM & Biosensor Telemetry Ingestion',
      description: 'Streaming real-time interstitial glucose velocity, resting photoplethysmography (PPG) heart rate, and RMSSD heart rate variability from paired BLE wearable devices.',
      legalBasis: 'DPDP Act 2023 Sec 6(1) Explicit Digital Consent',
      isGranted: 1,
      encryptionAtRest: 'AES-256-GCM (Hardware Security Module with Envelope Keying)',
      encryptionInTransit: 'TLS 1.3 with Perfect Forward Secrecy & mTLS Handshake',
      localization: 'India Central (MeitY Empaneled Data Center, Mumbai / Pune DC)',
      retention: 'Active Episode + 90 Days Post-Surveillance',
      manager: 'ABDM Electronic Consent Artifact #IND-CM-2026-4921'
    },
    {
      code: 'digital_twin_kinetics',
      title: 'In-Silico Compartmental Physiological Modeling',
      description: 'Continuous biophysical execution of two-compartment insulin-glucose kinetic equations to forecast metabolic excursions and autonomic stress profiles.',
      legalBasis: 'DPDP Act 2023 Sec 6(1) Explicit Digital Consent',
      isGranted: 1,
      encryptionAtRest: 'AES-256-GCM (Secure Enclave Ephemeral Memory)',
      encryptionInTransit: 'TLS 1.3 / Internal Secure gRPC',
      localization: 'India Central (Mumbai DC Sovereign Boundary)',
      retention: 'Simulation Lifecycle; Zero Persistent Raw PII',
      manager: 'ABDM Electronic Consent Artifact #IND-CM-2026-4921'
    },
    {
      code: 'lifestyle_pharmacotherapy_cds',
      title: 'Personalized Lifestyle & Pharmacotherapy Decision Support',
      description: 'Synthesis of dietary glycemic loads, postprandial physical ambulation (GLUT4 buffering), and clinician titration projections with Dr. Vikramaditya Rao.',
      legalBasis: 'DPDP Act 2023 Sec 6(1) Explicit Digital Consent',
      isGranted: 1,
      encryptionAtRest: 'AES-256-GCM',
      encryptionInTransit: 'TLS 1.3',
      localization: 'India Central (Mumbai DC)',
      retention: '1 Year Rolling Audit History',
      manager: 'ABDM Electronic Consent Artifact #IND-CM-2026-4921'
    },
    {
      code: 'anonymized_research_benchmarks',
      title: 'De-Identified Quality & Epidemiological Benchmarking',
      description: 'Voluntary contribution of anonymized, k-anonymity verified metabolic trajectories to advance Indian Type 2 Diabetes clinical outcome models.',
      legalBasis: 'DPDP Act 2023 Sec 6(1) Explicit Digital Consent (Optional Tier)',
      isGranted: 1,
      encryptionAtRest: 'AES-256-GCM with Cryptographic Salt Hashing',
      encryptionInTransit: 'TLS 1.3',
      localization: 'India Central (Mumbai DC)',
      retention: '3 Years De-Identified Cohort Archive',
      manager: 'ABDM Electronic Consent Artifact #IND-CM-2026-4921'
    }
  ];

  ['pat-ananya-iyer', 'pat-elena-vance'].forEach(pid => {
    defaultConsents.forEach(c => {
      const cid = `cns-${pid}-${c.code}`;
      db.run(`
        INSERT OR REPLACE INTO dpdp_consents (
          id, patient_id, purpose_code, purpose_title, purpose_description, legal_basis,
          is_granted, encryption_at_rest, encryption_in_transit, data_localization_region,
          retention_period, consent_manager, last_updated_at
        ) VALUES (
          '${cid}',
          '${pid}',
          '${c.code}',
          '${c.title.replace(/'/g, "''")}',
          '${c.description.replace(/'/g, "''")}',
          '${c.legalBasis}',
          ${c.isGranted},
          '${c.encryptionAtRest}',
          '${c.encryptionInTransit}',
          '${c.localization}',
          '${c.retention}',
          '${c.manager}',
          '${new Date(Date.now() - 3600 * 1000).toISOString()}'
        );
      `);
    });

    // Seed initial immutable audit logs for this patient
    const initialLogs = [
      {
        id: `aud-${pid}-01`,
        action: 'CONSENT_GRANTED',
        purposeCode: 'cgm_telemetry',
        purposeTitle: 'Continuous CGM & Biosensor Telemetry Ingestion',
        sectionRef: 'DPDP Act 2023 Section 6(1) Notice & Explicit Consent',
        details: 'Data Principal granted explicit, informed digital consent via ABDM Consent Manager #IND-CM-2026-4921 for real-time telemetry processing.',
        ipHash: 'sha256:7a4f91b2c... (Mumbai, IN)',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
      },
      {
        id: `aud-${pid}-02`,
        action: 'ENCRYPTION_VERIFIED',
        purposeCode: 'cgm_telemetry',
        purposeTitle: 'Security Safeguards Audit',
        sectionRef: 'DPDP Act 2023 Section 8(5) Reasonable Security Safeguards',
        details: 'Hardware Security Module (HSM) verified AES-256-GCM envelope encryption at rest and TLS 1.3 forward-secret cipher suites in transit.',
        ipHash: 'sha256:internal-hsm',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      },
      {
        id: `aud-${pid}-03`,
        action: 'LOCALIZATION_AUDIT',
        purposeCode: 'all_purposes',
        purposeTitle: 'Sovereign Cloud Residency Check',
        sectionRef: 'DPDP Act 2023 Section 16 Cross-Border Boundary Enforcement',
        details: 'Data localization check passed: All telemetry time-series and diagnostic records reside strictly within India Central (Mumbai/Pune) regional cloud.',
        ipHash: 'sha256:compliance-audit-bot',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
      },
      {
        id: `aud-${pid}-04`,
        action: 'CONSENT_GRANTED',
        purposeCode: 'digital_twin_kinetics',
        purposeTitle: 'In-Silico Compartmental Physiological Modeling',
        sectionRef: 'DPDP Act 2023 Section 6(1) Notice & Explicit Consent',
        details: 'Data Principal authorized biophysical compartmental modeling for 2-hour postprandial glycemic prediction and metabolic strain simulation.',
        ipHash: 'sha256:7a4f91b2c... (Mumbai, IN)',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
      }
    ];

    initialLogs.forEach(log => {
      db.run(`
        INSERT OR REPLACE INTO dpdp_audit_logs (
          id, patient_id, action, purpose_code, purpose_title, section_reference, details, ip_address_hash, timestamp
        ) VALUES (
          '${log.id}',
          '${pid}',
          '${log.action}',
          '${log.purposeCode}',
          '${log.purposeTitle.replace(/'/g, "''")}',
          '${log.sectionRef.replace(/'/g, "''")}',
          '${log.details.replace(/'/g, "''")}',
          '${log.ipHash}',
          '${log.timestamp}'
        );
      `);
    });
  });

  console.log('[DB] Seeding completed successfully.');
}
