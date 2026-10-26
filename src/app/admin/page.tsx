import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  Users,
  BookOpen,
  CheckSquare,
  Mail,
  ArrowRight,
  Clock,
  Award,
  Sparkles,
  CalendarCheck,
  Megaphone,
  CheckCircle2
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Real database metrics
  const [
    totalStudents,
    totalSubjects,
    totalAssignments,
    pendingSubmissionsCount,
    totalInquiries,
    recentSubmissions,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.subject.count(),
    prisma.assignment.count(),
    prisma.submission.count({
      where: {
        status: { in: ['SUBMITTED', 'LATE'] },
      },
    }),
    prisma.contactInquiry.count({ where: { status: 'NEW' } }),
    prisma.submission.findMany({
      where: {
        status: { in: ['SUBMITTED', 'LATE'] },
      },
      include: {
        student: true,
        assignment: {
          include: { subject: true },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-200 text-slate-800 text-xs font-bold uppercase tracking-wider mb-2">
          <span>Instructor Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-muted tracking-tight">
          Cambridge Academic Overview
        </h1>
        <p className="text-sm text-slate-soft mt-1">
          Manage Cambridge O & A Levels courses, student enrollments, submissions, and grading.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-sage-200 subtle-paper-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-light">Registered Students</span>
            <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-slate-muted">
              <Users className="w-4 h-4 text-slate-muted" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-muted font-mono">{totalStudents}</div>
          <p className="mt-1 text-xs text-slate-soft">Active candidates in platform</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sage-200 subtle-paper-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-light">Submissions To Grade</span>
            <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-slate-muted">
              <CheckSquare className="w-4 h-4 text-amber-700" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-muted font-mono">{pendingSubmissionsCount}</div>
          <p className="mt-1 text-xs text-slate-soft">Awaiting marks & feedback</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sage-200 subtle-paper-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-light">Active Syllabuses</span>
            <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-slate-muted">
              <BookOpen className="w-4 h-4 text-slate-muted" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-muted font-mono">{totalSubjects}</div>
          <p className="mt-1 text-xs text-slate-soft">Cambridge O & A Level modules</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sage-200 subtle-paper-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-light">New Inquiries</span>
            <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-slate-muted">
              <Mail className="w-4 h-4 text-slate-muted" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-muted font-mono">{totalInquiries}</div>
          <p className="mt-1 text-xs text-slate-soft">Incoming admissions questions</p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white p-6 rounded-3xl border border-sage-200 subtle-paper-shadow">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-muted mb-4">Quick Management Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/assignments"
            className="p-4 rounded-2xl bg-ivory-50 border border-sage-200 hover:bg-sage-100 transition-colors text-left"
          >
            <CheckSquare className="w-5 h-5 text-slate-muted mb-2" />
            <h4 className="text-xs font-bold text-slate-muted">Grade Submissions</h4>
            <p className="text-[11px] text-slate-light mt-0.5">Review solutions & publish grades</p>
          </Link>

          <Link
            href="/admin/assignments"
            className="p-4 rounded-2xl bg-ivory-50 border border-sage-200 hover:bg-sage-100 transition-colors text-left"
          >
            <Sparkles className="w-5 h-5 text-slate-muted mb-2" />
            <h4 className="text-xs font-bold text-slate-muted">Create Quest</h4>
            <p className="text-[11px] text-slate-light mt-0.5">New assignment & prompt</p>
          </Link>

          <Link
            href="/admin/attendance"
            className="p-4 rounded-2xl bg-ivory-50 border border-sage-200 hover:bg-sage-100 transition-colors text-left"
          >
            <CalendarCheck className="w-5 h-5 text-slate-muted mb-2" />
            <h4 className="text-xs font-bold text-slate-muted">Log Attendance</h4>
            <p className="text-[11px] text-slate-light mt-0.5">Record live class attendance</p>
          </Link>

          <Link
            href="/admin/announcements"
            className="p-4 rounded-2xl bg-ivory-50 border border-sage-200 hover:bg-sage-100 transition-colors text-left"
          >
            <Megaphone className="w-5 h-5 text-slate-muted mb-2" />
            <h4 className="text-xs font-bold text-slate-muted">Announce</h4>
            <p className="text-[11px] text-slate-light mt-0.5">Broadcast school alerts</p>
          </Link>
        </div>
      </div>

      {/* Submissions Pending Evaluation */}
      <div className="bg-white rounded-3xl border border-sage-200 p-6 sm:p-7 subtle-paper-shadow">
        <div className="flex items-center justify-between pb-4 border-b border-sage-200">
          <div>
            <h3 className="text-lg font-bold text-slate-muted">Submissions Pending Evaluation</h3>
            <p className="text-xs text-slate-light mt-0.5">Student solution files awaiting mark assignment and written feedback.</p>
          </div>
          <Link
            href="/admin/assignments"
            className="text-xs font-bold text-slate-muted hover:text-slate-900 inline-flex items-center gap-1"
          >
            <span>Grading Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-sage-100 mt-2">
          {recentSubmissions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-light">
              <CheckCircle2 className="w-8 h-8 text-sage-600 mx-auto mb-2" />
              <p className="font-bold text-slate-muted">No pending submissions!</p>
              <p>All student work has been graded and published.</p>
            </div>
          ) : (
            recentSubmissions.map((sub) => {
              const latestVer = sub.versions[0];
              return (
                <div key={sub.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-ivory-200 text-slate-soft">
                        {sub.assignment.subject.name}
                      </span>
                      <span className="text-xs font-bold text-slate-muted">{sub.student.fullName}</span>
                      {sub.status === 'LATE' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          Late
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-muted mt-1">{sub.assignment.title}</h4>
                    <p className="text-xs text-slate-light mt-0.5">
                      Submitted: {new Date(sub.submittedAt || sub.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • File: {latestVer?.fileName || 'Attached solution'}
                    </p>
                  </div>

                  <Link
                    href={`/admin/assignments?submissionId=${sub.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-sage-300 hover:bg-sage-400 rounded-xl transition-colors shrink-0"
                  >
                    <span>Grade Solution</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
