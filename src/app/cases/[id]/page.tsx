'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Building,
  User,
  Clock,
  Send,
  ArrowRightLeft,
  Flame,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { dataStore } from '@/lib/store';
import { StatusBadge, BureauBadge } from '@/components/Badges';
import { CaseStatus, BureauCode } from '@/types';

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params?.id as string;

  const currentUser = dataStore.getCurrentUser();
  const complaint = dataStore.getComplaintById(caseId);
  const actions = dataStore.getActionsForCase(caseId);
  const bureaus = dataStore.getAllBureaus();

  const [activeTab, setActiveTab] = useState<'details' | 'timeline'>('details');

  // Modal / Form States
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus>('under_process');
  const [statusRemarks, setStatusRemarks] = useState('');

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [targetBureau, setTargetBureau] = useState<BureauCode>('PGRC');
  const [transferRemarks, setTransferRemarks] = useState('');

  if (!complaint) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white border border-neutral-200 shadow-xs">
        <h3 className="font-bold text-neutral-900 text-base tracking-tight">Case Not Found</h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
          The requested complaint identifier does not exist or has been archived.
        </p>
        <Link
          href="/cases"
          className="inline-block mt-5 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all shadow-xs cursor-pointer"
        >
          Return to Registry
        </Link>
      </div>
    );
  }

  const isOwningBureau = currentUser.bureau_code === complaint.bureau_code;
  const isPrivileged = currentUser.role === 'admin' || currentUser.role === 'senior';
  const hasFullAccess = isOwningBureau || isPrivileged;

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.updateComplaintStatus(complaint.id, selectedStatus, statusRemarks);
    setStatusModalOpen(false);
    setStatusRemarks('');
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.transferComplaint(complaint.id, targetBureau, transferRemarks);
    setTransferModalOpen(false);
    setTransferRemarks('');
  };

  const now = new Date();
  const isOverdue =
    complaint.status !== 'disposed' &&
    Boolean(complaint.expected_disposal_date) &&
    new Date(complaint.expected_disposal_date!) < now;

  let daysRemaining: number | null = null;
  if (complaint.expected_disposal_date) {
    daysRemaining = Math.ceil((new Date(complaint.expected_disposal_date).getTime() - now.getTime()) / (1000 * 3600 * 24));
  }

  return (
    <div className="space-y-6 text-neutral-900 animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cases Registry
        </Link>

        <div className="flex items-center gap-2">
          {hasFullAccess && (
            <>
              <button
                onClick={() => setTransferModalOpen(true)}
                className="px-3.5 py-1.5 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold rounded-xl border border-neutral-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-500" />
                Transfer Bureau
              </button>
              <button
                onClick={() => setStatusModalOpen(true)}
                className="px-4 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Update Status / Record Action
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cross-Bureau Visibility Notice Banner */}
      {!hasFullAccess && (
        <div className="p-3.5 bg-neutral-100 border border-neutral-200 rounded-xl text-xs text-neutral-700 flex items-center gap-2.5 shadow-2xs">
          <Lock className="w-4 h-4 text-neutral-500 flex-shrink-0" />
          <span className="leading-relaxed">
            <strong className="text-neutral-900">Summary View Mode:</strong> You are viewing a case currently assigned to <strong className="text-neutral-900">{complaint.bureau_code}</strong>. As an official of <strong className="text-neutral-900">{currentUser.bureau_code || currentUser.role}</strong>, sensitive complainant remarks and document attachments are protected under AICTE data privacy guidelines.
          </span>
        </div>
      )}

      {/* Case Header Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-base font-bold text-neutral-900 tracking-tight">{complaint.case_number}</span>
              <StatusBadge status={complaint.status} />
              <BureauBadge code={complaint.bureau_code} />
              {isOverdue && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-900 text-white shadow-2xs">
                  <ShieldAlert className="w-3 h-3 text-white" />
                  SLA Breached ({Math.abs(daysRemaining || 0)}d overdue)
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-neutral-900 mt-3 tracking-tight">{complaint.category}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 mt-2 font-medium">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-neutral-400" />
                <span>
                  {complaint.institution_name_raw}
                  {complaint.institution && complaint.institution.name !== complaint.institution_name_raw && (
                    <span className="text-neutral-500 font-normal ml-1.5">
                      · <strong className="text-neutral-800 font-semibold">Canonical:</strong> {complaint.institution.name}
                    </span>
                  )}
                </span>
              </span>
              <span className="flex items-center gap-1.5 font-mono">
                AICTE ID: {complaint.permanent_id_raw || (complaint.institution ? complaint.institution.aicte_permanent_id : 'Unmatched / Pending Queue')}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                Received: {new Date(complaint.date_received).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-right min-w-[220px]">
            <p className="text-neutral-500 font-medium uppercase tracking-wider text-[10px]">Assigned Officer</p>
            <p className="font-bold text-neutral-900 mt-0.5">{complaint.assigned_officer_name || 'Unassigned'}</p>
            <p className="text-[10px] text-neutral-500 mt-2 uppercase tracking-wider">Disposal Target</p>
            <p className="font-mono font-bold text-neutral-900 mt-0.5">
              {complaint.expected_disposal_date
                ? new Date(complaint.expected_disposal_date).toLocaleDateString()
                : 'Not defined'}
              {daysRemaining !== null && complaint.status !== 'disposed' && (
                <span className="text-[11px] font-normal text-neutral-500 ml-1">
                  ({daysRemaining < 0 ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-neutral-200 mt-6 gap-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 transition border-b-2 cursor-pointer ${
              activeTab === 'details'
                ? 'border-neutral-900 text-neutral-900 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Case Overview &amp; Institutional Profile
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-neutral-900 text-neutral-900 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Chronological Audit History ({actions.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Details */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Grievance Narrative */}
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6">
              <h3 className="font-bold text-sm text-neutral-900 mb-3 tracking-tight">Grievance Narrative &amp; Particulars</h3>
              {hasFullAccess ? (
                <div className="p-4 bg-neutral-50 rounded-xl text-xs leading-relaxed text-neutral-700 border border-neutral-200 whitespace-pre-wrap">
                  {complaint.description}
                </div>
              ) : (
                <div className="p-4 bg-neutral-50 rounded-xl text-xs text-neutral-500 italic border border-neutral-200">
                  Full allegations narrative is restricted to {complaint.bureau_code} officials.
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-neutral-100 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[11px] uppercase tracking-wider">Complainant Group</span>
                  <span className="font-semibold text-neutral-900 capitalize mt-0.5 block">
                    {hasFullAccess ? complaint.complainant_type : 'Confidential'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px] uppercase tracking-wider">Last Action Recorded</span>
                  <span className="font-semibold text-neutral-900 mt-0.5 block">{complaint.last_action || 'None recorded'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px] uppercase tracking-wider">Next Mandated Action</span>
                  <span className="font-semibold text-neutral-900 mt-0.5 block">{complaint.next_action || 'Pending scrutiny'}</span>
                </div>
              </div>
            </div>

            {/* Resolved Institution Card */}
            {complaint.institution && (
              <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-neutral-900 tracking-tight">Linked Master Institution Profile</h3>
                  <span className="text-[11px] font-mono text-neutral-800 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200 font-semibold">
                    Verified AICTE Match
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-neutral-400 block text-[11px] uppercase tracking-wider">Institution Name</span>
                    <span className="font-semibold text-neutral-900 mt-0.5 block">{complaint.institution.name}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px] uppercase tracking-wider">AICTE Permanent ID</span>
                    <span className="font-mono font-bold text-neutral-900 mt-0.5 block">
                      {complaint.institution.aicte_permanent_id}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px] uppercase tracking-wider">Jurisdiction</span>
                    <span className="text-neutral-700 mt-0.5 block">
                      {complaint.institution.district}, {complaint.institution.state} ({complaint.institution.region} Region)
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px] uppercase tracking-wider">Programme Category</span>
                    <span className="text-neutral-700 mt-0.5 block">{complaint.institution.type}</span>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-neutral-100 text-right">
                  <Link
                    href={`/institutions/${complaint.institution.id}`}
                    className="text-xs font-semibold text-neutral-900 hover:underline"
                  >
                    View All Institution Cases &amp; Overlaps &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Integrity Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-4">
                Integrity &amp; Audit Attributes
              </h3>
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[11px] uppercase tracking-wider">Matching Method</span>
                  <span className="font-mono font-semibold text-neutral-900 mt-0.5 block">
                    {complaint.match_method || 'Unresolved Manual Queue'}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px] uppercase tracking-wider">Internal UUID</span>
                  <span className="font-mono text-[11px] text-neutral-600 mt-0.5 block break-all">{complaint.id}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px] uppercase tracking-wider mb-1">Handling Bureau</span>
                  <BureauBadge code={complaint.bureau_code} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Chronological Audit Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-100">
            <div>
              <h3 className="font-bold text-base text-neutral-900 tracking-tight">Append-Only Case Action History</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Immutable ledger of all actions, bureau transfers, and official notes (Database triggers block UPDATE or DELETE).
              </p>
            </div>
            <span className="text-[11px] bg-neutral-100 text-neutral-700 border border-neutral-200 px-2.5 py-1 rounded-full font-mono font-semibold">
              Strictly Append-Only
            </span>
          </div>

          <div className="relative pl-6 space-y-6 border-l-2 border-neutral-200 ml-3">
            {actions.map((act) => (
              <div key={act.id} className="relative">
                {/* Node circle */}
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-neutral-900 border-2 border-white shadow-2xs" />
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs">
                  <div className="flex items-center justify-between font-medium mb-1.5">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-neutral-900">
                      {act.action_type.replace('_', ' ')}
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      {new Date(act.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-neutral-700 leading-relaxed">{act.remarks}</p>
                  <div className="flex items-center gap-3 mt-3 text-[11px] text-neutral-500 pt-2.5 border-t border-neutral-200/60">
                    <span>Official: <strong className="text-neutral-800">{act.performed_by_name}</strong></span>
                    <BureauBadge code={act.bureau_code} />
                    {act.from_bureau_code && act.to_bureau_code && (
                      <span className="font-semibold text-neutral-800">
                        {act.from_bureau_code} &rarr; {act.to_bureau_code}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Update Status */}
      {statusModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-2xl max-w-md w-full p-6 text-neutral-900">
            <h3 className="font-bold text-base text-neutral-900 tracking-tight mb-1">Record Official Case Action</h3>
            <p className="text-xs text-neutral-500 mb-5">
              Action will be immutably recorded in the case audit trail under your official identity.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">New Case Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as CaseStatus)}
                  className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900"
                >
                  <option value="under_process">Under Process</option>
                  <option value="escalated">Escalated (Senior Review)</option>
                  <option value="disposed">Disposed (Resolution Completed)</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Official Remarks &amp; Action Taken *
                </label>
                <textarea
                  required
                  rows={3}
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="e.g. Scrutiny completed; notice issued to institution management..."
                  className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  Save Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Transfer Bureau */}
      {transferModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-neutral-200 rounded-2xl shadow-2xl max-w-md w-full p-6 text-neutral-900">
            <h3 className="font-bold text-base text-neutral-900 tracking-tight mb-1">Transfer Case Between Bureaus</h3>
            <p className="text-xs text-neutral-500 mb-5">
              Transferring automatically retains active status and triggers cross-bureau overlap checks.
            </p>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">Target Bureau / Cell</label>
                <select
                  value={targetBureau}
                  onChange={(e) => setTargetBureau(e.target.value as BureauCode)}
                  className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900"
                >
                  {bureaus
                    .filter((b) => b.code !== complaint.bureau_code)
                    .map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.code} — {b.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Reason for Transfer *
                </label>
                <textarea
                  required
                  rows={3}
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  placeholder="Specify jurisdiction rationale or requirement for multi-bureau review..."
                  className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
