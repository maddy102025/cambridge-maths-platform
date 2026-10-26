import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import {
  BookOpen,
  Video,
  FileText,
  CheckSquare,
  ArrowRight,
  Clock,
  Calendar,
  Sparkles,
  Lock
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentModulesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Fetch enrolled subjects
  const enrollments = await prisma.studentEnrollment.findMany({
    where: { studentId: user.id, status: 'ACTIVE' },
    include: {
      subject: {
        include: {
          lessons: true,
          materials: true,
          assignments: {
            include: {
              submissions: {
                where: { studentId: user.id },
              },
            },
          },
        },
      },
    },
  });

  const enrolledSubjectIds = enrollments.map((e) => e.subjectId);

  // Fetch other subjects available in the platform
  const otherSubjects = await prisma.subject.findMany({
    where: {
      id: { notIn: enrolledSubjectIds },
      isAvailable: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-muted tracking-tight">
          Course Modules
        </h1>
        <p className="text-sm text-slate-soft mt-1">
          Access your active subject debriefs, downloadable study drops, and lecture recordings.
        </p>
      </div>

      {/* Enrolled Modules Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-muted">Enrolled Subjects ({enrollments.length})</h2>
          <span className="text-xs text-slate-light">May/June 2026 Examination Candidate</span>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-sage-200 text-center">
            <BookOpen className="w-10 h-10 text-slate-light mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-muted">No Enrolled Subjects Yet</h3>
            <p className="text-xs text-slate-soft max-w-sm mx-auto mt-1">
              Your teacher or administrator has not assigned you to any subject batches yet. Please contact Ms. Vance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => {
              const sub = enrollment.subject;
              const completedAssignments = sub.assignments.filter(
                (a) => a.submissions.length > 0 && a.submissions[0].status !== 'NOT_STARTED'
              ).length;
              const totalAssignments = sub.assignments.length;
              const progressPercentage =
                totalAssignments > 0
                  ? Math.round((completedAssignments / totalAssignments) * 100)
                  : 0;

              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-3xl border border-sage-200 p-6 flex flex-col justify-between subtle-hover-lift subtle-paper-shadow"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-ivory-200 text-slate-soft border border-sage-200">
                        {sub.level}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800 border border-sage-300">
                        Active Cohort
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-muted tracking-tight">{sub.name}</h3>
                      <p className="text-xs font-mono font-medium text-slate-light mt-0.5">
                        {sub.syllabusInfo}
                      </p>
                    </div>

                    <p className="text-xs text-slate-soft line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>

                    {/* Stats pills */}
                    <div className="pt-2 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-ivory-100 border border-sage-100">
                        <div className="font-bold text-slate-muted flex items-center justify-center gap-1">
                          <Video className="w-3.5 h-3.5 text-slate-soft" />
                          <span>{sub.lessons.length}</span>
                        </div>
                        <div className="text-[10px] text-slate-light mt-0.5">Lessons</div>
                      </div>

                      <div className="p-2 rounded-xl bg-ivory-100 border border-sage-100">
                        <div className="font-bold text-slate-muted flex items-center justify-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-soft" />
                          <span>{sub.materials.length}</span>
                        </div>
                        <div className="text-[10px] text-slate-light mt-0.5">Drops</div>
                      </div>

                      <div className="p-2 rounded-xl bg-ivory-100 border border-sage-100">
                        <div className="font-bold text-slate-muted flex items-center justify-center gap-1">
                          <CheckSquare className="w-3.5 h-3.5 text-slate-soft" />
                          <span>{sub.assignments.length}</span>
                        </div>
                        <div className="text-[10px] text-slate-light mt-0.5">Quests</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-light font-medium">Assignment Progress</span>
                        <span className="font-bold text-slate-muted">{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-ivory-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sage-500 rounded-full transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-sage-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-light font-medium">
                      Instructor: {sub.instructorName}
                    </span>
                    <Link
                      href={`/student/modules/${sub.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-sage-300 hover:bg-sage-400 rounded-xl transition-all shadow-xs"
                    >
                      <span>Enter Module</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Other Modules for Enrollment */}
      {otherSubjects.length > 0 && (
        <div className="pt-8 border-t border-sage-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-muted">Other Available Cambridge Subjects</h2>
              <p className="text-xs text-slate-light">Enquire to add these syllabuses to your timetable.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherSubjects.map((sub) => (
              <div
                key={sub.id}
                className="bg-white/70 rounded-3xl border border-sage-200/60 p-6 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-ivory-200 text-slate-soft">
                      {sub.level}
                    </span>
                    <span className="text-xs text-slate-light flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Not Enrolled</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-muted">{sub.name}</h3>
                  <p className="text-xs font-mono text-slate-light">{sub.syllabusInfo}</p>
                  <p className="text-xs text-slate-soft line-clamp-2">{sub.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-sage-100 flex items-center justify-between">
                  <span className="text-xs text-slate-light font-medium">
                    {sub.scheduleInfo || 'Flexible timings'}
                  </span>
                  <Link
                    href="/#contact"
                    className="text-xs font-semibold text-slate-muted hover:text-slate-900 hover:underline"
                  >
                    Enquire Enrollment
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
