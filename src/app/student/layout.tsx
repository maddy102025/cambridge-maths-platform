import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import StudentSidebar from '@/components/layout/StudentSidebar';
import StudentHeader from '@/components/layout/StudentHeader';

export const dynamic = 'force-dynamic';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Count unread notifications
  const unreadCount = await prisma.notification.count({
    where: {
      userId: user.id,
      isRead: false,
    },
  });

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col lg:flex-row text-slate-muted">
      {/* Sidebar */}
      <StudentSidebar user={user} unreadCount={unreadCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader user={user} unreadCount={unreadCount} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
