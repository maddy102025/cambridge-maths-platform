'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  FolderPlus,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Filter
} from 'lucide-react';

interface CoursesManagementViewProps {
  subjects: any[];
}

export default function CoursesManagementView({ subjects }: CoursesManagementViewProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a resource file.');
      return;
    }

    setUploading(true);
    setMessage('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('action', 'UPLOAD_RESOURCE');
      formData.append('subjectId', selectedSubjectId);
      formData.append('title', title);
      formData.append('topic', topic);
      formData.append('description', description);
      formData.append('file', file);

      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload resource.');

      setMessage(data.message);
      setTitle('');
      setTopic('');
      setDescription('');
      setFile(null);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error uploading file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-muted tracking-tight">
          Courses & Study Drops Repository
        </h1>
        <p className="text-sm text-slate-soft mt-1">
          Upload new revision notes, formula sheets, and past paper packs into student Study Drops.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Upload New Resource Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-sage-200 p-6 sm:p-7 subtle-paper-shadow space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-sage-200">
            <FolderPlus className="w-5 h-5 text-slate-muted" />
            <h3 className="font-bold text-slate-muted text-base">Publish New Study Drop</h3>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Target Subject *
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs font-medium focus:ring-2 focus:ring-sage-400"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                placeholder="CAIE Syllabus Lecture Notes & Worked Solutions"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs focus:ring-2 focus:ring-sage-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Curriculum Topic *
              </label>
              <input
                type="text"
                required
                placeholder="Syllabus chapter (e.g. Integration by Parts & Differential Equations)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs focus:ring-2 focus:ring-sage-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Description / Exam Notes
              </label>
              <textarea
                rows={3}
                placeholder="Explicit method formulas, mark scheme criteria, and examiner cautions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs resize-none focus:ring-2 focus:ring-sage-400"
              />
            </div>


            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Select File (PDF, DOCX, ZIP up to 15MB) *
              </label>
              <input
                type="file"
                required
                accept=".pdf,.docx,.doc,.zip,.jpg,.png"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-soft file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sage-200 file:text-slate-900 hover:file:bg-sage-300"
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-3 px-4 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 font-bold text-xs shadow-xs transition-colors disabled:opacity-60"
            >
              {uploading ? 'Publishing Study Drop...' : 'Publish to Students'}
            </button>
          </form>
        </div>

        {/* Right Column (7 cols): Existing Resources in Selected Subject */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-sage-200 p-6 sm:p-7 subtle-paper-shadow space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-sage-200">
            <div>
              <h3 className="font-bold text-slate-muted text-base">{currentSubject?.name} Study Drops</h3>
              <p className="text-xs text-slate-light">{currentSubject?.materials?.length || 0} Resources Active</p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-ivory-200 text-slate-soft rounded-lg">
              {currentSubject?.code}
            </span>
          </div>

          {currentSubject?.materials?.length === 0 ? (
            <p className="text-xs text-slate-light py-8 text-center">
              No study drops published for this subject yet.
            </p>
          ) : (
            <div className="space-y-3">
              {currentSubject.materials.map((mat: any) => (
                <div
                  key={mat.id}
                  className="p-4 rounded-2xl bg-ivory-50 border border-sage-200 flex items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-muted">{mat.title}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sage-200 text-slate-800">
                        {mat.fileType}
                      </span>
                    </div>
                    <p className="text-[11px] text-sage-800 font-medium mt-0.5">Topic: {mat.topic}</p>
                    <p className="text-[11px] text-slate-light mt-0.5">
                      {mat.fileSize} • Uploaded {new Date(mat.createdAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>

                  <a
                    href={mat.fileUrl}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 font-semibold text-xs transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
