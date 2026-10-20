import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, Lock, Database, EyeOff, Server, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Official privacy statement and data handling disclosure for the TRAC-AICTE portal.',
};

export default function PrivacyPolicyPage() {
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
            <Shield className="w-5 h-5 text-neutral-700" /> Privacy Policy &amp; Data Disclosure
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Effective Date: October 2026 · Document Version 1.0 (Pre-Launch Baseline)
          </p>
        </div>
      </div>

      {/* Review Notice Alert */}
      <div className="p-4 rounded-2xl bg-neutral-100 border border-neutral-300 text-xs text-neutral-800 space-y-1">
        <div className="flex items-center gap-2 font-bold text-neutral-900">
          <HelpCircle className="w-4 h-4 text-neutral-700" />
          <span>Notice for Institutional Counsel &amp; System Administrators</span>
        </div>
        <p className="leading-relaxed">
          This privacy policy reflects the technical implementation of TRAC-AICTE. Placeholders marked with{' '}
          <code className="font-mono bg-neutral-200 px-1 py-0.5 rounded text-[11px] font-bold">
            [PROJECT_OWNER_CONFIRMATION_REQUIRED]
          </code>{' '}
          must be formally validated and updated by the authorized project sponsor prior to official institutional deployment.
        </p>
      </div>

      {/* Main Content Cards */}
      <div className="space-y-5">
        {/* Section 1: Data Architecture & Scope */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-neutral-600" /> 1. Scope &amp; Current Technical Architecture
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            The <strong>TRAC-AICTE</strong> platform operates as a centralized institutional monitoring console designed for grievance tracking, cross-bureau overlap telemetry, and suspected duplicate case review across technical education institutions.
          </p>
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 space-y-1.5">
            <p className="font-semibold text-neutral-900">Actual Technical Data Flows:</p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-600">
              <li>
                <strong>In-Memory State:</strong> In its current implementation, user session selections, status changes, and filter parameters are processed within client-side browser memory (<code className="font-mono text-[11px]">src/lib/store.ts</code>).
              </li>
              <li>
                <strong>Zero Outbound Data Transmission:</strong> The application does not send telemetry, user identities, or case remark payloads to any external advertising network, commercial broker, or unlisted third party.
              </li>
              <li>
                <strong>Zero Cookies &amp; Persistent Local Storage:</strong> No HTTP cookies, <code className="font-mono text-[11px]">localStorage</code> tokens, or <code className="font-mono text-[11px]">sessionStorage</code> keys are written or read by this application.
              </li>
            </ul>
          </div>
        </div>

        {/* Section 2: Information Collected */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-neutral-600" /> 2. Information Handled &amp; Purpose of Processing
          </h2>
          <div className="space-y-2 text-xs text-neutral-600 leading-relaxed">
            <p>
              When authorized officials access the system, the portal handles the following categories of operational information:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Institutional Grievance Records:</strong> Case reference identifiers, assigned regulatory bureau codes (RB, PGRC, EB, AB, QAC, LC), filing dates, categorized complaint subjects, and disposal targets.
              </li>
              <li>
                <strong>Institution Directory References:</strong> AICTE Permanent IDs, institution names, states, districts, and institution types (Engineering, Management, Architecture, Pharmacy, Applied Arts, Polytechnic).
              </li>
              <li>
                <strong>Administrative Audit Actions:</strong> Internal records of status updates, cross-bureau reallocations, and associated official remarks for procedural accountability.
              </li>
            </ul>
          </div>
        </div>

        {/* Section 3: Third-Party Dependencies */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
            <Server className="w-4 h-4 text-neutral-600" /> 3. External Dependencies &amp; Network Resources
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            All user interface typography is self-hosted at build time via Next.js server-side font optimization. No client-side network calls are made to external font servers or tracking services upon page loading.
          </p>
        </div>

        {/* Section 4: Security & Access Boundaries */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-neutral-600" /> 4. Data Security &amp; Access Controls
          </h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            The application implements defense-in-depth HTTP security headers including Content Security Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options (DENY), and X-Content-Type-Options (nosniff) to mitigate clickjacking, cross-site scripting, and unauthorized framing.
          </p>
        </div>

        {/* Section 5: Institutional Identity & Contact */}
        <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-800">
            5. Contact Information &amp; Custodianship
          </h2>
          <div className="text-xs text-neutral-600 space-y-2 leading-relaxed">
            <p>
              Questions regarding this privacy statement, institutional data handling practices, or verification procedures should be directed to the designated nodal officer:
            </p>
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 font-mono text-[11px] space-y-1 text-neutral-700">
              <p><strong>Organization:</strong> [PROJECT_OWNER_CONFIRMATION_REQUIRED: Institutional Authority Name]</p>
              <p><strong>Official Contact:</strong> [PROJECT_OWNER_CONFIRMATION_REQUIRED: grievance-officer@domain.example]</p>
              <p><strong>Postal Address:</strong> [PROJECT_OWNER_CONFIRMATION_REQUIRED: Official Address Line, New Delhi / Regional Office]</p>
            </div>
            <p className="text-[11px] text-neutral-500 italic mt-2">
              Note: This website is an institutional grievance management software system. Official government certification or statutory delegation must be verified through official AICTE notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
