import { NextResponse } from 'next/server';
import { getCurrentCmsSession } from '@/lib/cmsAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentCmsSession();
    if (!session) {
      return NextResponse.json(
        { authenticated: false, error: 'Unauthorized CMS session. SuperAdmin login required.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.userId,
        email: session.email,
        fullName: session.fullName,
        role: 'SuperAdmin',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { authenticated: false, error: err.message || 'Session verification failed' },
      { status: 500 }
    );
  }
}
