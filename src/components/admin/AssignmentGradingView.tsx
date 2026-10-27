'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Download,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  RotateCcw,
  FileText,
  User,
  Calendar,
  Sparkles
} from 'lucide-react';

interface AssignmentGradingViewProps {
  assignments: any[];
  allSubjects: any[];
  allSubmissions: any[];
  initialSubmissionId?: string;
}

export default function AssignmentGradingView({
  assignments,
  allSubjects,
  allSubmissions: initialSubmissions,
  initialSubmissionId,
}: AssignmentGradingViewProps) {
  const [activeTab, setActiveTab] = useState<'grade' | 'create'>('grade');
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [selectedSubId, setSelectedSubId] = useState<string>(
    initialSubmissionId || submissions[0]?.id || ''
  );

  // Selected Submission grading form state
  const selectedSub = submissions.find((s) => s.id === selectedSubId) || submissions[0];
  const [score, setScore] = useState<string>(
    selectedSub?.gradeScore !== null && selectedSub?.gradeScore !== undefined
      ? String(selectedSub.gradeScore)
      : ''
  );
  const [gradeLetter, setGradeLetter] = useState<string>(selectedSub?.gradeLetter || 'A*');
  const [feedback, setFeedback] = useState<string>(selectedSub?.feedback || '');
  const [gradingStatus, setGradingStatus] = useState<string>('');
  const [savingGrade, setSavingGrade] = useState(false);

  // Create Assignment Form State
  const [newSubjectId, setNewSubjectId] = useState(allSubjects[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newMaxMarks, setNewMaxMarks] = useState('50');
  const [newDueDate, setNewDueDate] = useState('');
  const [allowLate, setAllowLate] = useState(true);
  const [allowResubmit, setAllowResubmit] = useState(true);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [creatingAsg, setCreatingAsg] = useState(false);
  const [createMsg, setCreateMsg] = useState('');
  const [createError, setCreateError] = useState('');

  // Handle switching selected submission
  const handleSelectSubmission = (sub: any) => {
    setSelectedSubId(sub.id);
    setScore(sub.gradeScore !== null && sub.gradeScore !== undefined ? String(sub.gradeScore) : '');
    setGradeLetter(sub.gradeLetter || 'A*');
    setFeedback(sub.feedback || '');
    setGradingStatus('');
  };

  const handleGradeSubmit = async (action: 'PUBLISH' | 'DRAFT' | 'RETURN_FOR_REVISION') => {
    if (!selectedSub) return;
    setSavingGrade(true);
    setGradingStatus('');

    try {
      const res = await fetch('/api/admin/grading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          gradeScore: score ? parseFloat(score) : null,
          gradeLetter,
          feedback,
          action,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit grade.');

      setGradingStatus(data.message);
      setSubmissions((prev) =>
        prev.map((s) => (s.id === selectedSub.id ? { ...s, ...data.submission } : s))
      );
    } catch (err: any) {
      setGradingStatus(`Error: ${err.message}`);
    } finally {
      setSavingGrade(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAsg(true);
    setCreateMsg('');
    setCreateError('');

    try {
      const formData = new FormData();
      formData.append('subjectId', newSubjectId);
      formData.append('title', newTitle);
      formData.append('instructions', newInstructions);
      formData.append('maxMarks', newMaxMarks);
      formData.append('dueDate', newDueDate);
      formData.append('allowLateSubmissions', String(allowLate));
      formData.append('allowResubmissions', String(allowResubmit));
      if (referenceFile) {
        formData.append('referenceFile', referenceFile);
      }

      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create assignment.');

      setCreateMsg('Assignment successfully published to syllabus and students notified!');
      setNewTitle('');
      setNewInstructions('');
      setReferenceFile(null);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setCreateError(err.message || 'Error creating assignment.');
    } finally {
      setCreatingAsg(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-muted tracking-tight">
            Assignments & Grading Workspace
          </h1>
          <p className="text-sm text-slate-soft mt-1">
            Review student solutions, award marks and detailed feedback, or publish new Cambridge problem sets.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-sage-200 subtle-paper-shadow self-start">
          <button
            onClick={() => setActiveTab('grade')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'grade'
                ? 'bg-slate-muted text-white shadow-xs'
                : 'text-slate-muted hover:bg-ivory-100'
            }`}
          >
            Review & Grade ({submissions.length})
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-slate-muted text-white shadow-xs'
                : 'text-slate-muted hover:bg-ivory-100'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Quest</span>
          </button>
        </div>
      </div>

      {/* TAB 1: GRADING WORKSPACE */}
      {activeTab === 'grade' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (5 cols): Submissions List */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-sage-200 p-5 subtle-paper-shadow space-y-3">
            <h3 className="font-bold text-slate-muted text-sm pb-2 border-b border-sage-200">
              Candidate Submissions ({submissions.length})
            </h3>

            {submissions.length === 0 ? (
              <p className="text-xs text-slate-light py-8 text-center">
                No submissions received yet.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {submissions.map((sub) => {
                  const isSelected = sub.id === selectedSub?.id;
                  const latestVer = sub.versions[0];
                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleSelectSubmission(sub)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-white border-slate-muted ring-2 ring-sage-300 shadow-md'
                          : 'bg-ivory-50/70 border-sage-200 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-muted">{sub.student.fullName}</span>
                        {sub.isPublished ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sage-200 text-slate-900">
                            Published ({sub.gradeScore}/{sub.gradeMax})
                          </span>
                        ) : sub.status === 'LATE' ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Late Submission
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                            Needs Grading
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-semibold text-slate-muted truncate">{sub.assignment.title}</h4>
                      <p className="text-[11px] text-slate-light mt-0.5">
                        {sub.assignment.subject.name} • Version {sub.currentVersion}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column (7 cols): Evaluation Interface */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-sage-200 p-6 sm:p-8 subtle-paper-shadow space-y-6">
            {!selectedSub ? (
              <div className="py-16 text-center text-slate-light">
                <FileText className="w-12 h-12 mx-auto mb-2" />
                <p className="text-xs">Select a submission from the left to enter marks and feedback.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-4 border-b border-sage-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-soft">
                      {selectedSub.assignment.subject.name}
                    </span>
                    <h2 className="text-xl font-bold text-slate-muted">{selectedSub.assignment.title}</h2>
                    <p className="text-xs text-slate-light mt-0.5">
                      Candidate: <strong className="text-slate-muted">{selectedSub.student.fullName}</strong> ({selectedSub.student.email})
                    </p>
                  </div>

                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-ivory-200 text-slate-muted">
                    Max: {selectedSub.assignment.maxMarks} Marks
                  </span>
                </div>

                {/* Submitted Files */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-muted">
                    Submitted Solution Files (Version {selectedSub.currentVersion})
                  </h4>

                  <div className="space-y-2">
                    {selectedSub.versions.map((ver: any) => (
                      <div
                        key={ver.id}
                        className="p-3.5 rounded-2xl bg-ivory-50 border border-sage-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-muted">{ver.fileName}</span>
                            <span className="text-[10px] text-slate-light">({ver.fileSize})</span>
                          </div>
                          <p className="text-[11px] text-slate-light mt-0.5">
                            Uploaded {new Date(ver.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {ver.studentNote && (
                            <p className="text-[11px] italic text-slate-soft mt-1">
                              Student note: "{ver.studentNote}"
                            </p>
                          )}
                        </div>

                        <a
                          href={ver.fileUrl}
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 font-semibold text-xs transition-colors shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Inspect File</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grading Form */}
                <div className="pt-4 border-t border-sage-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-muted">
                    Official Assessment
                  </h4>

                  {gradingStatus && (
                    <div className="p-3 rounded-xl bg-sage-100 border border-sage-300 text-slate-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0" />
                      <span>{gradingStatus}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-muted mb-1">
                        Awarded Score (out of {selectedSub.assignment.maxMarks}) *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        max={selectedSub.assignment.maxMarks}
                        placeholder="Score (e.g. 85)"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted font-mono font-bold text-sm focus:ring-2 focus:ring-sage-400 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-muted mb-1">
                        Grade Classification
                      </label>
                      <select
                        value={gradeLetter}
                        onChange={(e) => setGradeLetter(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted font-bold text-sm focus:ring-2 focus:ring-sage-400 focus:bg-white"
                      >
                        <option value="A*">A* (Exceptional / 90%+)</option>
                        <option value="A">A (Excellent / 80-89%)</option>
                        <option value="B">B (Good / 70-79%)</option>
                        <option value="C">C (Satisfactory / 60-69%)</option>
                        <option value="D">D (Needs Revision / 50-59%)</option>
                        <option value="U">Ungraded / Below Standard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-muted mb-1">
                      Written Feedback & Specific Mathematical Deductions
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Detail Method (M) and Accuracy (A) marks, notation slips, and step-by-step model corrections..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs leading-relaxed focus:ring-2 focus:ring-sage-400 focus:bg-white resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={savingGrade}
                      onClick={() => handleGradeSubmit('RETURN_FOR_REVISION')}
                      className="px-4 py-2 rounded-xl border border-amber-300 text-amber-800 hover:bg-amber-50 text-xs font-semibold transition-colors"
                    >
                      Return For Revision
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={savingGrade}
                        onClick={() => handleGradeSubmit('DRAFT')}
                        className="px-4 py-2 rounded-xl bg-ivory-100 hover:bg-ivory-200 text-slate-muted text-xs font-semibold border border-sage-200 transition-colors"
                      >
                        Save Draft
                      </button>

                      <button
                        type="button"
                        disabled={savingGrade || !score}
                        onClick={() => handleGradeSubmit('PUBLISH')}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 text-xs font-bold shadow-xs transition-colors disabled:opacity-60"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Publish Results to Student</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CREATE NEW ASSIGNMENT */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-3xl border border-sage-200 p-6 sm:p-8 subtle-paper-shadow max-w-3xl space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-muted">Create New Quest Assignment</h3>
            <p className="text-xs text-slate-soft mt-1">
              Configure assignment instructions, examination deadlines, and attach question sheets.
            </p>
          </div>

          {createMsg && (
            <div className="p-3.5 rounded-xl bg-sage-100 border border-sage-300 text-slate-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-sage-700" />
              <span>{createMsg}</span>
            </div>
          )}

          {createError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-muted mb-1">
                  Target Subject / Syllabus *
                </label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs font-medium focus:ring-2 focus:ring-sage-400"
                >
                  {allSubjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-muted mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Cambridge Problem Set Title (e.g. Pure Mathematics Differential Equations & Vector Lines)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs focus:ring-2 focus:ring-sage-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-muted mb-1">
                  Maximum Marks *
                </label>
                <input
                  type="number"
                  required
                  value={newMaxMarks}
                  onChange={(e) => setNewMaxMarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-muted mb-1">
                  Submission Deadline *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Full Instructions & Examination Guidelines *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Mandatory working steps, standard CAIE notation rules, graph paper requirements, and calculator permissions..."
                value={newInstructions}
                onChange={(e) => setNewInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs leading-relaxed resize-none focus:ring-2 focus:ring-sage-400"
              />
            </div>

            {/* Prompt File Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-muted mb-1">
                Attach Reference / Question Sheet (Optional PDF/DOCX)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => setReferenceFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-soft file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sage-200 file:text-slate-900 hover:file:bg-sage-300"
              />
            </div>

            {/* Checkbox Options */}
            <div className="pt-2 flex flex-col sm:flex-row gap-4 text-xs text-slate-muted">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowLate}
                  onChange={(e) => setAllowLate(e.target.checked)}
                  className="rounded text-sage-600 focus:ring-sage-400"
                />
                <span>Allow late submissions (marked with late tag)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowResubmit}
                  onChange={(e) => setAllowResubmit(e.target.checked)}
                  className="rounded text-sage-600 focus:ring-sage-400"
                />
                <span>Allow solution revisions & version replacements</span>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={creatingAsg}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 font-semibold text-xs shadow-xs transition-colors disabled:opacity-60"
              >
                {creatingAsg ? (
                  <span>Publishing Quest...</span>
                ) : (
                  <span>Publish Assignment to Students</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
