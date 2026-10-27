'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  Globe,
  GraduationCap,
  Presentation,
  Settings2,
  UserCog,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { CMS_CATEGORIES, CmsCategory } from '@/lib/cmsMeta';
import { useCmsSession } from './CmsSessionContext';

const ICONS: Record<CmsCategory, React.ComponentType<{ className?: string }>> = {
  PUBLIC: Globe,
  STUDENT: GraduationCap,
  TEACHER: Presentation,
  GLOBAL: Settings2,
};

const PREVIEWS = [
  { label: 'Public site', href: '/' },
  { label: 'Student portal', href: '/student/home' },
  { label: 'Teacher workspace', href: '/admin' },
];

export default function CmsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() || '';
  const { user, signOut } = useCmsSession();

  const isActive = (href: string) =>
    href === '/cms' ? pathname === '/cms' || pathname === '/cms/' : pathname.startsWith(href);

  const linkCls = (active: boolean) =>
    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active
        ? 'bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/20'
        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
    }`;

  return (
    <div className="h-full flex flex-col bg-[#121920] overflow-y-auto">
      <div className="px-5 py-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <ShieldCheck className="w-5 h-5 text-[#0B0F14]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">SuperAdmin</p>
          <p className="text-[11px] uppercase tracking-widest text-amber-400/80">Content Console</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-6" aria-label="SuperAdmin navigation">
        <div className="space-y-1">
          <Link href="/cms" onClick={onNavigate} className={linkCls(isActive('/cms'))}>
            <LayoutDashboard className="w-4 h-4" /> Overview
          </Link>
        </div>

        <div className="space-y-1">
          <p className="px-3 pb-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">Content</p>
          {CMS_CATEGORIES.map((c) => {
            const Icon = ICONS[c.id];
            return (
              <Link
                key={c.id}
                id={`cms-nav-${c.slug}`}
                href={c.href}
                onClick={onNavigate}
                className={linkCls(isActive(c.href))}
              >
                <Icon className="w-4 h-4" /> {c.navLabel}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1">
          <p className="px-3 pb-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">Security</p>
          <Link href="/cms/account" onClick={onNavigate} className={linkCls(isActive('/cms/account'))}>
            <UserCog className="w-4 h-4" /> Account &amp; Security
          </Link>
        </div>

        <div className="space-y-1">
          <p className="px-3 pb-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">Live preview</p>
          {PREVIEWS.map((p) => (
            <a
              key={p.href}
              href={p.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all"
            >
              {p.label} <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-amber-400/15 text-amber-300 flex items-center justify-center text-sm font-semibold">
            {(user.fullName || user.email).charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-white truncate">{user.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          id="cms-signout"
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-300 bg-white/5 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );
}
