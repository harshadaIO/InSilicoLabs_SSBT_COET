# VitaTwin: AI-Powered Patient Digital Twin & Predictive Simulation Engine

> **Next-generation clinical digital twin platform uniting static EHR diagnostic profiles with high-frequency wearable biometric streams for proactive metabolic and cardiovascular care[cite: 3].**

---

## Team & Submission Details
- **Team Name / ID:** mahajanharshada2006
- **College / Incubator:** SSBT's College of Engineering and Technology Jalgaon
- **Team Leader Name:** Harshada Ravindra Mahajan
- **Contact Number:** 8010459735
- **Email ID:** mahajanharshada2006@gmail.com
- **Public GitHub Repository:** https://github.com/mahajanharshada2006/InSilicoLabs_SSBT_COET
- **Live Application:** https://vitatwin.onrender.com
- **Demo & Walkthrough Video:** [YouTube Video Demonstration Link](https://youtu.be/YOUR_YOUTUBE_VIDEO_ID_HERE)
- **Open-Source License:** Distributed under the **MIT License**

---

## 1. Problem Statement & Healthcare Use Case
- **Problem Statement:** Traditional management of Type 2 Diabetes Mellitus (T2DM) relies heavily on retrospective, 3-month HbA1c laboratory samples. This reactive model leaves clinicians completely blind to daily glycemic volatility, postprandial glucose excursions, and cumulative cardiorenal strain between episodic clinical visits.
- **Healthcare Use Case:** VitaTwin bridges the gap between static diagnostics and real-world physiology by building an in-silico patient digital twin. It empowers patients with a "What-If" lifestyle simulator to forecast glucose trends and equips clinicians with real-time anomaly alerts and a pharmacotherapy titration simulator to optimize outcomes safely.

---

## 2. Core Architecture & Features

### A. Multimodal Data Fusion Pipeline
- **Static EHR Layer**: Modeled on Synthea / MIMIC-IV FHIR schemas containing demographics, chronic diagnoses (ICD-10 / SNOMED-CT), active medications (RxNorm), and baseline laboratory diagnostic panels (HbA1c, eGFR, fasting blood sugar, lipid panel, baseline BP)[cite: 3].
- **Dynamic Wearable Telemetry**: Ingests high-frequency time-series data modeling Continuous Glucose Monitors (CGM mg/dL), heart rate (bpm), HRV (RMSSD ms), sleep stages (Deep, REM, Light, Awake), and step count.
- **Live Sync Endpoint**: Live endpoint (`POST /api/wearables/sync`) that generates and appends fresh synthetic time-series sensor points to the database with immediate chart animation.

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
- **DPDP Act 2023**: Operates within a synthetic anonymized sandbox with Data Principal consent management and regional localization architecture[cite: 3].
- **HIPAA Safe Harbor**: Compliant with 45 CFR § 164.514 de-identification standards.

---

## 3. Pre-Seeded Clinical Profiles

| Persona | Email | Password | Role & Features |
|---|---|---|---|
| **Patient: Ananya Iyer** | `ananya.iyer@example.com` | `patient123` | 52y T2D, CGM telemetry, What-If simulator |
| **Clinician: Dr. Vikramaditya Rao, MD** | `dr.vikramaditya.rao@example.com` | `doctor123` | Cohort risk stratification, alert surveillance, treatment adjustments[cite: 3] |

---

## 4. Evaluation Documents & Architecture
- **[Architecture Diagram PDF](docs/architecture-diagram.pdf)** (Comprehensive multi-organ in-silico workflow diagram)
- **[Project Presentation PDF](docs/project-presentation.pdf)** (Project presentation deck, clinical outcomes, and metrics)

---

## 5. Technology Stack & AI Framework Details
- **Frontend**: React.js, Tailwind CSS, React Router, Lucide React, Recharts, Motion
- **Backend**: Node.js Express (`server.ts` + `server/routes.ts`)
- **Database**: SQLite powered by WebAssembly `sql.js` with disk persistence (`data/vitatwin.sqlite`)
- **AI/ML Model & Framework**: Hybrid predictive simulation engine combining Google Gemini structured LLM reasoning with mathematical compartmental modeling (Bergman Minimal Model fallback).
- **Auth**: JWT Authentication (`jsonwebtoken`) & `bcryptjs` password hashing

---

## 6. Repository Structure

```text
mahajanharshada2006_SSBT_COET/
├── server/                 # Express backend, Gemini AI integration, and clinical titration logic
├── client/                 # React frontend, patient/clinician portals, and simulation charts
├── docs/                   # Supporting evaluation documentation
│   ├── architecture-diagram.pdf  # Comprehensive multi-organ in-silico workflow diagram
│   └── project-presentation.pdf  # Project presentation deck, clinical outcomes, and metrics
├── package.json            # Project dependencies and build scripts
└── README.md               # Elite project documentation
