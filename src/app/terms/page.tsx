import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Scale, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Terms of service and institutional usage guidelines for the TRAC-AICTE portal.',
};

export default function TermsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto text-neutral-900 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition flex items-center justify-center cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-neutral-700" /> Terms &amp; Conditions of Usage
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Effective Date: October 2026 · Operating Terms Version 1.0
          </p>
        </div>
      </div>

      {/* Review Notice Alert */}
      <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-300 text-xs text-neutral-800 space-y-1">
        <div className="flex items-center gap-2 font-bold text-neutral-900">
          <HelpCircle className="w-4 h-4 text-neutral-700" />
          <span>Notice for Institutional Counsel &amp; System Operators</span>
        </div>
        <p className="leading-relaxed">
          The following terms govern authorized access to the TRAC-AICTE management console. Specific statutory covenants, jurisdiction clauses, and organization references marked with{' '}
          <code className="font-mono bg-neutral-200 px-1 py-0.5 rounded text-[11px] font-bold">
            [PROJECT_OWNER_CONFIRMATION_REQUIRED]
          </code>{' '}
          are subject to authorized institutional sign-off prior to production legal effectiveness.
        </p>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-5">
        {/* Section 1: Acceptance & Permitted Use */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-neutral-600" /> 1. Acceptance &amp; Authorized Institutional Purpose
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Access to this portal is restricted to authorized administrative personnel, nodal bureau scrutiny officers, and institutional evaluators. By signing in, users agree to use the portal solely for legitimate grievance tracking, cross-bureau overlap analysis, and regulatory compliance monitoring.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600">
            <li>Users must not share authentication credentials or bypass role-based access boundaries.</li>
            <li>Users must not export or circulate confidential grievance transcripts outside authorized institutional channels.</li>
            <li>Automated scraping, penetration probes, or denial-of-service simulations against the production endpoints without explicit authorization are prohibited.</li>
          </ul>
        </div>

        {/* Section 2: Demonstration & Architecture Status */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-neutral-600" /> 2. System Status &amp; Data Integrity
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            In the current pre-launch deployment phase, the portal runs on validated sample data structures representing AICTE bureaus, standard categories, and institution directories. Actions taken during demo mode are stored in transient memory for operational verification and do not constitute formal legal dispositions until backed by a persistent production database.
          </p>
        </div>

        {/* Section 3: User Accountability & Role Conduct */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neutral-600" /> 3. Role Responsibilities &amp; Audit Trail
          </h2>
          <div className="space-y-2 text-xs text-neutral-600 leading-relaxed">
            <p>
              Users are held accountable for actions performed under their designated roles:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Bureau Nodal Officers:</strong> Responsible for accurate documentation of case progress, rationale for bureau transfers, and adherence to statutory SLA countdowns.
              </li>
              <li>
                <strong>Scrutiny Committee &amp; Regional Directors:</strong> Responsible for reviewing suspected duplicate flags and approving cross-bureau coordination protocols.
              </li>
              <li>
                <strong>Super Administrators:</strong> Responsible for maintaining system configuration parameters, monitoring audit logs, and overseeing user privileges.
              </li>
            </ul>
          </div>
        </div>

        {/* Section 4: Limitation of Liability */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
            <Scale className="w-4 h-4 text-neutral-600" /> 4. Disclaimer &amp; Limitation of Liability
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            To the maximum extent permitted by applicable law, the software operators and developers shall not be liable for incidental, consequential, or indirect damages arising from temporary service unavailability, network interruptions, or administrative decisions executed using demonstrative analytics.
          </p>
        </div>

        {/* Section 5: Governing Framework & Jurisdiction */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
            5. Jurisdiction &amp; Amendments
          </h2>
          <div className="text-xs text-neutral-600 space-y-2 leading-relaxed">
            <p>
              These terms shall be governed by and construed in accordance with the laws of [PROJECT_OWNER_CONFIRMATION_REQUIRED: India / Applicable Jurisdiction]. Any dispute arising from these terms shall be subject to the exclusive jurisdiction of the competent courts in [PROJECT_OWNER_CONFIRMATION_REQUIRED: New Delhi, India].
            </p>
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 font-mono text-[11px] space-y-1 text-neutral-700">
              <p><strong>Operating Authority:</strong> [PROJECT_OWNER_CONFIRMATION_REQUIRED: Institutional Authority Name]</p>
              <p><strong>Legal Inquiries:</strong> [PROJECT_OWNER_CONFIRMATION_REQUIRED: legal-office@domain.example]</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
