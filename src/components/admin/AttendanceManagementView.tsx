'use client';

import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Save,
  Users,
  Clock
} from 'lucide-react';

interface AttendanceManagementViewProps {
  subjects: any[];
  allAttendance: any[];
}

export default function AttendanceManagementView({
  subjects,
  allAttendance,
}: AttendanceManagementViewProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const enrolledStudents = currentSubject?.enrollments?.map((e: any) => e.student) || [];

  const handleStatusChange = (studentId: string, status: string) => {
    setStatusMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const records = enrolledStudents.map((st: any) => ({
        studentId: st.id,
        status: statusMap[st.id] || 'PRESENT',
        remarks: 'Live lecture session log',
      }));

      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: selectedSubjectId,
          classDate,
          records,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save attendance.');

      setMessage(data.message);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error saving attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-muted tracking-tight">
          Attendance & Lecture Records
        </h1>
        <p className="text-sm text-slate-soft mt-1">
          Record attendance for live sessions. Metrics update each student's official attendance percentage in real-time.
        </p>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-sage-100 border border-sage-300 text-slate-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sage-700" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Selector Bar */}
      <div className="bg-white p-5 rounded-3xl border border-sage-200 subtle-paper-shadow grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
            Select Subject Cohort
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs font-medium focus:ring-2 focus:ring-sage-400"
          >
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name} ({sub.code}) — {sub.enrollments?.length || 0} enrolled
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
            Class Session Date
          </label>
          <input
            type="date"
            value={classDate}
            onChange={(e) => setClassDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs focus:ring-2 focus:ring-sage-400"
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-3xl border border-sage-200 subtle-paper-shadow p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-sage-200">
          <div>
            <h3 className="font-bold text-slate-muted text-base">{currentSubject?.name} Roster</h3>
            <p className="text-xs text-slate-light">{enrolledStudents.length} Students Enrolled</p>
          </div>
          <button
            onClick={handleSaveAttendance}
            disabled={saving || enrolledStudents.length === 0}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 font-bold text-xs shadow-xs transition-colors disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Recording...' : 'Submit Session Log'}</span>
          </button>
        </div>

        {enrolledStudents.length === 0 ? (
          <p className="text-xs text-slate-light py-8 text-center">
            No students are currently enrolled in this subject. Enroll students from the Student Management page.
          </p>
        ) : (
          <div className="divide-y divide-sage-100">
            {enrolledStudents.map((st: any) => {
              const currentStatus = statusMap[st.id] || 'PRESENT';

              return (
                <div key={st.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sage-200 text-slate-muted font-bold font-mono text-xs flex items-center justify-center shrink-0">
                      {st.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-muted">{st.fullName}</h4>
                      <p className="text-[11px] text-slate-light">{st.email}</p>
                    </div>
                  </div>

                  {/* Status Radio Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {[
                      { label: 'Present', val: 'PRESENT', color: 'bg-sage-200 text-slate-900' },
                      { label: 'Absent', val: 'ABSENT', color: 'bg-red-100 text-red-800' },
                      { label: 'Excused', val: 'EXCUSED', color: 'bg-ivory-200 text-slate-soft' },
                      { label: 'Late', val: 'LATE', color: 'bg-amber-100 text-amber-800' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => handleStatusChange(st.id, opt.val)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          currentStatus === opt.val
                            ? `${opt.color} font-bold shadow-xs ring-1 ring-sage-400`
                            : 'bg-ivory-50 text-slate-light hover:bg-ivory-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
