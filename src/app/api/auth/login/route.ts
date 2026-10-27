import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email address or password.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid email address or password.' },
        { status: 401 }
      );
    }

    // Determine redirect based on role
    const cleanRole = (user.role || '').trim().toUpperCase();
    const isSuper = cleanRole === 'SUPERADMIN' || cleanRole === 'SUPER_ADMIN';
    const isTeacher = cleanRole === 'TEACHER' || cleanRole === 'ADMIN';
    const redirectUrl = isSuper ? '/cms' : isTeacher ? '/admin' : '/student/home';

    // Generate token
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      redirectUrl,
    });

    if (isSuper) {
      const { createCmsSessionToken, CMS_COOKIE_NAME } = await import('@/lib/cmsAuth');
      const cmsToken = await createCmsSessionToken({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: 'SuperAdmin',
      });
      response.cookies.set({
        name: CMS_COOKIE_NAME,
        value: cmsToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      });
    }


    // Set secure HTTP-only cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Server error during login. Please try again.' },
      { status: 500 }
    );
  }
}
