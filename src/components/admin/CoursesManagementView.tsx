'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import GoogleDriveUpload, { GoogleDriveUploadResult } from '@/components/common/GoogleDriveUpload';
import { parseGoogleDriveUrl } from '@/lib/googleDrive';

interface CoursesManagementViewProps {
  subjects: any[];
}

export default function CoursesManagementView({ subjects }: CoursesManagementViewProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [driveResult, setDriveResult] = useState<GoogleDriveUploadResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId);

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !title || !topic || !driveResult) {
      setError('Please fill in all required fields and provide a file or Google Drive document.');
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

      if (driveResult.isGoogleDrive) {
        formData.append('driveUrl', driveResult.fileUrl);
      } else if (driveResult.rawFile) {
        formData.append('file', driveResult.rawFile);
      }

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
      setDriveResult(null);
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
          Courses &amp; Study Drops Repository
        </h1>
        <p className="text-sm text-slate-soft mt-1">
          Publish revision notes, formula sheets, past paper collections, and Google Drive worksheets into student Study Drops.
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
        {/* Left Column (5 cols): Upload Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-sage-200 p-6 sm:p-7 subtle-paper-shadow space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-sage-200">
            <div className="w-9 h-9 rounded-xl bg-sage-100 text-slate-muted flex items-center justify-center font-bold">
              <Upload className="w-4 h-4 text-sage-700" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-muted">Add New Study Drop</h2>
              <p className="text-[11px] text-slate-light">Supports Google Drive links &amp; Direct uploads</p>
            </div>
          </div>

          <form onSubmit={handleUploadResource} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Target Syllabus *
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs font-medium focus:ring-2 focus:ring-sage-400"
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
                Resource Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pure Mathematics 3: Vectors & Lines Master Note"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs focus:ring-2 focus:ring-sage-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Topic / Chapter Area *
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

            {/* Google Drive Dual-Mode Component */}
            <GoogleDriveUpload
              onSelected={setDriveResult}
              label="Resource Attachment *"
              hint="Paste a Google Drive/Docs link or upload a PDF/DOCX (Max 15MB)."
            />

            <button
              type="submit"
              disabled={uploading || !driveResult}
              className="w-full py-3 px-4 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
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
              {currentSubject.materials.map((mat: any) => {
                const driveInfo = parseGoogleDriveUrl(mat.fileUrl);
                return (
                  <div
                    key={mat.id}
                    className="p-4 rounded-2xl bg-ivory-50 border border-sage-200 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-muted truncate">{mat.title}</span>
                        {driveInfo.isGoogleDrive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                            Google Drive
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sage-200 text-slate-800 shrink-0">
                            {mat.fileType}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-sage-800 font-medium mt-0.5 truncate">Topic: {mat.topic}</p>
                      <p className="text-[11px] text-slate-light mt-0.5">
                        {mat.fileSize} • Uploaded {new Date(mat.createdAt).toLocaleDateString('en-GB')}
                      </p>
                    </div>

                    {driveInfo.isGoogleDrive ? (
                      <a
                        href={driveInfo.viewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 font-semibold text-xs transition-colors shrink-0"
                      >
                        <span>Open Drive</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <a
                        href={mat.fileUrl}
                        download
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 font-semibold text-xs transition-colors shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
