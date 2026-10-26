import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { title, content, subjectId, priority } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        subjectId: subjectId || null,
        priority: priority || 'NORMAL',
        authorId: user.id,
      },
    });

    // Notify students
    const targetStudentIds: string[] = [];
    if (subjectId) {
      const enrollments = await prisma.studentEnrollment.findMany({
        where: { subjectId, status: 'ACTIVE' },
        select: { studentId: true },
      });
      targetStudentIds.push(...enrollments.map((e) => e.studentId));
    } else {
      const students = await prisma.user.findMany({
        where: { role: 'STUDENT' },
        select: { id: true },
      });
      targetStudentIds.push(...students.map((s) => s.id));
    }

    for (const sid of targetStudentIds) {
      await prisma.notification.create({
        data: {
          userId: sid,
          title: `Announcement: ${announcement.title}`,
          message: announcement.content.substring(0, 140) + '...',
          linkUrl: '/student/heads-up',
          type: 'ANNOUNCEMENT',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement published successfully!',
      announcement,
    });
  } catch (error: any) {
    console.error('Announcement publish error:', error);
    return NextResponse.json({ error: 'Server error publishing announcement.' }, { status: 500 });
  }
}
