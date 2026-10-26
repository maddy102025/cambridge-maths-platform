import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import CoursesManagementView from '@/components/admin/CoursesManagementView';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  const subjects = await prisma.subject.findMany({
    include: {
      materials: {
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { orderIndex: 'asc' },
  });

  return <CoursesManagementView subjects={subjects} />;
}
