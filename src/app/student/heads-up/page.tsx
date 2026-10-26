import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import HeadsUpView from '@/components/headsup/HeadsUpView';

export const dynamic = 'force-dynamic';

export default async function HeadsUpPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Enrolled subjects
  const enrollments = await prisma.studentEnrollment.findMany({
    where: { studentId: user.id },
    select: { subjectId: true },
  });
  const subjectIds = enrollments.map((e) => e.subjectId);

  // Fetch announcements (all school + enrolled subjects)
  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [
        { subjectId: null },
        { subjectId: { in: subjectIds } },
      ],
    },
    include: { subject: true },
    orderBy: { publishedAt: 'desc' },
  });

  // Fetch notifications for user
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <HeadsUpView
      notifications={notifications}
      announcements={announcements}
    />
  );
}
