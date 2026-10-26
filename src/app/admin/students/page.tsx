import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import StudentManagementView from '@/components/admin/StudentManagementView';

export const dynamic = 'force-dynamic';

export default async function AdminStudentsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  const [students, allSubjects] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        enrollments: {
          include: { subject: true },
        },
        attendance: true,
      },
      orderBy: { fullName: 'asc' },
    }),
    prisma.subject.findMany({
      orderBy: { orderIndex: 'asc' },
    }),
  ]);

  return <StudentManagementView students={students} allSubjects={allSubjects} />;
}
