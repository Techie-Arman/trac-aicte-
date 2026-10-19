import Link from 'next/link';
import { Clock, LogIn } from 'lucide-react';

export default function SessionExpiredPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-neutral-900/80 border border-white/10 text-white flex items-center justify-center mx-auto mb-5 backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Session Expired</h2>
        <p className="mt-2 text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
          Your portal authentication token has expired due to inactivity. Please re-authenticate your terminal to continue.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl text-xs font-semibold hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98]"
          >
            <LogIn className="w-4 h-4" /> Re-authenticate Terminal
          </Link>
        </div>
      </div>
    </div>
  );
}
