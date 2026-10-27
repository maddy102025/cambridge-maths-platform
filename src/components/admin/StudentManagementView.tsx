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
  Check,
  UserPlus,
  X,
  Key,
  Copy,
  Sparkles,
  Loader2
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
  const [errorMessage, setErrorMessage] = useState('');

  // Add Student Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Cambridge2026!');
  const [phone, setPhone] = useState('');
  const [level, setLevel] = useState('Cambridge O Level');
  const [projectedGrade, setProjectedGrade] = useState('Predicted A*');
  const [targetExamDate, setTargetExamDate] = useState('May/June 2026');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; pass: string; name: string } | null>(null);

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

  const handleGeneratePassword = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setPassword(`Cambridge${randomSuffix}!`);
  };

  const toggleSubjectSelection = (subId: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_STUDENT',
          fullName,
          email,
          password,
          phone,
          level,
          projectedGrade,
          targetExamDate,
          subjectIds: selectedSubjectIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create student account.');
      }

      setCreatedCredentials({ email, pass: password, name: fullName });
      setMessage(data.message || 'Student account created successfully!');

      // Reset form
      setFullName('');
      setEmail('');
      setPassword('Cambridge2026!');
      setPhone('');
      setSelectedSubjectIds([]);

      // Refresh list
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating student account.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-muted tracking-tight">
            Student Management
          </h1>
          <p className="text-sm text-slate-soft mt-1">
            Review candidate enrollments, monitor attendance stats, configure projected Cambridge grades, and onboard new students.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            setCreatedCredentials(null);
            setErrorMessage('');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-muted hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm shrink-0"
        >
          <UserPlus className="w-4 h-4 text-sage-300" />
          <span>Add New Student</span>
        </button>
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
            placeholder="Search candidates by name, email, or syllabus stream..."
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
              No students match the search criteria. Click &quot;Add New Student&quot; to register candidates.
            </div>
          ) : (
            filteredStudents.map((student) => {
              const attendedCount = student.attendance.filter((a: any) => a.status === 'PRESENT').length;
              const totalClasses = student.attendance.length;
              const attPct = totalClasses > 0 ? Math.round((attendedCount / totalClasses) * 100) : 'N/A';

              // Unenrolled subjects for this student
              const unenrolledSubjects = allSubjects.filter(
                (sub) => !student.enrollments.some((e: any) => e.subject.id === sub.id)
              );

              return (
                <div key={student.id} className="p-5 sm:p-6 space-y-4 hover:bg-ivory-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Student Info */}
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-sage-200 text-slate-900 font-bold font-mono text-base flex items-center justify-center shrink-0">
                        {student.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-muted flex items-center gap-2">
                          <span>{student.fullName}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sage-100 text-sage-800 border border-sage-200">
                            {student.role}
                          </span>
                        </h3>
                        <p className="text-xs text-slate-light mt-0.5">{student.email}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="px-3 py-1.5 rounded-xl bg-ivory-100 border border-sage-200 flex items-center gap-1.5">
                        <CalendarCheck className="w-3.5 h-3.5 text-sage-600" />
                        <span>
                          Attendance: <strong className="text-slate-muted">{attendedCount}/{totalClasses}</strong> ({attPct}%)
                        </span>
                      </div>

                      <div className="px-3 py-1.5 rounded-xl bg-ivory-100 border border-sage-200 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-sage-600" />
                        <span>Projected:</span>
                        <select
                          disabled={savingId === student.id}
                          defaultValue={student.projectedGrade || 'A*'}
                          onChange={(e) => handleUpdateProjectedGrade(student.id, e.target.value)}
                          className="bg-transparent font-bold text-slate-muted focus:outline-none cursor-pointer"
                        >
                          <option value="A*">A*</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Enrollments List */}
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-soft mr-1">Active Syllabuses:</span>
                    {student.enrollments.map((enr: any) => (
                      <span
                        key={enr.id}
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-sage-100 text-slate-muted font-medium border border-sage-300/80"
                      >
                        <BookOpen className="w-3 h-3 text-sage-700" />
                        <span>{enr.subject.name} ({enr.subject.code})</span>
                        <button
                          onClick={() => handleUnenroll(student.id, enr.subject.id)}
                          className="ml-1 text-slate-400 hover:text-red-700"
                          title="Unenroll from course"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}

                    {/* Enroll in new subject dropdown */}
                    {unenrolledSubjects.length > 0 && (
                      <select
                        disabled={savingId === student.id}
                        defaultValue=""
                        onChange={(e) => handleEnroll(student.id, e.target.value)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-dashed border-sage-300 bg-white text-slate-soft hover:border-sage-400 focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>+ Enroll in additional subject...</option>
                        {unenrolledSubjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} ({sub.code})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 subtle-paper-shadow border border-sage-200 my-8">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-ivory-200 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-muted">Add &amp; Enroll New Student</h2>
                <p className="text-xs text-slate-soft">Create candidate account and assign Cambridge syllabuses.</p>
              </div>
            </div>

            {createdCredentials ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Account Created Successfully!</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Share these student credentials with <strong>{createdCredentials.name}</strong> to access the Cambridge portal:
                  </p>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs font-mono space-y-1 mt-2">
                    <p><strong>Email:</strong> {createdCredentials.email}</p>
                    <p><strong>Temporary Password:</strong> {createdCredentials.pass}</p>
                    <p><strong>Login Portal:</strong> {window.location.origin}/login</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-muted text-white text-xs font-bold hover:bg-slate-800 transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateStudent} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-muted mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Zayan Chowdhury"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-sage-300 bg-ivory-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-muted mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. zayan@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-sage-300 bg-ivory-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-muted">
                        Initial Password *
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[10px] text-sage-700 hover:text-sage-900 font-semibold flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Auto Generate
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-sage-300 bg-ivory-50 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-muted mb-1">
                      Contact Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +44 7911 123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-sage-300 bg-ivory-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-muted mb-1">
                      Academic Level
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-sage-300 bg-ivory-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
                    >
                      <option value="Cambridge O Level">Cambridge O Level</option>
                      <option value="Cambridge A Level">Cambridge A Level</option>
                      <option value="Both O & A Level">Both O &amp; A Level</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-muted mb-1">
                      Target Exam Series
                    </label>
                    <input
                      type="text"
                      value={targetExamDate}
                      onChange={(e) => setTargetExamDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-sage-300 bg-ivory-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-muted mb-1">
                      Projected Grade
                    </label>
                    <select
                      value={projectedGrade}
                      onChange={(e) => setProjectedGrade(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-sage-300 bg-ivory-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
                    >
                      <option value="Predicted A*">Predicted A*</option>
                      <option value="Predicted A">Predicted A</option>
                      <option value="Predicted B">Predicted B</option>
                      <option value="Targeting A*">Targeting A*</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-muted mb-1.5">
                    Select Syllabuses to Immediately Enroll:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 rounded-xl bg-ivory-50 border border-sage-200">
                    {allSubjects.map((sub) => {
                      const isSelected = selectedSubjectIds.includes(sub.id);
                      return (
                        <label
                          key={sub.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                            isSelected
                              ? 'bg-sage-100 border-sage-400 text-slate-900 font-semibold'
                              : 'bg-white border-sage-200 text-slate-soft hover:bg-ivory-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSubjectSelection(sub.id)}
                            className="rounded text-sage-700 focus:ring-sage-400"
                          />
                          <span className="truncate">{sub.name} ({sub.code})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-sage-200">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-soft hover:text-slate-900 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-muted hover:bg-slate-800 text-white text-xs font-bold transition disabled:opacity-50 shadow-sm"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 text-sage-300" />}
                    <span>{isCreating ? 'Creating Account...' : 'Create & Enroll Student'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
