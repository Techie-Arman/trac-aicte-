'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  GitCompare,
  Building2,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Flame,
} from 'lucide-react';
import { dataStore } from '@/lib/store';
import { StatusBadge, BureauBadge } from '@/components/Badges';

interface MetricCardProps {
  label: string;
  value: number | string;
  sub: string;
  icon: React.ElementType;
  emphasis?: boolean;
  critical?: boolean;
  dim?: boolean;
  delay?: string;
}

function MetricCard({ label, value, sub, icon: Icon, emphasis, critical, dim, delay }: MetricCardProps) {
  return (
    <div
      className={`rounded-2xl p-4 flex flex-col gap-2 transition-all duration-200 animate-fade-in-up bg-white border shadow-xs hover:shadow-md hover:border-neutral-300 ${
        critical ? 'border-neutral-900 ring-1 ring-neutral-900/10' : 'border-neutral-200/80'
      }`}
      style={{ animationDelay: delay || '0ms' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-wider uppercase text-neutral-500">{label}</span>
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            critical ? 'bg-neutral-900 text-white' : emphasis ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-50 text-neutral-500'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div
        className={`text-2xl font-black tracking-tight ${
          critical ? 'text-black' : dim ? 'text-neutral-400' : 'text-neutral-900'
        }`}
      >
        {value}
      </div>
      <span className="text-[10px] text-neutral-500">{sub}</span>
    </div>
  );
}

export default function DashboardPage() {
  const metrics = dataStore.getDashboardMetrics();
  const complaints = dataStore.getComplaints();
  const alerts = dataStore.getAlerts().filter(a => !a.is_read).slice(0, 5);
  const recentComplaints = complaints.slice(0, 6);

  // SLA Aging distribution calculation
  const now = new Date();
  let ageUnder15 = 0;
  let age15To30 = 0;
  let age30To45 = 0;
  let ageOver45 = 0;

  complaints.forEach((c) => {
    if (c.status === 'disposed') return;
    const received = new Date(c.date_received);
    const diffDays = Math.floor((now.getTime() - received.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 15) ageUnder15++;
    else if (diffDays <= 30) age15To30++;
    else if (diffDays <= 45) age30To45++;
    else ageOver45++;
  });

  const totalActive = metrics.total - metrics.disposed;

  return (
    <div className="space-y-6 animate-fade-in text-neutral-900">

      {/* ── Welcome Banner ── */}
      <div
        className="rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white border border-neutral-200/80 shadow-xs relative overflow-hidden"
      >
        <div className="relative">
          <div
            className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-[0.18em] uppercase mb-2 bg-neutral-100 text-neutral-700 border border-neutral-200"
          >
            AICTE Grievance Surveillance Terminal
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Centralized Institutional Surveillance Dashboard
          </h2>
          <p className="text-xs mt-1 max-w-2xl text-neutral-500 leading-relaxed">
            Real-time cross-bureau complaint monitoring, automatic overlap flags between RB &amp; PGRC, SLA breach surveillance, and immutable audit logs.
          </p>
        </div>
        <div className="flex items-center gap-2.5 relative flex-shrink-0">
          <Link
            href="/cases/new"
            className="btn-primary px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" /> File Case
          </Link>
          <Link
            href="/overlaps"
            className="btn-ghost px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <GitCompare className="w-3.5 h-3.5" /> Overlaps ({metrics.openOverlaps})
          </Link>
        </div>
      </div>

      {/* ── Overlap Alert Banner (When collisions exist) ── */}
      {metrics.openOverlaps > 0 && (
        <div
          className="p-4 rounded-2xl flex items-center gap-4 animate-fade-in-up bg-white border-2 border-neutral-900 shadow-sm"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-neutral-900 text-white"
          >
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold text-neutral-900">
                Cross-Bureau Overlap Collisions Detected
              </span>
              <span
                className="text-[9px] font-black px-2 py-0.5 rounded-full bg-neutral-900 text-white"
              >
                {metrics.openOverlaps} Open Overlaps
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Active complaints for the same institution are being investigated simultaneously across multiple Bureaus (RB &amp; PGRC). Coordinated review is required.
            </p>
          </div>
          <Link
            href="/overlaps"
            className="btn-primary px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1 flex-shrink-0 cursor-pointer shadow-xs"
          >
            Review in Center <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* ── KPI Metric Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Total Cases"   value={metrics.total}               sub="Across all Bureaus"       icon={FileText}       delay="0ms"   />
        <MetricCard label="Pending"       value={metrics.pending}             sub="Awaiting scrutiny"        icon={Clock}          delay="40ms"  emphasis />
        <MetricCard label="Under Process" value={metrics.underProcess}        sub="Active investigation"     icon={AlertTriangle}  delay="80ms" emphasis />
        <MetricCard label="Transferred"   value={metrics.transferred}         sub="Active cross-bureau"      icon={ArrowRightLeft} delay="120ms" />
        <MetricCard label="Overdue (SLA)" value={metrics.pendingBeyondTimeline} sub="Statutory breach"      icon={ShieldAlert}    delay="160ms" critical />
        <MetricCard label="Disposed"      value={metrics.disposed}            sub="Resolved & closed"        icon={CheckCircle2}   delay="200ms" dim />
      </div>

      {/* ── Executive SLA Case-Aging Heatmap & Escalation Velocity ── */}
      <div className="rounded-2xl p-5 bg-white border border-neutral-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Executive SLA Case-Aging &amp; Escalation Heatmap
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-neutral-100 text-neutral-700">
                {totalActive} Active Tracked
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Live age distribution of active complaints against statutory disposal windows
            </p>
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">Statutory Target: 30 Days</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 block">Fresh (&lt; 15 Days)</span>
            <span className="text-xl font-bold font-mono text-neutral-900 mt-1 block">{ageUnder15}</span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">Within early review</span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-600 block">Active (15 – 30 Days)</span>
            <span className="text-xl font-bold font-mono text-neutral-900 mt-1 block">{age15To30}</span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">Nearing SLA deadline</span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-100 border border-neutral-300">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-800 block">Warning (30 – 45 Days)</span>
            <span className="text-xl font-bold font-mono text-neutral-900 mt-1 block">{age30To45}</span>
            <span className="text-[10px] text-neutral-600 mt-0.5 block">Action required</span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-900 text-white border border-neutral-900 shadow-xs">
            <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-300 block flex items-center justify-between">
              Critical (&gt; 45 Days)
              <Flame className="w-3 h-3 text-white" />
            </span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">{ageOver45}</span>
            <span className="text-[10px] text-neutral-300 mt-0.5 block">Escalated to Apex</span>
          </div>
        </div>
      </div>

      {/* ── Bureau Workload + Alerts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bureau Workload */}
        <div
          className="lg:col-span-2 rounded-2xl p-5 bg-white border border-neutral-200/80 shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Bureau Workload Distribution</h3>
              <p className="text-[10px] text-neutral-500 mt-0.5">Active vs disposed cases by AICTE Bureau/Cell</p>
            </div>
            <Link
              href="/reports"
              className="text-[10px] font-semibold text-neutral-500 hover:text-neutral-900 flex items-center gap-1 transition-colors"
            >
              Detailed Report <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {metrics.bureauWorkload.map((b) => {
              const activePercent = b.total > 0 ? (b.active / b.total) * 100 : 0;
              const disposedPercent = b.total > 0 ? (b.disposed / b.total) * 100 : 0;
              return (
                <div key={b.code}>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <div className="flex items-center gap-2">
                      <BureauBadge code={b.code} />
                      <span className="font-semibold text-neutral-800">{b.name}</span>
                    </div>
                    <span className="font-mono text-neutral-500 text-[10px]">
                      {b.active} active · {b.disposed} disposed ({b.total} total)
                    </span>
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden bg-neutral-100 flex"
                  >
                    <div
                      className="h-full bg-neutral-900 transition-all duration-700"
                      style={{ width: `${activePercent}%` }}
                      title={`Active: ${b.active}`}
                    />
                    <div
                      className="h-full bg-neutral-300 transition-all duration-700"
                      style={{ width: `${disposedPercent}%` }}
                      title={`Disposed: ${b.disposed}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Alerts */}
        <div
          className="rounded-2xl p-5 flex flex-col bg-white border border-neutral-200/80 shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Active Alerts</h3>
            <Link href="/alerts" className="text-[10px] font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
              View all →
            </Link>
          </div>

          <div className="space-y-2.5 flex-1">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className="p-3 rounded-xl text-xs bg-neutral-50 border border-neutral-200/80 hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[9px] font-black uppercase tracking-widest text-neutral-900"
                  >
                    {alt.type.replace('_', ' ')}
                  </span>
                  {alt.recipient_bureau_code && <BureauBadge code={alt.recipient_bureau_code} />}
                </div>
                <p className="line-clamp-2 text-neutral-600 text-[11px] leading-relaxed">{alt.message}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 text-center border-t border-neutral-100">
            <span className="text-[10px] text-neutral-400">
              Real-time surveillance &amp; SLA timeout monitoring
            </span>
          </div>
        </div>
      </div>

      {/* ── Recent Complaints Table ── */}
      <div
        className="rounded-2xl overflow-hidden bg-white border border-neutral-200/80 shadow-xs"
      >
        <div
          className="px-6 py-4 flex items-center justify-between border-b border-neutral-200/80 bg-white"
        >
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Recent Complaints &amp; Movement</h3>
            <p className="text-[10px] text-neutral-500 mt-0.5">Live surveillance feed across all AICTE bureaus</p>
          </div>
          <Link
            href="/cases"
            className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition-colors"
          >
            All complaints <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left mono-table">
            <thead>
              <tr>
                <th>Case #</th>
                <th>Institution</th>
                <th>Bureau</th>
                <th>Status</th>
                <th>Category</th>
                <th>Officer</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link
                      href={`/cases/${c.id}`}
                      className="font-mono font-bold text-[11px] text-neutral-900 hover:underline"
                    >
                      {c.case_number}
                    </Link>
                  </td>
                  <td>
                    <p className="font-semibold text-[11px] truncate max-w-[200px] text-neutral-900">
                      {c.institution_name_raw}
                    </p>
                    <p className="text-[10px] font-mono mt-0.5 text-neutral-500">
                      {c.permanent_id_raw ? `ID: ${c.permanent_id_raw}` : (
                        <span className="text-neutral-700 font-semibold bg-neutral-100 px-1 py-0.5 rounded text-[9px]">Missing ID → Queue</span>
                      )}
                    </p>
                  </td>
                  <td><BureauBadge code={c.bureau_code} /></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="truncate max-w-[140px] text-neutral-600">
                    {c.category}
                  </td>
                  <td className="text-neutral-600 font-medium">
                    {c.assigned_officer_name || '—'}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/cases/${c.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 text-[11px] font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-900 transition-all"
                    >
                      View →
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
