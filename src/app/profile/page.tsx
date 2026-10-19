'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  User,
  Mail,
  Shield,
  Building,
  MapPin,
  Calendar,
  Lock,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { BureauBadge } from '@/components/Badges';

export default function ProfilePage() {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    showToast('Profile information updated in demo session');
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-neutral-900 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">Official User Profile</h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Personal identification and official credentials registered with AICTE TRAC portal
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {/* Profile Header Banner */}
        <div className="bg-neutral-50 border-b border-neutral-200/80 p-6 md:p-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white font-bold text-2xl flex items-center justify-center shadow-xs">
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">{user.name}</h3>
              <p className="text-xs text-neutral-500 mt-0.5">{user.email}</p>
              <div className="flex items-center gap-2 mt-2.5">
                <span className="text-[11px] font-semibold bg-neutral-200 text-neutral-800 px-2.5 py-0.5 rounded-full capitalize">
                  {user.role.replace('_', ' ')}
                </span>
                {user.bureau_code && <BureauBadge code={user.bureau_code} />}
              </div>
            </div>
          </div>

          <div className="text-right text-xs text-neutral-500 hidden sm:block">
            <p className="uppercase tracking-wider text-[10px]">Official Terminal ID</p>
            <p className="font-mono font-bold text-neutral-900 text-sm mt-0.5">{user.id}</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-neutral-200 px-6 gap-6 text-xs font-semibold bg-white">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 transition border-b-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-neutral-900 text-neutral-900 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Personal &amp; Statutory Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3.5 transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'border-neutral-900 text-neutral-900 font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" /> Authentication &amp; Credentials
          </button>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === 'profile' ? (
            <form onSubmit={handleSave} className="space-y-5 max-w-xl">
              {saved && (
                <div className="p-3.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs text-neutral-900 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-neutral-900 flex-shrink-0" />
                  <span>Profile changes successfully recorded in demo session.</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">Full Official Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">Official Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full text-xs border border-neutral-200 bg-neutral-50 text-neutral-500 rounded-xl p-2.5 cursor-not-allowed font-mono"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">Institutional emails can only be altered by AICTE IT Admin.</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">Statutory Role Assignment</label>
                  <input
                    type="text"
                    disabled
                    value={user.role}
                    className="w-full text-xs border border-neutral-200 bg-neutral-50 text-neutral-500 rounded-xl p-2.5 cursor-not-allowed font-mono"
                  />
                  <span className="text-[10px] text-neutral-400 mt-1 block">Self role modification prohibited by RLS.</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">Assigned Bureau</label>
                  <input
                    type="text"
                    disabled
                    value={user.bureau_code || 'All Bureaus / Apex Authority'}
                    className="w-full text-xs border border-neutral-200 bg-neutral-50 text-neutral-500 rounded-xl p-2.5 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-primary px-5 py-2.5 text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Save Profile Information
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 max-w-xl text-xs">
              <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                <h4 className="font-bold text-neutral-900 text-sm tracking-tight">Password &amp; Multifactor Authentication</h4>
                <p className="text-neutral-600 leading-relaxed">
                  Password changes require central authentication verification through Gov.in identity service in production.
                </p>
                <div className="pt-1">
                  <Link
                    href="/reset-password"
                    className="inline-block px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Simulate Password Reset
                  </Link>
                </div>
              </div>

              <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200 text-neutral-700">
                <p className="font-bold text-neutral-900 tracking-tight">Session Security Notice:</p>
                <p className="mt-1 leading-relaxed text-neutral-600">
                  All session events, case edits, and status updates are logged immutably against your official UUID (<strong className="text-neutral-900">{user.id}</strong>) in the database audit log.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
