import React from 'react';
import { CaseStatus } from '@/types';

export const StatusBadge: React.FC<{ status: CaseStatus }> = ({ status }) => {
  const styles: Record<CaseStatus, { bg: string; border: string; color: string; label: string; dot: string }> = {
    pending: {
      bg: '#f4f4f5',
      border: '#e4e4e7',
      color: '#52525b',
      dot: '#71717a',
      label: 'Pending',
    },
    under_process: {
      bg: '#18181b',
      border: '#18181b',
      color: '#ffffff',
      dot: '#ffffff',
      label: 'Under Process',
    },
    transferred: {
      bg: '#e4e4e7',
      border: '#d4d4d8',
      color: '#18181b',
      dot: '#3f3f46',
      label: 'Transferred',
    },
    escalated: {
      bg: '#000000',
      border: '#000000',
      color: '#ffffff',
      dot: '#ffffff',
      label: 'Escalated ↑',
    },
    disposed: {
      bg: '#fafafa',
      border: '#e4e4e7',
      color: '#52525b',
      dot: '#71717a',
      label: 'Disposed',
    },
  };

  const s = styles[status] || styles.pending;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-tight shadow-2xs"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
};

// Bureau badge — high-contrast monochrome
export const BureauBadge: React.FC<{ code: string }> = ({ code }) => {
  const bureauStyles: Record<string, { bg: string; border: string; color: string }> = {
    RB:   { bg: '#18181b', border: '#18181b', color: '#ffffff' },
    PGRC: { bg: '#27272a', border: '#27272a', color: '#ffffff' },
    EB:   { bg: '#3f3f46', border: '#3f3f46', color: '#ffffff' },
    AB:   { bg: '#52525b', border: '#52525b', color: '#ffffff' },
    QAC:  { bg: '#f4f4f5', border: '#d4d4d8', color: '#18181b' },
    LC:   { bg: '#e4e4e7', border: '#d4d4d8', color: '#18181b' },
  };

  const style = bureauStyles[code] || { bg: '#f4f4f5', border: '#d4d4d8', color: '#18181b' };

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold font-mono tracking-wider shadow-2xs"
      style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.color }}
    >
      {code}
    </span>
  );
};
