import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { User, Mail, Phone, ShieldCheck, Award, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const enrollments = await prisma.studentEnrollment.findMany({
    where: { studentId: user.id },
    include: { subject: true },
  });

  const attendanceRecords = await prisma.attendanceRecord.findMany({
    where: { studentId: user.id },
  });

  const totalClasses = attendanceRecords.length;
  const attendedClasses = attendanceRecords.filter((a) => a.status === 'PRESENT').length;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-muted tracking-tight">
          Profile & Account Settings
        </h1>
        <p className="text-sm text-slate-soft mt-1">
          Review your Cambridge student credentials, contact verification status, and enrolled subjects.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-sage-200 p-6 sm:p-8 subtle-paper-shadow space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-sage-200">
          <div className="w-16 h-16 rounded-2xl bg-sage-300 text-slate-900 font-bold text-2xl flex items-center justify-center font-mono">
            {user.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-muted">{user.fullName}</h2>
            <p className="text-xs text-slate-soft">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md bg-sage-100 text-sage-800 font-bold text-[10px] uppercase">
                {user.role}
              </span>
              <span className="text-[11px] text-slate-light">
                Candidate Registered: {new Date(user.createdAt).toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-2xl bg-ivory-50 border border-sage-200 space-y-1">
            <span className="text-xs font-semibold text-slate-light uppercase">Email Address</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-muted">{user.email}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sage-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-ivory-50 border border-sage-200 space-y-1">
            <span className="text-xs font-semibold text-slate-light uppercase">Phone Number</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-muted">{user.phone || 'Not provided'}</span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${user.phoneVerified ? 'text-sage-800' : 'text-slate-light'}`}>
                {user.phoneVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{user.phoneVerified ? 'Verified' : 'Unverified Contact'}</span>
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-ivory-50 border border-sage-200 space-y-1">
            <span className="text-xs font-semibold text-slate-light uppercase">Projected Cambridge Grade</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-slate-muted">{user.projectedGrade || 'A*'}</span>
              <span className="text-xs text-slate-light">Teacher Assessed</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-ivory-50 border border-sage-200 space-y-1">
            <span className="text-xs font-semibold text-slate-light uppercase">Attendance Overview</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-muted">
                {totalClasses > 0 ? `${attendedClasses} / ${totalClasses} (${Math.round((attendedClasses / totalClasses) * 100)}%)` : 'No logs yet'}
              </span>
              <span className="text-xs text-slate-light">Live Sessions</span>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="pt-4 border-t border-sage-200 space-y-3">
          <h3 className="font-bold text-slate-muted text-sm">Active Enrolled Subjects</h3>
          <div className="space-y-2">
            {enrollments.map((enr) => (
              <div
                key={enr.id}
                className="p-3.5 rounded-xl border border-sage-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-muted">{enr.subject.name}</span>
                  <p className="text-[11px] text-slate-light">{enr.subject.syllabusInfo}</p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-sage-100 text-slate-800 font-semibold text-[11px]">
                  Enrolled {new Date(enr.enrolledAt).toLocaleDateString('en-GB')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
