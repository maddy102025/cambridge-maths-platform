import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AnnouncementsManagementView from '@/components/admin/AnnouncementsManagementView';

export const dynamic = 'force-dynamic';

export default async function AdminAnnouncementsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  const [announcements, subjects] = await Promise.all([
    prisma.announcement.findMany({
      include: { subject: true },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.subject.findMany({
      orderBy: { orderIndex: 'asc' },
    }),
  ]);

  return <AnnouncementsManagementView announcements={announcements} subjects={subjects} />;
}
