import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentCmsSession } from '@/lib/cmsAuth';
import { INITIAL_CMS_DATA, DEFAULT_CMS_MAP, CmsItem } from '@/lib/cmsData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let dbItems: any[] = [];
    try {
      dbItems = await (prisma as any).$queryRawUnsafe(
        'SELECT * FROM CmsContent ORDER BY category ASC, section ASC, key ASC'
      );
    } catch (e) {
      console.warn('Could not query CmsContent from DB, falling back to defaults:', e);
    }

    // Merge DB items with default CMS data
    const itemMap = new Map<string, CmsItem>();
    for (const def of INITIAL_CMS_DATA) {
      itemMap.set(def.key, { ...def });
    }

    if (Array.isArray(dbItems)) {
      for (const row of dbItems) {
        const existing = itemMap.get(row.key);
        if (existing) {
          existing.value = row.value;
          existing.updatedAt = row.updatedAt;
          existing.updatedBy = row.updatedBy;
        } else {
          itemMap.set(row.key, {
            id: row.id || `cms_${row.key}`,
            key: row.key,
            section: row.section || 'global_settings',
            category: row.category || 'GLOBAL',
            label: row.label || row.key,
            value: row.value || '',
            type: (row.type as any) || 'text',
            description: row.description || '',
            updatedAt: row.updatedAt,
            updatedBy: row.updatedBy,
          });
        }
      }
    }

    const items = Array.from(itemMap.values());
    const contentMap: Record<string, string> = {};
    for (const item of items) {
      contentMap[item.key] = item.value;
    }

    return NextResponse.json({
      success: true,
      items,
      contentMap,
      count: items.length,
    });
  } catch (err: any) {
    console.error('CMS Content GET Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to fetch CMS content',
        items: INITIAL_CMS_DATA,
        contentMap: DEFAULT_CMS_MAP,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate SuperAdmin CMS Layer
    const session = await getCurrentCmsSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Only SuperAdmin can modify website contents.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { updates, items, key, value } = body;

    const itemsToUpdate: Array<{ key: string; value: string }> = [];

    if (key && typeof value === 'string') {
      itemsToUpdate.push({ key, value });
    } else if (Array.isArray(items)) {
      for (const it of items) {
        if (it && it.key && typeof it.value === 'string') {
          itemsToUpdate.push({ key: it.key, value: it.value });
        }
      }
    } else if (updates && typeof updates === 'object') {
      for (const [k, v] of Object.entries(updates)) {
        if (typeof v === 'string') {
          itemsToUpdate.push({ key: k, value: v });
        }
      }
    }

    if (itemsToUpdate.length === 0) {
      return NextResponse.json(
        { error: 'No valid content updates provided.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const updatedBy = session.fullName || 'SuperAdmin';

    const rejected: string[] = [];
    let updatedCount = 0;

    // Update in DB
    for (const it of itemsToUpdate) {
      const def = INITIAL_CMS_DATA.find((d) => d.key === it.key);
      if (!def || it.value.length > 5000) {
        rejected.push(it.key);
        continue;
      }
      const section = def.section;
      const category = def.category;
      const label = def.label;
      const type = def.type;
      const description = def.description || '';

      await (prisma as any).$executeRawUnsafe(
        `INSERT INTO CmsContent (id, key, section, category, label, value, type, description, updatedAt, updatedBy)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value,
           updatedAt = excluded.updatedAt,
           updatedBy = excluded.updatedBy`,
        `cms_${it.key}`,
        it.key,
        section,
        category,
        label,
        it.value,
        type,
        description,
        now,
        updatedBy
      );
      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Synchronized ${updatedCount} content field${updatedCount === 1 ? '' : 's'} to the database.`,
      updatedCount,
      rejected,
      updatedAt: now,
      updatedBy,
    });
  } catch (err: any) {
    console.error('CMS Content POST Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update CMS content' },
      { status: 500 }
    );
  }
}
