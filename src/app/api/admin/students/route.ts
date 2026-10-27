import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !['TEACHER', 'ADMIN', 'SuperAdmin'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { action, studentId, subjectId, projectedGrade } = await request.json();

    if (action === 'ENROLL') {
      await prisma.studentEnrollment.upsert({
        where: {
          studentId_subjectId: {
            studentId,
            subjectId,
          },
        },
        create: {
          studentId,
          subjectId,
          status: 'ACTIVE',
        },
        update: {
          status: 'ACTIVE',
        },
      });
      return NextResponse.json({ success: true, message: 'Student successfully enrolled.' });
    }

    if (action === 'UNENROLL') {
      await prisma.studentEnrollment.deleteMany({
        where: { studentId, subjectId },
      });
      return NextResponse.json({ success: true, message: 'Student removed from subject.' });
    }

    if (action === 'UPDATE_GRADE') {
      await prisma.user.update({
        where: { id: studentId },
        data: { projectedGrade },
      });
      return NextResponse.json({ success: true, message: 'Projected grade updated.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin student action error:', error);
    return NextResponse.json({ error: 'Server error occurred.' }, { status: 500 });
  }
}
