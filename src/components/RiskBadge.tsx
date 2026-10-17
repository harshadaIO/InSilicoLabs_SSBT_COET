import React from 'react';

interface RiskBadgeProps {
  level: 'high' | 'medium' | 'low';
  showLabel?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, showLabel = true }) => {
  if (level === 'high') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded text-rose-700 bg-rose-50 border border-rose-200">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
        {showLabel && <span>High Risk</span>}
      </span>
    );
  }

  if (level === 'medium') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded text-amber-700 bg-amber-50 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
        {showLabel && <span>Medium Risk</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded text-teal-700 bg-teal-50 border border-teal-200">
      <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
      {showLabel && <span>Low Risk</span>}
    </span>
  );
};
