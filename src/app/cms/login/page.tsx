'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

export default function CmsLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cms/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Authentication failed.');
      router.replace('/cms');
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
      setLoading(false);
    }
  };

  const field =
    'w-full rounded-xl bg-[#0B0F14] border border-white/10 pl-10 pr-3.5 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40 transition';

  return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-amber-700/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to website
        </Link>
        <div className="rounded-3xl bg-[#121920]/90 backdrop-blur border border-white/5 p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <ShieldCheck className="w-6 h-6 text-[#0B0F14]" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-white">SuperAdmin Console</h1>
          <p className="mt-1 text-sm text-slate-400">Restricted access. Sign in to manage platform content.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="cms-email"
                type="email"
                required
                autoComplete="username"
                aria-label="Email address"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={field}
              />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="cms-password"
                type={show ? 'text' : 'password'}
                required
                autoComplete="current-password"
                aria-label="Password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${field} pr-11`}
              />
              <button
                type="button"
                aria-label={show ? 'Hide password' : 'Show password'}
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div role="alert" className="flex items-center gap-2 rounded-xl bg-red-500/10 text-red-300 text-sm px-3.5 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button
              id="cms-login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 text-[#0B0F14] font-semibold text-sm hover:brightness-110 disabled:opacity-60 transition"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
