'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Building2, MapPin, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { StatusBadge, BureauBadge } from '@/components/Badges';

export default function InstitutionDetailPage() {
  const params = useParams();
  const instId = params?.id as string;
  const institution = dataStore.getInstitutionById(instId);
  const complaints = dataStore.getComplaintsForInstitution(instId);
  const overlaps = dataStore.getOverlapFlags().filter((f) => f.institution_id === instId);

  if (!institution) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white border border-neutral-200 shadow-xs">
        <h3 className="font-bold text-neutral-900 text-base tracking-tight">Institution Not Found</h3>
        <Link
          href="/institutions"
          className="inline-block mt-4 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all shadow-xs cursor-pointer"
        >
          Return to Institutions
        </Link>
      </div>
    );
  }

  const activeCases = complaints.filter((c) => c.status !== 'disposed');

  return (
    <div className="space-y-6 text-neutral-900 animate-fade-in">
      <Link
        href="/institutions"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Master Institutions
      </Link>

      {/* Institution Header Card */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
              AICTE Permanent ID: {institution.aicte_permanent_id}
            </span>
            <h1 className="text-2xl font-bold text-neutral-900 mt-3 tracking-tight">{institution.name}</h1>
            <p className="text-xs text-neutral-500 flex items-center gap-1.5 mt-2">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              {institution.address}, {institution.district}, {institution.state} ({institution.region} Region)
            </p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-right min-w-[200px]">
            <p className="text-neutral-500 font-medium uppercase tracking-wider text-[10px]">Surveillance Status</p>
            <p className="text-base font-bold text-neutral-900 mt-1">
              {activeCases.length > 0 ? (
                <span className="text-black font-mono">{activeCases.length} Active Cases</span>
              ) : (
                <span className="text-neutral-500">No Active Grievances</span>
              )}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">{complaints.length} Total Historical Cases</p>
          </div>
        </div>
      </div>

      {/* Active Overlap Alert Banner */}
      {overlaps.length > 0 && (
        <div className="p-4 rounded-2xl bg-neutral-50 border-2 border-neutral-900 flex items-start gap-4 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-neutral-900 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-neutral-800">
            <h4 className="font-bold text-sm text-neutral-900 tracking-tight">
              Active Cross-Bureau Overlap Detected For This Institution
            </h4>
            <p className="mt-1 leading-relaxed text-neutral-600">
              This institution currently has parallel open grievances undergoing active handling across multiple AICTE Bureaus.
            </p>
          </div>
          <Link
            href="/overlaps"
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all shadow-xs cursor-pointer"
          >
            Review in Overlap Center
          </Link>
        </div>
      )}

      {/* Complaints List for this Institution */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="p-4 px-6 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-neutral-900 tracking-tight">
            Historical &amp; Active Complaints ({complaints.length})
          </h3>
          <Link
            href="/cases/new"
            className="text-xs text-neutral-800 hover:text-black font-semibold transition-colors"
          >
            + File for this institution
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left mono-table">
            <thead>
              <tr>
                <th>Case #</th>
                <th>Bureau</th>
                <th>Status</th>
                <th>Category</th>
                <th>Received Date</th>
                <th>Disposal Target</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/cases/${c.id}`} className="font-mono font-bold text-neutral-900 hover:underline">
                      {c.case_number}
                    </Link>
                  </td>
                  <td>
                    <BureauBadge code={c.bureau_code} />
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="text-neutral-700 max-w-sm truncate">{c.category}</td>
                  <td className="text-neutral-500 font-mono text-[11px]">
                    {new Date(c.date_received).toLocaleDateString()}
                  </td>
                  <td className="font-mono text-neutral-500 text-[11px]">
                    {c.expected_disposal_date
                      ? new Date(c.expected_disposal_date).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/cases/${c.id}`}
                      className="px-3 py-1.5 text-[11px] font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-900 rounded-lg transition"
                    >
                      View Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
