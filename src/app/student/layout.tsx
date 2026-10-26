'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentSidebar from '@/components/layout/StudentSidebar';
import StudentHeader from '@/components/layout/StudentHeader';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal?view=student-layout')
      .then(async (res) => {
        if (!res.ok) {
          router.replace('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          setUnreadCount(data.unreadCount || 0);
          setLoading(false);
        }
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-ivory-100 flex items-center justify-center text-slate-muted">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage-300 flex items-center justify-center font-bold font-mono text-slate-900 animate-pulse">
            ∑
          </div>
          <p className="text-xs font-semibold text-slate-soft">Loading Student Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col lg:flex-row text-slate-muted">
      <StudentSidebar user={user} unreadCount={unreadCount} />

      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader user={user} unreadCount={unreadCount} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
