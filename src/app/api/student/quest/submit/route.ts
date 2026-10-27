import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { parseGoogleDriveUrl } from '@/lib/googleDrive';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.zip', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const assignmentId = formData.get('assignmentId') as string;
    const file = formData.get('file') as File | null;
    const driveUrl = (formData.get('driveUrl') as string) || '';
    const studentNote = (formData.get('studentNote') as string) || '';

    if (!assignmentId || (!file && !driveUrl)) {
      return NextResponse.json(
        { error: 'Assignment ID and either a solution document or Google Drive link are required.' },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found.' }, { status: 404 });
    }

    // Check deadlines & late submissions
    const isLate = new Date() > new Date(assignment.dueDate);
    if (isLate && !assignment.allowLateSubmissions) {
      return NextResponse.json(
        { error: 'Late submissions are not accepted for this assignment.' },
        { status: 400 }
      );
    }

    let fileUrl = '';
    let fileName = '';
    let fileSizeStr = '';
    let fileType = 'PDF';

    if (driveUrl) {
      const parsed = parseGoogleDriveUrl(driveUrl);
      if (!parsed.isGoogleDrive) {
        return NextResponse.json({ error: 'Invalid Google Drive link provided.' }, { status: 400 });
      }
      fileUrl = parsed.viewUrl;
      fileName = `${parsed.label} (Google Drive)`;
      fileSizeStr = 'Google Drive';
      fileType = parsed.kind === 'document' ? 'DOCS' : parsed.kind === 'spreadsheet' ? 'SHEETS' : parsed.kind === 'presentation' ? 'SLIDES' : 'G-DRIVE';
    } else if (file) {
      // Check size & extension
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds 15 MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.` },
          { status: 400 }
        );
      }

      const ext = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { error: `Format ${ext} not allowed. Please upload PDF, DOCX, ZIP, PNG, or JPG.` },
          { status: 400 }
        );
      }

      // Save file to disk
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeFileName = `quest_${assignmentId}_${user.id}_v${Date.now()}${ext}`;
      const filePath = path.join(uploadsDir, safeFileName);
      const bytes = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(bytes));

      fileUrl = `/uploads/${safeFileName}`;
      fileSizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      fileName = file.name;
      fileType = ext.replace('.', '').toUpperCase();
    }

    // Check existing submission
    const existingSubmission = await prisma.submission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: user.id,
        },
      },
    });

    let submission;
    let nextVersion = 1;

    if (existingSubmission) {
      if (!assignment.allowResubmissions && existingSubmission.status === 'GRADED') {
        return NextResponse.json(
          { error: 'This assignment has already been graded and resubmissions are closed.' },
          { status: 400 }
        );
      }

      nextVersion = existingSubmission.currentVersion + 1;
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          status: isLate ? 'LATE' : 'SUBMITTED',
          currentVersion: nextVersion,
          submittedAt: new Date(),
          isPublished: false, // Reset published until teacher regrades if applicable
        },
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          assignmentId,
          studentId: user.id,
          status: isLate ? 'LATE' : 'SUBMITTED',
          currentVersion: 1,
          submittedAt: new Date(),
          gradeMax: assignment.maxMarks,
        },
      });
    }

    // Create SubmissionVersion record for auditability
    await prisma.submissionVersion.create({
      data: {
        submissionId: submission.id,
        versionNumber: nextVersion,
        fileUrl,
        fileName,
        fileSize: fileSizeStr,
        fileType,
        studentNote: studentNote.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: isLate
        ? 'Assignment submitted (marked as late submission).'
        : 'Assignment solution submitted successfully!',
      submission,
      version: nextVersion,
    });
  } catch (error: any) {
    console.error('Quest submission error:', error);
    return NextResponse.json(
      { error: 'An error occurred while saving your assignment submission.' },
      { status: 500 }
    );
  }
}
