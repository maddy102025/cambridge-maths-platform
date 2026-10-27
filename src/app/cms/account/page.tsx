'use client';

import React from 'react';
import { ShieldCheck, LogOut, KeyRound, Clock, Lock } from 'lucide-react';
import { useCmsSession } from '@/components/cms/CmsSessionContext';

export default function CmsAccountPage() {
  const { user, signOut } = useCmsSession();

  const rows = [
    ['Name', user.fullName],
    ['Email', user.email],
    ['Role', user.role],
    ['User ID', user.id],
  ];

  const notes = [
    { icon: Clock, text: 'CMS sessions expire automatically after 24 hours and use a separate cookie from the standard login.' },
    { icon: Lock, text: 'Only SuperAdmin accounts can publish content. All writes are validated against known keys and length limits.' },
    {
      icon: KeyRound,
      text: 'The emergency passkey is disabled unless the CMS_MASTER_PASSKEY secret (12+ characters) is configured on the server.',
    },
  ];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Account &amp; Security</h1>
      <p className="mt-2 text-sm text-slate-400">Your SuperAdmin identity and the safeguards protecting this console.</p>

      <div className="mt-8 rounded-2xl bg-[#121920] border border-white/5 p-6">
        <div className="flex items-center gap-3 mb-5 text-amber-300">
          <ShieldCheck className="w-5 h-5" />
          <span className="font-medium text-white">Active session</span>
        </div>
        <dl className="grid sm:grid-cols-2 gap-4">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs uppercase tracking-widest text-slate-500">{k}</dt>
              <dd className="mt-1 text-sm text-slate-200 break-all">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ul className="mt-6 space-y-3">
        {notes.map(({ icon: Icon, text }) => (
          <li key={text} className="flex gap-3 rounded-2xl bg-[#121920] border border-white/5 p-4 text-sm text-slate-300">
            <Icon className="w-4 h-4 mt-0.5 text-amber-300 shrink-0" /> {text}
          </li>
        ))}
      </ul>

      <button
        onClick={signOut}
        className="mt-8 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/20 text-sm font-medium transition"
      >
        <LogOut className="w-4 h-4" /> Sign out of console
      </button>
    </div>
  );
}
