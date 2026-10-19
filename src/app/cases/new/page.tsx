'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, AlertCircle, Building2 } from 'lucide-react';
import { dataStore } from '@/lib/store';
import { BureauCode, ComplainantType } from '@/types';

export default function NewCasePage() {
  const router = useRouter();
  const institutions = dataStore.getInstitutions();
  const bureaus = dataStore.getAllBureaus();
  const currentUser = dataStore.getCurrentUser();

  const [formData, setFormData] = useState({
    institution_name_raw: '',
    permanent_id_raw: '',
    category: 'Faculty & Cadre Ratio Deficiency',
    description: '',
    complainant_type: 'student' as ComplainantType,
    bureau_code: (currentUser.bureau_code || 'RB') as BureauCode,
    expected_days: 30,
  });

  const [selectedInstId, setSelectedInstId] = useState<string>('');

  const handleInstitutionSelect = (instId: string) => {
    setSelectedInstId(instId);
    if (instId) {
      const inst = institutions.find((i) => i.id === instId);
      if (inst) {
        setFormData((prev) => ({
          ...prev,
          institution_name_raw: inst.name,
          permanent_id_raw: inst.aicte_permanent_id,
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetBureau = bureaus.find((b) => b.code === formData.bureau_code) || bureaus[0];

    // Compute expected disposal date
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + Number(formData.expected_days));

    // Institution resolution logic
    const matchedInst = institutions.find(
      (i) => i.aicte_permanent_id === formData.permanent_id_raw.trim()
    );

    const created = dataStore.createComplaint({
      institution_id: matchedInst ? matchedInst.id : null,
      institution_name_raw: formData.institution_name_raw,
      permanent_id_raw: formData.permanent_id_raw || null,
      category: formData.category,
      description: formData.description,
      complainant_type: formData.complainant_type,
      date_received: new Date().toISOString(),
      status: 'pending',
      bureau_id: targetBureau.id,
      bureau_code: targetBureau.code,
      assigned_officer_id: currentUser.id,
      assigned_officer_name: currentUser.name,
      expected_disposal_date: expDate.toISOString(),
      match_method: matchedInst ? 'id' : undefined,
    });

    router.push(`/cases/${created.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-neutral-900 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          href="/cases"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cases Registry
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 md:p-8">
        <div className="mb-6 pb-4 border-b border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Register New Institutional Grievance</h2>
          <p className="text-xs text-neutral-500 mt-1">
            Record a formal complaint received through AICTE regional counters, public portals, or official submissions.
          </p>
        </div>

        {/* Safety Rule Banner */}
        <div className="mb-6 p-4 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-700 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-neutral-900 mt-0.5 flex-shrink-0" />
          <div className="leading-relaxed">
            <span className="font-bold text-neutral-900">Permanent ID Matching Protocol:</span> If the AICTE Permanent ID is omitted or not recognized, the complaint will immediately be routed to the manual <strong className="text-neutral-900">Institution Resolution Queue</strong>. Fuzzy matching will provide suggestions only and will never automatically link or merge records.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quick Select from Known Master Institutions */}
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
              Quick Pick Known Institution (Demo Helper)
            </label>
            <select
              value={selectedInstId}
              onChange={(e) => handleInstitutionSelect(e.target.value)}
              className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900"
            >
              <option value="">-- Choose from Master or Enter Manually Below --</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} (Permanent ID: {i.aicte_permanent_id}) - {i.state}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Institution Name (As reported) *
              </label>
              <input
                type="text"
                required
                value={formData.institution_name_raw}
                onChange={(e) => setFormData({ ...formData, institution_name_raw: e.target.value })}
                placeholder="e.g. Apex Institute of Technology"
                className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                AICTE Permanent ID (Primary Key)
              </label>
              <input
                type="text"
                value={formData.permanent_id_raw}
                onChange={(e) => setFormData({ ...formData, permanent_id_raw: e.target.value })}
                placeholder="e.g. 1-1049281741 (leave blank to test queue)"
                className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 font-mono bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-all"
              />
              <span className="text-[10px] text-neutral-500 mt-1 block">Leaving blank routes to manual resolution queue.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">Assigning Bureau *</label>
              <select
                value={formData.bureau_code}
                onChange={(e) => setFormData({ ...formData, bureau_code: e.target.value as BureauCode })}
                className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900"
              >
                {bureaus.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} — {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">Complainant Group *</label>
              <select
                value={formData.complainant_type}
                onChange={(e) =>
                  setFormData({ ...formData, complainant_type: e.target.value as ComplainantType })
                }
                className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty Member</option>
                <option value="stakeholder">Stakeholder / Parent</option>
                <option value="other">Other Concerned Party</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">Disposal SLA Target (Days)</label>
              <input
                type="number"
                min="7"
                max="90"
                value={formData.expected_days}
                onChange={(e) => setFormData({ ...formData, expected_days: parseInt(e.target.value) || 30 })}
                className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">Grievance Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full text-xs border border-neutral-300 rounded-xl p-2.5 bg-white text-neutral-900 focus:outline-none focus:border-neutral-900"
            >
              <option value="Faculty & Cadre Ratio Deficiency">Faculty & Cadre Ratio Deficiency</option>
              <option value="Non-refund of Fees & Retention of Original Certificates">
                Non-refund of Fees & Retention of Original Certificates
              </option>
              <option value="Infrastructure & Safety Norm Violations">
                Infrastructure & Safety Norm Violations
              </option>
              <option value="Unapproved PGDM intake expansion">Unapproved PGDM intake expansion</option>
              <option value="Non-payment of 7th CPC Salary Scales">
                Non-payment of 7th CPC Salary Scales
              </option>
              <option value="Capitation fee / Bribery demand">Capitation fee / Bribery demand</option>
              <option value="Unapproved Course Offerings without AICTE Approval">
                Unapproved Course Offerings without AICTE Approval
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">Complaint Narrative & Evidence *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a factual summary of allegations, dates, affected programmes, and supporting documentation..."
              className="w-full text-xs border border-neutral-300 rounded-xl p-3 bg-white text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition-all leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <Link
              href="/cases"
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 font-semibold text-xs rounded-xl shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Register Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
