'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, ShieldAlert, Copy, CheckCircle, ExternalLink, GitCompare } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { BureauBadge } from '@/components/Badges';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(dataStore.getAlerts());
  const [filterType, setFilterType] = useState('ALL');

  const handleMarkRead = (id: string) => {
    dataStore.markAlertAsRead(id);
    setAlerts([...dataStore.getAlerts()]);
  };

  const filtered = alerts.filter((a) => filterType === 'ALL' || a.type === filterType);
  const unread = alerts.filter(a => !a.is_read).length;

  return (
    <div className="space-y-5 animate-fade-in text-neutral-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Surveillance Alerts &amp; SLA Notifications
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time feed of multi-bureau overlaps, duplicate filings, SLA breaches, and escalation notices · {unread} unread
          </p>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="mono-select px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white text-neutral-800 self-start sm:self-auto"
        >
          <option value="ALL">All Alert Types</option>
          <option value="overlap">Cross-Bureau Overlaps</option>
          <option value="duplicate">Suspected Duplicates</option>
          <option value="sla_breach">SLA Breaches &amp; Overdue</option>
          <option value="escalation">Escalation Notices</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((alt) => {
          const isOverlap    = alt.type === 'overlap';
          const isBreach     = alt.type === 'sla_breach';
          const isDuplicate  = alt.type === 'duplicate';

          const Icon = isBreach ? ShieldAlert : isOverlap ? GitCompare : isDuplicate ? Copy : Bell;

          return (
            <div
              key={alt.id}
              className={`p-5 rounded-2xl flex items-start gap-4 transition-all bg-white border shadow-xs ${
                alt.is_read ? 'opacity-60 border-neutral-200' : isBreach ? 'border-neutral-900 ring-1 ring-neutral-900/10' : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isBreach ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-black uppercase tracking-widest text-neutral-900"
                    >
                      {alt.type.replace('_', ' ')}
                    </span>
                    {alt.recipient_bureau_code && <BureauBadge code={alt.recipient_bureau_code} />}
                    {!alt.is_read && (
                      <span
                        className="w-2 h-2 rounded-full bg-neutral-900"
                        title="Unread alert"
                      />
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {new Date(alt.created_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-neutral-700">{alt.message}</p>

                <div
                  className="flex items-center gap-4 mt-3 pt-2 text-[11px] border-t border-neutral-100"
                >
                  {alt.case_id && (
                    <Link
                      href={`/cases/${alt.case_id}`}
                      className="font-semibold flex items-center gap-1 text-neutral-900 hover:underline"
                    >
                      View Complaint {alt.case_number} <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                  {isOverlap && (
                    <Link
                      href="/overlaps"
                      className="font-semibold flex items-center gap-1 text-neutral-900 hover:underline"
                    >
                      Overlap Center <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                  {isDuplicate && (
                    <Link
                      href="/duplicates"
                      className="font-semibold flex items-center gap-1 text-neutral-900 hover:underline"
                    >
                      Duplicate Reviews <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                  {!alt.is_read && (
                    <button
                      onClick={() => handleMarkRead(alt.id)}
                      className="ml-auto font-medium flex items-center gap-1 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div
            className="py-16 text-center rounded-2xl text-xs text-neutral-400 bg-white border border-neutral-200"
          >
            No alerts match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
