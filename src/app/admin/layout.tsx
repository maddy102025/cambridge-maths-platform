import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminSidebar from '@/components/layout/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Strict server-side RBAC check
  const isAuthorizedTeacher = user.role === 'TEACHER' || user.role === 'ADMIN';
  if (!isAuthorizedTeacher) {
    redirect('/student/home');
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
