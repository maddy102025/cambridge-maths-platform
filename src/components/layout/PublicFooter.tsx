'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useCms } from '@/lib/useCms';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();
  const { cms } = useCms();

  return (
    <footer className="bg-ivory-200 border-t border-sage-200 text-slate-muted pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-sage-200">
          {/* Column 1: Teacher Brand & Philosophy */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sage-300 flex items-center justify-center text-slate-muted font-bold text-xl shadow-sm border border-sage-400/50">
                <span className="font-mono text-slate-900">∑</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-lg tracking-tight text-slate-muted">
                  {cms('global_instructor_name', 'Ms. Eleanor Vance')}
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-soft">
                  {cms('global_instructor_title', 'Cambridge O & A Levels Mathematics Specialist')}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-soft max-w-sm leading-relaxed">
              {cms('public_footer_bio', 'Specialist Cambridge International Examinations mentorship focusing on axiomatic clarity, structured mathematical practice, and disciplined examination technique.')}
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-soft flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-sage-100 border border-sage-200 font-medium">
                Syllabus 4024 / 4037 / 9709
              </span>
              <span className="px-2.5 py-1 rounded-full bg-sage-100 border border-sage-200 font-medium">
                Live Online & Physical
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-muted">Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-soft">
              <li>
                <Link href="/" className="hover:text-slate-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-slate-900 transition-colors">
                  About the Teacher
                </Link>
              </li>
              <li>
                <Link href="/#classes" className="hover:text-slate-900 transition-colors">
                  Classes & Subjects
                </Link>
              </li>
              <li>
                <Link href="/#approach" className="hover:text-slate-900 transition-colors">
                  Learning Approach
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-slate-900 transition-colors">
                  Contact & Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Cambridge Subjects */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-muted">Syllabuses</h4>
            <ul className="space-y-2 text-sm text-slate-soft">
              <li>
                <Link href="/#classes" className="hover:text-slate-900 transition-colors">
                  Mathematics (4024 / 4025)
                </Link>
              </li>
              <li>
                <Link href="/#classes" className="hover:text-slate-900 transition-colors">
                  Additional Mathematics (4037)
                </Link>
              </li>
              <li>
                <Link href="/#classes" className="hover:text-slate-900 transition-colors">
                  Pure Mathematics (Papers 1, 2, 3)
                </Link>
              </li>
              <li>
                <Link href="/#classes" className="hover:text-slate-900 transition-colors">
                  Mechanics (Paper 4)
                </Link>
              </li>
              <li>
                <Link href="/#classes" className="hover:text-slate-900 transition-colors">
                  Probability & Statistics (9709)
                </Link>
              </li>
              <li>
                <Link href="/#classes" className="hover:text-slate-900 transition-colors">
                  Further Mathematics (9231)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Student Access & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-muted">Portals & Contact</h4>
            <div className="space-y-2 text-sm text-slate-soft">
              <div className="flex flex-col gap-1.5">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 font-medium text-slate-muted hover:text-slate-900 transition-colors"
                >
                  <span>Student Portal Login</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/cms/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>SuperAdmin CMS Portal</span>
                </Link>
              </div>

              <div className="pt-2 space-y-1.5 text-xs text-slate-soft">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-light shrink-0" />
                  <span className="truncate">{cms('global_contact_email', 'eleanor.vance@cambridgemaths.edu')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-light shrink-0" />
                  <span>{cms('global_contact_phone', '+44 20 7946 0912 / WhatsApp')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-light shrink-0 mt-0.5" />
                  <span className="leading-tight">{cms('global_academy_address', 'London Academy Center & Global Online Live Classroom')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-soft gap-4">
          <p>© {currentYear} {cms('public_footer_copyright', 'Ms. Eleanor Vance Cambridge Mathematics Academy. All rights reserved.')}</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-light">
              {cms('public_footer_disclaimer', 'Cambridge Assessment International Education (CAIE) syllabus preparation.')}
            </span>
            <Link href="/cms/login" className="hover:text-slate-900 transition-colors font-medium">
              CMS Security Layer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
