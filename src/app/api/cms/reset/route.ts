import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentCmsSession } from '@/lib/cmsAuth';
import { INITIAL_CMS_DATA } from '@/lib/cmsData';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getCurrentCmsSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Only SuperAdmin can reset CMS content.' },
        { status: 401 }
      );
    }

    const { section } = (await request.json().catch(() => ({}))) as any;
    const now = new Date().toISOString();

    const targets = section
      ? INITIAL_CMS_DATA.filter((i) => i.section === section)
      : INITIAL_CMS_DATA;

    for (const item of targets) {
      await (prisma as any).$executeRawUnsafe(
        `INSERT INTO CmsContent (id, key, section, category, label, value, type, description, updatedAt, updatedBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value,
           updatedAt = excluded.updatedAt,
           updatedBy = excluded.updatedBy`,
        item.id,
        item.key,
        item.section,
        item.category,
        item.label,
        item.value,
        item.type,
        item.description || '',
        now,
        'SuperAdmin Default Reset'
      );
    }

    return NextResponse.json({
      success: true,
      message: `Reset ${targets.length} content fields to standard Cambridge academic defaults.`,
      resetCount: targets.length,
    });
  } catch (err: any) {
    console.error('CMS Reset Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to reset CMS content' },
      { status: 500 }
    );
  }
}
