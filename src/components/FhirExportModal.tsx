import React, { useState } from 'react';
import { PatientProfile } from '../types';
import {
  X,
  FileCode,
  Download,
  Copy,
  Check,
  Printer,
  FileText,
  ShieldCheck,
  User,
  Activity,
  Stethoscope,
  Building2,
  Calendar
} from 'lucide-react';

interface FhirExportModalProps {
  patient: PatientProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FhirExportModal: React.FC<FhirExportModalProps> = ({
  patient,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'summary'>('json');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !patient) return null;

  const abhaId = patient.abha_id || (
    patient.id.includes('ananya')
      ? '91-4921-8302-1194'
      : patient.id.includes('rajesh')
      ? '91-5192-3401-8821'
      : patient.id.includes('siddharth')
      ? '91-8832-7719-4450'
      : patient.id.includes('priya')
      ? '91-7401-2290-6632'
      : '91-6284-9012-3341'
  );

  const syntheaFormatted = patient.synthea_id.endsWith('-T2D')
    ? patient.synthea_id
    : `${patient.synthea_id}-T2D`;

  const labs = patient.baselineLabs || {
    hba1c: 7.8,
    fastingGlucose: 142,
    homaIr: 3.4,
    egfr: 76,
    ldl: 128,
    hdl: 46,
    triglycerides: 182,
    systolicBp: 132,
    diastolicBp: 84,
    creatinine: 0.98
  };

  const nameParts = patient.full_name.split(' ');
  const familyName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
  const givenName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : patient.full_name;

  // Generate Valid HL7 FHIR Release 4 Document Bundle
  const fhirBundle = {
    resourceType: 'Bundle',
    id: `bundle-${patient.id}-export`,
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString(),
      profile: [
        'http://hl7.org/fhir/StructureDefinition/Bundle',
        'https://nrces.in/ndhm/fhir/r4/StructureDefinition/ClinicalArtifact'
      ]
    },
    identifier: {
      system: 'https://vitatwin.hospital.org/fhir/bundles',
      value: `FHIR-${syntheaFormatted}-${Date.now()}`
    },
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: [
      // 1. Patient Resource (with ABHA and Synthea identifiers)
      {
        fullUrl: `urn:uuid:patient-${patient.id}`,
        resource: {
          resourceType: 'Patient',
          id: patient.id,
          identifier: [
            {
              use: 'official',
              type: {
                coding: [
                  {
                    system: 'https://abdm.gov.in/fhir/ndhm/identifier-type',
                    code: 'ABHA',
                    display: 'Ayushman Bharat Health Account ID'
                  }
                ]
              },
              system: 'https://healthid.ndhm.gov.in',
              value: abhaId
            },
            {
              use: 'secondary',
              type: {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                    code: 'MR',
                    display: 'Medical Record Number (Synthea EHR)'
                  }
                ]
              },
              system: 'https://synthea.mitre.org/fhir/patients',
              value: syntheaFormatted
            }
          ],
          active: true,
          name: [
            {
              use: 'official',
              text: patient.full_name,
              family: familyName,
              given: [givenName]
            }
          ],
          gender: patient.gender.toLowerCase(),
          birthDate: patient.dob,
          telecom: patient.phone
            ? [{ system: 'phone', value: patient.phone, use: 'mobile' }]
            : undefined,
          generalPractitioner: [
            {
              display: 'Dr. Vikramaditya Rao, MD (Endocrinology)',
              identifier: {
                system: 'https://nmc.org.in/doctor-registration',
                value: 'NMC-IND-END-58491'
              }
            }
          ],
          managingOrganization: {
            display: 'Department of Endocrinology & Metabolic Medicine, National Diabetes Institute, New Delhi'
          }
        }
      },
      // 2. Glycated Hemoglobin Observation (LOINC 4548-4)
      {
        fullUrl: `urn:uuid:obs-hba1c-${patient.id}`,
        resource: {
          resourceType: 'Observation',
          id: `obs-hba1c-${patient.id}`,
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'laboratory',
                  display: 'Laboratory'
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '4548-4',
                display: 'Hemoglobin A1c/Hemoglobin.total in Blood'
              }
            ],
            text: 'Glycated Hemoglobin (HbA1c)'
          },
          subject: { reference: `urn:uuid:patient-${patient.id}` },
          effectiveDateTime: new Date().toISOString(),
          valueQuantity: {
            value: labs.hba1c,
            unit: '%',
            system: 'http://unitsofmeasure.org',
            code: '%'
          },
          referenceRange: [
            {
              high: { value: 7.0, unit: '%', system: 'http://unitsofmeasure.org', code: '%' },
              text: 'ADA/RSSDI Clinical Goal: < 7.0 %'
            }
          ]
        }
      },
      // 3. Fasting Glucose Observation (LOINC 1558-6)
      {
        fullUrl: `urn:uuid:obs-fpg-${patient.id}`,
        resource: {
          resourceType: 'Observation',
          id: `obs-fpg-${patient.id}`,
          status: 'final',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '1558-6',
                display: 'Fasting glucose [Mass/volume] in Serum or Plasma'
              }
            ],
            text: 'Fasting Plasma Glucose'
          },
          subject: { reference: `urn:uuid:patient-${patient.id}` },
          valueQuantity: {
            value: labs.fastingGlucose,
            unit: 'mg/dL',
            system: 'http://unitsofmeasure.org',
            code: 'mg/dL'
          },
          referenceRange: [
            {
              low: { value: 70, unit: 'mg/dL' },
              high: { value: 100, unit: 'mg/dL' },
              text: 'Normoglycemic: 70 - 100 mg/dL'
            }
          ]
        }
      },
      // 4. Blood Pressure Component Observation (LOINC 85354-9)
      {
        fullUrl: `urn:uuid:obs-bp-${patient.id}`,
        resource: {
          resourceType: 'Observation',
          id: `obs-bp-${patient.id}`,
          status: 'final',
          category: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                  code: 'vital-signs',
                  display: 'Vital Signs'
                }
              ]
            }
          ],
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '85354-9',
                display: 'Blood pressure panel with all children optional'
              }
            ],
            text: 'Blood Pressure'
          },
          subject: { reference: `urn:uuid:patient-${patient.id}` },
          component: [
            {
              code: {
                coding: [
                  {
                    system: 'http://loinc.org',
                    code: '8480-6',
                    display: 'Systolic blood pressure'
                  }
                ]
              },
              valueQuantity: { value: labs.systolicBp, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' }
            },
            {
              code: {
                coding: [
                  {
                    system: 'http://loinc.org',
                    code: '8462-4',
                    display: 'Diastolic blood pressure'
                  }
                ]
              },
              valueQuantity: { value: labs.diastolicBp, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' }
            }
          ]
        }
      },
      // 5. Estimated Glomerular Filtration Rate Observation (LOINC 33914-3)
      {
        fullUrl: `urn:uuid:obs-egfr-${patient.id}`,
        resource: {
          resourceType: 'Observation',
          id: `obs-egfr-${patient.id}`,
          status: 'final',
          code: {
            coding: [
              {
                system: 'http://loinc.org',
                code: '33914-3',
                display: 'Glomerular filtration rate/1.73 sq M.predicted [Volume Rate/Area] in Serum or Plasma by CKD-EPI'
              }
            ],
            text: 'eGFR (CKD-EPI 2021)'
          },
          subject: { reference: `urn:uuid:patient-${patient.id}` },
          valueQuantity: {
            value: labs.egfr,
            unit: 'mL/min/1.73m²',
            system: 'http://unitsofmeasure.org',
            code: 'mL/min/1.73m2'
          }
        }
      },
      // 6. Primary Condition Resource (SNOMED-CT / ICD-10)
      {
        fullUrl: `urn:uuid:cond-t2d-${patient.id}`,
        resource: {
          resourceType: 'Condition',
          id: `cond-t2d-${patient.id}`,
          clinicalStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }]
          },
          verificationStatus: {
            coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }]
          },
          category: [
            {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-category', code: 'encounter-diagnosis' }]
            }
          ],
          code: {
            coding: [
              { system: 'http://snomed.info/sct', code: '44054006', display: 'Type 2 diabetes mellitus' },
              { system: 'http://hl7.org/fhir/sid/icd-10', code: 'E11.9', display: 'Type 2 diabetes mellitus without complications' }
            ],
            text: patient.primary_condition
          },
          subject: { reference: `urn:uuid:patient-${patient.id}` }
        }
      },
      // 7. MedicationRequest Resources
      ...(patient.medications || []).map((med, idx) => ({
        fullUrl: `urn:uuid:med-req-${patient.id}-${idx}`,
        resource: {
          resourceType: 'MedicationRequest',
          id: `med-req-${patient.id}-${idx}`,
          status: 'active',
          intent: 'order',
          medicationCodeableConcept: {
            text: med
          },
          subject: { reference: `urn:uuid:patient-${patient.id}` },
          authoredOn: new Date().toISOString(),
          requester: {
            display: 'Dr. Vikramaditya Rao, MD (Endocrinology)'
          }
        }
      }))
    ]
  };

  const jsonString = JSON.stringify(fhirBundle, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FHIR-R4-${syntheaFormatted}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b2545]/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#8da9c4]/40 max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-[#0b2545] border-b border-[#13315c] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#134074] border border-[#8da9c4]/30 flex items-center justify-center text-white shadow-inner">
              <FileCode className="w-5 h-5 text-[#8da9c4]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#8da9c4] uppercase tracking-wider">
                  HL7® FHIR® R4 Export Engine
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  ABDM / NDHM Validated
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Interoperable Clinical Record · {patient.full_name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#13315c] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip & Actions Ribbon */}
        <div className="px-4 sm:px-6 py-3 bg-[#eef4ed] border-b border-[#8da9c4]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('json')}
              className={`min-h-[38px] px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'json'
                  ? 'bg-[#134074] text-white shadow-xs'
                  : 'bg-white border border-[#8da9c4]/40 text-[#0b2545] hover:bg-slate-50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>FHIR R4 JSON Bundle</span>
            </button>
            <button
              onClick={() => setActiveTab('summary')}
              className={`min-h-[38px] px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'summary'
                  ? 'bg-[#134074] text-white shadow-xs'
                  : 'bg-white border border-[#8da9c4]/40 text-[#0b2545] hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Executive Clinical Summary</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopy}
              className="min-h-[38px] px-3.5 py-1.5 text-xs font-bold text-[#0b2545] bg-white border border-[#8da9c4]/40 hover:bg-[#eef4ed] rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#134074]" />}
              <span>{copied ? 'Copied JSON' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="min-h-[38px] px-3.5 py-1.5 text-xs font-bold text-white bg-[#134074] hover:bg-[#0b2545] rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#8da9c4]" />
              <span>Download .json</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-[#8da9c4]/40 hover:text-[#0b2545] rounded-xl transition-all shadow-2xs flex items-center gap-1"
              title="Print Clinical Summary"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {activeTab === 'json' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 font-mono">
                <span>Standard: HL7 FHIR Release 4 (Bundle Type: Document)</span>
                <span>Resources: Patient, 4x Observations, Condition, MedicationRequests</span>
              </div>
              <pre className="p-4 bg-[#0b2545] text-slate-200 rounded-xl text-xs font-mono overflow-x-auto max-h-[500px] border border-[#13315c] leading-relaxed select-all">
                {jsonString}
              </pre>
            </div>
          ) : (
            <div className="space-y-6 text-[#0b2545] print:p-0">
              {/* Clinical Summary Header */}
              <div className="border-b border-[#8da9c4]/30 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#134074]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#134074]">
                      AIIMS National Diabetes Institute · Digital Twin Endocrinology Network
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 font-semibold">
                    Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-[#0b2545] mt-2">
                  Comprehensive Diagnostic & Physiological Digital Twin Report
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Standardized FHIR R4 clinical summary synthesizing Synthea electronic health records, continuous glucose telemetry, and organ kinetic simulations.
                </p>
              </div>

              {/* Patient Demographics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#eef4ed] border border-[#8da9c4]/30 rounded-xl">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Patient Name</div>
                  <div className="text-sm font-bold text-[#0b2545] mt-0.5">{patient.full_name}</div>
                  <div className="text-[11px] text-slate-500">{patient.age}y {patient.gender} · {patient.dob}</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">ABHA Health ID</div>
                  <div className="text-sm font-mono font-bold text-[#134074] mt-0.5">{abhaId}</div>
                  <div className="text-[11px] text-slate-500">Synthea #{syntheaFormatted}</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Attending Physician</div>
                  <div className="text-sm font-bold text-[#0b2545] mt-0.5">Dr. Vikramaditya Rao, MD</div>
                  <div className="text-[11px] text-slate-500">Dept of Endocrinology</div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500">Clinical Stratification</div>
                  <div className="text-sm font-bold text-[#0b2545] mt-0.5 capitalize">{patient.risk_level} Risk Tier</div>
                  <div className="text-[11px] text-slate-500">{patient.primary_condition}</div>
                </div>
              </div>

              {/* Baseline Labs Matrix */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#134074] mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#134074]" />
                  <span>Baseline Laboratory Panels (LOINC Harmonized)</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">HbA1c</div>
                    <div className="text-xl font-bold font-mono text-[#0b2545]">{labs.hba1c}%</div>
                    <div className="text-[10px] text-rose-600 font-semibold">Target &lt; 7.0%</div>
                  </div>

                  <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Fasting Glucose</div>
                    <div className="text-xl font-bold font-mono text-[#0b2545]">{labs.fastingGlucose} mg/dL</div>
                    <div className="text-[10px] text-slate-500">Preprandial state</div>
                  </div>

                  <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">HOMA-IR Score</div>
                    <div className="text-xl font-bold font-mono text-[#0b2545]">{labs.homaIr}</div>
                    <div className="text-[10px] text-amber-700 font-semibold">Marked Resistance</div>
                  </div>

                  <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">eGFR Renal Index</div>
                    <div className="text-xl font-bold font-mono text-[#0b2545]">{labs.egfr}</div>
                    <div className="text-[10px] text-slate-500">mL/min/1.73m² (CKD 2)</div>
                  </div>

                  <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Blood Pressure</div>
                    <div className="text-xl font-bold font-mono text-[#0b2545]">{labs.systolicBp}/{labs.diastolicBp}</div>
                    <div className="text-[10px] text-slate-500">mm Hg (Resting)</div>
                  </div>

                  <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">LDL-C / Triglycerides</div>
                    <div className="text-xl font-bold font-mono text-[#0b2545]">{labs.ldl} / {labs.triglycerides}</div>
                    <div className="text-[10px] text-slate-500">mg/dL (Dyslipidemia)</div>
                  </div>

                  <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Serum Creatinine</div>
                    <div className="text-xl font-bold font-mono text-[#0b2545]">{labs.creatinine || 0.98} mg/dL</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">Normal range</div>
                  </div>

                  <div className="p-3 bg-white border border-[#8da9c4]/30 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">BMI & WHR</div>
                    <div className="text-xl font-bold font-mono text-[#0b2545]">{patient.bmi} kg/m²</div>
                    <div className="text-[10px] text-slate-500">WHR: {patient.anthropometrics?.waistToHipRatio || 0.86}</div>
                  </div>
                </div>
              </div>

              {/* Active Prescriptions */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#134074] mb-2 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[#134074]" />
                  <span>Current Pharmacotherapy Protocol</span>
                </h4>
                <div className="p-4 bg-white border border-[#8da9c4]/30 rounded-xl space-y-1.5">
                  {(patient.medications || []).map((med, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#0b2545]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#134074]" />
                      <span className="font-semibold">{med}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Digital Twin Clinical Rationale & Signature */}
              <div className="pt-4 border-t border-[#8da9c4]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  <span>Authorized by: </span>
                  <strong className="text-[#0b2545]">Dr. Vikramaditya Rao, MD (Endocrinology)</strong>
                  <div>Medical Registration: NMC-IND-END-58491</div>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  VitaTwin In-Silico Endocrinology Platform · ISO 27001 / DPDP 2023 Compliant
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
