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
    const action = formData.get('action') as string;

    if (action === 'UPLOAD_RESOURCE') {
      const subjectId = formData.get('subjectId') as string;
      const title = formData.get('title') as string;
      const topic = formData.get('topic') as string;
      const description = formData.get('description') as string;
      const file = formData.get('file') as File | null;

      if (!subjectId || !title || !topic || !file) {
        return NextResponse.json({ error: 'Subject, title, topic, and file required.' }, { status: 400 });
      }

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeName = `drop_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = path.join(uploadsDir, safeName);
      const bytes = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(bytes));

      const ext = path.extname(file.name).replace('.', '').toUpperCase();
      const fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      const material = await prisma.studyMaterial.create({
        data: {
          subjectId,
          title: title.trim(),
          topic: topic.trim(),
          description: description?.trim() || null,
          fileType: ext,
          fileSize,
          fileUrl: `/uploads/${safeName}`,
          uploadedByRole: 'TEACHER',
          uploadedById: user.id,
          isPublicToClass: true,
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
            title: 'New Study Drop Published',
            message: `Ms. Eleanor Vance added "${material.title}" (${material.topic}).`,
            linkUrl: `/student/modules/${subjectId}`,
            type: 'RESOURCE',
          },
        });
      }

      return NextResponse.json({ success: true, message: 'Resource uploaded and published to Study Drops!' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Course management error:', error);
    return NextResponse.json({ error: 'Server error processing request.' }, { status: 500 });
  }
}
