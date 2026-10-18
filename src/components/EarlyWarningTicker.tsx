import React from 'react';
import { AlertLog } from '../types';
import { CheckCircle, ShieldAlert, Stethoscope } from 'lucide-react';

interface EarlyWarningTickerProps {
  alerts: AlertLog[];
  onAcknowledge: (alertId: string) => void;
  onAdjustProtocol?: (patientId: string) => void;
}

export const EarlyWarningTicker: React.FC<EarlyWarningTickerProps> = ({
  alerts,
  onAcknowledge,
  onAdjustProtocol
}) => {
  const activeAlerts = alerts.filter(a => a.status === 'active');

  if (activeAlerts.length === 0) {
    return (
      <div className="bg-white/85 backdrop-blur-md border border-[#8da9c4]/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-[#0b2545] shadow-sm">
        <div className="flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Continuous Telemetry Surveillance: All patient biometric data streams are within normal target bounds.
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-700 font-bold shrink-0">0 Active Critical Anomalies</span>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-md border border-rose-200/80 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-950 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>AI Predictive Early Warning Ticker ({activeAlerts.length} Active)</span>
          </h3>
        </div>
        <span className="text-[11px] font-medium text-slate-500">Real-time Synthea & Sensor Fusion</span>
      </div>

      <div className="space-y-2.5">
        {activeAlerts.map(alert => (
          <div
            key={alert.id}
            className={`p-3.5 sm:p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              alert.severity === 'critical'
                ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                : 'bg-amber-50/70 border-amber-200 text-amber-950'
            }`}
          >
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-bold">
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                  alert.severity === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  {alert.severity}
                </span>
                <span className="text-[#0b2545]">{alert.title}</span>
                {alert.patient_name && (
                  <span className="text-slate-600 font-normal">
                    · Patient: <strong className="text-[#0b2545] font-semibold">{alert.patient_name}</strong>
                  </span>
                )}
                <span className="text-slate-500 font-normal">
                  ({new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                {alert.anomaly_detected}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="min-h-[38px] px-3.5 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-[#0b2545] border border-slate-300 rounded-lg transition-colors whitespace-nowrap shadow-2xs flex-1 sm:flex-initial flex items-center justify-center"
              >
                Acknowledge Alert
              </button>

              {onAdjustProtocol && (
                <button
                  onClick={() => onAdjustProtocol(alert.patient_id)}
                  className="min-h-[38px] px-3.5 py-1.5 text-xs font-semibold bg-[#134074] hover:bg-[#0b2545] text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm flex-1 sm:flex-initial"
                >
                  <Stethoscope className="w-3.5 h-3.5 text-[#8da9c4]" />
                  <span>Adjust Protocol</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
