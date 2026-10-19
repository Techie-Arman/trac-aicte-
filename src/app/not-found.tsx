import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 text-neutral-900">
      <div className="w-16 h-16 rounded-2xl bg-white border border-neutral-200 text-neutral-900 flex items-center justify-center mb-5 shadow-xs">
        <FileQuestion className="w-8 h-8 text-neutral-900" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-neutral-900">404 — Record Not Found</h2>
      <p className="mt-2 text-sm text-neutral-500 max-w-sm leading-relaxed">
        The requested institutional surveillance route or grievance identifier does not exist or has been archived.
      </p>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
