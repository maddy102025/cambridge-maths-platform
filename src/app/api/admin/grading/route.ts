import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !['TEACHER', 'ADMIN', 'SuperAdmin'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { submissionId, gradeScore, gradeLetter, feedback, action } = await request.json();

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required.' }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
        student: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
    }

    const isPublish = action === 'PUBLISH';
    const isRevision = action === 'RETURN_FOR_REVISION';

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        gradeScore: gradeScore !== undefined ? parseFloat(gradeScore) : submission.gradeScore,
        gradeLetter: gradeLetter || submission.gradeLetter,
        feedback: feedback !== undefined ? feedback.trim() : submission.feedback,
        gradedAt: new Date(),
        gradedById: user.id,
        isPublished: isPublish,
        status: isRevision ? 'RETURNED_FOR_REVISION' : (isPublish ? 'GRADED' : submission.status),
      },
    });

    // Notify student if published
    if (isPublish) {
      await prisma.notification.create({
        data: {
          userId: submission.studentId,
          title: 'Grade Published',
          message: `Your grade for "${submission.assignment.title}" has been published: ${gradeScore}/${submission.assignment.maxMarks} (${gradeLetter}). Click to view teacher comments.`,
          linkUrl: `/student/quest?id=${submission.assignmentId}`,
          type: 'GRADE',
        },
      });
    } else if (isRevision) {
      await prisma.notification.create({
        data: {
          userId: submission.studentId,
          title: 'Revision Requested on Quest',
          message: `Ms. Vance requested a revision on "${submission.assignment.title}". Please review teacher comments and resubmit.`,
          linkUrl: `/student/quest?id=${submission.assignmentId}`,
          type: 'ASSIGNMENT',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: isPublish
        ? 'Grade and feedback successfully published to student!'
        : isRevision
        ? 'Assignment returned to student for revision.'
        : 'Grade saved as draft.',
      submission: updated,
    });
  } catch (error: any) {
    console.error('Grading error:', error);
    return NextResponse.json({ error: 'Server error processing evaluation.' }, { status: 500 });
  }
}
