'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portal?view=admin-layout')
      .then(async (res) => {
        if (res.status === 401) {
          router.replace('/login');
          return null;
        }
        if (res.status === 403) {
          router.replace('/student/home');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
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
          <div className="w-10 h-10 rounded-xl bg-slate-muted text-sage-300 flex items-center justify-center font-bold font-mono animate-pulse">
            ∑
          </div>
          <p className="text-xs font-semibold text-slate-soft">Loading Instructor Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col lg:flex-row text-slate-muted">
      <AdminSidebar user={user} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
