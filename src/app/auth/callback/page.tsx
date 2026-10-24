'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const completeAuth = async () => {
      if (!isSupabaseConfigured) {
        setError('Supabase is not configured for this site.');
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      if (!code) {
        setError('This authentication link is invalid or has expired. Request a new recovery link.');
        return;
      }

      try {
        const { error: exchangeError } = await createClient().auth.exchangeCodeForSession(code);
        if (!isActive) return;
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }

        router.replace(params.get('next') === '/reset-password' ? '/reset-password' : '/');
      } catch (exchangeError) {
        if (!isActive) return;
        setError(
          exchangeError instanceof Error
            ? exchangeError.message
            : 'Unable to complete authentication. Request a new recovery link.',
        );
      }
    };

    void completeAuth();
    return () => {
      isActive = false;
    };
  }, [router]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900/60 p-8 text-center">
        {error ? (
          <>
            <h1 className="text-lg font-semibold">Authentication link could not be used</h1>
            <p className="mt-3 text-sm text-neutral-400">{error}</p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-neutral-200"
            >
              Request a new recovery link
            </Link>
          </>
        ) : (
          <>
            <div
              className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white"
              aria-label="Completing authentication"
            />
            <h1 className="mt-4 text-lg font-semibold">Completing secure sign-in</h1>
            <p className="mt-2 text-sm text-neutral-400">Please wait while we verify your link.</p>
          </>
        )}
      </div>
    </main>
  );
}
