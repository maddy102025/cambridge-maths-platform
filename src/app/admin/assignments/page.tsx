import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AssignmentGradingView from '@/components/admin/AssignmentGradingView';

export const dynamic = 'force-dynamic';

export default async function AdminAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ submissionId?: string }>;
}) {
  const { submissionId } = await searchParams;
  const user = await getCurrentUser();
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  const [assignments, allSubjects, allSubmissions] = await Promise.all([
    prisma.assignment.findMany({
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subject.findMany({
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.submission.findMany({
      include: {
        student: true,
        assignment: {
          include: { subject: true },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
      },
      orderBy: { submittedAt: 'desc' },
    }),
  ]);

  return (
    <AssignmentGradingView
      assignments={assignments}
      allSubjects={allSubjects}
      allSubmissions={allSubmissions}
      initialSubmissionId={submissionId}
    />
  );
}
