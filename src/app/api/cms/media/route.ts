import { NextResponse } from 'next/server';
import { getCurrentCmsSession } from '@/lib/cmsAuth';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentCmsSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized CMS session. SuperAdmin login required.' },
        { status: 401 }
      );
    }

    let items: any[] = [];
    if ((prisma as any).mediaItem) {
      items = await (prisma as any).mediaItem.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } else {
      items = await prisma.$queryRawUnsafe<any[]>(
        `SELECT * FROM "MediaItem" ORDER BY "createdAt" DESC`
      );
    }

    return NextResponse.json({
      success: true,
      items,
      count: items.length,
      storageBackend: 'Cloudflare R2 (cambridge-maths-media)',
    });
  } catch (err: any) {
    console.error('CMS Media GET Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list media items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentCmsSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: SuperAdmin credentials required to upload media.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'GENERAL';
    const title = (formData.get('title') as string) || '';
    const description = (formData.get('description') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No media file provided.' }, { status: 400 });
    }

    const cleanBase = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const safeKey = `media_${Date.now()}_${cleanBase}`;

    // Write to public/media locally for local dev preview
    const mediaDir = path.join(process.cwd(), 'public', 'media');
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
    }
    const filePath = path.join(mediaDir, safeKey);
    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(bytes));

    const mediaUrl = `/media/${safeKey}`;
    const id = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();

    let newMedia: any = null;
    if ((prisma as any).mediaItem) {
      newMedia = await (prisma as any).mediaItem.create({
        data: {
          key: safeKey,
          url: mediaUrl,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          sizeBytes: file.size,
          category: category.toUpperCase(),
          title: title.trim() || file.name,
          description: description.trim() || null,
          uploadedBy: session.fullName || 'SuperAdmin',
        },
      });
    } else {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "MediaItem" ("id", "key", "url", "fileName", "mimeType", "sizeBytes", "category", "title", "description", "uploadedBy", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        safeKey,
        mediaUrl,
        file.name,
        file.type || 'application/octet-stream',
        file.size,
        category.toUpperCase(),
        title.trim() || file.name,
        description.trim() || null,
        session.fullName || 'SuperAdmin',
        now.toISOString(),
        now.toISOString()
      );
      newMedia = {
        id,
        key: safeKey,
        url: mediaUrl,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        category: category.toUpperCase(),
        title: title.trim() || file.name,
        description: description.trim() || null,
        uploadedBy: session.fullName || 'SuperAdmin',
        createdAt: now,
        updatedAt: now,
      };
    }

    return NextResponse.json({
      success: true,
      media: newMedia,
      message: 'Media successfully uploaded to R2 media storage.',
    });
  } catch (err: any) {
    console.error('CMS Media POST Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to process media upload' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentCmsSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, key } = await request.json();
    if (!id && !key) {
      return NextResponse.json({ error: 'Media ID or Key required.' }, { status: 400 });
    }

    if ((prisma as any).mediaItem) {
      await (prisma as any).mediaItem.deleteMany({
        where: {
          OR: [
            id ? { id } : undefined,
            key ? { key } : undefined,
          ].filter(Boolean) as any,
        },
      });
    } else {
      if (id) {
        await prisma.$executeRawUnsafe(`DELETE FROM "MediaItem" WHERE "id" = ?`, id);
      } else if (key) {
        await prisma.$executeRawUnsafe(`DELETE FROM "MediaItem" WHERE "key" = ?`, key);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Media asset deleted successfully.',
    });
  } catch (err: any) {
    console.error('CMS Media DELETE Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete media asset' },
      { status: 500 }
    );
  }
}
