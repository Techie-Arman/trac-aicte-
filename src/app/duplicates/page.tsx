'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Copy, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { StatusBadge, BureauBadge } from '@/components/Badges';

export default function DuplicateReviewsPage() {
  const flags = dataStore.getDuplicateFlags();
  const currentUser = dataStore.getCurrentUser();

  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(
    flags.length > 0 ? flags[0].id : null
  );
  const [notes, setNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const activeFlag = flags.find((f) => f.id === selectedFlagId);

  const handleAction = async (action: 'confirmed_duplicate' | 'dismissed' | 'remark') => {
    if (!activeFlag) return;
    setActionError(null);
    try {
      await dataStore.recordDuplicateReview(activeFlag.id, action, notes);
      setSuccessMessage(`Duplicate review action recorded: ${action}`);
      setNotes('');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to save duplicate review.');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in text-neutral-900">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">
          Suspected Duplicate Complaints Review
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          AI text similarity engine flagging identical or repeated complaints filed for the same institution
        </p>
      </div>

      {/* Policy banner */}
      <div
        className="p-4 rounded-2xl flex items-start gap-3.5 bg-neutral-50 border border-neutral-300 shadow-2xs"
      >
        <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5 text-neutral-900" />
        <div className="text-xs text-neutral-700 leading-relaxed">
          <strong className="text-neutral-900">Isolated AI Duplicate Analysis Engine:</strong>{' '}
          Suspected duplicates are flagged via NLP text similarity across complaint descriptions for the same institution. Similarity scores are computed via trigram/embedding text matching (illustrative demonstration model). Suspected duplicates are never merged or closed automatically, keeping duplicate detection strictly separate from Cross-Bureau Overlaps. Authorized human officer verification is strictly required before any action.
        </div>
      </div>

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
          <h3 className="font-bold text-sm mb-1 text-neutral-900">No Suspected Duplicates</h3>
          <p className="text-xs text-neutral-500">
            No complaints currently exceed the AI similarity threshold for repeated filings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Flags list */}
          <div
            className="rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-xs"
          >
            <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                Flagged ({flags.length})
              </h3>
            </div>
            <div className="divide-y divide-neutral-100">
              {flags.map((flag) => {
                const isSelected = selectedFlagId === flag.id;
                const pct = Math.round(flag.confidence * 100);
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
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-200 text-neutral-900"
                      >
                        {pct}% match
                      </span>
                    </div>
                    <p className="text-xs font-semibold truncate mb-1.5 text-neutral-800">
                      {flag.institution_name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[9px] font-bold uppercase text-neutral-500"
                      >
                        {flag.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {flag.case_ids.length} linked cases
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail */}
          {activeFlag && (
            <div className="lg:col-span-2 space-y-4">
              <div
                className="rounded-2xl p-5 bg-white border border-neutral-200 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    AI Text Similarity Match
                  </span>
                  <span
                    className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-neutral-900 text-white self-start sm:self-auto"
                  >
                    NLP Similarity Score: {Math.round(activeFlag.confidence * 100)}% (Illustrative Demonstration Model)
                  </span>
                </div>
                <h3 className="text-base font-bold text-neutral-900">{activeFlag.institution_name}</h3>
                <p className="text-xs font-mono mt-0.5 text-neutral-500">
                  AICTE Permanent ID: {activeFlag.aicte_permanent_id}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(activeFlag.cases || []).map((c, idx) => (
                  <div
                    key={c.id}
                    className="rounded-2xl p-4 flex flex-col justify-between bg-white border border-neutral-200 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-700"
                        >
                          {idx === 0 ? 'Original Filing' : 'Suspected Repeat'}
                        </span>
                        <BureauBadge code={c.bureau_code} />
                      </div>
                      <p className="font-mono font-bold text-[11px] mb-0.5 text-neutral-900">
                        {c.case_number}
                      </p>
                      <h5 className="font-bold text-xs mb-2 text-neutral-800">{c.category}</h5>
                      <p
                        className="text-xs leading-relaxed p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-neutral-600"
                      >
                        {c.description}
                      </p>
                    </div>
                    <div
                      className="mt-4 pt-3 flex items-center justify-between text-[11px] border-t border-neutral-100"
                    >
                      <span className="text-neutral-500 font-mono">
                        Filed: {new Date(c.date_received).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/cases/${c.id}`}
                        className="font-semibold flex items-center gap-1 text-neutral-900 hover:underline"
                      >
                        View Case <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="rounded-2xl p-5 space-y-4 bg-white border border-neutral-200 shadow-xs"
              >
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Record Duplicate Review Decision
                </h4>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record verification notes (e.g. verified as exact duplicate from same complainant)…"
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
                      onClick={() => handleAction('confirmed_duplicate')}
                      className="btn-primary px-4 py-1.5 text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
                    >
                      Confirm Duplicate
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
