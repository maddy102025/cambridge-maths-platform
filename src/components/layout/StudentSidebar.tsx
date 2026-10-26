'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BookOpen,
  CheckSquare,
  Bell,
  User,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

interface StudentSidebarProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  };
  unreadCount?: number;
}

export default function StudentSidebar({ user, unreadCount = 0 }: StudentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/student/home', icon: Home },
    { name: 'Modules', href: '/student/modules', icon: BookOpen },
    { name: 'Quest', href: '/student/quest', icon: CheckSquare },
    {
      name: 'Heads-up',
      href: '/student/heads-up',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { name: 'Profile / Settings', href: '/student/profile', icon: User },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-sage-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/student/home" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sage-300 flex items-center justify-center font-bold font-mono text-slate-900 text-sm">
            ∑
          </div>
          <span className="font-bold text-slate-muted text-sm tracking-tight">Cambridge Portal</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/student/heads-up"
            className="relative p-2 rounded-lg text-slate-muted hover:bg-ivory-100"
          >
            <Bell className="w-5 h-5 text-slate-soft" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sage-600 ring-2 ring-white" />
            )}
          </Link>
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-lg text-slate-muted hover:bg-ivory-100"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          <div className="relative w-72 max-w-[85vw] bg-[#FAF8F2] h-full shadow-2xl flex flex-col justify-between p-5 z-10 border-r border-sage-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-sage-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sage-300 flex items-center justify-center font-bold font-mono text-slate-900">
                    ∑
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-muted text-sm leading-tight">Ms. Eleanor Vance</h4>
                    <p className="text-[11px] text-slate-soft">Student Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-sage-100 text-slate-muted"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student info card */}
              <div className="my-4 p-3 rounded-xl bg-white border border-sage-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sage-200 text-slate-muted font-bold text-xs flex items-center justify-center shrink-0">
                  {getInitials(user.fullName)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-muted truncate">{user.fullName}</p>
                  <p className="text-[11px] text-slate-light truncate">{user.email}</p>
                </div>
              </div>

              {/* Navigation list */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-sage-300 text-slate-900 font-semibold shadow-xs'
                          : 'text-slate-muted hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-slate-muted" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sage-600 text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-sage-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-[#FAF8F2] border-r border-sage-200 h-screen sticky top-0 shrink-0 p-5">
        <div>
          {/* Logo Wordmark */}
          <Link href="/student/home" className="flex items-center gap-3 pb-6 border-b border-sage-200">
            <div className="w-10 h-10 rounded-xl bg-sage-300 flex items-center justify-center font-bold font-mono text-slate-900 text-lg shadow-sm border border-sage-400/60">
              ∑
            </div>
            <div>
              <h2 className="font-bold text-slate-muted text-sm tracking-tight">Ms. Eleanor Vance</h2>
              <p className="text-[11px] uppercase tracking-wider text-slate-soft font-medium">Student Portal</p>
            </div>
          </Link>

          {/* Student mini profile badge */}
          <div className="my-5 p-3 rounded-2xl bg-white border border-sage-200 subtle-paper-shadow flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-200 text-slate-muted font-bold text-sm flex items-center justify-center shrink-0">
              {getInitials(user.fullName)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-muted truncate">{user.fullName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-600" />
                <span className="text-[10px] text-slate-soft uppercase tracking-wider font-semibold">Active Student</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sage-300 text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-muted hover:bg-white hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-slate-muted" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sage-700 text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area: Sign Out & Teacher Link */}
        <div className="space-y-3 pt-4 border-t border-sage-200">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-soft hover:text-slate-900 rounded-lg transition-colors"
          >
            <span>Public Teacher Site</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-soft hover:text-red-700 hover:bg-red-50/80 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-light" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
