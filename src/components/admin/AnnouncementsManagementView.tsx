'use client';

import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Send
} from 'lucide-react';

interface AnnouncementsManagementViewProps {
  announcements: any[];
  subjects: any[];
}

export default function AnnouncementsManagementView({
  announcements: initialAnnouncements,
  subjects,
}: AnnouncementsManagementViewProps) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          subjectId: subjectId || null,
          priority,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish announcement.');

      setMessage(data.message);
      setTitle('');
      setContent('');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-muted tracking-tight">
          Announcement Broadcasts
        </h1>
        <p className="text-sm text-slate-soft mt-1">
          Publish notices across all candidates or target specific Cambridge syllabus cohorts.
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
        {/* Left Column (5 cols): Draft form */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-sage-200 p-6 sm:p-7 subtle-paper-shadow space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-sage-200">
            <Megaphone className="w-5 h-5 text-slate-muted" />
            <h3 className="font-bold text-slate-muted text-base">Broadcast Announcement</h3>
          </div>

          <form onSubmit={handlePublish} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Announcement Title *
              </label>
              <input
                type="text"
                required
                placeholder="Cambridge Academic Notice (e.g. May/June 2026 Examination Timetable Release)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs focus:ring-2 focus:ring-sage-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1">
                  Target Audience
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs focus:ring-2 focus:ring-sage-400"
                >
                  <option value="">All Students (Global)</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs focus:ring-2 focus:ring-sage-400"
                >
                  <option value="NORMAL">Normal Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent Exam Alert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-muted mb-1">
                Announcement Content *
              </label>
              <textarea
                rows={5}
                required
                placeholder="Official instructions, syllabus cohort updates, examination center rules, or formula revisions..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sage-200 bg-ivory-50 text-slate-muted text-xs leading-relaxed resize-none focus:ring-2 focus:ring-sage-400"
              />
            </div>


            <button
              type="submit"
              disabled={publishing}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sage-300 hover:bg-sage-400 text-slate-900 font-bold text-xs shadow-xs transition-colors disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{publishing ? 'Broadcasting...' : 'Broadcast Announcement'}</span>
            </button>
          </form>
        </div>

        {/* Right Column (7 cols): Published Announcements Feed */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-sage-200 p-6 sm:p-7 subtle-paper-shadow space-y-4">
          <h3 className="font-bold text-slate-muted text-base pb-3 border-b border-sage-200">
            Active Broadcast Feed ({announcements.length})
          </h3>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-5 rounded-2xl bg-ivory-50 border border-sage-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold px-2 py-0.5 rounded bg-white text-slate-soft border border-sage-200">
                    {ann.subject ? ann.subject.name : 'All Cohorts'}
                  </span>
                  {ann.priority === 'HIGH' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                      High Priority
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-muted">{ann.title}</h4>
                <p className="text-slate-soft leading-relaxed whitespace-pre-line">{ann.content}</p>

                <p className="text-[10px] text-slate-light pt-2 border-t border-sage-200/60">
                  Published {new Date(ann.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
