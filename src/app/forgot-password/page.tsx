'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setTimeout(() => {
      setStatus('success');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-sage-300">
      <div className="absolute inset-0 math-grid-pattern pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-3 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-sage-300 flex items-center justify-center text-slate-muted font-bold text-2xl shadow-sm border border-sage-400/50">
            <span className="font-mono text-slate-900">∑</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-xl tracking-tight text-slate-muted">
              Ms. Eleanor Vance
            </span>
            <span className="text-xs uppercase tracking-wider text-slate-soft">
              Cambridge Mathematics Platform
            </span>
          </div>
        </Link>

        <h2 className="text-center text-3xl font-extrabold text-slate-muted tracking-tight">
          Password Recovery
        </h2>
        <p className="mt-2 text-center text-sm text-slate-soft">
          Enter your registered email address to receive password reset instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-sage-200 subtle-paper-shadow">
          {status === 'success' ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-sage-100 border border-sage-300 text-sage-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-muted">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-soft leading-relaxed">
                If an account exists for <strong className="text-slate-muted">{email}</strong>, a secure password reset link has been dispatched to your inbox.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 font-semibold text-sm transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
                  Registered Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-light">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 font-semibold text-sm shadow-sm border border-sage-400/60 disabled:opacity-60 transition-all focus:outline-none focus:ring-2 focus:ring-slate-muted"
              >
                {status === 'submitting' ? (
                  <span>Sending Instructions...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send Reset Instructions</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-soft hover:text-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
