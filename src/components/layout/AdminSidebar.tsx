'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CheckSquare,
  CalendarCheck,
  Megaphone,
  Mail,
  LogOut,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

interface AdminSidebarProps {
  user: {
    fullName: string;
    email: string;
    role: string;
  };
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard Hub', href: '/admin', icon: LayoutDashboard },
    { name: 'Student Management', href: '/admin/students', icon: Users },
    { name: 'Courses & Study Drops', href: '/admin/courses', icon: BookOpen },
    { name: 'Assignments & Grading', href: '/admin/assignments', icon: CheckSquare },
    { name: 'Attendance Records', href: '/admin/attendance', icon: CalendarCheck },
    { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
    { name: 'Contact Inquiries', href: '/admin/inquiries', icon: Mail },
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

  return (
    <aside className="w-full lg:w-72 bg-[#FAF8F2] border-r border-sage-200 lg:h-screen lg:sticky lg:top-0 shrink-0 p-5 flex flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="pb-5 border-b border-sage-200">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-muted text-sage-300 flex items-center justify-center font-bold font-mono text-xl shadow-sm">
              ∑
            </div>
            <div>
              <h2 className="font-bold text-slate-muted text-sm tracking-tight">Instructor Workspace</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-sage-200 text-slate-800">
                Teacher / Admin
              </span>
            </div>
          </Link>
        </div>

        {/* Teacher profile badge */}
        <div className="my-4 p-3 rounded-2xl bg-white border border-sage-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sage-200 text-slate-muted font-bold text-xs flex items-center justify-center shrink-0">
            {user.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-muted truncate">{user.fullName}</p>
            <p className="text-[11px] text-slate-light truncate">{user.email}</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-slate-muted text-white shadow-xs'
                    : 'text-slate-muted hover:bg-white hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 text-sage-600" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom links */}
      <div className="pt-4 border-t border-sage-200 space-y-2">
        <Link
          href="/student/home"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-soft hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Switch to Student View</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-soft hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
        >
          <span>Public Teacher Site</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
