import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import SubjectDetailView from '@/components/modules/SubjectDetailView';

export const dynamic = 'force-dynamic';

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Fetch subject
  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { orderIndex: 'asc' },
      },
      materials: {
        orderBy: { createdAt: 'desc' },
      },
      assignments: {
        include: {
          submissions: {
            where: { studentId: user.id },
          },
        },
        orderBy: { dueDate: 'asc' },
      },
      announcements: {
        orderBy: { publishedAt: 'desc' },
        take: 5,
      },
      enrollments: {
        where: { studentId: user.id },
      },
    },
  });

  if (!subject) {
    notFound();
  }

  // Check enrollment (teachers & admins can access all)
  const isEnrolled = subject.enrollments.length > 0 || user.role === 'TEACHER' || user.role === 'ADMIN';
  if (!isEnrolled) {
    redirect('/student/modules');
  }

  return <SubjectDetailView subject={subject} userRole={user.role} />;
}
