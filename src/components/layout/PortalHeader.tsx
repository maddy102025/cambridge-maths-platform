'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Bell,
  Menu,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Presentation,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useCms } from '@/lib/useCms';

export interface PortalHeaderProps {
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SuperAdmin';
  user: {
    fullName: string;
    email?: string;
    role?: string;
    avatarUrl?: string | null;
    studyStreakDays?: number;
    projectedGrade?: string | null;
  };
  portalTitle?: string;
  portalSubtitle?: string;
  unreadCount?: number;
  onMenuClick?: () => void;
}

export default function PortalHeader({
  role,
  user,
  portalTitle,
  portalSubtitle,
  unreadCount = 0,
  onMenuClick,
}: PortalHeaderProps) {
  const router = useRouter();
  const { cms } = useCms();
  const isSuperAdmin = role === 'SuperAdmin' || user.role === 'SuperAdmin';
  const isTeacher = role === 'TEACHER' || role === 'ADMIN';
  const isStudent = role === 'STUDENT';

  const effectiveAvatar =
    user.avatarUrl ||
    (isTeacher ? cms('global_instructor_avatar_url', '') : cms('global_student_default_avatar_url', ''));

  const todayFormatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const firstName = user.fullName.split(' ')[0] || user.fullName;

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (isSuperAdmin) {
        await fetch('/api/cms/logout', { method: 'POST' });
      }
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // Dark styling for SuperAdmin console; clean academic ivory/sage styling for Teacher & Student
  if (isSuperAdmin) {
    return (
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-[#121920]/95 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                {portalTitle || 'SuperAdmin Content Console'}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                <ShieldCheck className="w-3 h-3" /> Master Authority
              </span>
            </div>
            {portalSubtitle && (
              <p className="text-[11px] text-slate-400 hidden md:block">{portalSubtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick portal navigation */}
          <div className="hidden md:flex items-center gap-1.5 text-xs">
            <Link
              href="/admin"
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center gap-1"
            >
              <Presentation className="w-3.5 h-3.5 text-amber-300" />
              <span>Teacher Workspace</span>
            </Link>
            <Link
              href="/student/home"
              className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center gap-1"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>Student View</span>
            </Link>
          </div>

          {/* User badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-300 font-semibold text-xs flex items-center justify-center">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                {firstName}
              </p>
              <p className="text-[10px] text-amber-400 font-mono">SuperAdmin</p>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Teacher & Student Header
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 sm:h-20 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-md border-b border-sage-200">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-slate-muted hover:text-slate-900 hover:bg-ivory-200 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h1 className="text-base sm:text-lg lg:text-xl font-extrabold text-slate-muted tracking-tight">
            {portalTitle || (isStudent ? `Welcome back, ${firstName} 👋` : 'Faculty Instruction Hub')}
          </h1>
          <p className="text-xs text-slate-soft hidden sm:block">
            {portalSubtitle || 'Cambridge May/June 2026 Examination Series Preparation'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Date pill */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-ivory-100 border border-sage-200 text-xs font-medium text-slate-soft">
          <Calendar className="w-3.5 h-3.5 text-slate-light" />
          <span>{todayFormatted}</span>
        </div>

        {/* Student Streak Pill */}
        {isStudent && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-100 border border-sage-300/80 text-xs font-bold text-slate-800">
            <span className="text-amber-600">🔥</span>
            <span className="hidden sm:inline">{user.studyStreakDays || 7} Day Streak</span>
            <span className="sm:hidden">{user.studyStreakDays || 7}d</span>
          </div>
        )}

        {/* Teacher Quick Switcher */}
        {isTeacher && (
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/student/home"
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-muted hover:bg-ivory-100 border border-transparent hover:border-sage-200 transition"
              title="Preview Student Experience"
            >
              Student View
            </Link>
            <Link
              href="/"
              className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-muted hover:bg-ivory-100 border border-transparent hover:border-sage-200 transition"
              title="Public Landing Site"
            >
              Public Site
            </Link>
            {isSuperAdmin && (
              <Link
                href="/cms"
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition"
                title="SuperAdmin CMS Console"
              >
                CMS Suite
              </Link>
            )}
          </div>
        )}

        {/* Notifications (Student) */}
        {isStudent && (
          <Link
            href="/student/heads-up"
            className="relative p-2.5 rounded-xl text-slate-muted hover:bg-ivory-100 border border-sage-200 transition-colors"
            title="Announcements & Notifications"
          >
            <Bell className="w-4 h-4 text-slate-muted" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-sage-700 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </Link>
        )}

        {/* User Pill */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-sage-200">
          <div className="w-8 h-8 rounded-xl bg-sage-200 text-slate-900 font-bold text-xs flex items-center justify-center font-mono overflow-hidden">
            {effectiveAvatar ? (
              <img src={effectiveAvatar} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              user.fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-muted truncate max-w-[120px]">{user.fullName}</p>
            <p className="text-[10px] font-semibold text-slate-light uppercase tracking-wider">
              {isTeacher ? 'Teacher / Faculty' : 'Candidate'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
