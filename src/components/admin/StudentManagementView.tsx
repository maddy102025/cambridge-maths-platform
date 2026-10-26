'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  BookOpen,
  Award,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Save,
  Check
} from 'lucide-react';

interface StudentManagementViewProps {
  students: any[];
  allSubjects: any[];
}

export default function StudentManagementView({
  students: initialStudents,
  allSubjects,
}: StudentManagementViewProps) {
  const [students, setStudents] = useState(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      subjectFilter === 'ALL' ||
      s.enrollments.some((e: any) => e.subject.id === subjectFilter);

    return matchesSearch && matchesSubject;
  });

  const handleEnroll = async (studentId: string, subjectId: string) => {
    if (!subjectId) return;
    setSavingId(studentId);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ENROLL', studentId, subjectId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Enrollment updated successfully!');
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  const handleUnenroll = async (studentId: string, subjectId: string) => {
    if (!confirm('Are you sure you want to unenroll this student from this subject?')) return;
    setSavingId(studentId);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UNENROLL', studentId, subjectId }),
      });
      if (res.ok) {
        setMessage('Student unenrolled successfully!');
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdateProjectedGrade = async (studentId: string, grade: string) => {
    setSavingId(studentId);
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_GRADE', studentId, projectedGrade: grade }),
      });
      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? { ...s, projectedGrade: grade } : s))
        );
        setMessage('Projected grade updated!');
        setTimeout(() => setMessage(''), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-muted tracking-tight">
          Student Management
        </h1>
        <p className="text-sm text-slate-soft mt-1">
          Review candidate enrollments, monitor attendance stats, and configure projected Cambridge grades.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-sage-100 border border-sage-300 text-slate-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sage-700" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-sage-200 subtle-paper-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-light absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search student by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-sage-200 bg-ivory-50 text-xs text-slate-muted focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-light">Filter by Subject:</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50 text-xs text-slate-muted font-medium focus:outline-none focus:ring-2 focus:ring-sage-400"
          >
            <option value="ALL">All Syllabuses ({students.length})</option>
            {allSubjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table / Grid */}
      <div className="bg-white rounded-3xl border border-sage-200 subtle-paper-shadow overflow-hidden">
        <div className="divide-y divide-sage-200">
          {filteredStudents.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-light">
              No students match the search criteria.
            </div>
          ) : (
            filteredStudents.map((student) => {
              const attendedCount = student.attendance.filter((a: any) => a.status === 'PRESENT').length;
              const totalClasses = student.attendance.length;
              const attPct = totalClasses > 0 ? Math.round((attendedCount / totalClasses) * 100) : 'N/A';

              // Unenrolled subjects for this student
              const unenrolledSubjects = allSubjects.filter(
                (sub) => !student.enrollments.some((e: any) => e.subjectId === sub.id)
              );

              return (
                <div key={student.id} className="p-6 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Student Basic Info */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-sage-200 font-bold font-mono text-slate-muted flex items-center justify-center shrink-0">
                        {student.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-muted">{student.fullName}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sage-100 text-slate-800">
                            Candidate
                          </span>
                        </div>
                        <p className="text-xs text-slate-light mt-0.5">
                          {student.email} • Phone: {student.phone || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Stats: Attendance & Projected Grade selector */}
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      {/* Attendance */}
                      <div className="p-2.5 rounded-xl bg-ivory-100 border border-sage-200 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-light block">Attendance</span>
                        <span className="font-bold text-slate-muted">
                          {totalClasses > 0 ? `${attendedCount}/${totalClasses} (${attPct}%)` : 'No logs'}
                        </span>
                      </div>

                      {/* Projected Grade */}
                      <div className="p-2 rounded-xl bg-ivory-100 border border-sage-200">
                        <span className="text-[10px] uppercase font-bold text-slate-light block mb-1">
                          Projected Grade
                        </span>
                        <select
                          value={student.projectedGrade || 'A*'}
                          onChange={(e) => handleUpdateProjectedGrade(student.id, e.target.value)}
                          disabled={savingId === student.id}
                          className="px-2 py-1 rounded-lg bg-white border border-sage-300 font-mono font-bold text-slate-muted text-xs focus:ring-1 focus:ring-sage-400"
                        >
                          <option value="A*">A*</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Enrollments List & Quick Add */}
                  <div className="pt-3 border-t border-sage-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-muted block mb-2">
                      Enrolled Syllabuses ({student.enrollments.length}):
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {student.enrollments.map((enr: any) => (
                        <div
                          key={enr.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ivory-100 border border-sage-200 text-xs"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-slate-muted" />
                          <span className="font-semibold text-slate-muted">{enr.subject.name}</span>
                          <span className="text-[10px] font-mono text-slate-light">({enr.subject.code})</span>
                          <button
                            onClick={() => handleUnenroll(student.id, enr.subject.id)}
                            className="p-1 hover:text-red-700 text-slate-light transition-colors"
                            title="Unenroll student"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* Quick Enroll Dropdown */}
                      {unenrolledSubjects.length > 0 && (
                        <div className="inline-flex items-center gap-1.5">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleEnroll(student.id, e.target.value);
                                e.target.value = '';
                              }
                            }}
                            defaultValue=""
                            className="text-xs px-2.5 py-1.5 rounded-xl border border-dashed border-sage-400 bg-white text-slate-muted focus:ring-1 focus:ring-sage-400"
                          >
                            <option value="" disabled>
                              + Enroll in Course...
                            </option>
                            {unenrolledSubjects.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name} ({sub.code})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
