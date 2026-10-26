import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, ExternalLink, ArrowUpRight } from 'lucide-react';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

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
                  Ms. Eleanor Vance
                </span>
                <span className="text-xs uppercase tracking-wider text-slate-soft">
                  Cambridge O & A Levels Mathematics
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-soft max-w-sm leading-relaxed">
              Specialist Cambridge International curriculum mentorship focusing on conceptual clarity, structured mathematical practice, and disciplined examination technique.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs text-slate-soft">
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-muted">Portal & Contact</h4>
            <div className="space-y-2 text-sm text-slate-soft">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 font-medium text-slate-muted hover:text-slate-900 transition-colors"
              >
                <span>Student Login</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <p className="text-xs text-slate-light">
                Secure access to enrolled Debriefs, Study Drops, and Quest assignment trackers.
              </p>
              <div className="pt-2 space-y-1.5 text-xs text-slate-soft">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-light" />
                  <span>eleanor.vance@cambridgemaths.edu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-light" />
                  <span>+44 20 7946 0912 / WhatsApp</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-light" />
                  <span>London, UK & Global Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-soft gap-4">
          <p>© {currentYear} Ms. Eleanor Vance. Cambridge O & A Levels Mathematics. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-light">Cambridge Assessment International Education (CAIE) syllabus preparation</span>
            <Link href="/login" className="hover:text-slate-900 transition-colors">
              Teacher / Staff Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
