import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { parseGoogleDriveUrl } from '@/lib/googleDrive';

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
      const driveUrl = (formData.get('driveUrl') as string) || '';

      if (!subjectId || !title || !topic) {
        return NextResponse.json({ error: 'Subject, title, and topic are required.' }, { status: 400 });
      }

      let fileUrl = '';
      let fileType = 'PDF';
      let fileSize = 'Cloud';

      if (driveUrl) {
        const parsedDrive = parseGoogleDriveUrl(driveUrl);
        if (!parsedDrive.isGoogleDrive) {
          return NextResponse.json({ error: 'Invalid Google Drive link provided.' }, { status: 400 });
        }
        fileUrl = parsedDrive.viewUrl;
        fileType = parsedDrive.kind === 'document' ? 'DOCS' : parsedDrive.kind === 'spreadsheet' ? 'SHEETS' : parsedDrive.kind === 'presentation' ? 'SLIDES' : 'G-DRIVE';
        fileSize = 'Google Drive';
      } else if (file) {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const safeName = `drop_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadsDir, safeName);
        const bytes = await file.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(bytes));

        const ext = path.extname(file.name).replace('.', '').toUpperCase();
        fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
        fileType = ext;
        fileUrl = `/uploads/${safeName}`;
      } else {
        return NextResponse.json({ error: 'Please provide a Google Drive link or select a file to upload.' }, { status: 400 });
      }

      const material = await prisma.studyMaterial.create({
        data: {
          subjectId,
          title: title.trim(),
          topic: topic.trim(),
          description: description?.trim() || null,
          fileType,
          fileSize,
          fileUrl,
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
            message: `Ms. Vance uploaded a new ${fileType} resource: "${title}" under ${topic}.`,
            linkUrl: '/student/modules',
            type: 'RESOURCE',
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: driveUrl
          ? 'Google Drive resource linked and published to Study Drops!'
          : 'Resource uploaded and published to Study Drops!',
        material,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Course management action error:', error);
    return NextResponse.json({ error: 'Failed to process course action.' }, { status: 500 });
  }
}
