import React from 'react';
import { AlertCircle, Inbox, Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading institutional records...' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-neutral-500">
    <Loader2 className="w-8 h-8 animate-spin text-neutral-900 mb-3" />
    <p className="text-sm font-medium tracking-tight text-neutral-700">{message}</p>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white border border-dashed border-neutral-300 shadow-xs">
    <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mb-4 text-neutral-500">
      <Inbox className="w-6 h-6" />
    </div>
    <h3 className="text-base font-semibold text-neutral-900 mb-1 tracking-tight">{title}</h3>
    <p className="text-sm text-neutral-500 max-w-sm mb-5 leading-relaxed">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-xs active:scale-[0.98]"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export const ErrorBanner: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="p-4 rounded-xl bg-white border border-neutral-300 flex items-start gap-3 text-neutral-800 shadow-xs">
    <AlertCircle className="w-5 h-5 flex-shrink-0 text-neutral-900 mt-0.5" />
    <div className="flex-1 text-sm">
      <p className="font-semibold text-neutral-900 tracking-tight">Operation Notice</p>
      <p className="mt-0.5 text-neutral-600">{message}</p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs font-semibold underline text-neutral-900 hover:text-neutral-700 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);
