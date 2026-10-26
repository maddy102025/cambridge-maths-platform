import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import QuestTrackerView from '@/components/quest/QuestTrackerView';

export const dynamic = 'force-dynamic';

export default async function StudentQuestPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Fetch enrolled subjects
  const enrollments = await prisma.studentEnrollment.findMany({
    where: { studentId: user.id, status: 'ACTIVE' },
    select: { subjectId: true },
  });

  const subjectIds = enrollments.map((e) => e.subjectId);

  // Fetch assignments for enrolled subjects
  const assignments = await prisma.assignment.findMany({
    where: {
      subjectId: { in: subjectIds },
    },
    include: {
      subject: true,
      submissions: {
        where: { studentId: user.id },
        include: {
          versions: {
            orderBy: { versionNumber: 'desc' },
          },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  });

  return (
    <QuestTrackerView
      assignments={assignments}
      initialSelectedId={id}
      userId={user.id}
    />
  );
}
