'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCms } from '@/lib/useCms';
import {
  Award,
  CalendarCheck,
  Flame,
  CheckCircle,
  Clock,
  ArrowRight,
  FileText,
  ChevronRight,
  MessageSquare,
  Sparkles,
  BookOpen,
  Lightbulb
} from 'lucide-react';

export default function StudentHomePage() {
  const { cms } = useCms();
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
      {/* STUDENT WELCOME & MOTIVATIONAL BANNER */}
      <div className="bg-gradient-to-r from-sage-200/80 via-ivory-100 to-sage-100 p-6 sm:p-8 rounded-3xl border border-sage-300/80 subtle-paper-shadow relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-sage-300 text-[11px] font-bold uppercase tracking-wider text-slate-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{cms('student_dash_welcome_prefix', 'Candidate Academic Command Hub')}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-muted tracking-tight">
            Welcome back, {user.fullName}!
          </h1>

          <p className="text-sm text-slate-soft max-w-2xl font-medium">
            {cms('student_dash_welcome_subtitle', 'Live metrics, syllabus lecture streams, and assignment feedback synchronized from your instructor.')}
          </p>

          <div className="pt-2 flex items-center gap-3 flex-wrap">
            <div className="p-3 rounded-xl bg-white/90 border border-sage-200 text-xs text-slate-soft italic max-w-xl">
              {cms('student_dash_quote_text', '“Pure mathematics is, in its way, the poetry of logical ideas.” — Albert Einstein')}
            </div>
          </div>
        </div>
      </div>

      {/* EXAMINER STRATEGY TIP */}
      <div className="bg-white p-5 rounded-2xl border border-sage-200/90 subtle-paper-shadow flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
          <Lightbulb className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-muted">
            {cms('student_dash_tip_title', 'Examiner Strategy: Explicit Working')}
          </h3>
          <p className="text-xs text-slate-soft mt-1 leading-relaxed">
            {cms('student_dash_tip_desc', 'Always state the relevant mathematical identity before numeric substitution. Cambridge mark schemes award method marks (M1) even if an arithmetic slip occurs in the final answer (A0).')}
          </p>
        </div>
      </div>

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
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-light">
                {cms('student_dash_card1_title', 'Projected Grade')}
              </span>
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
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-light">
                {cms('student_dash_card2_title', 'Class Attendance')}
              </span>
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
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-light">
                {cms('student_dash_card4_title', 'Study Consistency Streak')}
              </span>
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
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-light">
                {cms('student_dash_card3_title', 'Completed Problem Sets')}
              </span>
              <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-slate-muted">
                <CheckCircle className="w-4 h-4 text-slate-muted" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-muted font-mono">
                {completedAssignmentsCount} / {totalAssignmentsCount}
              </span>
              <span className="text-xs text-slate-soft font-medium">Tasks Graded</span>
            </div>
            <p className="mt-3 text-xs text-slate-soft">
              {pendingAssignmentsCount > 0
                ? `${pendingAssignmentsCount} pending submission`
                : 'All current problem sets submitted'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION B: UPCOMING TASKS & RECENT GRADES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-sage-200 p-6 sm:p-7 subtle-paper-shadow">
            <div className="flex items-center justify-between pb-4 border-b border-sage-200">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-muted" />
                <h3 className="text-lg font-bold text-slate-muted">Upcoming Quest Tasks</h3>
              </div>
              <Link
                href="/student/quest"
                className="text-xs font-bold text-slate-muted hover:text-slate-900 inline-flex items-center gap-1"
              >
                <span>View All Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-sage-100 mt-2">
              {upcomingTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-light">
                  <CheckCircle className="w-8 h-8 text-sage-600 mx-auto mb-2" />
                  <p className="font-bold text-slate-muted">You are completely up to date!</p>
                  <p>No active problem sets pending submission.</p>
                </div>
              ) : (
                upcomingTasks.map((task: any) => {
                  const dueDate = new Date(task.dueDate);
                  const isUrgent = dueDate.getTime() - Date.now() < 48 * 3600 * 1000;

                  return (
                    <div key={task.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-ivory-200 text-slate-soft">
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
                        <span>{cms('student_dash_btn_submit_quest', 'Submit Solution Working')}</span>
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
                <span>Browse All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-sage-100 mt-2">
              {enrollments.map((enr: any) => (
                <div key={enr.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-light block">
                      {enr.subject?.code}
                    </span>
                    <h4 className="text-sm font-bold text-slate-muted">{enr.subject?.name}</h4>
                    <p className="text-xs text-slate-soft mt-0.5">{enr.subject?.level}</p>
                  </div>

                  <Link
                    href={`/student/modules?id=${enr.subject?.id}`}
                    className="p-2 rounded-xl bg-ivory-100 hover:bg-sage-100 text-slate-muted transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-sage-200 p-6 subtle-paper-shadow">
            <div className="flex items-center justify-between pb-4 border-b border-sage-200">
              <h3 className="text-lg font-bold text-slate-muted">Recent Study Drops</h3>
              <Link
                href="/student/modules"
                className="text-xs font-semibold text-slate-soft hover:text-slate-900 inline-flex items-center gap-1"
              >
                <span>{cms('student_dash_btn_browse_drops', 'Access Syllabus Lecture Drops')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-sage-100 mt-2">
              {recentMaterials.map((mat: any) => (
                <div key={mat.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center text-slate-muted shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-slate-muted" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-muted truncate">{mat.title}</h4>
                      <p className="text-[11px] text-slate-light truncate">
                        {mat.subject?.name} • {mat.fileType} ({mat.fileSize})
                      </p>
                    </div>
                  </div>

                  <a
                    href={mat.fileUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-slate-soft hover:text-slate-900 px-2 py-1 rounded bg-ivory-100 hover:bg-sage-100 transition-colors shrink-0"
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
