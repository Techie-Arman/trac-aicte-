'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  GitCompare,
  Copy,
  Clock,
} from 'lucide-react';
import { dataStore } from '@/lib/store';
import { BureauBadge } from '@/components/Badges';

type ReportTab = 'bureau' | 'overlap' | 'duplicate' | 'ageing';

export default function ReportsPage() {
  const metrics = dataStore.getDashboardMetrics();
  const complaints = dataStore.getComplaints();
  const overlapFlags = dataStore.getOverlapFlags();
  const duplicateFlags = dataStore.getDuplicateFlags();

  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('bureau');

  // Functional CSV export for reports
  const handleExportCSV = (reportName: string) => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (activeReportTab === 'bureau') {
      headers = ['Bureau Code', 'Bureau Name', 'Total Cases', 'Active Cases', 'Disposed Cases', 'Disposal Rate (%)'];
      rows = metrics.bureauWorkload.map(b => [
        `"${b.code}"`,
        `"${b.name}"`,
        `"${b.total}"`,
        `"${b.active}"`,
        `"${b.disposed}"`,
        `"${b.total > 0 ? Math.round((b.disposed / b.total) * 100) : 0}%"`
      ]);
    } else if (activeReportTab === 'overlap') {
      headers = ['Permanent ID', 'Institution Name', 'Involved Bureaus', 'Active Cases Count', 'Status', 'Date Detected'];
      rows = overlapFlags.map(ov => [
        `"${ov.aicte_permanent_id}"`,
        `"${ov.institution_name.replace(/"/g, '""')}"`,
        `"${ov.involved_bureaus.join(' & ')}"`,
        `"${ov.case_ids.length}"`,
        `"${ov.status}"`,
        `"${new Date(ov.created_at).toLocaleDateString()}"`
      ]);
    } else if (activeReportTab === 'duplicate') {
      headers = ['Institution Name', 'Permanent ID', 'Similarity Confidence', 'Linked Case IDs', 'Review Status', 'Date Detected'];
      rows = duplicateFlags.map(dup => [
        `"${dup.institution_name.replace(/"/g, '""')}"`,
        `"${dup.aicte_permanent_id}"`,
        `"${Math.round(dup.confidence * 100)}%"`,
        `"${dup.case_ids.join('; ')}"`,
        `"${dup.status}"`,
        `"${new Date(dup.created_at).toLocaleDateString()}"`
      ]);
    } else {
      headers = ['Case Number', 'Institution', 'Bureau', 'Date Received', 'Expected Disposal', 'Status'];
      rows = complaints.map(c => [
        `"${c.case_number}"`,
        `"${c.institution_name_raw.replace(/"/g, '""')}"`,
        `"${c.bureau_code}"`,
        `"${new Date(c.date_received).toLocaleDateString()}"`,
        `"${c.expected_disposal_date ? new Date(c.expected_disposal_date).toLocaleDateString() : 'N/A'}"`,
        `"${c.status}"`
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TRAC_${reportName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs: { key: ReportTab; label: string; icon?: React.ElementType }[] = [
    { key: 'bureau',    label: 'Bureau Performance' },
    { key: 'overlap',   label: 'Cross-Bureau Overlaps',   icon: GitCompare },
    { key: 'duplicate', label: 'Suspected Duplicates',    icon: Copy },
    { key: 'ageing',    label: 'Ageing & SLA Breaches',  icon: Clock },
  ];

  return (
    <div className="space-y-5 animate-fade-in text-neutral-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Institutional Surveillance &amp; Analytics
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Official statistical reports on grievance volume, resolution rates, ageing analysis, and overlap telemetry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportCSV(activeReportTab.toUpperCase())}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export Data (CSV)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = activeReportTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveReportTab(key)}
              className={`flex items-center gap-1.5 px-4 pb-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-neutral-900 text-neutral-900 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {label}
            </button>
          );
        })}
      </div>

      {/* Bureau Performance */}
      {activeReportTab === 'bureau' && (
        <div className="rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-neutral-100 bg-neutral-50">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Bureau-wise Disposal &amp; Pending Metrics</h3>
              <p className="text-[10px] text-neutral-500 mt-0.5">Evaluation across AICTE regulatory and grievance handling wings</p>
            </div>
            <button
              onClick={() => handleExportCSV('Bureau_Performance')}
              className="text-[11px] font-semibold flex items-center gap-1 text-neutral-600 hover:text-neutral-900 cursor-pointer"
            >
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left mono-table">
              <thead>
                <tr>
                  <th>Bureau / Cell</th>
                  <th className="text-center">Total</th>
                  <th className="text-center">Active</th>
                  <th className="text-center">Disposed</th>
                  <th className="text-center">Disposal Rate</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.bureauWorkload.map((b) => {
                  const rate = b.total > 0 ? Math.round((b.disposed / b.total) * 100) : 0;
                  return (
                    <tr key={b.code}>
                      <td>
                        <div className="flex items-center gap-2">
                          <BureauBadge code={b.code} />
                          <span className="font-semibold text-neutral-900">{b.name}</span>
                        </div>
                      </td>
                      <td className="text-center font-mono font-bold text-neutral-800">{b.total}</td>
                      <td className="text-center font-mono font-bold text-neutral-900">{b.active}</td>
                      <td className="text-center font-mono text-neutral-500">{b.disposed}</td>
                      <td className="text-center">
                        <span
                          className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-900"
                        >
                          {rate}%
                        </span>
                      </td>
                      <td className="text-right text-[11px] font-semibold text-neutral-700">
                        {b.active > 2 ? 'High Load' : 'Normal Flow'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overlap Report */}
      {activeReportTab === 'overlap' && (
        <div className="rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-neutral-100 bg-neutral-50">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Cross-Bureau Overlap Telemetry Report</h3>
              <p className="text-[10px] text-neutral-500 mt-0.5">Official audit report documenting multi-bureau active case distributions per institution</p>
            </div>
            <button
              onClick={() => handleExportCSV('Cross_Bureau_Overlaps')}
              className="text-[11px] font-semibold flex items-center gap-1 text-neutral-600 hover:text-neutral-900 cursor-pointer"
            >
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left mono-table">
              <thead>
                <tr>
                  <th>Permanent ID</th>
                  <th>Institution</th>
                  <th>Overlapping Bureaus</th>
                  <th>Active Cases</th>
                  <th>Status</th>
                  <th>Detected</th>
                </tr>
              </thead>
              <tbody>
                {overlapFlags.map((ov) => (
                  <tr key={ov.id}>
                    <td className="font-mono font-bold text-neutral-900">{ov.aicte_permanent_id}</td>
                    <td className="font-semibold text-neutral-900">{ov.institution_name}</td>
                    <td>
                      <div className="flex gap-1">
                        {ov.involved_bureaus.map((b) => <BureauBadge key={b} code={b} />)}
                      </div>
                    </td>
                    <td className="font-mono font-bold text-neutral-900">{ov.case_ids.length}</td>
                    <td>
                      <span className="uppercase text-[9px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                        {ov.status}
                      </span>
                    </td>
                    <td className="font-mono text-neutral-500 text-[11px]">{new Date(ov.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Duplicate Report */}
      {activeReportTab === 'duplicate' && (
        <div className="rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-neutral-100 bg-neutral-50">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Suspected Duplicate Complaints Telemetry</h3>
              <p className="text-[10px] text-neutral-500 mt-0.5">NLP similarity logs flagging redundant filings</p>
            </div>
            <button
              onClick={() => handleExportCSV('Suspected_Duplicates')}
              className="text-[11px] font-semibold flex items-center gap-1 text-neutral-600 hover:text-neutral-900 cursor-pointer"
            >
              <Download className="w-3 h-3" /> Download
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left mono-table">
              <thead>
                <tr>
                  <th>Institution</th>
                  <th>Permanent ID</th>
                  <th>AI Similarity</th>
                  <th>Linked Cases</th>
                  <th>Review Status</th>
                  <th>Detected</th>
                </tr>
              </thead>
              <tbody>
                {duplicateFlags.map((dup) => (
                  <tr key={dup.id}>
                    <td className="font-semibold text-neutral-900">{dup.institution_name}</td>
                    <td className="font-mono text-neutral-500">{dup.aicte_permanent_id}</td>
                    <td className="font-mono font-bold text-neutral-900">{Math.round(dup.confidence * 100)}%</td>
                    <td className="font-mono text-neutral-600">{dup.case_ids.join(', ')}</td>
                    <td>
                      <span className="uppercase text-[9px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200">
                        {dup.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="font-mono text-neutral-500 text-[11px]">{new Date(dup.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ageing & SLA */}
      {activeReportTab === 'ageing' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Total Active Cases', value: complaints.filter((c) => c.status !== 'disposed').length, emphasis: false },
              { label: 'Within SLA Timeline', value: complaints.filter((c) => c.status !== 'disposed').length - metrics.pendingBeyondTimeline, emphasis: false },
              { label: 'Beyond Timeline (Breached)', value: metrics.pendingBeyondTimeline, emphasis: true },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`p-5 rounded-2xl text-center bg-white border shadow-xs ${
                  stat.emphasis ? 'border-neutral-900 ring-1 ring-neutral-900/10' : 'border-neutral-200'
                }`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider block mb-2 text-neutral-500">
                  {stat.label}
                </span>
                <span
                  className="text-3xl font-black font-mono text-neutral-900"
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          <div
            className="p-4 rounded-2xl text-xs bg-white border border-neutral-200 shadow-xs"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="font-bold text-neutral-900">Database Implementation Specification:</p>
              <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                Statutory Target: {dataStore.getStatutorySLATarget()} Days
              </span>
            </div>
            <p className="text-neutral-600 leading-relaxed">
              In compliance with architectural rules, &quot;pending beyond timeline&quot; is generated via the dynamic SQL view{' '}
              <code
                className="px-1.5 py-0.5 rounded font-mono bg-neutral-100 text-neutral-800 border border-neutral-200"
              >
                v_pending_beyond_timeline
              </code>
              . No background mutating cron job modifies complaint statuses automatically.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
