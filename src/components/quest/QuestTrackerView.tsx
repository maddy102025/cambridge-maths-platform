'use client';

import GoogleDriveUpload, { GoogleDriveUploadResult } from '@/components/common/GoogleDriveUpload';
import { parseGoogleDriveUrl } from '@/lib/googleDrive';

import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Calendar,
  Download,
  History,
  MessageSquare,
  Award,
  ChevronRight,
  Filter,
  ExternalLink
} from 'lucide-react';

interface QuestTrackerViewProps {
  assignments: any[];
  initialSelectedId?: string;
  userId: string;
}

export default function QuestTrackerView({
  assignments,
  initialSelectedId,
  userId,
}: QuestTrackerViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'upcoming' | 'overdue' | 'submitted' | 'graded'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>(
    initialSelectedId || assignments[0]?.id || ''
  );

  // Submission Form State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [driveResult, setDriveResult] = useState<GoogleDriveUploadResult | null>(null);
  const [studentNote, setStudentNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // Selected Assignment details
  const selectedAssignment = assignments.find((a) => a.id === selectedAssignmentId) || assignments[0];
  const submission = selectedAssignment?.submissions?.[0] || null;

  // Filter logic
  const filteredAssignments = assignments.filter((asg) => {
    const sub = asg.submissions?.[0];
    const isSubmitted = sub && sub.status !== 'NOT_STARTED';
    const isGraded = sub && sub.status === 'GRADED';
    const isOverdue = new Date() > new Date(asg.dueDate) && !isSubmitted;
    const isUpcoming = new Date() <= new Date(asg.dueDate) && !isSubmitted;

    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'upcoming' && isUpcoming) ||
      (selectedFilter === 'overdue' && isOverdue) ||
      (selectedFilter === 'submitted' && isSubmitted) ||
      (selectedFilter === 'graded' && isGraded);

    const matchesSearch =
      asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.subject.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (asg: any) => {
    const sub = asg.submissions?.[0];
    const isOverdue = new Date() > new Date(asg.dueDate) && (!sub || sub.status === 'NOT_STARTED');

    if (sub?.status === 'GRADED') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sage-200 text-slate-900 border border-sage-300">
          Graded ({sub.gradeScore}/{sub.gradeMax})
        </span>
      );
    }
    if (sub?.status === 'SUBMITTED') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          Submitted (v{sub.currentVersion})
        </span>
      );
    }
    if (sub?.status === 'LATE') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          Late Submission
        </span>
      );
    }
    if (sub?.status === 'RETURNED_FOR_REVISION') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
          Revision Requested
        </span>
      );
    }
    if (isOverdue) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
          Overdue
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ivory-200 text-slate-soft border border-sage-200">
        Not Started
      </span>
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setSubmitError('File exceeds 15 MB limit.');
        setUploadFile(null);
        return;
      }
      setUploadFile(file);
      setSubmitError('');
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveResult) {
      setSubmitError('Please provide a Google Drive link or select a file to upload.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const formData = new FormData();
      formData.append('assignmentId', selectedAssignment.id);
      if (driveResult.isGoogleDrive) {
        formData.append('driveUrl', driveResult.fileUrl);
      } else if (driveResult.rawFile) {
        formData.append('file', driveResult.rawFile);
      }
      formData.append('studentNote', studentNote);

      const res = await fetch('/api/student/quest/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed.');
      }

      setSubmitSuccess('Solution successfully submitted!');
      setUploadFile(null);
      setStudentNote('');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while uploading submission.');
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-muted tracking-tight">
          Quest — Assignment Tracker
        </h1>
        <p className="text-sm text-slate-soft mt-1">
          Track problem sets, submit examination solutions, and review detailed instructor evaluations.
        </p>
      </div>

      {/* Filters & Search Row */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-sage-200 subtle-paper-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedFilter === 'all'
                ? 'bg-slate-muted text-white shadow-xs'
                : 'bg-ivory-100 text-slate-soft hover:bg-sage-100'
            }`}
          >
            All ({assignments.length})
          </button>

          <button
            onClick={() => setSelectedFilter('upcoming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedFilter === 'upcoming'
                ? 'bg-slate-muted text-white shadow-xs'
                : 'bg-ivory-100 text-slate-soft hover:bg-sage-100'
            }`}
          >
            Upcoming
          </button>

          <button
            onClick={() => setSelectedFilter('submitted')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedFilter === 'submitted'
                ? 'bg-slate-muted text-white shadow-xs'
                : 'bg-ivory-100 text-slate-soft hover:bg-sage-100'
            }`}
          >
            Submitted
          </button>

          <button
            onClick={() => setSelectedFilter('graded')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedFilter === 'graded'
                ? 'bg-slate-muted text-white shadow-xs'
                : 'bg-ivory-100 text-slate-soft hover:bg-sage-100'
            }`}
          >
            Graded
          </button>

          <button
            onClick={() => setSelectedFilter('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedFilter === 'overdue'
                ? 'bg-slate-muted text-white shadow-xs'
                : 'bg-ivory-100 text-slate-soft hover:bg-sage-100'
            }`}
          >
            Overdue
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-light absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search assigned Cambridge problem sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-sage-200 bg-ivory-50 text-xs text-slate-muted focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white"
          />
        </div>
      </div>

      {/* Main Split Layout: Assignment List on Left, Active Quest Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Assignments List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredAssignments.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-sage-200 text-center">
              <CheckSquare className="w-8 h-8 text-slate-light mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-muted">No Quests Match Criteria</p>
              <p className="text-xs text-slate-light mt-0.5">Adjust your filters or search terms.</p>
            </div>
          ) : (
            filteredAssignments.map((asg) => {
              const isSelected = asg.id === selectedAssignment?.id;
              const dueDate = new Date(asg.dueDate);

              return (
                <div
                  key={asg.id}
                  onClick={() => {
                    setSelectedAssignmentId(asg.id);
                    setSubmitError('');
                    setSubmitSuccess('');
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-white border-slate-muted ring-2 ring-sage-300 shadow-md'
                      : 'bg-white border-sage-200 hover:border-sage-400 hover:bg-ivory-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-soft">
                      {asg.subject.name}
                    </span>
                    {getStatusBadge(asg)}
                  </div>

                  <h3 className="text-sm font-bold text-slate-muted">{asg.title}</h3>

                  <div className="mt-3 pt-3 border-t border-sage-100 flex items-center justify-between text-xs text-slate-light">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </span>
                    <span className="font-semibold text-slate-soft">{asg.maxMarks} Marks</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column (7 cols): Selected Assignment Detail & Submission Workspace */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-sage-200 p-6 sm:p-8 subtle-paper-shadow space-y-6">
          {!selectedAssignment ? (
            <div className="py-16 text-center text-slate-light">
              <FileText className="w-12 h-12 mx-auto mb-2" />
              <p className="text-sm">Select an assignment from the list to view instructions and submit solutions.</p>
            </div>
          ) : (
            <>
              {/* Header Info */}
              <div className="space-y-3 pb-6 border-b border-sage-200">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-ivory-200 text-slate-soft border border-sage-200">
                    {selectedAssignment.subject.name} • {selectedAssignment.subject.syllabusInfo}
                  </span>
                  {getStatusBadge(selectedAssignment)}
                </div>

                <h2 className="text-2xl font-extrabold text-slate-muted tracking-tight">
                  {selectedAssignment.title}
                </h2>

                <div className="flex flex-wrap gap-4 text-xs text-slate-soft font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-light" />
                    <span>Assigned: {new Date(selectedAssignment.assignedDate).toLocaleDateString('en-GB')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-light" />
                    <span>
                      Deadline: {new Date(selectedAssignment.dueDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-muted">
                    <Award className="w-4 h-4 text-sage-700" />
                    <span>Maximum Marks: {selectedAssignment.maxMarks}</span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-muted">Instructions</h4>
                <p className="text-sm text-slate-soft leading-relaxed whitespace-pre-line bg-ivory-50 p-4 rounded-2xl border border-sage-200/80">
                  {selectedAssignment.instructions}
                </p>
              </div>

              {/* Attached Reference Files */}
              {selectedAssignment.referenceFileName && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-muted">Attached Prompt Materials</h4>
                  <div className="p-3.5 rounded-xl border border-sage-200 bg-white flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-slate-muted" />
                      <span className="font-semibold text-slate-muted">{selectedAssignment.referenceFileName}</span>
                    </div>
                    <a
                      href={selectedAssignment.referenceFileUrl || '#'}
                      download
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sage-200 hover:bg-sage-300 text-slate-900 font-semibold text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Prompt</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Graded Feedback Section (if published) */}
              {submission && submission.isPublished && submission.gradeScore !== null && (
                <div className="p-5 rounded-2xl bg-sage-100/70 border border-sage-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-sage-800" />
                      <h4 className="text-sm font-bold text-slate-900">Official Evaluation & Feedback</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-slate-900 font-mono">
                        {submission.gradeScore} / {submission.gradeMax}
                      </span>
                      <span className="ml-2 px-2 py-0.5 rounded bg-sage-300 font-bold text-xs text-slate-900">
                        {submission.gradeLetter || 'A*'}
                      </span>
                    </div>
                  </div>

                  {submission.feedback && (
                    <div className="p-3 bg-white rounded-xl border border-sage-200 text-xs text-slate-soft leading-relaxed">
                      "{submission.feedback}"
                    </div>
                  )}
                  <p className="text-[10px] text-slate-light">
                    Evaluated on {new Date(submission.gradedAt).toLocaleDateString('en-GB')} by Ms. Eleanor Vance.
                  </p>
                </div>
              )}

              {/* Version History */}
              {submission && submission.versions && submission.versions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-muted flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      <span>Submission Versions ({submission.versions.length})</span>
                    </h4>
                    <span className="text-[11px] text-slate-light">Retained for exam auditability</span>
                  </div>

                  <div className="space-y-2">
                    {submission.versions.map((ver: any) => (
                      <div
                        key={ver.id}
                        className="p-3 rounded-xl border border-sage-200 bg-ivory-50 text-xs flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-muted">Version {ver.versionNumber}</span>
                            <span className="text-[10px] text-slate-light">
                              {new Date(ver.submittedAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-soft truncate mt-0.5">
                            {ver.fileName} ({ver.fileSize})
                          </p>
                          {ver.studentNote && (
                            <p className="text-[11px] italic text-slate-light mt-0.5">"{ver.studentNote}"</p>
                          )}
                        </div>

                        {(() => {
                          const d = parseGoogleDriveUrl(ver.fileUrl);
                          if (d.isGoogleDrive) {
                            return (
                              <a
                                href={d.viewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 shrink-0"
                              >
                                <span>Open in Drive</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            );
                          }
                          return (
                            <a
                              href={ver.fileUrl}
                              download
                              className="text-xs font-bold text-slate-muted hover:underline shrink-0"
                            >
                              Download
                            </a>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submission Upload Area */}
              {(!submission || selectedAssignment.allowResubmissions || submission.status === 'RETURNED_FOR_REVISION') ? (
                <div className="pt-4 border-t border-sage-200 space-y-4">
                  <h4 className="text-sm font-bold text-slate-muted">
                    {submission ? 'Submit Revision / Replacement' : 'Submit Solution'}
                  </h4>

                  {submitSuccess && (
                    <div className="p-3 rounded-xl bg-sage-100 border border-sage-300 text-slate-800 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0" />
                      <span>{submitSuccess}</span>
                    </div>
                  )}

                  {submitError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmitWork} className="space-y-4">
                    <GoogleDriveUpload
                      onSelected={setDriveResult}
                      label="Solution Document Attachment *"
                      hint="Paste a Google Drive/Docs shareable link or upload your scanned solution PDF/Images."
                    />

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1">
                        Optional Note to Instructor
                      </label>
                      <input
                        type="text"
                        placeholder="Specify formula substitutions or problem parts requiring feedback..."

                        value={studentNote}
                        onChange={(e) => setStudentNote(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-sage-200 bg-ivory-50 text-xs text-slate-muted focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !driveResult}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 font-semibold text-xs disabled:opacity-60 transition-all shadow-xs"
                    >
                      {submitting ? (
                        <span>Validating and Recording Submission...</span>
                      ) : (
                        <span>Confirm and Upload Solution</span>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-ivory-100 border border-sage-200 text-xs text-slate-soft text-center">
                  This assignment has been submitted and is locked for further revisions.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
