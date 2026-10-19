'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { BureauBadge } from '@/components/Badges';

export default function InstitutionQueuePage() {
  const queue = dataStore.getResolutionQueue();
  const currentUser = dataStore.getCurrentUser();
  const institutions = dataStore.getInstitutions();

  const [selectedQueueItem, setSelectedQueueItem] = useState<string | null>(
    queue.length > 0 ? queue[0].id : null
  );
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
  const [resolutionReason, setResolutionReason] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeItem = queue.find((q) => q.id === selectedQueueItem);
  const suggestions = activeItem ? dataStore.getSuggestionsForQueueItem(activeItem.id) : [];

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !selectedInstitutionId) return;
    dataStore.resolveInstitutionQueueItem(activeItem.id, selectedInstitutionId, resolutionReason);
    setSuccessMessage(`Case ${activeItem.case_number} successfully linked to institution. Cross-bureau overlap check triggered.`);
    setSelectedInstitutionId('');
    setResolutionReason('');
    setSelectedQueueItem(null);
  };

  return (
    <div className="space-y-5 animate-fade-in text-neutral-900">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">
          Manual Institution Resolution Queue
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Cases submitted with missing, incomplete, or unrecognized AICTE Permanent IDs requiring verified official assignment
        </p>
      </div>

      {/* Safety notice */}
      <div
        className="p-4 rounded-2xl flex items-start gap-3.5 bg-neutral-50 border border-neutral-300 shadow-2xs"
      >
        <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-neutral-900" />
        <div className="text-xs text-neutral-700">
          <p className="font-bold text-neutral-900 mb-0.5">Strict Human-in-the-Loop Safety Rule:</p>
          <p className="leading-relaxed">
            AICTE Permanent ID is the exclusive primary institution-matching key. Fuzzy name/address similarity scores are advisory only. The system <strong className="text-neutral-900">never</strong> silently links or merges institutions automatically. An authorized Bureau Official must explicitly confirm the mapping with an audit rationale.
          </p>
        </div>
      </div>

      {/* Success */}
      {successMessage && (
        <div
          className="p-3.5 rounded-xl text-xs flex items-center gap-2 bg-neutral-900 text-white shadow-xs"
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-white" />
          <span>{successMessage}</span>
        </div>
      )}

      {queue.length === 0 ? (
        <div
          className="p-12 text-center rounded-2xl bg-white border border-neutral-200 shadow-xs"
        >
          <CheckCircle className="w-8 h-8 mx-auto mb-3 text-neutral-400" />
          <h3 className="font-bold text-sm mb-1 text-neutral-900">Resolution Queue Clean</h3>
          <p className="text-xs text-neutral-500">
            All submitted complaints have been successfully resolved against verified AICTE Permanent IDs.
          </p>
          <Link
            href="/cases"
            className="inline-block mt-5 px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition"
          >
            Go to Complaints Registry
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Queue List */}
          <div
            className="rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-xs"
          >
            <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                Pending Verification ({queue.length})
              </h3>
            </div>
            <div className="max-h-[480px] overflow-y-auto divide-y divide-neutral-100">
              {queue.map((item) => {
                const isSelected = selectedQueueItem === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedQueueItem(item.id); setSuccessMessage(null); }}
                    className={`w-full text-left px-4 py-3.5 transition-all cursor-pointer ${
                      isSelected ? 'bg-neutral-100 border-l-4 border-l-neutral-900' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-[11px] text-neutral-900">
                        {item.case_number}
                      </span>
                      <BureauBadge code={item.bureau_code} />
                    </div>
                    <p className="font-semibold text-xs truncate mb-1 text-neutral-800">
                      {item.raw_institution_name}
                    </p>
                    <p className="text-[10px] font-mono text-neutral-500">
                      ID: {item.raw_permanent_id || 'Missing / Not provided'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resolution workspace */}
          {activeItem && (
            <div
              className="lg:col-span-2 rounded-2xl p-6 space-y-5 bg-white border border-neutral-200 shadow-xs"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Reviewing Queue Item
                </span>
                <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                  {activeItem.raw_institution_name}
                </h3>
                <p className="text-xs font-mono text-neutral-500 mt-0.5">
                  Case: {activeItem.case_number} · Bureau: {activeItem.bureau_code}
                </p>
              </div>

              {/* Suggestions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                    Automated Candidate Suggestions (pg_trgm Advisory Similarity)
                  </h4>
                  <span className="text-[10px] text-neutral-400 font-medium">Advisory Only</span>
                </div>
                <div className="space-y-2">
                  {suggestions.map((sug) => {
                    const pct = Math.round(sug.confidence * 100);
                    const isSelected = selectedInstitutionId === sug.suggested_institution_id;
                    return (
                      <div
                        key={sug.id}
                        onClick={() => setSelectedInstitutionId(sug.suggested_institution_id)}
                        className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                          isSelected
                            ? 'bg-neutral-100 border-neutral-900 shadow-xs'
                            : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-neutral-900">{sug.suggested_institution_name}</span>
                          <span
                            className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-neutral-200 text-neutral-900"
                          >
                            {pct}% Match
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-neutral-500">
                          ID: {sug.suggested_permanent_id} · {sug.match_details.city}, {sug.match_details.state}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Manual selection */}
              <div
                className="p-4 rounded-xl bg-neutral-50 border border-neutral-200"
              >
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-2 text-neutral-600">
                  Or Manually Select from Master Directory
                </label>
                <select
                  value={selectedInstitutionId}
                  onChange={(e) => setSelectedInstitutionId(e.target.value)}
                  className="mono-select w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 bg-white text-neutral-900"
                >
                  <option value="">— Select Master Institution —</option>
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.aicte_permanent_id}) - {i.state}
                    </option>
                  ))}
                </select>
              </div>

              {/* Decision form */}
              <form onSubmit={handleResolve} className="space-y-4 pt-4 border-t border-neutral-100">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-neutral-600">
                    Official Decision Rationale (Mandatory for Audit Trail) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={resolutionReason}
                    onChange={(e) => setResolutionReason(e.target.value)}
                    placeholder="e.g. Verified against AICTE approval letter file 2024-25; name spelling matched…"
                    className="mono-input w-full px-3 py-2.5 text-xs rounded-xl resize-none border border-neutral-300 bg-white text-neutral-900 leading-relaxed"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-500">
                    Actor: {currentUser.name} ({currentUser.role})
                  </span>
                  <button
                    type="submit"
                    disabled={!selectedInstitutionId}
                    className="btn-primary px-5 py-2 text-xs font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                  >
                    Confirm &amp; Link Institution
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
