'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCheck,
  Megaphone,
  BookOpen,
  Award,
  Calendar,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';

interface HeadsUpViewProps {
  notifications: any[];
  announcements: any[];
}

export default function HeadsUpView({
  notifications: initialNotifications,
  announcements,
}: HeadsUpViewProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState<'all' | 'announcements' | 'notifications'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch('/api/student/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await fetch('/api/student/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingAll(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (typeFilter === 'ALL') return true;
    return n.type === typeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-muted tracking-tight">
            Heads-up — Updates & Announcements
          </h1>
          <p className="text-sm text-slate-soft mt-1">
            Teacher announcements, homework reminders, published grades, and Cambridge syllabus alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-ivory-100 border border-sage-300 text-xs font-semibold text-slate-muted transition-colors shadow-xs"
          >
            <CheckCheck className="w-4 h-4 text-sage-700" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      {/* Tabs Row */}
      <div className="bg-white p-3 rounded-2xl border border-sage-200 subtle-paper-shadow flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-slate-muted text-white shadow-xs'
                : 'text-slate-muted hover:bg-ivory-100'
            }`}
          >
            All Updates
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'announcements'
                ? 'bg-slate-muted text-white shadow-xs'
                : 'text-slate-muted hover:bg-ivory-100'
            }`}
          >
            Announcements ({announcements.length})
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'notifications'
                ? 'bg-slate-muted text-white shadow-xs'
                : 'text-slate-muted hover:bg-ivory-100'
            }`}
          >
            Notifications ({unreadCount > 0 ? `${unreadCount} unread` : notifications.length})
          </button>
        </div>

        {/* Sub-type filter for notifications */}
        {activeTab !== 'announcements' && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-light mr-1">Type:</span>
            {['ALL', 'GRADE', 'ASSIGNMENT', 'RESOURCE'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                  typeFilter === t
                    ? 'bg-sage-200 text-slate-900'
                    : 'text-slate-soft hover:bg-ivory-100'
                }`}
              >
                {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Layout */}
      <div className="space-y-6">
        {/* Section: Teacher Announcements (if tab is all or announcements) */}
        {(activeTab === 'all' || activeTab === 'announcements') && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-slate-muted" />
              <h2 className="text-base font-bold text-slate-muted">Official Instructor Announcements</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white rounded-3xl border border-sage-200 p-6 subtle-paper-shadow flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-ivory-200 text-slate-soft border border-sage-200">
                        {ann.subject ? ann.subject.name : 'All Cohorts & Subjects'}
                      </span>
                      {ann.priority === 'HIGH' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                          Priority Alert
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-muted tracking-tight">{ann.title}</h3>
                    <p className="text-xs text-slate-soft leading-relaxed whitespace-pre-line">
                      {ann.content}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-sage-100 flex items-center justify-between text-xs text-slate-light">
                    <span>
                      Posted {new Date(ann.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="font-medium text-slate-soft">Ms. Eleanor Vance</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Notifications Stream (if tab is all or notifications) */}
        {(activeTab === 'all' || activeTab === 'notifications') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-muted" />
                <h2 className="text-base font-bold text-slate-muted">Notifications & Reminders</h2>
              </div>
              <span className="text-xs text-slate-light">{filteredNotifications.length} items</span>
            </div>

            <div className="bg-white rounded-3xl border border-sage-200 divide-y divide-sage-100 subtle-paper-shadow overflow-hidden">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-light">
                  No notifications match your current filter.
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  return (
                    <div
                      key={notif.id}
                      className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        notif.isRead ? 'bg-white' : 'bg-sage-50/60'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            notif.isRead
                              ? 'bg-ivory-200 text-slate-soft'
                              : 'bg-sage-300 text-slate-900 font-bold'
                          }`}
                        >
                          {notif.type === 'GRADE' ? (
                            <Award className="w-4 h-4" />
                          ) : notif.type === 'ASSIGNMENT' ? (
                            <BookOpen className="w-4 h-4" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-muted">{notif.title}</h4>
                            {!notif.isRead && (
                              <span className="w-2 h-2 rounded-full bg-sage-600" />
                            )}
                          </div>
                          <p className="text-xs text-slate-soft mt-0.5 max-w-2xl">{notif.message}</p>
                          <span className="text-[10px] text-slate-light block mt-1">
                            {new Date(notif.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="px-2.5 py-1 text-[11px] font-medium text-slate-soft hover:text-slate-900 rounded-lg hover:bg-sage-100 transition-colors"
                          >
                            Mark Read
                          </button>
                        )}

                        {notif.linkUrl && (
                          <Link
                            href={notif.linkUrl}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sage-200 hover:bg-sage-300 text-slate-900 font-semibold text-xs transition-colors"
                          >
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
