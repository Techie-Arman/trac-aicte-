import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-neutral-900/80 border border-white/10 text-white flex items-center justify-center mx-auto mb-5 backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          <ShieldAlert className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">403 — Access Denied</h2>
        <p className="mt-2 text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
          You do not have statutory authorization or the required role privilege to inspect or modify this restricted institutional record.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-white text-black rounded-xl text-xs font-semibold hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98]"
          >
            Return to Dashboard
          </Link>
          <Link
            href="/cases"
            className="px-5 py-2.5 bg-white/[0.06] text-white border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/[0.12] transition-all active:scale-[0.98]"
          >
            Cases Registry
          </Link>
        </div>
      </div>
    </div>
  );
}
