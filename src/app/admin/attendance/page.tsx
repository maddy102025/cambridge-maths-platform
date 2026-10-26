import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import AttendanceManagementView from '@/components/admin/AttendanceManagementView';

export const dynamic = 'force-dynamic';

export default async function AdminAttendancePage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  const [subjects, allAttendance] = await Promise.all([
    prisma.subject.findMany({
      include: {
        enrollments: {
          include: { student: true },
        },
      },
      orderBy: { orderIndex: 'asc' },
    }),
    prisma.attendanceRecord.findMany({
      orderBy: { classDate: 'desc' },
      take: 20,
    }),
  ]);

  return <AttendanceManagementView subjects={subjects} allAttendance={allAttendance} />;
}
