# VitaTwin - AI-Powered Patient Digital Twin & Predictive Simulation Engine

VitaTwin is a full-stack clinical digital twin platform that unites static Electronic Health Record (EHR) diagnostic baselines with dynamic continuous wearable biometric streams (CGM glucose, PPG heart rate, sleep architecture). Powered by advanced predictive modeling and compartmental physiological kinetics, it simulates forward postprandial glucose curves and cardiovascular strain before clinical symptoms occur.

---

## 1. Core Architecture & Features

### A. Multimodal Data Fusion Pipeline
- **Static EHR Layer**: Modeled on Synthea / MIMIC-IV FHIR schemas containing demographics, chronic diagnoses (ICD-10 / SNOMED-CT), active medications (RxNorm), and baseline laboratory diagnostic panels (HbA1c, eGFR, fasting blood sugar, lipid panel, baseline BP).
- **Dynamic Wearable Telemetry**: Ingests high-frequency time-series data modeling Continuous Glucose Monitors (CGM mg/dL), heart rate (bpm), HRV (RMSSD ms), sleep stages (Deep, REM, Light, Awake), and step count.
- **[Sync Wearable Data]**: Live endpoint (`POST /api/wearables/sync`) that generates and appends fresh synthetic time-series sensor points to the database with immediate chart animation.

### B. "What-If" Predictive Scenario Simulator
- Enables patients and clinicians to formulate lifestyle and dietary perturbations:
  - Carbohydrate dosage (0 - 150g) and Glycemic Index (Low, Medium, High)
  - Postprandial physical activity (0 - 60 min brisk walking for non-insulin GLUT4 translocation)
  - Pharmacotherapy adherence (Normal Metformin dose, Skipped, or Delayed)
  - Autonomic / Cortisol stress surge
- **Predictive Trajectory Engine**: Computes 120-minute forward trajectories at 15-minute intervals.
- **Deterministic Physiological Fallback**: Built-in Bergman Minimal Model compartment fallback guarantees 100% platform availability under all network conditions.

### C. Clinician Command Center & Early Warning Ticker
- **Cohort Surveillance**: Searchable, filterable patient table with risk stratification badges (High, Medium, Low).
- **Patient Detail Drill-Down**: Full Synthea EHR modal detailing baseline labs, condition timelines, and care plans.
- **AI Early Warning Ticker**: Flags real-time anomaly risks (e.g., nocturnal hypoglycemia velocity, postprandial spikes > 200 mg/dL).
- **Interactive Action Handlers**: **[Acknowledge Alert]** and **[Adjust Treatment Protocol]** with instant database updates.

### D. Regulatory Sandbox Compliance
- **DPDP Act 2023**: Operates within a synthetic anonymized sandbox. Zero real-world PII stored.
- **HIPAA Safe Harbor**: Compliant with 45 CFR § 164.514 de-identification standards.

---

## 2. Pre-Seeded Clinical Profiles

| Persona | Email | Password | Role & Features |
|---|---|---|---|
| **Patient: Elena Vance** | `elena.vance@example.com` | `patient123` | 52y T2D, CGM telemetry, What-If simulator |
| **Clinician: Dr. Marcus Chen, MD** | `dr.marcus.chen@hospital.org` | `doctor123` | Cohort risk stratification, alert surveillance, treatment adjustments |

---

## 3. Technology Stack

- **Frontend**: React.js, Tailwind CSS, React Router, Lucide React, Recharts, Motion
- **Backend**: Node.js Express (`server.ts` + `server/routes.ts`)
- **Database**: SQLite powered by WebAssembly `sql.js` with disk persistence (`data/vitatwin.sqlite`)
- **AI & Kinetics**: Predictive simulation engine with mathematical compartmental fallback
- **Auth**: JWT Authentication (`jsonwebtoken`) & `bcryptjs` password hashing

---

## 4. Local Installation & Development

```bash
# 1. Install dependencies
npm install

# 2. Environment Variables
cp .env.example .env

# 3. Start Full-Stack Dev Server (Port 3000)
npm run dev

# 4. Production Build
npm run build
npm start
```
