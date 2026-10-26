import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, password, confirmPassword } = body;

    // Validation
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Clean email
    const normalizedEmail = email.trim().toLowerCase();

    // Check duplicate
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : null,
        passwordHash,
        role: 'STUDENT',
        phoneVerified: false,
        emailVerified: true, // Configured for immediate access
        projectedGrade: 'A',
        studyStreakDays: 1,
      },
    });

    // Auto-enroll new student into core Mathematics (4024) by default
    const mathSubject = await prisma.subject.findFirst({
      where: { code: 'MATH-4024' },
    });

    if (mathSubject) {
      await prisma.studentEnrollment.create({
        data: {
          studentId: newUser.id,
          subjectId: mathSubject.id,
          status: 'ACTIVE',
        },
      });

      // Create welcome notification
      await prisma.notification.create({
        data: {
          userId: newUser.id,
          title: 'Welcome to the Student Portal',
          message: 'Your account is active. You have been enrolled in Mathematics (4024). Explore your Debrief and Study Drops.',
          linkUrl: '/student/modules',
          type: 'SYSTEM',
        },
      });
    }

    // Generate JWT token session
    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role as 'STUDENT' | 'TEACHER' | 'ADMIN',
      fullName: newUser.fullName,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
        },
        redirectUrl: '/student/home',
      },
      { status: 201 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Server error during registration. Please try again.' },
      { status: 500 }
    );
  }
}
