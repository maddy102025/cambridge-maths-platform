'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, Calendar, Sparkles } from 'lucide-react';

interface StudentHeaderProps {
  user: {
    fullName: string;
    projectedGrade?: string | null;
    studyStreakDays?: number;
  };
  unreadCount?: number;
}

export default function StudentHeader({ user, unreadCount = 0 }: StudentHeaderProps) {
  const todayFormatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const firstName = user.fullName.split(' ')[0] || user.fullName;

  return (
    <header className="hidden lg:flex items-center justify-between h-20 px-8 bg-white/80 backdrop-blur-md border-b border-sage-200 sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-extrabold text-slate-muted tracking-tight">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-xs text-slate-soft mt-0.5">
          Cambridge May/June 2026 Examination Series Preparation
        </p>
      </div>

      <div className="flex items-center gap-5">
        {/* Academic Date & Term Label */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-ivory-100 border border-sage-200 text-xs font-medium text-slate-soft">
          <Calendar className="w-3.5 h-3.5 text-slate-light" />
          <span>{todayFormatted}</span>
        </div>

        {/* Study streak pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-100 border border-sage-300/80 text-xs font-bold text-slate-800">
          <span className="text-amber-600">🔥</span>
          <span>{user.studyStreakDays || 7} Day Streak</span>
        </div>

        {/* Notifications indicator */}
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
      </div>
    </header>
  );
}
