'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowRight, User, ShieldCheck } from 'lucide-react';
import { useCms } from '@/lib/useCms';

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cms } = useCms();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About the Teacher', href: '/#about' },
    { name: 'Classes & Subjects', href: '/#classes' },
    { name: 'Learning Approach', href: '/#approach' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F2]/90 backdrop-blur-md border-b border-sage-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo / Teacher Wordmark */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-sage-400 rounded-lg p-1">
            <div className="w-10 h-10 rounded-xl bg-sage-300 flex items-center justify-center text-slate-muted font-bold text-xl shadow-sm border border-sage-400/50 group-hover:bg-sage-400 transition-colors">
              <span className="font-mono text-slate-900">∑</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg tracking-tight text-slate-muted group-hover:text-slate-900 transition-colors">
                {cms('public_nav_brand_title', 'Ms. Eleanor Vance')}
              </span>
              <span className="text-xs tracking-wider uppercase text-slate-soft font-medium">
                {cms('public_nav_brand_subtitle', 'Cambridge O & A Levels Mathematics')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-sage-400 rounded px-1.5 py-1 ${
                    isActive ? 'text-slate-900 font-semibold' : 'text-slate-soft'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA actions */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/cms/login"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-sage-100 hover:bg-sage-200/80 border border-sage-300/80 rounded-xl transition-all"
              title="SuperAdmin CMS Gateway"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>CMS</span>
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-muted bg-white hover:bg-ivory-200 border border-sage-300/80 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-sage-400"
            >
              <User className="w-4 h-4 text-slate-soft" />
              <span>{cms('public_nav_btn_student_login', 'Candidate Portal')}</span>
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-900 bg-sage-300 hover:bg-sage-400 border border-sage-400/60 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-slate-muted"
            >
              <span>{cms('public_nav_btn_register', 'Enroll for 2026 Series')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              href="/cms/login"
              className="inline-flex items-center p-2 text-slate-700 bg-sage-100 border border-sage-300 rounded-lg text-xs"
              title="SuperAdmin CMS"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </Link>
            <Link
              href="/login"
              className="inline-flex sm:hidden items-center p-2 text-slate-muted bg-white border border-sage-300 rounded-lg text-sm"
              title="Student Login"
            >
              <User className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-muted hover:bg-ivory-200 border border-sage-300/80 focus:outline-none focus:ring-2 focus:ring-sage-400 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-ivory-100/98 border-b border-sage-200 px-4 pt-3 pb-6 shadow-xl transition-all">
          <div className="flex flex-col gap-2 pt-2 pb-4 border-b border-sage-200">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-base font-medium text-slate-muted hover:bg-sage-100 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-slate-muted bg-white border border-sage-300 rounded-xl shadow-sm"
            >
              <User className="w-4 h-4" />
              <span>{cms('public_nav_btn_student_login', 'Candidate Portal')}</span>
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-slate-900 bg-sage-300 hover:bg-sage-400 rounded-xl shadow-sm"
            >
              <span>{cms('public_nav_btn_register', 'Enroll for 2026 Series')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/cms/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-slate-700 bg-sage-200/70 border border-sage-300 rounded-xl shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>SuperAdmin Content Management (CMS)</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
