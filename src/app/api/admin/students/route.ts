import { NextResponse } from 'next/server';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !['TEACHER', 'ADMIN', 'SuperAdmin'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Unauthorized: Faculty access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { action, studentId, subjectId, projectedGrade } = body;

    if (action === 'CREATE_STUDENT') {
      const {
        fullName,
        email,
        password,
        phone,
        level,
        projectedGrade: studentGrade,
        targetExamDate,
        subjectIds = [],
      } = body;

      if (!fullName || !email || !password) {
        return NextResponse.json(
          { error: 'Full name, email, and initial password are required.' },
          { status: 400 }
        );
      }

      const cleanEmail = email.toLowerCase().trim();

      // Check existing user
      const existing = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (existing) {
        return NextResponse.json(
          { error: `An account with email "${cleanEmail}" is already registered.` },
          { status: 400 }
        );
      }

      const passwordHash = await hashPassword(password);

      const newStudent = await prisma.user.create({
        data: {
          fullName: fullName.trim(),
          email: cleanEmail,
          passwordHash,
          role: 'STUDENT',
          phone: phone ? phone.trim() : null,
                    projectedGrade: studentGrade || 'Predicted A*',
          emailVerified: true,
          phoneVerified: true,
          bio: level ? `Enrolled in ${level} mathematics mentorship.` : 'Enrolled student.',
        },
      });

      // Enroll in selected subjects
      if (Array.isArray(subjectIds) && subjectIds.length > 0) {
        for (const subId of subjectIds) {
          if (!subId) continue;
          const subjectExists = await prisma.subject.findUnique({ where: { id: subId } });
          if (subjectExists) {
            await prisma.studentEnrollment.create({
              data: {
                studentId: newStudent.id,
                subjectId: subId,
                status: 'ACTIVE',
              },
            });
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Student account created for "${newStudent.fullName}". Enrolled in ${subjectIds.length} course(s).`,
        student: {
          id: newStudent.id,
          fullName: newStudent.fullName,
          email: newStudent.email,
          role: newStudent.role,
        },
      });
    }

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
    return NextResponse.json({ error: error.message || 'Server error occurred.' }, { status: 500 });
  }
}
