import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Valid file extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.zip', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const subjectId = formData.get('subjectId') as string;
    const title = formData.get('title') as string;
    const topic = (formData.get('topic') as string) || 'General Work';
    const description = (formData.get('description') as string) || '';

    if (!file || !subjectId || !title) {
      return NextResponse.json(
        { error: 'File, subject, and title are required.' },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the 15 MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.` },
        { status: 400 }
      );
    }

    // Validate extension
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `File format ${ext} is not supported. Please upload a PDF, DOCX, ZIP, or PNG/JPG.` },
        { status: 400 }
      );
    }

    // Format human readable size
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${sizeInMb} MB`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Safe sanitized filename
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(uploadsDir, safeName);

    // Write file to public/uploads
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${safeName}`;

    // Record in database
    const newMaterial = await prisma.studyMaterial.create({
      data: {
        subjectId,
        title: title.trim(),
        topic: topic.trim(),
        description: description.trim() || null,
        fileType: ext.replace('.', '').toUpperCase(),
        fileSize: sizeStr,
        fileUrl,
        uploadedByRole: ['TEACHER', 'ADMIN', 'SuperAdmin'].includes(user.role as string) ? 'TEACHER' : 'STUDENT',
        uploadedById: user.id,
        isPublicToClass: ['TEACHER', 'ADMIN', 'SuperAdmin'].includes(user.role as string), // Teachers are public; students are private/review
      },
    });

    return NextResponse.json(
      {
        success: true,
        material: newMaterial,
        message: 'File successfully uploaded and stored.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file upload. Please try again.' },
      { status: 500 }
    );
  }
}
