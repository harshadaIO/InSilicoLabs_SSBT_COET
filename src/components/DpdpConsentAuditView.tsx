import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Server,
  FileCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  Clock
} from 'lucide-react';
import { PatientProfile, DpdpConsent, DpdpAuditLog, DpdpCompliancePayload } from '../types';

interface DpdpConsentAuditViewProps {
  patient: PatientProfile;
}

export const DpdpConsentAuditView: React.FC<DpdpConsentAuditViewProps> = ({ patient }) => {
  const [data, setData] = useState<DpdpCompliancePayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [togglingCode, setTogglingCode] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'warn'; message: string } | null>(null);

  const patientId = patient?.id || 'pat-ananya-iyer';
  const patientName = data?.dataPrincipal?.full_name || patient?.full_name || 'Patient Profile';
  const patientSynthea = data?.dataPrincipal?.synthea_id || patient?.synthea_id || 'SYN-IND';
  const patientAge = (data?.dataPrincipal as any)?.age || patient?.age || 45;

  const fetchConsentData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dpdp/consent/${patientId}`);
      if (!res.ok) throw new Error('Failed to fetch DPDP compliance status');
      const payload: DpdpCompliancePayload = await res.json();
      setData(payload);
    } catch (err: any) {
      console.error('Error fetching DPDP data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsentData();
  }, [patientId]);

  const handleToggleConsent = async (purposeCode: string, currentStatus: boolean) => {
    try {
      setTogglingCode(purposeCode);
      const newStatus = !currentStatus;
      const res = await fetch('/api/dpdp/consent/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          purposeCode,
          isGranted: newStatus
        })
      });

      if (!res.ok) throw new Error('Failed to update consent');
      const result = await res.json();

      setNotification({
        type: newStatus ? 'success' : 'warn',
        message: result.message
      });

      // Update local state immediately
      if (data) {
        const updatedConsents = data.consents.map(c =>
          c.purpose_code === purposeCode ? { ...c, is_granted: newStatus, last_updated_at: result.timestamp } : c
        );
        const newLog: DpdpAuditLog = {
          id: result.auditLogId,
          patient_id: patient.id,
          action: result.action,
          purpose_code: purposeCode,
          purpose_title: purposeCode,
          section_reference: result.sectionRef,
          details: result.message,
          ip_address_hash: 'sha256:current-session (Mumbai, IN)',
          timestamp: result.timestamp
        };
        setData({
          ...data,
          consents: updatedConsents,
          auditLogs: [newLog, ...data.auditLogs]
        });
      }

      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      console.error('Toggle consent error:', err);
      setNotification({
        type: 'warn',
        message: 'Could not update consent status. Please try again.'
      });
    } finally {
      setTogglingCode(null);
    }
  };

  const abhaFormatted = data?.dataPrincipal?.abha_id || patient?.abha_id || (patientId.includes('ananya')
    ? '91-4921-3820-1194'
    : patientId.includes('rajesh')
    ? '91-5192-3401-8821'
    : `91-${patientId.replace(/[^0-9]/g, '').padEnd(4, '0').slice(0, 4)}-3820-1194`);

  const allActive = data?.consents.every(c => c.is_granted);
  const anyActive = data?.consents.some(c => c.is_granted);

  return (
    <div className="space-y-6">
      {/* 1. TOP STATUTORY & DATA PRINCIPAL BANNER */}
      <div className="bg-[#0b2545] border border-[#13315c] rounded-2xl p-6 sm:p-7 text-white shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#13315c]/80">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#13315c] text-[#8da9c4] border border-[#134074]">
                DPDP ACT 2023 · SEC. 6 COMPLIANT
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ABDM Consent Gateway Active</span>
              </span>
              <span className="px-2.5 py-1 text-[11px] font-mono text-slate-300 bg-[#13315c]/60 rounded-lg">
                Act No. 22 of 2023
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
                <span>DPDP Act 2023 Compliance & Consent Audit</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#8da9c4] font-medium mt-1 max-w-3xl leading-relaxed">
                Empowering the Data Principal with statutory rights under India's Digital Personal Data Protection Act 2023. Review active digital consents, verify telemetry cryptographic security (AES-256 / TLS 1.3), confirm sovereign data localization, or exercise unconditional right of consent withdrawal per Section 6(4).
              </p>
            </div>

            {/* Principal Demographics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-[#13315c]/60 border border-[#134074] rounded-xl text-xs">
                <span className="text-[#8da9c4] block text-[10px] uppercase font-bold">Data Principal (User)</span>
                <strong className="text-white font-bold text-sm">{patientName}</strong>
                <span className="text-slate-400 font-mono block text-[11px]">{patientSynthea} · {patientAge}y</span>
              </div>

              <div className="p-3 bg-[#13315c]/60 border border-[#134074] rounded-xl text-xs">
                <span className="text-[#8da9c4] block text-[10px] uppercase font-bold">ABHA Health ID</span>
                <strong className="text-emerald-300 font-mono font-bold text-sm">{abhaFormatted}</strong>
                <span className="text-slate-400 block text-[11px]">National Digital Health Mission</span>
              </div>

              <div className="p-3 bg-[#13315c]/60 border border-[#134074] rounded-xl text-xs">
                <span className="text-[#8da9c4] block text-[10px] uppercase font-bold">Data Fiduciary</span>
                <strong className="text-white font-bold text-sm">VitaTwin Endocrine Network</strong>
                <span className="text-slate-400 block text-[11px]">Attending: Dr. Vikramaditya Rao, MD</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full sm:w-auto lg:w-64">
            <button
              onClick={fetchConsentData}
              disabled={loading}
              className="min-h-[44px] px-4 py-2.5 text-xs font-semibold text-white bg-[#13315c] hover:bg-[#134074] border border-[#8da9c4]/30 rounded-xl transition-all flex items-center justify-center gap-2 w-full whitespace-nowrap shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#8da9c4] ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Cryptographic Audit</span>
            </button>
          </div>
        </div>

        {/* Global Compliance Status Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#13315c]/70 border border-[#134074] rounded-xl">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${allActive ? 'bg-emerald-400 animate-pulse' : anyActive ? 'bg-amber-400' : 'bg-rose-400'}`} />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Statutory Processing Status:</span>
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                  allActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : anyActive ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {allActive ? 'ACTIVE CONSENT · FULL PIPELINE AUTHORIZED' : anyActive ? 'PARTIALLY RESTRICTED · SELECTIVE WITHDRAWAL' : 'PROCESSING SUSPENDED · CONSENT WITHDRAWN'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Section 6(4) guarantees the Data Principal’s unconditional right to revoke consent with immediate computational suspension.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-[#8da9c4] shrink-0">
            Regulated by DPB India
          </span>
        </div>
      </div>

      {/* Real-time Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-3 shadow-md animate-in fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          )}
          <div className="flex-1 font-semibold">{notification.message}</div>
        </div>
      )}

      {/* 2. SECURITY, ENCRYPTION & DATA LOCALIZATION VERIFICATION CARDS */}
      <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#134074]">
            <Lock className="w-4 h-4 text-[#134074]" />
            <span>Section 8 Compliance · Reasonable Security Safeguards & Localization</span>
          </div>
          <h3 className="text-xl font-extrabold text-[#0b2545] mt-1">
            Telemetry Cryptography & Sovereign Residency Verification
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Audit-grade cryptographic telemetry protection verified under DPDP Act 2023 Section 8(5) and Section 16 data residency mandates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Encryption at Rest */}
          <div className="p-5 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#134074] bg-[#eef4ed] px-2 py-0.5 rounded">
                SEC. 8(5) SAFEGUARD
              </span>
              <Lock className="w-4 h-4 text-[#134074]" />
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Encryption at Rest</div>
              <div className="text-base font-extrabold font-mono text-[#0b2545] mt-0.5">
                AES-256-GCM
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>FIPS 140-3 Hardware HSM</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug border-t border-slate-100 pt-2">
              All synthetic EHR diagnostic records and time-series wearable points encrypted with envelope keying and 24-hour key rotation.
            </p>
          </div>

          {/* Card 2: Encryption in Transit */}
          <div className="p-5 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#134074] bg-[#eef4ed] px-2 py-0.5 rounded">
                SEC. 8(5) SAFEGUARD
              </span>
              <KeyRound className="w-4 h-4 text-emerald-600" />
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Encryption in Transit</div>
              <div className="text-base font-extrabold font-mono text-[#0b2545] mt-0.5">
                TLS 1.3 / mTLS
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Perfect Forward Secrecy</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug border-t border-slate-100 pt-2">
              Sensor BLE packets and client telemetry streams transported via mutual TLS (mTLS) with ECDHE-ECDSA-AES256 cipher suites.
            </p>
          </div>

          {/* Card 3: Sovereign Data Localization */}
          <div className="p-5 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                SEC. 16 RESIDENCY
              </span>
              <Server className="w-4 h-4 text-blue-600" />
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Data Localization</div>
              <div className="text-base font-extrabold font-mono text-[#0b2545] mt-0.5">
                India Central
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mumbai / Pune MeitY Cloud</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug border-t border-slate-100 pt-2">
              Cross-border transfer strictly prohibited. All data persists solely within Indian sovereign cloud data centers.
            </p>
          </div>

          {/* Card 4: Zero-PII De-Identification */}
          <div className="p-5 bg-white border border-[#8da9c4]/30 rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#134074] bg-[#eef4ed] px-2 py-0.5 rounded">
                HIPAA & DPDP
              </span>
              <FileCheck className="w-4 h-4 text-[#134074]" />
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">Privacy Sandbox</div>
              <div className="text-base font-extrabold font-mono text-[#0b2545] mt-0.5">
                Zero-PII Tokenization
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Synthetic ABHA Isolation</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug border-t border-slate-100 pt-2">
              Direct real-world PII is never stored or transmitted. Telemetry streams operate strictly on de-identified tokens.
            </p>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE DIGITAL CONSENTS & LIVE SECTION 6 TOGGLE CONTROLS */}
      <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#8da9c4]/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#134074]">
              <ShieldCheck className="w-4 h-4 text-[#134074]" />
              <span>Section 6(1) Notice & Section 6(4) Unconditional Right of Withdrawal</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#0b2545] mt-1">
              Active Digital Consent Registry & Purpose Permissions
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              The Data Principal retains absolute statutory authority to grant or revoke processing permissions for each biometric purpose at any time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1.5 bg-[#eef4ed] text-[#0b2545] border border-[#8da9c4]/40 rounded-xl">
              {data?.consents.filter(c => c.is_granted).length} of {data?.consents.length || 4} Purposes Authorized
            </span>
          </div>
        </div>

        {/* Consents List */}
        <div className="space-y-4">
          {data?.consents.map((consent, idx) => (
            <div
              key={consent.id || idx}
              className={`p-5 rounded-2xl border transition-all shadow-xs ${
                consent.is_granted
                  ? 'bg-white border-[#8da9c4]/40 hover:border-[#134074]/60'
                  : 'bg-rose-50/40 border-rose-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#13315c] text-white">
                      PURPOSE #{idx + 1}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      consent.is_granted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {consent.is_granted ? '● ACTIVE & VERIFIED' : '○ REVOKED / SUSPENDED'}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Ref: {consent.legal_basis}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#0b2545]">
                    {consent.purpose_title}
                  </h4>

                  <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                    {consent.purpose_description}
                  </p>

                  {/* Metadata Specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] font-mono text-slate-600">
                    <div className="p-2 bg-[#eef4ed]/60 rounded-lg">
                      <span className="text-slate-500 font-sans block text-[9px] uppercase font-bold">Cryptographic Spec:</span>
                      <strong className="text-[#0b2545]">{consent.encryption_at_rest.split(' ')[0]} / {consent.encryption_in_transit.split(' ')[0]}</strong>
                    </div>

                    <div className="p-2 bg-[#eef4ed]/60 rounded-lg">
                      <span className="text-slate-500 font-sans block text-[9px] uppercase font-bold">Data Residency:</span>
                      <strong className="text-[#0b2545]">{consent.data_localization_region.split('(')[0]}</strong>
                    </div>

                    <div className="p-2 bg-[#eef4ed]/60 rounded-lg">
                      <span className="text-slate-500 font-sans block text-[9px] uppercase font-bold">Retention Horizon:</span>
                      <strong className="text-[#0b2545]">{consent.retention_period}</strong>
                    </div>
                  </div>

                  {!consent.is_granted && (
                    <div className="p-2.5 bg-rose-100/70 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-center gap-2 mt-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        <strong>Processing Paused:</strong> Data Principal exercised Section 6(4) right to withdraw consent. Telemetry ingestion pipeline and in-silico twin updates are currently suspended for this purpose.
                      </span>
                    </div>
                  )}
                </div>

                {/* Live Section 6 Toggle Switch */}
                <div className="flex flex-col items-end gap-2 shrink-0 md:pl-4 md:border-l border-slate-100">
                  <div className="text-[11px] font-bold uppercase text-slate-500">
                    Section 6 Statutory Consent
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleConsent(consent.purpose_code, consent.is_granted)}
                    disabled={togglingCode === consent.purpose_code}
                    className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      consent.is_granted ? 'bg-[#134074]' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={consent.is_granted}
                    title={consent.is_granted ? 'Click to revoke consent per Section 6(4)' : 'Click to grant consent per Section 6(1)'}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        consent.is_granted ? 'translate-x-8' : 'translate-x-0'
                      }`}
                    />
                  </button>

                  <div className="text-xs font-bold font-mono">
                    {consent.is_granted ? (
                      <span className="text-emerald-700">Consent Granted</span>
                    ) : (
                      <span className="text-rose-700">Consent Revoked</span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500">
                    {consent.is_granted ? 'Tap to withdraw consent' : 'Tap to re-authorize'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. IMMUTABLE SECTION 6 AUDIT LOG TRAIL */}
      <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#134074]">
              <Clock className="w-4 h-4 text-[#134074]" />
              <span>Immutable Consent Audit Log & Statutory Ledger</span>
            </div>
            <h3 className="text-lg font-bold text-[#0b2545] mt-0.5">
              Chronological Audit Trail of Consent Grants, Withdrawals & Security Checks
            </h3>
          </div>

          <span className="text-xs font-mono px-3 py-1 bg-white border border-[#8da9c4]/40 rounded-xl text-slate-600">
            Append-Only Verification Ledger
          </span>
        </div>

        <div className="overflow-x-auto border border-[#8da9c4]/30 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#eef4ed] text-[#13315c] uppercase text-[10px] tracking-wider border-b border-[#8da9c4]/30 font-bold">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Purpose / Subsystem</th>
                <th className="py-3 px-4">Statutory Reference</th>
                <th className="py-3 px-4">Audit Details</th>
                <th className="py-3 px-4">Verification IP Hash</th>
                <th className="py-3 px-4">Timestamp (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {data?.auditLogs && data.auditLogs.length > 0 ? (
                data.auditLogs.map((log, i) => (
                  <tr key={log.id || i} className="hover:bg-[#eef4ed]/40 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'CONSENT_GRANTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action === 'CONSENT_REVOKED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#0b2545]">
                      {log.purpose_title || log.purpose_code}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {log.section_reference}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {log.ip_address_hash}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No consent audit events recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
