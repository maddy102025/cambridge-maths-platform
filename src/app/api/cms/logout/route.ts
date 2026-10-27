import { NextResponse } from 'next/server';
import { CMS_COOKIE_NAME } from '@/lib/cmsAuth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'SuperAdmin CMS session ended successfully.',
  });

  response.cookies.set(CMS_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
