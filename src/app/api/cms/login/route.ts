import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';
import {
  createCmsSessionToken,
  CMS_COOKIE_NAME,
  getMasterPasskey,
  isSuperAdmin,
} from '@/lib/cmsAuth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, masterPasskey } = body as Record<string, string | undefined>;

    let superAdminUser: { id: string; email: string; fullName: string; role: string } | null = null;

    const configuredPasskey = getMasterPasskey();
    if (configuredPasskey && typeof masterPasskey === 'string' && masterPasskey.trim() === configuredPasskey) {
      superAdminUser = await prisma.user.findFirst({
        where: { role: { in: ['SuperAdmin', 'SUPERADMIN'] } },
        orderBy: { createdAt: 'asc' },
      });
      if (!superAdminUser) {
        return NextResponse.json({ error: 'No SuperAdmin account exists in the database.' }, { status: 404 });
      }
    } else {
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required for SuperAdmin CMS access.' },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
      // Same message for unknown user / wrong password to avoid account enumeration.
      const valid = user ? await verifyPassword(password, user.passwordHash) : false;
      if (!user || !valid) {
        return NextResponse.json({ error: 'Invalid SuperAdmin credentials.' }, { status: 401 });
      }
      if (!isSuperAdmin(user.role)) {
        return NextResponse.json(
          { error: 'This account is not authorised for the CMS layer.' },
          { status: 403 }
        );
      }
      superAdminUser = user;
    }

    const cmsToken = await createCmsSessionToken({
      id: superAdminUser.id,
      email: superAdminUser.email,
      fullName: superAdminUser.fullName,
      role: 'SuperAdmin',
    });

    const stdToken = await createSessionToken({
      userId: superAdminUser.id,
      email: superAdminUser.email,
      fullName: superAdminUser.fullName,
      role: 'SuperAdmin',
    });

    const response = NextResponse.json({
      success: true,
      message: 'SuperAdmin authenticated to CMS layer successfully.',
      user: {
        id: superAdminUser.id,
        email: superAdminUser.email,
        fullName: superAdminUser.fullName,
        role: 'SuperAdmin',
      },
    });

    const secure = process.env.NODE_ENV === 'production';
    response.cookies.set(CMS_COOKIE_NAME, cmsToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    response.cookies.set(COOKIE_NAME, stdToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error('SuperAdmin CMS Login Error:', err);
    return NextResponse.json({ error: 'An error occurred during CMS authentication.' }, { status: 500 });
  }
}
