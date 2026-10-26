'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  CalendarCheck,
  Flame,
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

export default function StudentHomePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/portal?view=student-home')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res) setData(res);
      })
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="py-12 text-center text-xs text-slate-light font-medium">
        Loading performance summary...
      </div>
    );
  }

  const {
    user,
    enrollments = [],
    attendanceRecords = [],
    allAssignments = [],
    recentGrades = [],
    recentMaterials = [],
  } = data;

  const totalClassesRecorded = attendanceRecords.length;
  const classesAttended = attendanceRecords.filter((a: any) => a.status === 'PRESENT').length;
  const attendancePercentage =
    totalClassesRecorded > 0
      ? Math.round((classesAttended / totalClassesRecorded) * 100)
      : 100;

  const totalAssignmentsCount = allAssignments.length;
  const submittedAssignments = allAssignments.filter(
    (a: any) => a.submissions && a.submissions.length > 0 && a.submissions[0].status !== 'NOT_STARTED'
  );
  const completedAssignmentsCount = submittedAssignments.length;
  const pendingAssignmentsCount = totalAssignmentsCount - completedAssignmentsCount;

  const upcomingTasks = allAssignments
    .filter((a: any) => !a.submissions || a.submissions.length === 0 || a.submissions[0].status === 'NOT_STARTED')
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* SECTION A: PERFORMANCE SUMMARY CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-muted tracking-tight">Performance Summary</h2>
          <span className="text-xs text-slate-light font-medium">Updated in real-time from instructor assessments</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Projected Grade */}
          <div className="bg-white p-5 rounded-2xl border border-sage-200 subtle-paper-shadow relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-light">Projected Grade</span>
              <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-slate-muted">
                <Award className="w-4 h-4 text-slate-muted" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-muted font-mono">
                {user.projectedGrade || 'A*'}
              </span>
              <span className="text-xs text-sage-700 font-semibold bg-sage-100 px-2 py-0.5 rounded-md">
                Verified Target
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-soft">
              Based on formal mock papers & problem set scores.
            </p>
          </div>

          {/* Card 2: Attendance */}
          <div className="bg-white p-5 rounded-2xl border border-sage-200 subtle-paper-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-light">Class Attendance</span>
              <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-slate-muted">
                <CalendarCheck className="w-4 h-4 text-slate-muted" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-muted font-mono">
                {totalClassesRecorded > 0 ? `${classesAttended}/${totalClassesRecorded}` : 'N/A'}
              </span>
              <span className="text-xs text-slate-soft font-semibold">
                ({attendancePercentage}%)
              </span>
            </div>
            <div className="mt-3 w-full bg-ivory-200 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  attendancePercentage >= 75 ? 'bg-sage-600' : 'bg-amber-500'
                }`}
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-light">
              Calculated from {totalClassesRecorded} logged lecture sessions.
            </p>
          </div>

          {/* Card 3: Study Streak */}
          <div className="bg-white p-5 rounded-2xl border border-sage-200 subtle-paper-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-light">Study Streak</span>
              <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-slate-muted">
                <Flame className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-muted font-mono">
                {user.studyStreakDays || 7}
              </span>
              <span className="text-xs text-slate-soft font-medium">Consecutive Days</span>
            </div>
            <p className="mt-3 text-xs text-slate-soft">
              Active daily problem solving and resource engagement.
            </p>
          </div>

          {/* Card 4: Assignments Completed */}
          <div className="bg-white p-5 rounded-2xl border border-sage-200 subtle-paper-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-light">Quest Completion</span>
              <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-slate-muted">
                <CheckCircle className="w-4 h-4 text-slate-muted" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-muted font-mono">
                {completedAssignmentsCount} / {totalAssignmentsCount}
              </span>
              <span className="text-xs text-slate-soft font-semibold">
                ({totalAssignmentsCount > 0 ? Math.round((completedAssignmentsCount / totalAssignmentsCount) * 100) : 0}%)
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-soft">
              {pendingAssignmentsCount} pending submission deadlines remaining.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION B & C: UPCOMING TASKS & ENROLLED MODULES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-sage-200 p-6 sm:p-7 subtle-paper-shadow">
            <div className="flex items-center justify-between pb-4 border-b border-sage-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-muted" />
                <h3 className="text-lg font-bold text-slate-muted">Upcoming Assignment Deadlines</h3>
              </div>
              <Link
                href="/student/quest"
                className="text-xs font-semibold text-slate-soft hover:text-slate-900 inline-flex items-center gap-1"
              >
                <span>View Quest</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-sage-100 mt-2">
              {upcomingTasks.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle className="w-8 h-8 text-sage-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-muted">All Caught Up!</p>
                  <p className="text-xs text-slate-light mt-0.5">No pending assignment deadlines at the moment.</p>
                </div>
              ) : (
                upcomingTasks.map((task: any) => {
                  const dueDate = new Date(task.dueDate);
                  const isUrgent = dueDate.getTime() - Date.now() < 48 * 3600 * 1000;
                  return (
                    <div key={task.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-ivory-200 text-slate-soft border border-sage-200">
                            {task.subject?.name}
                          </span>
                          {isUrgent && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              Due Soon
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-muted mt-1">{task.title}</h4>
                        <p className="text-xs text-slate-light mt-0.5">
                          Deadline: {dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • Max {task.maxMarks} Marks
                        </p>
                      </div>

                      <Link
                        href={`/student/quest?id=${task.id}`}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-sage-200 hover:bg-sage-300 rounded-xl transition-colors shrink-0"
                      >
                        <span>Open Task</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-sage-200 p-6 sm:p-7 subtle-paper-shadow">
            <div className="flex items-center justify-between pb-4 border-b border-sage-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-muted" />
                <h3 className="text-lg font-bold text-slate-muted">Recent Instructor Feedback</h3>
              </div>
              <span className="text-xs text-slate-light font-medium">Published Evaluations</span>
            </div>

            <div className="divide-y divide-sage-100 mt-2">
              {recentGrades.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-light">
                  No graded submissions published yet. Check back once your teacher marks your work.
                </p>
              ) : (
                recentGrades.map((grade: any) => (
                  <div key={grade.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-slate-light">
                          {grade.assignment?.subject?.name}
                        </span>
                        <h4 className="text-sm font-bold text-slate-muted">{grade.assignment?.title}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-muted font-mono">
                          {grade.gradeScore} / {grade.gradeMax}
                        </span>
                        <span className="ml-2 px-2 py-0.5 bg-sage-200 text-slate-900 rounded font-bold text-xs">
                          {grade.gradeLetter || 'A*'}
                        </span>
                      </div>
                    </div>

                    {grade.feedback && (
                      <div className="p-3 rounded-xl bg-ivory-100 border border-sage-200/80 text-xs text-slate-soft italic">
                        "{grade.feedback}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-sage-200 p-6 subtle-paper-shadow">
            <div className="flex items-center justify-between pb-4 border-b border-sage-200">
              <h3 className="text-lg font-bold text-slate-muted">Enrolled Modules</h3>
              <Link
                href="/student/modules"
                className="text-xs font-semibold text-slate-soft hover:text-slate-900 inline-flex items-center gap-1"
              >
                <span>All Modules</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3 mt-4">
              {enrollments.length === 0 ? (
                <p className="text-xs text-slate-light py-4 text-center">
                  You are not currently enrolled in any modules. Contact instructor.
                </p>
              ) : (
                enrollments.map((enrollment: any) => {
                  const sub = enrollment.subject;
                  return (
                    <Link
                      key={sub.id}
                      href={`/student/modules?id=${sub.id}`}
                      className="block p-4 rounded-2xl bg-ivory-50 border border-sage-200/80 hover:bg-sage-100/50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-slate-soft border border-sage-200">
                          {sub.level}
                        </span>
                        <span className="text-xs font-medium text-slate-light">
                          {sub.materials?.length || 0} Drops • {sub.assignments?.length || 0} Quests
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-muted group-hover:text-slate-900 mt-2">
                        {sub.name}
                      </h4>
                      <p className="text-xs font-mono text-slate-light mt-0.5 truncate">
                        {sub.syllabusInfo}
                      </p>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-sage-200 p-6 subtle-paper-shadow">
            <div className="flex items-center justify-between pb-4 border-b border-sage-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-muted" />
                <h3 className="text-base font-bold text-slate-muted">Recent Study Drops</h3>
              </div>
              <Link
                href="/student/modules"
                className="text-xs font-semibold text-slate-soft hover:text-slate-900"
              >
                Repository
              </Link>
            </div>

            <div className="space-y-3 mt-4">
              {recentMaterials.map((mat: any) => (
                <div
                  key={mat.id}
                  className="p-3 rounded-xl border border-sage-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-muted truncate">{mat.title}</p>
                    <p className="text-[11px] text-slate-light truncate mt-0.5">
                      {mat.subject?.name} • {mat.fileType} ({mat.fileSize})
                    </p>
                  </div>
                  <a
                    href={mat.fileUrl}
                    download
                    className="px-2.5 py-1.5 rounded-lg bg-sage-100 hover:bg-sage-200 text-slate-900 font-semibold shrink-0 transition-colors"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
