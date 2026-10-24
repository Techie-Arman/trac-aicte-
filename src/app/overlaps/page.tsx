'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GitCompare, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { StatusBadge, BureauBadge } from '@/components/Badges';

export default function OverlapCenterPage() {
  const flags = dataStore.getOverlapFlags();
  const currentUser = dataStore.getCurrentUser();

  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(
    flags.length > 0 ? flags[0].id : null
  );
  const [reviewNotes, setReviewNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeFlag = flags.find((f) => f.id === selectedFlagId);

  const handleAction = async (action: 'coordinated' | 'dismissed' | 'remark') => {
    if (!activeFlag) return;
    setActionError(null);
    try {
      await dataStore.recordOverlapReview(activeFlag.id, action, reviewNotes);
      setSuccessMessage(`Overlap coordination recorded: ${action}`);
      setReviewNotes('');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to save overlap review.');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in text-neutral-900">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">
          Cross-Bureau Overlap Monitoring Center
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Automated multi-bureau active case cluster surveillance across RB, PGRC, and other cells
        </p>
      </div>

      {/* Policy callout */}
      <div
        className="p-4 rounded-2xl flex items-start gap-3.5 bg-neutral-50 border border-neutral-300 shadow-2xs"
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-neutral-900 text-white"
        >
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="text-xs flex-1 text-neutral-700">
          <h3 className="font-bold text-neutral-900 mb-1">Potential Overlapping Cases — Coordination Required</h3>
          <p className="leading-relaxed">
            Active grievances regarding the same institution are distributed across distinct AICTE Bureaus.{' '}
            <strong className="text-neutral-900">Non-Negotiable Rule:</strong>{' '}
            The system never automatically closes, transfers, or modifies any case based on an overlap flag.
          </p>
        </div>
      </div>

      {/* Success */}
      {successMessage && (
        <div
          className="p-3.5 rounded-xl text-xs flex items-center gap-2 bg-neutral-900 text-white shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-white" />
          <span>{successMessage}</span>
        </div>
      )}
      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800" role="alert">
          {actionError}
        </div>
      )}

      {flags.length === 0 ? (
        <div
          className="p-12 text-center rounded-2xl bg-white border border-neutral-200 shadow-xs"
        >
          <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-neutral-400" />
          <h3 className="font-bold text-sm mb-1 text-neutral-900">No Active Overlaps</h3>
          <p className="text-xs text-neutral-500">
            No institutions currently exhibit parallel active cases across multiple AICTE Bureaus.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Flags List */}
          <div
            className="rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-xs"
          >
            <div
              className="px-4 py-3 border-b border-neutral-100 bg-neutral-50"
            >
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                Active Clusters ({flags.length})
              </h3>
            </div>
            <div className="divide-y divide-neutral-100">
              {flags.map((flag) => {
                const isSelected = selectedFlagId === flag.id;
                return (
                  <button
                    key={flag.id}
                    onClick={() => { setSelectedFlagId(flag.id); setSuccessMessage(null); }}
                    className={`w-full text-left px-4 py-3.5 transition-all cursor-pointer ${
                      isSelected ? 'bg-neutral-100 border-l-4 border-l-neutral-900' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] font-bold text-neutral-900">
                        {flag.aicte_permanent_id}
                      </span>
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-neutral-200 text-neutral-800"
                      >
                        {flag.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold truncate mb-1.5 text-neutral-800">
                      {flag.institution_name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-neutral-400">Involved:</span>
                      {flag.involved_bureaus.map((b) => (
                        <BureauBadge key={b} code={b} />
                      ))}
                      <span className="text-[10px] ml-auto font-mono text-neutral-500 font-semibold">
                        {flag.case_ids.length} cases
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Panel */}
          {activeFlag && (
            <div className="lg:col-span-2 space-y-4">
              {/* Cluster summary */}
              <div
                className="rounded-2xl p-5 bg-white border border-neutral-200 shadow-xs"
              >
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-neutral-400">
                  Cluster Analysis · {activeFlag.id}
                </div>
                <h3 className="text-base font-bold text-neutral-900">{activeFlag.institution_name}</h3>
                <p className="text-xs font-mono mt-0.5 text-neutral-500">
                  AICTE Permanent ID: {activeFlag.aicte_permanent_id}
                </p>
              </div>

              {/* Side-by-side cases */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(activeFlag.cases || []).map((c) => (
                  <div
                    key={c.id}
                    className="rounded-2xl p-4 flex flex-col justify-between bg-white border border-neutral-200 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <BureauBadge code={c.bureau_code} />
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="font-mono font-bold text-[11px] mb-0.5 text-neutral-900">
                        {c.case_number}
                      </p>
                      <h5 className="font-bold text-xs mb-2 text-neutral-800">{c.category}</h5>
                      <p
                        className="text-xs line-clamp-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-600 leading-relaxed"
                      >
                        {c.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 text-[10px] space-y-1 border-t border-neutral-100">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Officer:</span>
                        <span className="font-semibold text-neutral-700">
                          {c.assigned_officer_name || 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Last Action:</span>
                        <span className="truncate max-w-[140px] text-neutral-600">
                          {c.last_action || '—'}
                        </span>
                      </div>
                      <div className="pt-2 text-right">
                        <Link
                          href={`/cases/${c.id}`}
                          className="inline-flex items-center gap-1 font-semibold text-neutral-900 hover:underline"
                        >
                          Full Case <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Review actions */}
              <div
                className="rounded-2xl p-5 space-y-4 bg-white border border-neutral-200 shadow-xs"
              >
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Record Coordinated Bureau Review
                </h4>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record coordination notes between RB and PGRC officers…"
                  className="mono-input w-full px-3 py-2.5 text-xs rounded-xl resize-none border border-neutral-300 bg-white text-neutral-900 leading-relaxed"
                />
                <div
                  className="flex items-center justify-between pt-3 border-t border-neutral-100"
                >
                  <span className="text-[11px] font-mono text-neutral-500">
                    Reviewer: {currentUser.name} ({currentUser.role})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAction('dismissed')}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('coordinated')}
                      className="btn-primary px-4 py-1.5 text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
                    >
                      Confirm Coordination
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
