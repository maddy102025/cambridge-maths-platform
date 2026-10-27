'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Upload,
  Video,
  Download,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Play,
  X,
  FileUp,
  FolderOpen,
  Filter
} from 'lucide-react';

interface SubjectDetailViewProps {
  subject: any;
  userRole: string;
}

export default function SubjectDetailView({ subject, userRole }: SubjectDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'debrief' | 'study-drops' | 'upload'>('debrief');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadTopic, setUploadTopic] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Extract unique topics for filter
  const allTopics: string[] = [
    'All',
    ...(Array.from(new Set(subject.materials.map((m: any) => m.topic).filter(Boolean))) as string[]),
  ];

  // Filter study drops
  const filteredMaterials = subject.materials.filter((m: any) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTopic = selectedTopic === 'All' || m.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  // Student uploaded files vs Instructor files
  const studentUploads = subject.materials.filter((m: any) => m.uploadedByRole === 'STUDENT');
  const instructorUploads = subject.materials.filter((m: any) => m.uploadedByRole === 'TEACHER');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        setUploadError('File exceeds 15 MB limit.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setUploadError('');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('subjectId', subject.id);
      formData.append('title', uploadTitle || selectedFile.name);
      formData.append('topic', uploadTopic || 'General Study File');
      formData.append('description', uploadDesc);

      const res = await fetch('/api/student/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload file.');
      }

      setUploadSuccess(true);
      setUploadTitle('');
      setUploadTopic('');
      setUploadDesc('');
      setSelectedFile(null);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setUploadError(err.message || 'An error occurred during file upload.');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subject Header Banner */}
      <div className="bg-white rounded-3xl border border-sage-200 p-6 sm:p-8 subtle-paper-shadow relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-ivory-200 text-slate-soft border border-sage-200">
                {subject.level}
              </span>
              <span className="text-xs font-mono font-bold text-slate-muted bg-sage-100 px-2 py-0.5 rounded">
                {subject.code}
              </span>
              <span className="text-xs text-slate-light">
                Lead: {subject.instructorName}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-muted tracking-tight">
              {subject.name}
            </h1>
            <p className="text-xs sm:text-sm font-mono text-slate-light">
              {subject.syllabusInfo}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-slate-light uppercase tracking-wider block">Timetable</span>
              <span className="text-xs font-bold text-slate-muted">{subject.scheduleInfo || 'Regular Cohort'}</span>
            </div>
            <Link
              href="/student/quest"
              className="px-4 py-2.5 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 font-semibold text-xs shadow-xs transition-colors shrink-0"
            >
              View Quests
            </Link>
          </div>
        </div>

        {/* 3 Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 pt-6 border-t border-sage-200/80">
          <button
            onClick={() => setActiveTab('debrief')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'debrief'
                ? 'bg-slate-muted text-white shadow-xs'
                : 'text-slate-muted hover:bg-ivory-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Debrief</span>
          </button>

          <button
            onClick={() => setActiveTab('study-drops')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'study-drops'
                ? 'bg-slate-muted text-white shadow-xs'
                : 'text-slate-muted hover:bg-ivory-100'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Study Drops ({subject.materials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-slate-muted text-white shadow-xs'
                : 'text-slate-muted hover:bg-ivory-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Repository</span>
          </button>
        </div>
      </div>

      {/* Video Modal Preview */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative border border-sage-300">
            <div className="flex items-center justify-between pb-3 border-b border-sage-200 mb-4">
              <h3 className="font-bold text-slate-muted text-base">Recorded Lesson Stream</h3>
              <button
                onClick={() => setActiveVideoUrl(null)}
                className="p-1 rounded-lg hover:bg-ivory-200 text-slate-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
              <iframe
                src={activeVideoUrl}
                title="Lesson video"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: DEBRIEF */}
      {activeTab === 'debrief' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (8 cols): Subject overview & Lessons */}
          <div className="lg:col-span-8 space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-3xl border border-sage-200 p-6 sm:p-7 subtle-paper-shadow space-y-4">
              <h3 className="text-lg font-bold text-slate-muted">Subject Overview & Learning Goals</h3>
              <p className="text-sm text-slate-soft leading-relaxed">
                {subject.description}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-lg bg-ivory-100 border border-sage-200 text-slate-soft font-medium">
                  CAIE Examination Code: {subject.code}
                </span>
                <span className="px-3 py-1 rounded-lg bg-ivory-100 border border-sage-200 text-slate-soft font-medium">
                  Past Paper Coverage: 2018 - 2025
                </span>
              </div>
            </div>

            {/* Video Lessons List */}
            <div className="bg-white rounded-3xl border border-sage-200 p-6 sm:p-7 subtle-paper-shadow">
              <div className="flex items-center justify-between pb-4 border-b border-sage-200 mb-4">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-slate-muted" />
                  <h3 className="text-lg font-bold text-slate-muted">Class Lectures & Video Lessons</h3>
                </div>
                <span className="text-xs text-slate-light font-medium">{subject.lessons.length} Recorded Lessons</span>
              </div>

              {subject.lessons.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-light">
                  No video lessons recorded for this module yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {subject.lessons.map((lesson: any, i: number) => (
                    <div
                      key={lesson.id}
                      className="p-4 rounded-2xl bg-ivory-50 border border-sage-200/80 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-sage-200 flex items-center justify-center text-slate-muted font-bold text-xs shrink-0">
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-muted">{lesson.title}</h4>
                          <p className="text-xs text-slate-light mt-0.5">{lesson.description || 'Mastery walkthrough.'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-light hidden sm:inline">
                          {lesson.durationMinutes || 45} mins
                        </span>
                        {lesson.videoUrl && (
                          <button
                            onClick={() => setActiveVideoUrl(lesson.videoUrl)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 text-xs font-semibold transition-colors"
                          >
                            <Play className="w-3 h-3 fill-slate-900" />
                            <span>Watch</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (4 cols): Quests & Announcements for this subject */}
          <div className="lg:col-span-4 space-y-6">
            {/* Subject Assignments */}
            <div className="bg-white rounded-3xl border border-sage-200 p-6 subtle-paper-shadow">
              <div className="flex items-center justify-between pb-3 border-b border-sage-200 mb-3">
                <h3 className="font-bold text-slate-muted text-base">Module Quests</h3>
                <Link href="/student/quest" className="text-xs font-semibold text-slate-soft hover:text-slate-900">
                  Tracker
                </Link>
              </div>

              {subject.assignments.length === 0 ? (
                <p className="text-xs text-slate-light py-4 text-center">No assignments assigned yet.</p>
              ) : (
                <div className="space-y-3">
                  {subject.assignments.map((asg: any) => (
                    <div key={asg.id} className="p-3.5 rounded-xl border border-sage-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-muted truncate">{asg.title}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-ivory-200 text-slate-soft shrink-0">
                          {asg.maxMarks}m
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-light">
                        Due: {new Date(asg.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                      <Link
                        href={`/student/quest?id=${asg.id}`}
                        className="text-[11px] font-semibold text-slate-muted hover:underline block pt-1"
                      >
                        Open Quest →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subject Announcements */}
            <div className="bg-white rounded-3xl border border-sage-200 p-6 subtle-paper-shadow">
              <h3 className="font-bold text-slate-muted text-base pb-3 border-b border-sage-200 mb-3">
                Subject Notices
              </h3>
              {subject.announcements.length === 0 ? (
                <p className="text-xs text-slate-light py-4 text-center">No subject notices at this time.</p>
              ) : (
                <div className="space-y-3">
                  {subject.announcements.map((ann: any) => (
                    <div key={ann.id} className="p-3 rounded-xl bg-ivory-100 border border-sage-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-muted">{ann.title}</span>
                        {ann.priority === 'HIGH' && (
                          <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded">
                            Notice
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-soft line-clamp-3">{ann.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDY DROPS */}
      {activeTab === 'study-drops' && (
        <div className="bg-white rounded-3xl border border-sage-200 p-6 sm:p-8 subtle-paper-shadow space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-slate-muted">Study Drops Repository</h3>
              <p className="text-xs text-slate-soft mt-0.5">
                Downloadable PDF notes, formula sheets, past paper collections, and worked examples.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-light absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search syllabus lecture notes, mark schemes, or formula packs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-sage-200 bg-ivory-50 text-xs text-slate-muted focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white"
              />
            </div>
          </div>

          {/* Topic Pills Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs text-slate-light flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              <span>Topic:</span>
            </span>
            {allTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedTopic === topic
                    ? 'bg-sage-300 text-slate-900 font-bold'
                    : 'bg-ivory-100 text-slate-soft hover:bg-sage-100'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Resources Grid */}
          {filteredMaterials.length === 0 ? (
            <div className="py-12 text-center">
              <FolderOpen className="w-10 h-10 text-slate-light mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-muted">No Resources Found</h4>
              <p className="text-xs text-slate-light mt-0.5">
                No study materials match your search query or selected topic filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMaterials.map((mat: any) => (
                <div
                  key={mat.id}
                  className="p-5 rounded-2xl border border-sage-200 bg-ivory-50/50 hover:bg-ivory-100/70 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sage-200 text-slate-800">
                        {mat.fileType}
                      </span>
                      <span className="text-[11px] text-slate-light font-medium">{mat.fileSize}</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-muted leading-tight">{mat.title}</h4>
                      <p className="text-[11px] font-medium text-sage-800 mt-1">Topic: {mat.topic}</p>
                    </div>

                    {mat.description && (
                      <p className="text-xs text-slate-soft line-clamp-2 leading-relaxed">
                        {mat.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-sage-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-light">
                      Added {new Date(mat.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <a
                      href={mat.fileUrl}
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sage-300 hover:bg-sage-400 text-slate-900 font-semibold text-xs shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UPLOAD REPOSITORY */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (7 cols): Upload form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-sage-200 p-6 sm:p-8 subtle-paper-shadow space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-muted">Upload Educational File</h3>
              <p className="text-xs text-slate-soft mt-1 leading-relaxed">
                Upload your supplementary question inquiries, past paper working scans, or revision drafts for teacher review.
              </p>
            </div>

            {/* Distinction Notice */}
            <div className="p-4 rounded-2xl bg-ivory-100 border border-sage-200 text-xs text-slate-soft space-y-1">
              <span className="font-bold text-slate-muted block">Important Upload Guidelines:</span>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>For formal graded homework, submit directly via the <strong>Quest</strong> tab.</li>
                <li>Files uploaded here are saved to your student module repository for review.</li>
                <li>Supported formats: PDF, DOCX, ZIP, PNG, JPG (Max: 15 MB).</li>
              </ul>
            </div>

            {uploadSuccess && (
              <div className="p-4 rounded-xl bg-sage-100 border border-sage-300 text-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sage-700 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-semibold">Upload Complete!</h5>
                  <p className="text-xs text-slate-soft mt-0.5">Your file has been stored and registered.</p>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-semibold">Upload Failed</h5>
                  <p className="text-xs mt-0.5">{uploadError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
                  File Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Paper series and question references (e.g. Pure 1 Calculus Working)"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
                  Topic / Chapter
                </label>
                <input
                  type="text"
                  placeholder="CAIE Syllabus topic (e.g. Differentiation & Integration Techniques)"
                  value={uploadTopic}
                  onChange={(e) => setUploadTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
                  Notes for Instructor
                </label>
                <textarea
                  rows={3}
                  placeholder="Outline method hurdles or specific step proofs requiring marking feedback..."
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:bg-white resize-none"
                />
              </div>

              {/* File Drop Area */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1.5">
                  Select Document *
                </label>
                <label className="border-2 border-dashed border-sage-300 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-ivory-100/60 transition-colors">
                  <FileUp className="w-8 h-8 text-sage-600 mb-2" />
                  <span className="text-xs font-bold text-slate-muted">
                    {selectedFile ? selectedFile.name : 'Click or drag file here'}
                  </span>
                  <span className="text-[11px] text-slate-light mt-0.5">
                    {selectedFile
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                      : 'PDF, DOCX, ZIP, PNG, JPG up to 15 MB'}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc,.zip,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 font-semibold text-sm disabled:opacity-60 transition-colors shadow-xs"
              >
                {uploading ? <span>Uploading & Validating...</span> : <span>Upload File</span>}
              </button>
            </form>
          </div>

          {/* Right Column (5 cols): Student Uploaded History */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-sage-200 p-6 subtle-paper-shadow space-y-4">
            <h3 className="font-bold text-slate-muted text-base pb-3 border-b border-sage-200">
              Your Uploaded Files ({studentUploads.length})
            </h3>

            {studentUploads.length === 0 ? (
              <p className="text-xs text-slate-light py-6 text-center">
                You haven’t uploaded any supplementary files to this subject yet.
              </p>
            ) : (
              <div className="space-y-3">
                {studentUploads.map((mat: any) => (
                  <div key={mat.id} className="p-3.5 rounded-xl border border-sage-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-muted truncate">{mat.title}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sage-100 text-slate-800">
                        {mat.fileType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-light">
                      {mat.fileSize} • Uploaded {new Date(mat.createdAt).toLocaleDateString('en-GB')}
                    </p>
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[10px] text-sage-800 font-medium">Saved to subject</span>
                      <a href={mat.fileUrl} download className="text-[11px] font-bold text-slate-muted hover:underline">
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
