'use client';

import React, { useState } from 'react';
import { Settings, Users, Clock, Layers, Lock } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { BureauBadge } from '@/components/Badges';

type AdminTab = 'users' | 'bureaus' | 'sla';

export default function AdminPage() {
  const currentUser = dataStore.getCurrentUser();
  const users = dataStore.getAllUsers();
  const bureaus = dataStore.getAllBureaus();
  const slaRules = dataStore.getSLARules();

  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const isAdmin = currentUser.role === 'admin';

  const tabs: { key: AdminTab; label: string; icon: React.ElementType; count: number }[] = [
    { key: 'users',   label: 'User Registry',          icon: Users,  count: users.length },
    { key: 'bureaus', label: 'Bureaus & Cells',         icon: Layers, count: bureaus.length },
    { key: 'sla',     label: 'SLA Duration Rules',      icon: Clock,  count: slaRules.length },
  ];

  return (
    <div className="space-y-5 animate-fade-in text-neutral-900">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">System Administration</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          User roles, bureau configuration, and statutory SLA duration policies
        </p>
      </div>

      {!isAdmin && (
        <div
          className="p-4 rounded-2xl flex items-start gap-3 text-xs bg-neutral-50 border border-neutral-300 text-neutral-700 shadow-2xs"
        >
          <Lock className="w-4 h-4 flex-shrink-0 mt-0.5 text-neutral-900" />
          <div>
            <p className="font-bold text-neutral-900 mb-0.5">Read-only Audit Mode</p>
            <p className="leading-relaxed">
              Authenticated as <strong className="text-neutral-900">{currentUser.name}</strong> ({currentUser.role}).
              Only <strong className="text-neutral-900">admin</strong> role may alter SLA rules or assign user roles.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200">
        {tabs.map(({ key, label, icon: Icon, count }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-4 pb-3 text-xs font-semibold transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-neutral-900 text-neutral-900 font-bold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-neutral-100 bg-neutral-50">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Authorized Personnel Directory</h3>
            <span className="text-[10px] font-mono text-neutral-400">
              Role mutation restricted (RLS)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left mono-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Bureau</th>
                  <th>Region</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-semibold text-neutral-900">{u.name}</td>
                    <td className="font-mono text-neutral-500">{u.email}</td>
                    <td>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize bg-neutral-100 text-neutral-800 border border-neutral-200"
                      >
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{u.bureau_code ? <BureauBadge code={u.bureau_code} /> : <span className="text-neutral-400">Central</span>}</td>
                    <td className="text-neutral-600">{u.region || 'National'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bureaus Tab */}
      {activeTab === 'bureaus' && (
        <div className="rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-xs">
          <div className="px-5 py-3.5 border-b border-neutral-100 bg-neutral-50">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">AICTE Operating Bureaus &amp; Dedicated Cells</h3>
          </div>
          <div className="divide-y divide-neutral-100">
            {bureaus.map((b) => (
              <div
                key={b.id}
                className="px-5 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <BureauBadge code={b.code} />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{b.name}</h4>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{b.description}</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-neutral-400">ID: {b.id}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SLA Tab */}
      {activeTab === 'sla' && (
        <div className="space-y-4">
          {/* Statutory SLA Target Discrepancy Reconciliation Card */}
          <div className="rounded-2xl p-5 bg-white border border-neutral-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Central Statutory SLA Target Baseline
                </span>
                <h3 className="text-base font-bold text-neutral-900 mt-0.5">
                  Universal Default Statutory Target: {dataStore.getStatutorySLATarget()} Days
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 font-medium">Configured Target:</span>
                <select
                  value={dataStore.getStatutorySLATarget()}
                  onChange={(e) => {
                    dataStore.setStatutorySLATarget(Number(e.target.value));
                    setActiveTab('sla'); // Trigger re-render
                  }}
                  className="mono-select px-3 py-1.5 text-xs rounded-xl border border-neutral-300 bg-neutral-50 font-bold text-neutral-900"
                >
                  <option value={30}>30 Days (Statutory AICTE Standard / Citizen's Charter)</option>
                  <option value={21}>21 Days (Expedited SIH Problem Statement Target)</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 leading-relaxed">
              <strong className="text-neutral-900">Statutory SLA Rule Harmonization Note:</strong>{' '}
              Official AICTE Grievance Redressal Regulations (2019/2021) specify a <strong>30-day</strong> statutory window for standard institutional grievance redressal. Certain SIH presentation decks proposed an expedited <strong>21-day</strong> fast-track SLA for priority grievances. TRAC-AICTE centralizes this via a single configurable parameter (`statutorySLATargetDays`) across the Dashboard, Case Detail, Alerts, and Reports to maintain strict data integrity without hardcoding conflicting values.
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden bg-white border border-neutral-200 shadow-xs">
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-neutral-100 bg-neutral-50">
              <div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Statutory SLA Rules by Complaint Category</h3>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  Governs automatic timeline warnings and &quot;pending beyond timeline&quot; computations
                </p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => alert('[Demo] Admin-only: category rules are synced with statutory database.')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 transition cursor-pointer"
                >
                  + Add Rule
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left mono-table">
                <thead>
                  <tr>
                    <th>Grievance Category</th>
                    <th>Handling Bureau</th>
                    <th className="text-center">Allowed Duration</th>
                    <th className="text-center">Warning Window</th>
                    <th className="text-right">Access</th>
                  </tr>
                </thead>
                <tbody>
                  {slaRules.map((r) => (
                    <tr key={r.id}>
                      <td className="font-semibold text-neutral-900">{r.category}</td>
                      <td><BureauBadge code={r.bureau_code} /></td>
                      <td className="text-center font-mono font-bold text-neutral-900">
                        {r.days_allowed} Days
                      </td>
                      <td className="text-center font-mono font-semibold text-neutral-600">
                        {r.warning_days_before} Days Prior
                      </td>
                      <td className="text-right">
                        <span
                          className="text-[9px] font-mono px-2 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-600"
                        >
                          Admin-Only
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
