'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError('Please provide a valid official email address (e.g. user@institution.edu.in).');
      return;
    }
    setError('');
    setIsLoading(true);
    const resetError = await requestPasswordReset(email.trim());
    setIsLoading(false);
    if (resetError) {
      setError(resetError);
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.08] border border-white/20 flex items-center justify-center font-bold text-white text-sm shadow-[0_0_20px_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="mt-5 text-center text-2xl font-bold tracking-tight text-white">
          Reset Official Credentials
        </h2>
        <p className="mt-2 text-center text-xs text-neutral-400">
          Enter your registered institutional email to receive a secure recovery token.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-neutral-900/60 backdrop-blur-2xl py-8 px-6 shadow-2xl rounded-2xl border border-white/10 sm:px-10">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/[0.08] border border-white/20 text-white flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-base text-white tracking-tight">Recovery Token Dispatched</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                If an account exists for <strong className="text-white">{email}</strong>, a secure password reset link has been sent. Use the link in your email to choose a new password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">Official Email</label>
                <div className="mt-1.5 relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="name@aicte.gov.in"
                    className="block w-full pl-10 pr-4 py-2.5 text-xs bg-black/40 border border-white/10 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/40 transition-all"
                  />
                </div>
                {error && (
                  <p className="text-[11px] font-medium text-rose-400 mt-1.5 leading-normal">
                    {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-white hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
              >
                {isLoading ? 'Sending…' : 'Send Recovery Link'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
