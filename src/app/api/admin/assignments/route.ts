import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !['TEACHER', 'ADMIN', 'SuperAdmin'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const formData = await request.formData();
    const subjectId = formData.get('subjectId') as string;
    const title = formData.get('title') as string;
    const instructions = formData.get('instructions') as string;
    const maxMarks = parseInt(formData.get('maxMarks') as string) || 100;
    const dueDate = formData.get('dueDate') as string;
    const allowLateSubmissions = formData.get('allowLateSubmissions') === 'true';
    const allowResubmissions = formData.get('allowResubmissions') === 'true';
    const file = formData.get('referenceFile') as File | null;

    if (!subjectId || !title || !instructions || !dueDate) {
      return NextResponse.json(
        { error: 'Subject, title, instructions, and due date are required.' },
        { status: 400 }
      );
    }

    let referenceFileUrl = null;
    let referenceFileName = null;

    if (file && file.size > 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeName = `prompt_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadsDir, safeName);
      const bytes = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(bytes));

      referenceFileUrl = `/uploads/${safeName}`;
      referenceFileName = file.name;
    }

    // Create Assignment
    const newAssignment = await prisma.assignment.create({
      data: {
        subjectId,
        title: title.trim(),
        instructions: instructions.trim(),
        maxMarks,
        dueDate: new Date(dueDate),
        allowLateSubmissions,
        allowResubmissions,
        referenceFileUrl,
        referenceFileName,
      },
    });

    // Notify enrolled students
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { subjectId, status: 'ACTIVE' },
    });

    for (const enr of enrollments) {
      await prisma.notification.create({
        data: {
          userId: enr.studentId,
          title: 'New Assignment Published',
          message: `New Quest "${newAssignment.title}" is available. Max ${maxMarks} marks.`,
          linkUrl: `/student/quest?id=${newAssignment.id}`,
          type: 'ASSIGNMENT',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Assignment created successfully and students notified.',
      assignment: newAssignment,
    });
  } catch (error: any) {
    console.error('Create assignment error:', error);
    return NextResponse.json({ error: 'Server error creating assignment.' }, { status: 500 });
  }
}
