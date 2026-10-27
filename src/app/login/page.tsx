'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, UserCheck, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in. Please verify your credentials.');
      }

      // Successful login
      router.push(data.redirectUrl || '/student/home');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative selection:bg-sage-300">
      <div className="absolute inset-0 math-grid-pattern pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center gap-3 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-sage-300 flex items-center justify-center text-slate-muted font-bold text-2xl shadow-sm border border-sage-400/50 group-hover:bg-sage-400 transition-colors">
            <span className="font-mono text-slate-900">∑</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-xl tracking-tight text-slate-muted">
              Ms. Eleanor Vance
            </span>
            <span className="text-xs uppercase tracking-wider text-slate-soft">
              Cambridge O & A Levels Platform
            </span>
          </div>
        </Link>

        <h2 className="text-center text-3xl font-extrabold text-slate-muted tracking-tight">
          Welcome to the Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-soft">
          Enter your credentials to access your course modules and quests.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-sage-200 subtle-paper-shadow">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
                Email Address
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
                  placeholder="student@cambridgemaths.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-muted">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-slate-soft hover:text-slate-900 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-light">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 font-semibold text-sm shadow-sm border border-sage-400/60 disabled:opacity-60 transition-all focus:outline-none focus:ring-2 focus:ring-slate-muted"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-8 pt-6 border-t border-sage-200/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-light flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sage-600" />
                <span>Quick Demo Accounts</span>
              </span>
              <span className="text-[10px] text-slate-light">Click to autofill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('student@cambridgemaths.edu', 'StudentPass123!')}
                className="p-2.5 rounded-xl border border-sage-300 bg-ivory-100 hover:bg-sage-100 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-muted group-hover:text-slate-900">
                  <UserCheck className="w-3.5 h-3.5 text-sage-600" />
                  <span>Student</span>
                </div>
                <div className="text-[10px] text-slate-light truncate mt-0.5">Sarah Ahmed</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('teacher@cambridgemaths.edu', 'AdminPass123!')}
                className="p-2.5 rounded-xl border border-sage-300 bg-ivory-100 hover:bg-sage-100 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-muted group-hover:text-slate-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
                  <span>Teacher</span>
                </div>
                <div className="text-[10px] text-slate-light truncate mt-0.5">Ms. Eleanor Vance</div>
              </button>
            </div>

          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-soft">
          Don’t have an enrolled student account yet?{' '}
          <Link href="/register" className="font-semibold text-slate-muted hover:underline decoration-sage-400">
            Join / Register Here
          </Link>
        </p>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-slate-light hover:text-slate-900 transition-colors">
            ← Return to Teacher Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
