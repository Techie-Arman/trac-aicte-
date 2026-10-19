'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Settings, Bell, Shield, Sliders, CheckCircle2 } from 'lucide-react';

export default function AccountSettingsPage() {
  const { user, showToast } = useAuth();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [overlapNotifications, setOverlapNotifications] = useState(true);
  const [slaWarningThreshold, setSlaWarningThreshold] = useState('7');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Surveillance preferences saved in demo state');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-neutral-900 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">Account &amp; Surveillance Settings</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Configure notification dispatch preferences, surveillance alerts, and dashboard views
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 md:p-8 space-y-6">
        <form onSubmit={handleSave} className="space-y-6 max-w-xl text-xs">
          <div>
            <h3 className="font-bold text-sm text-neutral-900 mb-2 flex items-center gap-2 tracking-tight">
              <Bell className="w-4 h-4 text-neutral-900" />
              Surveillance Notification Preferences
            </h3>
            <p className="text-neutral-500 mb-5 leading-relaxed">
              Select which real-time events dispatch alerts to your official dashboard notification center.
            </p>

            <div className="space-y-3.5">
              <label className="flex items-start gap-3.5 p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={overlapNotifications}
                  onChange={(e) => setOverlapNotifications(e.target.checked)}
                  className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <div>
                  <span className="font-semibold text-neutral-900 block">
                    Cross-Bureau Overlap Alerts (Mandatory Priority)
                  </span>
                  <span className="text-neutral-500 text-[11px] mt-0.5 block leading-relaxed">
                    Alert immediately when an active complaint for an institution in your Bureau overlaps with another Bureau.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3.5 p-4 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                />
                <div>
                  <span className="font-semibold text-neutral-900 block">SLA Overdue &amp; Breach Dispatches</span>
                  <span className="text-neutral-500 text-[11px] mt-0.5 block leading-relaxed">
                    Notify when complaints approaching statutory deadlines breach expected disposal dates.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-5 border-t border-neutral-100">
            <h3 className="font-bold text-sm text-neutral-900 mb-2 flex items-center gap-2 tracking-tight">
              <Sliders className="w-4 h-4 text-neutral-900" />
              SLA Warning Advance Horizon
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={slaWarningThreshold}
                onChange={(e) => setSlaWarningThreshold(e.target.value)}
                className="text-xs border border-neutral-300 rounded-xl p-2.5 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900"
              >
                <option value="3">3 Days Before Expected Disposal</option>
                <option value="5">5 Days Before Expected Disposal</option>
                <option value="7">7 Days Before Expected Disposal (Standard)</option>
                <option value="10">10 Days Before Expected Disposal</option>
              </select>
              <span className="text-neutral-500 text-[11px]">Statutory early warning window</span>
            </div>
          </div>

          <div className="pt-5 border-t border-neutral-100">
            <button
              type="submit"
              className="btn-primary px-5 py-2.5 text-xs font-semibold shadow-xs cursor-pointer"
            >
              Save Surveillance Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
