import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { INITIAL_CMS_DATA } from '../src/lib/cmsData';

export interface Env {
  DB: any; // D1Database
  ASSETS: { fetch: (req: Request | string) => Promise<Response> };
  MEDIA_BUCKET?: any; // Cloudflare R2
  JWT_SECRET?: string;
  CMS_MASTER_PASSKEY?: string; // optional secret; enables the emergency CMS passkey when set
}

const COOKIE_NAME = 'cambridge_maths_token';
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.zip', '.jpg', '.jpeg', '.png'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function getJwtSecret(env: Env): Uint8Array {
  return new TextEncoder().encode(
    env.JWT_SECRET || 'cambridge_maths_super_secure_jwt_secret_change_in_production_2026'
  );
}

function jsonResponse(data: any, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
}

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';').map((c) => c.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.substring(name.length + 1));
    }
  }
  return null;
}

function makeSetCookie(token: string, maxAge = 60 * 60 * 24 * 7): string {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

const CMS_COOKIE_NAME = 'cambridge_cms_token';
const CMS_MAX_VALUE_LENGTH = 5000;
const CMS_DEFAULTS_BY_KEY = new Map(INITIAL_CMS_DATA.map((d) => [d.key, d]));

// Responses that set several cookies must use separate Set-Cookie headers (comma-joining is invalid).
function jsonWithCookies(data: any, status: number, cookies: string[]): Response {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  for (const c of cookies) headers.append('Set-Cookie', c);
  return new Response(JSON.stringify(data), { status, headers });
}

function isSuperAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const clean = role.trim().toUpperCase();
  return clean === 'SUPERADMIN' || clean === 'SUPER_ADMIN';
}

function makeSetCmsCookie(token: string, maxAge = 60 * 60 * 24): string {
  return `${CMS_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

async function getCurrentCmsUserFromD1(request: Request, env: Env) {
  const token = getCookie(request, CMS_COOKIE_NAME);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(env));
    if (!payload || !payload.userId || !payload.cmsLayer) return null;
    if (!isSuperAdminRole(payload.role as string)) return null;
    return payload;
  } catch {
    return null;
  }
}


async function getCurrentUserFromD1(request: Request, env: Env) {
  const token = getCookie(request, COOKIE_NAME);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(env));
    const userId = payload.userId as string;
    if (!userId) return null;
    const row = await env.DB.prepare(
      'SELECT id, email, fullName, role, phone, phoneVerified, emailVerified, avatarUrl, bio, projectedGrade, studyStreakDays, createdAt FROM User WHERE id = ?'
    )
      .bind(userId)
      .first();
    if (!row) return null;
    return {
      ...row,
      phoneVerified: Boolean(row.phoneVerified),
      emailVerified: Boolean(row.emailVerified),
    };
  } catch {
    return null;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getExt(fileName: string): string {
  const idx = fileName.lastIndexOf('.');
  return idx >= 0 ? fileName.slice(idx).toLowerCase() : '';
}

async function saveFileToD1(env: Env, file: File, prefix: string): Promise<{ fileUrl: string; fileSize: string; ext: string }> {
  const ext = getExt(file.name);
  const safeName = `${prefix}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const bytes = await file.arrayBuffer();
  const base64 = arrayBufferToBase64(bytes);
  const now = new Date().toISOString();

  await env.DB.prepare(
    'INSERT OR REPLACE INTO FileStorage (fileName, mimeType, sizeBytes, dataBase64, createdAt) VALUES (?, ?, ?, ?, ?)'
  )
    .bind(safeName, file.type || 'application/octet-stream', file.size, base64, now)
    .run();

  const fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  return {
    fileUrl: `/uploads/${safeName}`,
    fileSize,
    ext: ext.replace('.', '').toUpperCase() || 'FILE',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // 1. Serve dynamically uploaded files from D1 FileStorage if requested under /uploads/
    if (request.method === 'GET' && pathname.startsWith('/uploads/')) {
      const fileName = decodeURIComponent(pathname.replace('/uploads/', ''));
      try {
        const stored = await env.DB.prepare(
          'SELECT fileName, mimeType, dataBase64 FROM FileStorage WHERE fileName = ?'
        )
          .bind(fileName)
          .first();

        if (stored && stored.dataBase64) {
          const body = base64ToUint8Array(stored.dataBase64 as string);
          return new Response(body as unknown as BodyInit, {
            status: 200,
            headers: {
              'Content-Type': (stored.mimeType as string) || 'application/octet-stream',
              'Content-Disposition': `attachment; filename="${stored.fileName}"`,
            },
          });
        }
      } catch (e) {
        console.error('Error reading FileStorage:', e);
      }
      // Fallback to static asset in /public/uploads/
      return env.ASSETS.fetch(request);
    }

    // 1b. Serve media assets from Cloudflare R2 if requested under /media/
    if (request.method === 'GET' && pathname.startsWith('/media/')) {
      const mediaKey = decodeURIComponent(pathname.replace('/media/', ''));
      if (env.MEDIA_BUCKET) {
        try {
          const object = await env.MEDIA_BUCKET.get(mediaKey);
          if (object) {
            const headers = new Headers();
            object.writeHttpMetadata(headers);
            headers.set('etag', object.httpEtag);
            headers.set('Cache-Control', 'public, max-age=31536000, immutable');
            return new Response(object.body, { headers });
          }
        } catch (e) {
          console.error('Error fetching from R2:', e);
        }
      }
      return env.ASSETS.fetch(request);
    }

    // 2. Handle /api/* routes via D1
    if (pathname.startsWith('/api/')) {
      try {
        // --- POST /api/cms/login ---
        if (pathname === '/api/cms/login' && request.method === 'POST') {
          const body = (await request.json().catch(() => ({}))) as any;
          const { email, password, masterPasskey } = body;

          let superAdminUser: any = null;

          // Emergency passkey is only enabled when CMS_MASTER_PASSKEY is configured as a secret.
          if (
            env.CMS_MASTER_PASSKEY &&
            typeof masterPasskey === 'string' &&
            masterPasskey.trim() === env.CMS_MASTER_PASSKEY
          ) {
            superAdminUser = await env.DB.prepare(
              "SELECT * FROM User WHERE role IN ('SuperAdmin', 'SUPERADMIN') ORDER BY createdAt ASC LIMIT 1"
            ).first();
            if (!superAdminUser) {
              return jsonResponse({ error: 'No SuperAdmin account exists in the database.' }, 404);
            }
          } else {
            if (!email || !password) {
              return jsonResponse({ error: 'Email and password are required for SuperAdmin CMS access.' }, 400);
            }
            const user = await env.DB.prepare('SELECT * FROM User WHERE email = ?')
              .bind(String(email).trim().toLowerCase())
              .first();

            // Same message for unknown user / wrong password to avoid account enumeration.
            const isMatch = user ? await bcrypt.compare(password, user.passwordHash as string) : false;
            if (!user || !isMatch) {
              return jsonResponse({ error: 'Invalid SuperAdmin credentials.' }, 401);
            }
            if (!isSuperAdminRole(user.role as string)) {
              return jsonResponse({ error: 'This account is not authorised for the CMS layer.' }, 403);
            }
            superAdminUser = user;
          }

          const cmsToken = await new SignJWT({
            userId: superAdminUser.id,
            email: superAdminUser.email,
            fullName: superAdminUser.fullName,
            role: 'SuperAdmin',
            cmsLayer: true,
            authenticatedAt: new Date().toISOString(),
          })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(getJwtSecret(env));

          const stdToken = await new SignJWT({
            userId: superAdminUser.id,
            email: superAdminUser.email,
            fullName: superAdminUser.fullName,
            role: 'SuperAdmin',
          })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(getJwtSecret(env));

          return jsonWithCookies(
            {
              success: true,
              message: 'SuperAdmin authenticated to CMS layer successfully.',
              user: {
                id: superAdminUser.id,
                email: superAdminUser.email,
                fullName: superAdminUser.fullName,
                role: 'SuperAdmin',
              },
            },
            200,
            [makeSetCmsCookie(cmsToken), makeSetCookie(stdToken)]
          );
        }

        // --- GET /api/cms/session ---
        if (pathname === '/api/cms/session' && request.method === 'GET') {
          const cmsSession = await getCurrentCmsUserFromD1(request, env);
          if (!cmsSession) {
            return jsonResponse({ authenticated: false, error: 'Unauthorized CMS session. SuperAdmin login required.' }, 401);
          }
          return jsonResponse({
            authenticated: true,
            user: {
              id: cmsSession.userId,
              email: cmsSession.email,
              fullName: cmsSession.fullName,
              role: 'SuperAdmin',
            },
          });
        }

        // --- POST /api/cms/logout ---
        if (pathname === '/api/cms/logout' && request.method === 'POST') {
          return jsonWithCookies({ success: true, message: 'SuperAdmin CMS session ended.' }, 200, [
            makeSetCmsCookie('', 0),
          ]);
        }

        // --- GET /api/cms/content ---
        if (pathname === '/api/cms/content' && request.method === 'GET') {
          const { results: rows } = await env.DB.prepare(
            'SELECT * FROM CmsContent ORDER BY category ASC, section ASC, key ASC'
          )
            .all()
            .catch(() => ({ results: [] as any[] }));

          // Merge DB rows over the canonical defaults so newly added keys always appear.
          const merged = new Map<string, any>();
          for (const def of INITIAL_CMS_DATA) merged.set(def.key, { ...def });
          for (const row of rows || []) {
            const base = merged.get(row.key);
            merged.set(row.key, base ? { ...base, ...row } : row);
          }
          const items = Array.from(merged.values());
          const contentMap: Record<string, string> = {};
          for (const it of items) contentMap[it.key] = it.value;

          return jsonResponse({ success: true, items, contentMap, count: items.length });
        }

        // --- POST /api/cms/content ---
        if (pathname === '/api/cms/content' && request.method === 'POST') {
          const cmsSession = await getCurrentCmsUserFromD1(request, env);
          if (!cmsSession) {
            return jsonResponse({ error: 'Unauthorized: Only SuperAdmin can modify website contents.' }, 401);
          }

          const body = (await request.json().catch(() => ({}))) as any;
          const { updates, items, key, value } = body;
          const itemMap = new Map<string, string>();

          const processItemArray = (arr: any[]) => {
            for (const it of arr) {
              if (it && typeof it.key === 'string' && typeof it.value === 'string') {
                itemMap.set(it.key, it.value);
              }
            }
          };

          if (key && typeof value === 'string') {
            itemMap.set(key, value);
          }

          if (Array.isArray(updates)) {
            processItemArray(updates);
          } else if (updates && typeof updates === 'object') {
            for (const [k, v] of Object.entries(updates)) {
              if (typeof v === 'string') itemMap.set(k, v);
            }
          }

          if (Array.isArray(items)) {
            processItemArray(items);
          }

          const itemsToUpdate = Array.from(itemMap.entries()).map(([k, v]) => ({ key: k, value: v }));

          if (itemsToUpdate.length === 0) {
            return jsonResponse({ error: 'No valid content updates provided.' }, 400);
          }

          const now = new Date().toISOString();
          const updatedBy = (cmsSession.fullName as string) || 'SuperAdmin';
          let updatedCount = 0;
          const rejected: string[] = [];

          for (const it of itemsToUpdate) {
            const def = CMS_DEFAULTS_BY_KEY.get(it.key);
            if (!def || it.value.length > CMS_MAX_VALUE_LENGTH) {
              rejected.push(it.key);
              continue;
            }
            await env.DB.prepare(
              `INSERT INTO CmsContent (id, key, section, category, label, value, type, description, updatedAt, updatedBy)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(key) DO UPDATE SET
                 value = excluded.value,
                 updatedAt = excluded.updatedAt,
                 updatedBy = excluded.updatedBy`
            )
              .bind(def.id, def.key, def.section, def.category, def.label, it.value, def.type, def.description || '', now, updatedBy)
              .run();
            updatedCount++;
          }

          return jsonResponse({
            success: true,
            message: `Synchronized ${updatedCount} content field${updatedCount === 1 ? '' : 's'} to the remote D1 database.`,
            updatedCount,
            rejected,
            updatedAt: now,
            updatedBy,
          });
        }

        // --- POST /api/cms/reset ---
        if (pathname === '/api/cms/reset' && request.method === 'POST') {
          const cmsSession = await getCurrentCmsUserFromD1(request, env);
          if (!cmsSession) {
            return jsonResponse({ error: 'Unauthorized: Only SuperAdmin can reset CMS content.' }, 401);
          }
          const body = (await request.json().catch(() => ({}))) as any;
          const targets = body?.section
            ? INITIAL_CMS_DATA.filter((i) => i.section === body.section)
            : INITIAL_CMS_DATA;
          const now = new Date().toISOString();
          for (const def of targets) {
            await env.DB.prepare(
              `INSERT INTO CmsContent (id, key, section, category, label, value, type, description, updatedAt, updatedBy)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(key) DO UPDATE SET
                 value = excluded.value,
                 updatedAt = excluded.updatedAt,
                 updatedBy = excluded.updatedBy`
            )
              .bind(def.id, def.key, def.section, def.category, def.label, def.value, def.type, def.description || '', now, 'SuperAdmin Default Reset')
              .run();
          }
          return jsonResponse({
            success: true,
            message: `Reset ${targets.length} content fields to the standard defaults.`,
            resetCount: targets.length,
          });
        }

        // --- GET /api/cms/media ---
        if (pathname === '/api/cms/media' && request.method === 'GET') {
          const cmsSession = await getCurrentCmsUserFromD1(request, env);
          if (!cmsSession) return jsonResponse({ error: 'Unauthorized CMS session' }, 401);

          const { results: items } = await env.DB.prepare(
            'SELECT * FROM MediaItem ORDER BY createdAt DESC'
          ).all().catch(() => ({ results: [] }));

          return jsonResponse({
            success: true,
            items: items || [],
            count: (items || []).length,
            storageBackend: 'Cloudflare R2 (cambridge-maths-media)',
          });
        }

        // --- POST /api/cms/media ---
        if (pathname === '/api/cms/media' && request.method === 'POST') {
          const cmsSession = await getCurrentCmsUserFromD1(request, env);
          if (!cmsSession) return jsonResponse({ error: 'Unauthorized CMS session' }, 401);

          const formData = await request.formData();
          const file = formData.get('file') as File | null;
          const category = (formData.get('category') as string) || 'GENERAL';
          const title = (formData.get('title') as string) || '';
          const description = (formData.get('description') as string) || '';

          if (!file) return jsonResponse({ error: 'No media file provided.' }, 400);

          const cleanBase = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const safeKey = `media_${Date.now()}_${cleanBase}`;
          const bytes = await file.arrayBuffer();

          if (env.MEDIA_BUCKET) {
            await env.MEDIA_BUCKET.put(safeKey, bytes, {
              httpMetadata: {
                contentType: file.type || 'application/octet-stream',
              },
            });
          }

          const mediaUrl = `/media/${safeKey}`;
          const id = uid('med');
          const now = new Date().toISOString();

          await env.DB.prepare(
            'INSERT INTO MediaItem (id, key, url, fileName, mimeType, sizeBytes, category, title, description, uploadedBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          )
            .bind(
              id,
              safeKey,
              mediaUrl,
              file.name,
              file.type || 'application/octet-stream',
              file.size,
              category.toUpperCase(),
              title.trim() || file.name,
              description.trim() || null,
              cmsSession.fullName || 'SuperAdmin',
              now,
              now
            )
            .run();

          return jsonResponse({
            success: true,
            message: 'Media successfully uploaded to R2 media storage.',
            media: {
              id,
              key: safeKey,
              url: mediaUrl,
              fileName: file.name,
              mimeType: file.type || 'application/octet-stream',
              sizeBytes: file.size,
              category: category.toUpperCase(),
              title: title.trim() || file.name,
            },
          });
        }

        // --- DELETE /api/cms/media ---
        if (pathname === '/api/cms/media' && request.method === 'DELETE') {
          const cmsSession = await getCurrentCmsUserFromD1(request, env);
          if (!cmsSession) return jsonResponse({ error: 'Unauthorized CMS session' }, 401);

          const { id, key } = (await request.json().catch(() => ({}))) as any;
          if (!id && !key) return jsonResponse({ error: 'Media ID or Key required.' }, 400);

          if (key && env.MEDIA_BUCKET) {
            await env.MEDIA_BUCKET.delete(key).catch(() => {});
          }

          await env.DB.prepare(
            'DELETE FROM MediaItem WHERE id = ? OR key = ?'
          )
            .bind(id || '', key || '')
            .run();

          return jsonResponse({ success: true, message: 'Media asset deleted successfully.' });
        }

        // --- GET /api/portal ---
        if (pathname === '/api/portal' && request.method === 'GET') {
          const view = searchParams.get('view');

          if (view === 'public') {
            const [{ results: subjects }, { results: cmsRows }] = await Promise.all([
              env.DB.prepare('SELECT * FROM Subject ORDER BY orderIndex ASC').all(),
              env.DB.prepare('SELECT key, value FROM CmsContent').all().catch(() => ({ results: [] })),
            ]);

            const contentMap: Record<string, string> = {};
            if (Array.isArray(cmsRows)) {
              for (const r of cmsRows) {
                contentMap[r.key] = r.value;
              }
            }

            return jsonResponse({ subjects, contentMap });
          }


          const user = await getCurrentUserFromD1(request, env);
          if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

          if (view === 'student-layout') {
            const countRow = await env.DB.prepare(
              'SELECT COUNT(*) as cnt FROM Notification WHERE userId = ? AND isRead = 0'
            )
              .bind(user.id)
              .first();
            return jsonResponse({ user, unreadCount: Number(countRow?.cnt || 0) });
          }

          if (view === 'student-home' || view === 'student-modules') {
            const [
              { results: rawEnrollments },
              { results: allSubjects },
              { results: allLessons },
              { results: allMaterials },
              { results: rawAssignments },
              { results: userSubmissions },
            ] = await Promise.all([
              env.DB.prepare("SELECT * FROM StudentEnrollment WHERE studentId = ? AND status = 'ACTIVE'")
                .bind(user.id)
                .all(),
              env.DB.prepare('SELECT * FROM Subject ORDER BY orderIndex ASC').all(),
              env.DB.prepare('SELECT * FROM Lesson ORDER BY orderIndex ASC').all(),
              env.DB.prepare('SELECT * FROM StudyMaterial ORDER BY createdAt DESC').all(),
              env.DB.prepare('SELECT * FROM Assignment ORDER BY dueDate ASC').all(),
              env.DB.prepare('SELECT * FROM Submission WHERE studentId = ? ORDER BY gradedAt DESC')
                .bind(user.id)
                .all(),
            ]);

            const subjectMap = new Map<string, any>();
            for (const s of allSubjects) {
              subjectMap.set(s.id, {
                ...s,
                isAvailable: Boolean(s.isAvailable),
                lessons: allLessons.filter((l: any) => l.subjectId === s.id),
                materials: allMaterials.filter((m: any) => m.subjectId === s.id),
                assignments: rawAssignments
                  .filter((a: any) => a.subjectId === s.id)
                  .map((a: any) => ({
                    ...a,
                    allowLateSubmissions: Boolean(a.allowLateSubmissions),
                    allowResubmissions: Boolean(a.allowResubmissions),
                    subject: s,
                    submissions: userSubmissions
                      .filter((sub: any) => sub.assignmentId === a.id)
                      .map((sub: any) => ({ ...sub, isPublished: Boolean(sub.isPublished) })),
                  })),
              });
            }

            const enrollments = rawEnrollments
              .map((e: any) => ({
                ...e,
                subject: subjectMap.get(e.subjectId),
              }))
              .filter((e: any) => Boolean(e.subject));

            const enrolledIds = new Set(rawEnrollments.map((e: any) => e.subjectId));

            if (view === 'student-modules') {
              const otherSubjects = allSubjects.filter(
                (s: any) => !enrolledIds.has(s.id) && Boolean(s.isAvailable)
              );
              return jsonResponse({ user, enrollments, otherSubjects });
            }

            const { results: attendanceRecords } = await env.DB.prepare(
              'SELECT * FROM AttendanceRecord WHERE studentId = ?'
            )
              .bind(user.id)
              .all();

            const enrolledAssignments = rawAssignments
              .filter((a: any) => enrolledIds.has(a.subjectId))
              .map((a: any) => ({
                ...a,
                subject: subjectMap.get(a.subjectId),
                submissions: userSubmissions
                  .filter((sub: any) => sub.assignmentId === a.id)
                  .map((sub: any) => ({ ...sub, isPublished: Boolean(sub.isPublished) })),
              }));

            const asgMap = new Map<string, any>(rawAssignments.map((a: any) => [a.id, a]));
            const recentGrades = userSubmissions
              .filter((sub: any) => Boolean(sub.isPublished) && sub.gradeScore !== null)
              .slice(0, 3)
              .map((sub: any) => {
                const asg = asgMap.get(sub.assignmentId);
                return {
                  ...sub,
                  isPublished: true,
                  assignment: asg
                    ? { ...asg, subject: subjectMap.get(asg.subjectId) }
                    : null,
                };
              });

            const recentMaterials = allMaterials
              .filter((m: any) => enrolledIds.has(m.subjectId) && Boolean(m.isPublicToClass))
              .slice(0, 4)
              .map((m: any) => ({
                ...m,
                subject: subjectMap.get(m.subjectId),
              }));

            const { results: allAnnouncements } = await env.DB.prepare(
              'SELECT * FROM Announcement ORDER BY publishedAt DESC'
            ).all();
            const recentAnnouncements = allAnnouncements
              .filter((a: any) => !a.subjectId || enrolledIds.has(a.subjectId))
              .slice(0, 3)
              .map((a: any) => ({
                ...a,
                subject: a.subjectId ? subjectMap.get(a.subjectId) : null,
              }));

            return jsonResponse({
              user,
              enrollments,
              attendanceRecords,
              allAssignments: enrolledAssignments,
              recentGrades,
              recentMaterials,
              recentAnnouncements,
            });
          }

          if (view === 'student-module-detail') {
            const id = searchParams.get('id');
            if (!id) return jsonResponse({ error: 'Missing subject ID' }, 400);

            const subject = await env.DB.prepare('SELECT * FROM Subject WHERE id = ?')
              .bind(id)
              .first();
            if (!subject) return jsonResponse({ error: 'Not found' }, 404);

            const [
              { results: lessons },
              { results: materials },
              { results: assignments },
              { results: announcements },
              { results: enrollments },
              { results: userSubmissions },
            ] = await Promise.all([
              env.DB.prepare('SELECT * FROM Lesson WHERE subjectId = ? ORDER BY orderIndex ASC')
                .bind(id)
                .all(),
              env.DB.prepare('SELECT * FROM StudyMaterial WHERE subjectId = ? ORDER BY createdAt DESC')
                .bind(id)
                .all(),
              env.DB.prepare('SELECT * FROM Assignment WHERE subjectId = ? ORDER BY dueDate ASC')
                .bind(id)
                .all(),
              env.DB.prepare('SELECT * FROM Announcement WHERE subjectId = ? ORDER BY publishedAt DESC LIMIT 5')
                .bind(id)
                .all(),
              env.DB.prepare('SELECT * FROM StudentEnrollment WHERE subjectId = ? AND studentId = ?')
                .bind(id, user.id)
                .all(),
              env.DB.prepare('SELECT * FROM Submission WHERE studentId = ?')
                .bind(user.id)
                .all(),
            ]);

            const isEnrolled =
              enrollments.length > 0 || ['TEACHER', 'ADMIN', 'SuperAdmin'].includes(user.role as string);
            if (!isEnrolled) return jsonResponse({ error: 'Forbidden' }, 403);

            return jsonResponse({
              subject: {
                ...subject,
                lessons,
                materials,
                assignments: assignments.map((a: any) => ({
                  ...a,
                  submissions: userSubmissions.filter((s: any) => s.assignmentId === a.id),
                })),
                announcements,
                enrollments,
              },
              userRole: user.role,
            });
          }

          if (view === 'student-quest') {
            const [
              { results: rawEnrollments },
              { results: allSubjects },
              { results: rawAssignments },
              { results: userSubmissions },
              { results: allVersions },
            ] = await Promise.all([
              env.DB.prepare("SELECT * FROM StudentEnrollment WHERE studentId = ? AND status = 'ACTIVE'")
                .bind(user.id)
                .all(),
              env.DB.prepare('SELECT * FROM Subject').all(),
              env.DB.prepare('SELECT * FROM Assignment ORDER BY dueDate ASC').all(),
              env.DB.prepare('SELECT * FROM Submission WHERE studentId = ?').bind(user.id).all(),
              env.DB.prepare('SELECT * FROM SubmissionVersion ORDER BY versionNumber DESC').all(),
            ]);

            const enrolledIds = new Set(rawEnrollments.map((e: any) => e.subjectId));
            const subjectMap = new Map(allSubjects.map((s: any) => [s.id, s]));

            const assignments = rawAssignments
              .filter((a: any) => enrolledIds.has(a.subjectId))
              .map((a: any) => ({
                ...a,
                allowLateSubmissions: Boolean(a.allowLateSubmissions),
                allowResubmissions: Boolean(a.allowResubmissions),
                subject: subjectMap.get(a.subjectId),
                submissions: userSubmissions
                  .filter((s: any) => s.assignmentId === a.id)
                  .map((s: any) => ({
                    ...s,
                    isPublished: Boolean(s.isPublished),
                    versions: allVersions.filter((v: any) => v.submissionId === s.id),
                  })),
              }));

            return jsonResponse({ user, assignments });
          }

          if (view === 'student-heads-up') {
            const [
              { results: rawEnrollments },
              { results: allSubjects },
              { results: rawAnnouncements },
              { results: rawNotifications },
            ] = await Promise.all([
              env.DB.prepare('SELECT * FROM StudentEnrollment WHERE studentId = ?')
                .bind(user.id)
                .all(),
              env.DB.prepare('SELECT * FROM Subject').all(),
              env.DB.prepare('SELECT * FROM Announcement ORDER BY publishedAt DESC').all(),
              env.DB.prepare('SELECT * FROM Notification WHERE userId = ? ORDER BY createdAt DESC')
                .bind(user.id)
                .all(),
            ]);

            const enrolledIds = new Set(rawEnrollments.map((e: any) => e.subjectId));
            const subjectMap = new Map(allSubjects.map((s: any) => [s.id, s]));

            const announcements = rawAnnouncements
              .filter((a: any) => !a.subjectId || enrolledIds.has(a.subjectId))
              .map((a: any) => ({
                ...a,
                subject: a.subjectId ? subjectMap.get(a.subjectId) : null,
              }));

            const notifications = rawNotifications.map((n: any) => ({
              ...n,
              isRead: Boolean(n.isRead),
            }));

            return jsonResponse({ announcements, notifications });
          }

          if (view === 'student-profile') {
            const [
              { results: rawEnrollments },
              { results: allSubjects },
              { results: attendanceRecords },
            ] = await Promise.all([
              env.DB.prepare('SELECT * FROM StudentEnrollment WHERE studentId = ?')
                .bind(user.id)
                .all(),
              env.DB.prepare('SELECT * FROM Subject').all(),
              env.DB.prepare('SELECT * FROM AttendanceRecord WHERE studentId = ?')
                .bind(user.id)
                .all(),
            ]);
            const subjectMap = new Map(allSubjects.map((s: any) => [s.id, s]));
            const enrollments = rawEnrollments.map((e: any) => ({
              ...e,
              subject: subjectMap.get(e.subjectId),
            }));
            return jsonResponse({ user, enrollments, attendanceRecords });
          }

          // --- ADMIN VIEWS ---
          if (!['TEACHER', 'ADMIN', 'SuperAdmin'].includes(user.role as string)) {
            return jsonResponse({ error: 'Forbidden' }, 403);
          }

          if (view === 'admin-layout') {
            return jsonResponse({ user });
          }

          if (view === 'admin-dashboard') {
            const [
              studentsCnt,
              subjectsCnt,
              assignmentsCnt,
              pendingCnt,
              inquiriesCnt,
              { results: rawSubmissions },
              { results: allUsers },
              { results: allAssignments },
              { results: allSubjects },
              { results: allVersions },
            ] = await Promise.all([
              env.DB.prepare("SELECT COUNT(*) as c FROM User WHERE role = 'STUDENT'").first(),
              env.DB.prepare('SELECT COUNT(*) as c FROM Subject').first(),
              env.DB.prepare('SELECT COUNT(*) as c FROM Assignment').first(),
              env.DB.prepare("SELECT COUNT(*) as c FROM Submission WHERE status IN ('SUBMITTED', 'LATE')").first(),
              env.DB.prepare("SELECT COUNT(*) as c FROM ContactInquiry WHERE status = 'NEW'").first(),
              env.DB.prepare("SELECT * FROM Submission WHERE status IN ('SUBMITTED', 'LATE') ORDER BY submittedAt DESC LIMIT 5").all(),
              env.DB.prepare('SELECT id, fullName, email FROM User').all(),
              env.DB.prepare('SELECT * FROM Assignment').all(),
              env.DB.prepare('SELECT * FROM Subject').all(),
              env.DB.prepare('SELECT * FROM SubmissionVersion ORDER BY versionNumber DESC').all(),
            ]);

            const userMap = new Map(allUsers.map((u: any) => [u.id, u]));
            const subjectMap = new Map(allSubjects.map((s: any) => [s.id, s]));
            const asgMap = new Map(
              allAssignments.map((a: any) => [
                a.id,
                { ...a, subject: subjectMap.get(a.subjectId) },
              ])
            );

            const recentSubmissions = rawSubmissions.map((sub: any) => ({
              ...sub,
              isPublished: Boolean(sub.isPublished),
              student: userMap.get(sub.studentId),
              assignment: asgMap.get(sub.assignmentId),
              versions: allVersions.filter((v: any) => v.submissionId === sub.id).slice(0, 1),
            }));

            return jsonResponse({
              user,
              totalStudents: Number(studentsCnt?.c || 0),
              totalSubjects: Number(subjectsCnt?.c || 0),
              totalAssignments: Number(assignmentsCnt?.c || 0),
              pendingSubmissionsCount: Number(pendingCnt?.c || 0),
              totalInquiries: Number(inquiriesCnt?.c || 0),
              recentSubmissions,
            });
          }

          if (view === 'admin-students') {
            const [
              { results: rawStudents },
              { results: allSubjects },
              { results: allEnrollments },
              { results: allAttendance },
            ] = await Promise.all([
              env.DB.prepare("SELECT * FROM User WHERE role = 'STUDENT' ORDER BY fullName ASC").all(),
              env.DB.prepare('SELECT * FROM Subject ORDER BY orderIndex ASC').all(),
              env.DB.prepare('SELECT * FROM StudentEnrollment').all(),
              env.DB.prepare('SELECT * FROM AttendanceRecord').all(),
            ]);

            const subjectMap = new Map(allSubjects.map((s: any) => [s.id, s]));
            const students = rawStudents.map((st: any) => ({
              ...st,
              enrollments: allEnrollments
                .filter((e: any) => e.studentId === st.id)
                .map((e: any) => ({ ...e, subject: subjectMap.get(e.subjectId) })),
              attendance: allAttendance.filter((a: any) => a.studentId === st.id),
            }));

            return jsonResponse({ students, allSubjects });
          }

          if (view === 'admin-courses') {
            const [{ results: rawSubjects }, { results: allMaterials }] = await Promise.all([
              env.DB.prepare('SELECT * FROM Subject ORDER BY orderIndex ASC').all(),
              env.DB.prepare('SELECT * FROM StudyMaterial ORDER BY createdAt DESC').all(),
            ]);
            const subjects = rawSubjects.map((s: any) => ({
              ...s,
              materials: allMaterials.filter((m: any) => m.subjectId === s.id),
            }));
            return jsonResponse({ subjects });
          }

          if (view === 'admin-assignments') {
            const [
              { results: rawAssignments },
              { results: allSubjects },
              { results: rawSubmissions },
              { results: allUsers },
              { results: allVersions },
            ] = await Promise.all([
              env.DB.prepare('SELECT * FROM Assignment ORDER BY createdAt DESC').all(),
              env.DB.prepare('SELECT * FROM Subject ORDER BY orderIndex ASC').all(),
              env.DB.prepare('SELECT * FROM Submission ORDER BY submittedAt DESC').all(),
              env.DB.prepare('SELECT id, fullName, email FROM User').all(),
              env.DB.prepare('SELECT * FROM SubmissionVersion ORDER BY versionNumber DESC').all(),
            ]);

            const subjectMap = new Map(allSubjects.map((s: any) => [s.id, s]));
            const userMap = new Map(allUsers.map((u: any) => [u.id, u]));
            const assignments = rawAssignments.map((a: any) => ({
              ...a,
              subject: subjectMap.get(a.subjectId),
            }));
            const asgMap = new Map(assignments.map((a: any) => [a.id, a]));

            const allSubmissions = rawSubmissions.map((sub: any) => ({
              ...sub,
              isPublished: Boolean(sub.isPublished),
              student: userMap.get(sub.studentId),
              assignment: asgMap.get(sub.assignmentId),
              versions: allVersions.filter((v: any) => v.submissionId === sub.id),
            }));

            return jsonResponse({ assignments, allSubjects, allSubmissions });
          }

          if (view === 'admin-attendance') {
            const [
              { results: rawSubjects },
              { results: allEnrollments },
              { results: allUsers },
              { results: allAttendance },
            ] = await Promise.all([
              env.DB.prepare('SELECT * FROM Subject ORDER BY orderIndex ASC').all(),
              env.DB.prepare('SELECT * FROM StudentEnrollment').all(),
              env.DB.prepare('SELECT id, fullName, email FROM User').all(),
              env.DB.prepare('SELECT * FROM AttendanceRecord ORDER BY classDate DESC LIMIT 20').all(),
            ]);

            const userMap = new Map(allUsers.map((u: any) => [u.id, u]));
            const subjects = rawSubjects.map((s: any) => ({
              ...s,
              enrollments: allEnrollments
                .filter((e: any) => e.subjectId === s.id)
                .map((e: any) => ({ ...e, student: userMap.get(e.studentId) }))
                .filter((e: any) => Boolean(e.student)),
            }));

            return jsonResponse({ subjects, allAttendance });
          }

          if (view === 'admin-announcements') {
            const [{ results: rawAnnouncements }, { results: subjects }] = await Promise.all([
              env.DB.prepare('SELECT * FROM Announcement ORDER BY publishedAt DESC').all(),
              env.DB.prepare('SELECT * FROM Subject ORDER BY orderIndex ASC').all(),
            ]);
            const subjectMap = new Map(subjects.map((s: any) => [s.id, s]));
            const announcements = rawAnnouncements.map((a: any) => ({
              ...a,
              subject: a.subjectId ? subjectMap.get(a.subjectId) : null,
            }));
            return jsonResponse({ announcements, subjects });
          }

          if (view === 'admin-inquiries') {
            const { results: inquiries } = await env.DB.prepare(
              'SELECT * FROM ContactInquiry ORDER BY createdAt DESC'
            ).all();
            return jsonResponse({ inquiries });
          }

          return jsonResponse({ error: 'Unknown view' }, 400);
        }

        // --- POST /api/contact ---
        if (pathname === '/api/contact' && request.method === 'POST') {
          const { name, email, phone, subjectOfInterest, message } = (await request.json()) as any;
          if (!name || !email || !message) {
            return jsonResponse({ error: 'Name, email, and message are required fields.' }, 400);
          }
          const id = uid('inq');
          const now = new Date().toISOString();
          await env.DB.prepare(
            'INSERT INTO ContactInquiry (id, name, email, phone, subjectOfInterest, message, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
          )
            .bind(
              id,
              name.trim(),
              email.trim().toLowerCase(),
              phone ? phone.trim() : null,
              subjectOfInterest || 'General Inquiry',
              message.trim(),
              'NEW',
              now
            )
            .run();

          return jsonResponse(
            {
              success: true,
              message: 'Inquiry received successfully. Our team will contact you soon.',
              inquiryId: id,
            },
            201
          );
        }

        // --- POST /api/auth/login ---
        if (pathname === '/api/auth/login' && request.method === 'POST') {
          const { email, password } = (await request.json()) as any;
          if (!email || !password) {
            return jsonResponse({ error: 'Email and password are required.' }, 400);
          }
          const normalizedEmail = email.trim().toLowerCase();
          const user = await env.DB.prepare('SELECT * FROM User WHERE email = ?')
            .bind(normalizedEmail)
            .first();

          if (!user) {
            return jsonResponse({ error: 'Invalid email address or password.' }, 401);
          }

          const isMatch = await bcrypt.compare(password, user.passwordHash as string);
          if (!isMatch) {
            return jsonResponse({ error: 'Invalid email address or password.' }, 401);
          }

          const isSuper = isSuperAdminRole(user.role as string);
          const isTeacher = ['TEACHER', 'ADMIN', 'SuperAdmin'].includes(user.role as string);
          const redirectUrl = isSuper ? '/cms' : isTeacher ? '/admin' : '/student/home';

          const token = await new SignJWT({
            userId: user.id,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
          })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(getJwtSecret(env));

          const cookies: string[] = [makeSetCookie(token)];

          if (isSuper) {
            const cmsToken = await new SignJWT({
              userId: user.id,
              email: user.email,
              fullName: user.fullName,
              role: 'SuperAdmin',
              cmsLayer: true,
              authenticatedAt: new Date().toISOString(),
            })
              .setProtectedHeader({ alg: 'HS256' })
              .setIssuedAt()
              .setExpirationTime('24h')
              .sign(getJwtSecret(env));

            cookies.push(makeSetCmsCookie(cmsToken));
          }

          return jsonWithCookies(
            {
              success: true,
              user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
              },
              redirectUrl,
            },
            200,
            cookies
          );
        }


        // --- POST /api/auth/register ---
        if (pathname === '/api/auth/register' && request.method === 'POST') {
          const { fullName, email, phone, password, confirmPassword } = (await request.json()) as any;
          if (!fullName || !email || !password) {
            return jsonResponse({ error: 'Full name, email, and password are required.' }, 400);
          }
          if (password !== confirmPassword) {
            return jsonResponse({ error: 'Passwords do not match.' }, 400);
          }
          if (password.length < 8) {
            return jsonResponse({ error: 'Password must be at least 8 characters long.' }, 400);
          }

          const normalizedEmail = email.trim().toLowerCase();
          const existing = await env.DB.prepare('SELECT id FROM User WHERE email = ?')
            .bind(normalizedEmail)
            .first();
          if (existing) {
            return jsonResponse({ error: 'An account with this email address already exists.' }, 409);
          }

          const salt = await bcrypt.genSalt(10);
          const passwordHash = await bcrypt.hash(password, salt);
          const userId = uid('usr');
          const now = new Date().toISOString();

          await env.DB.prepare(
            'INSERT INTO User (id, email, passwordHash, fullName, phone, phoneVerified, emailVerified, role, projectedGrade, studyStreakDays, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 0, 1, ?, ?, 1, ?, ?)'
          )
            .bind(
              userId,
              normalizedEmail,
              passwordHash,
              fullName.trim(),
              phone ? phone.trim() : null,
              'STUDENT',
              'A',
              now,
              now
            )
            .run();

          const mathSubject = await env.DB.prepare("SELECT id FROM Subject WHERE code = 'MATH-4024'").first();
          if (mathSubject?.id) {
            await env.DB.prepare(
              'INSERT INTO StudentEnrollment (id, studentId, subjectId, status, enrolledAt) VALUES (?, ?, ?, ?, ?)'
            )
              .bind(uid('enr'), userId, mathSubject.id, 'ACTIVE', now)
              .run();

            await env.DB.prepare(
              'INSERT INTO Notification (id, userId, title, message, linkUrl, type, isRead, createdAt) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
            )
              .bind(
                uid('not'),
                userId,
                'Welcome to the Student Portal',
                'Your account is active. You have been enrolled in Mathematics (4024). Explore your Debrief and Study Drops.',
                '/student/modules',
                'SYSTEM',
                now
              )
              .run();
          }

          const token = await new SignJWT({
            userId,
            email: normalizedEmail,
            role: 'STUDENT',
            fullName: fullName.trim(),
          })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(getJwtSecret(env));

          return jsonResponse(
            {
              success: true,
              user: { id: userId, fullName: fullName.trim(), email: normalizedEmail, role: 'STUDENT' },
              redirectUrl: '/student/home',
            },
            201,
            { 'Set-Cookie': makeSetCookie(token) }
          );
        }

        // --- POST /api/auth/logout ---
        if (pathname === '/api/auth/logout' && request.method === 'POST') {
          return jsonResponse(
            { success: true, message: 'Logged out successfully.' },
            200,
            { 'Set-Cookie': `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` }
          );
        }

        // --- GET /api/auth/me ---
        if (pathname === '/api/auth/me' && request.method === 'GET') {
          const user = await getCurrentUserFromD1(request, env);
          if (!user) return jsonResponse({ authenticated: false, user: null }, 401);
          return jsonResponse({ authenticated: true, user });
        }

        // --- POST /api/student/upload ---
        if (pathname === '/api/student/upload' && request.method === 'POST') {
          const user = await getCurrentUserFromD1(request, env);
          if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

          const formData = await request.formData();
          const file = formData.get('file') as File | null;
          const driveUrl = (formData.get('driveUrl') as string) || '';
          const subjectId = formData.get('subjectId') as string;
          const title = formData.get('title') as string;
          const topic = (formData.get('topic') as string) || 'General Work';
          const description = (formData.get('description') as string) || '';

          if ((!file && !driveUrl) || !subjectId || !title) {
            return jsonResponse({ error: 'File or Google Drive link, subject, and title are required.' }, 400);
          }

          let fileType = 'GDRIVE';
          let fileSize = 'Drive Link';
          let fileUrl = driveUrl.trim();

          if (file && file.size > 0) {
            if (file.size > MAX_FILE_SIZE) {
              return jsonResponse({ error: 'File size exceeds the 15 MB limit.' }, 400);
            }
            const ext = getExt(file.name);
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
              return jsonResponse({ error: `File format ${ext} is not supported.` }, 400);
            }
            const saved = await saveFileToD1(env, file, 'mat');
            fileType = saved.ext;
            fileSize = saved.fileSize;
            fileUrl = saved.fileUrl;
          }

          const id = uid('mat');
          const now = new Date().toISOString();
          const isTeacher = ['TEACHER', 'ADMIN', 'SuperAdmin'].includes(user.role as string);

          await env.DB.prepare(
            'INSERT INTO StudyMaterial (id, subjectId, title, topic, description, fileType, fileSize, fileUrl, uploadedByRole, uploadedById, isPublicToClass, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          )
            .bind(
              id,
              subjectId,
              title.trim(),
              topic.trim(),
              description.trim() || null,
              fileType,
              fileSize,
              fileUrl,
              isTeacher ? 'TEACHER' : 'STUDENT',
              user.id,
              isTeacher ? 1 : 0,
              now,
              now
            )
            .run();

          return jsonResponse(
            {
              success: true,
              message: driveUrl ? 'Google Drive resource link attached successfully.' : 'File successfully uploaded and stored.',
            },
            201
          );
        }

        // --- POST /api/student/quest/submit ---
        if (pathname === '/api/student/quest/submit' && request.method === 'POST') {
          const user = await getCurrentUserFromD1(request, env);
          if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

          const formData = await request.formData();
          const assignmentId = formData.get('assignmentId') as string;
          const file = formData.get('file') as File | null;
          const driveUrl = (formData.get('driveUrl') as string) || '';
          const studentNote = (formData.get('studentNote') as string) || '';

          if (!assignmentId || (!file && !driveUrl)) {
            return jsonResponse({ error: 'Assignment ID and file or Google Drive URL are required.' }, 400);
          }

          const assignment = await env.DB.prepare('SELECT * FROM Assignment WHERE id = ?')
            .bind(assignmentId)
            .first();
          if (!assignment) return jsonResponse({ error: 'Assignment not found.' }, 404);

          const isLate = new Date() > new Date(assignment.dueDate as string);
          if (isLate && !assignment.allowLateSubmissions) {
            return jsonResponse({ error: 'Late submissions are not accepted for this assignment.' }, 400);
          }

          let savedUrl = driveUrl.trim();
          let savedName = 'Google Drive Document';
          let savedSize = 'Drive Link';
          let savedExt = 'GDRIVE';

          if (file && file.size > 0) {
            if (file.size > MAX_FILE_SIZE) {
              return jsonResponse({ error: 'File size exceeds 15 MB limit.' }, 400);
            }
            const ext = getExt(file.name);
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
              return jsonResponse({ error: `Format ${ext} not allowed.` }, 400);
            }
            const saved = await saveFileToD1(env, file, `quest_${assignmentId}`);
            savedUrl = saved.fileUrl;
            savedName = file.name;
            savedSize = saved.fileSize;
            savedExt = saved.ext;
          }

          const now = new Date().toISOString();

          const existing = await env.DB.prepare(
            'SELECT * FROM Submission WHERE assignmentId = ? AND studentId = ?'
          )
            .bind(assignmentId, user.id)
            .first();

          let submissionId: string;
          let nextVersion = 1;
          const status = isLate ? 'LATE' : 'SUBMITTED';

          if (existing) {
            submissionId = existing.id as string;
            nextVersion = Number(existing.currentVersion || 1) + 1;
            await env.DB.prepare(
              'UPDATE Submission SET status = ?, currentVersion = ?, submittedAt = ?, isPublished = 0, updatedAt = ? WHERE id = ?'
            )
              .bind(status, nextVersion, now, now, submissionId)
              .run();
          } else {
            submissionId = uid('sub');
            await env.DB.prepare(
              'INSERT INTO Submission (id, assignmentId, studentId, status, currentVersion, submittedAt, gradeMax, isPublished, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, ?, ?, 0, ?, ?)'
            )
              .bind(submissionId, assignmentId, user.id, status, now, assignment.maxMarks, now, now)
              .run();
          }

          await env.DB.prepare(
            'INSERT INTO SubmissionVersion (id, submissionId, versionNumber, fileUrl, fileName, fileSize, fileType, studentNote, submittedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
          )
            .bind(
              uid('ver'),
              submissionId,
              nextVersion,
              savedUrl,
              savedName,
              savedSize,
              savedExt,
              studentNote.trim() || null,
              now
            )
            .run();

          return jsonResponse({
            success: true,
            message: isLate
              ? 'Assignment submitted (marked as late submission).'
              : 'Assignment submitted successfully!',
            version: nextVersion,
          });
        }

        // --- POST /api/student/notifications/read ---
        if (pathname === '/api/student/notifications/read' && request.method === 'POST') {
          const user = await getCurrentUserFromD1(request, env);
          if (!user) return jsonResponse({ error: 'Unauthorized' }, 401);

          const { notificationId, markAll } = (await request.json()) as any;
          if (markAll) {
            await env.DB.prepare('UPDATE Notification SET isRead = 1 WHERE userId = ?')
              .bind(user.id)
              .run();
            return jsonResponse({ success: true });
          }
          if (notificationId) {
            await env.DB.prepare('UPDATE Notification SET isRead = 1 WHERE id = ? AND userId = ?')
              .bind(notificationId, user.id)
              .run();
            return jsonResponse({ success: true });
          }
          return jsonResponse({ error: 'Invalid request' }, 400);
        }

        // --- ADMIN MUTATION ENDPOINTS ---
        if (pathname.startsWith('/api/admin/')) {
          const user = await getCurrentUserFromD1(request, env);
          if (!user || !['TEACHER', 'ADMIN', 'SuperAdmin'].includes(user.role as string)) {
            return jsonResponse({ error: 'Unauthorized' }, 403);
          }

          const now = new Date().toISOString();

          // POST /api/admin/students
          if (pathname === '/api/admin/students' && request.method === 'POST') {
            const body = (await request.json().catch(() => ({}))) as any;
            const { action, studentId, subjectId, projectedGrade, fullName, email, password, phone, level, subjectIds } = body;

            if (action === 'CREATE_STUDENT') {
              if (!fullName || !email || !password) {
                return jsonResponse({ error: 'Full name, email, and password are required.' }, 400);
              }
              const cleanEmail = String(email).trim().toLowerCase();
              const existing = await env.DB.prepare('SELECT id FROM User WHERE email = ?').bind(cleanEmail).first();
              if (existing) {
                return jsonResponse({ error: 'An account with this email address already exists.' }, 409);
              }
              const passwordHash = await bcrypt.hash(password, 10);
              const newStudentId = uid('usr');
              const bio = level ? `Enrolled in ${level} mathematics mentorship.` : 'Enrolled student.';
              const pGrade = projectedGrade || 'Predicted A*';

              await env.DB.prepare(
                'INSERT INTO User (id, email, passwordHash, fullName, role, phone, projectedGrade, emailVerified, phoneVerified, bio, studyStreakDays, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, 0, ?, ?)'
              )
                .bind(newStudentId, cleanEmail, passwordHash, fullName.trim(), 'STUDENT', phone ? phone.trim() : null, pGrade, bio, now, now)
                .run();

              if (Array.isArray(subjectIds) && subjectIds.length > 0) {
                for (const subId of subjectIds) {
                  if (!subId) continue;
                  const subExists = await env.DB.prepare('SELECT id FROM Subject WHERE id = ?').bind(subId).first();
                  if (subExists) {
                    await env.DB.prepare(
                      'INSERT OR IGNORE INTO StudentEnrollment (id, studentId, subjectId, status, enrolledAt) VALUES (?, ?, ?, ?, ?)'
                    )
                      .bind(uid('enr'), newStudentId, subId, 'ACTIVE', now)
                      .run();
                  }
                }
              }

              return jsonResponse({
                success: true,
                message: `Student account created for "${fullName.trim()}". Enrolled in ${subjectIds ? subjectIds.length : 0} course(s).`,
                student: {
                  id: newStudentId,
                  fullName: fullName.trim(),
                  email: cleanEmail,
                  role: 'STUDENT',
                },
              });
            }
            if (action === 'ENROLL') {
              await env.DB.prepare(
                'INSERT OR REPLACE INTO StudentEnrollment (id, studentId, subjectId, status, enrolledAt) VALUES (?, ?, ?, ?, ?)'
              )
                .bind(uid('enr'), studentId, subjectId, 'ACTIVE', now)
                .run();
              return jsonResponse({ success: true, message: 'Student successfully enrolled.' });
            }
            if (action === 'UNENROLL') {
              await env.DB.prepare(
                'DELETE FROM StudentEnrollment WHERE studentId = ? AND subjectId = ?'
              )
                .bind(studentId, subjectId)
                .run();
              return jsonResponse({ success: true, message: 'Student removed from subject.' });
            }
            if (action === 'UPDATE_GRADE') {
              await env.DB.prepare('UPDATE User SET projectedGrade = ?, updatedAt = ? WHERE id = ?')
                .bind(projectedGrade, now, studentId)
                .run();
              return jsonResponse({ success: true, message: 'Projected grade updated.' });
            }
            return jsonResponse({ error: 'Invalid action' }, 400);
          }

          // POST /api/admin/assignments
          if (pathname === '/api/admin/assignments' && request.method === 'POST') {
            const formData = await request.formData();
            const subjectId = formData.get('subjectId') as string;
            const title = formData.get('title') as string;
            const instructions = formData.get('instructions') as string;
            const maxMarks = parseInt(formData.get('maxMarks') as string) || 100;
            const dueDate = formData.get('dueDate') as string;
            const allowLateSubmissions = formData.get('allowLateSubmissions') === 'true' ? 1 : 0;
            const allowResubmissions = formData.get('allowResubmissions') === 'true' ? 1 : 0;
            const file = formData.get('referenceFile') as File | null;
            const driveUrl = (formData.get('driveUrl') as string) || '';

            if (!subjectId || !title || !instructions || !dueDate) {
              return jsonResponse({ error: 'Subject, title, instructions, and due date are required.' }, 400);
            }

            let referenceFileUrl: string | null = null;
            let referenceFileName: string | null = null;
            if (file && file.size > 0) {
              const saved = await saveFileToD1(env, file, 'prompt');
              referenceFileUrl = saved.fileUrl;
              referenceFileName = file.name;
            } else if (driveUrl) {
              referenceFileUrl = driveUrl.trim();
              referenceFileName = 'Google Drive Reference Material';
            }

            const asgId = uid('asg');
            await env.DB.prepare(
              'INSERT INTO Assignment (id, subjectId, title, instructions, maxMarks, dueDate, assignedDate, allowLateSubmissions, allowResubmissions, referenceFileUrl, referenceFileName, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            )
              .bind(
                asgId,
                subjectId,
                title.trim(),
                instructions.trim(),
                maxMarks,
                new Date(dueDate).toISOString(),
                now,
                allowLateSubmissions,
                allowResubmissions,
                referenceFileUrl,
                referenceFileName,
                now,
                now
              )
              .run();

            const { results: enrollments } = await env.DB.prepare(
              "SELECT studentId FROM StudentEnrollment WHERE subjectId = ? AND status = 'ACTIVE'"
            )
              .bind(subjectId)
              .all();

            for (const enr of enrollments) {
              await env.DB.prepare(
                'INSERT INTO Notification (id, userId, title, message, linkUrl, type, isRead, createdAt) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
              )
                .bind(
                  uid('not'),
                  enr.studentId,
                  'New Assignment Published',
                  `New Quest "${title.trim()}" is available. Max ${maxMarks} marks.`,
                  `/student/quest?id=${asgId}`,
                  'ASSIGNMENT',
                  now
                )
                .run();
            }

            return jsonResponse({
              success: true,
              message: 'Assignment created successfully and students notified.',
            });
          }

          // POST /api/admin/grading
          if (pathname === '/api/admin/grading' && request.method === 'POST') {
            const { submissionId, gradeScore, gradeLetter, feedback, action } = (await request.json()) as any;
            if (!submissionId) return jsonResponse({ error: 'Submission ID is required.' }, 400);

            const submission = await env.DB.prepare('SELECT * FROM Submission WHERE id = ?')
              .bind(submissionId)
              .first();
            if (!submission) return jsonResponse({ error: 'Submission not found.' }, 404);

            const assignment = await env.DB.prepare('SELECT * FROM Assignment WHERE id = ?')
              .bind(submission.assignmentId)
              .first();

            const isPublish = action === 'PUBLISH' ? 1 : 0;
            const isRevision = action === 'RETURN_FOR_REVISION';
            const status = isRevision
              ? 'RETURNED_FOR_REVISION'
              : isPublish
              ? 'GRADED'
              : (submission.status as string);

            const numericScore = gradeScore !== undefined && gradeScore !== null ? parseFloat(gradeScore) : submission.gradeScore;

            await env.DB.prepare(
              'UPDATE Submission SET gradeScore = ?, gradeLetter = ?, feedback = ?, gradedAt = ?, gradedById = ?, isPublished = ?, status = ?, updatedAt = ? WHERE id = ?'
            )
              .bind(
                numericScore,
                gradeLetter || submission.gradeLetter,
                feedback !== undefined ? feedback.trim() : submission.feedback,
                now,
                user.id,
                isPublish,
                status,
                now,
                submissionId
              )
              .run();

            if (isPublish && assignment) {
              await env.DB.prepare(
                'INSERT INTO Notification (id, userId, title, message, linkUrl, type, isRead, createdAt) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
              )
                .bind(
                  uid('not'),
                  submission.studentId,
                  'Grade Published',
                  `Your grade for "${assignment.title}" has been published: ${numericScore}/${assignment.maxMarks} (${gradeLetter}). Click to view teacher comments.`,
                  `/student/quest?id=${submission.assignmentId}`,
                  'GRADE',
                  now
                )
                .run();
            } else if (isRevision && assignment) {
              await env.DB.prepare(
                'INSERT INTO Notification (id, userId, title, message, linkUrl, type, isRead, createdAt) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
              )
                .bind(
                  uid('not'),
                  submission.studentId,
                  'Revision Requested on Quest',
                  `Ms. Vance requested a revision on "${assignment.title}". Please review teacher comments and resubmit.`,
                  `/student/quest?id=${submission.assignmentId}`,
                  'ASSIGNMENT',
                  now
                )
                .run();
            }

            return jsonResponse({
              success: true,
              message: isPublish
                ? 'Grade and feedback successfully published to student!'
                : isRevision
                ? 'Assignment returned to student for revision.'
                : 'Grade saved as draft.',
              submission: {
                ...submission,
                gradeScore: numericScore,
                gradeLetter,
                feedback,
                isPublished: Boolean(isPublish),
                status,
              },
            });
          }

          // POST /api/admin/attendance
          if (pathname === '/api/admin/attendance' && request.method === 'POST') {
            const { subjectId, classDate, records } = (await request.json()) as any;
            if (!subjectId || !classDate || !Array.isArray(records)) {
              return jsonResponse({ error: 'Subject, date, and attendance records required.' }, 400);
            }
            const dateStr = new Date(classDate).toISOString();
            for (const rec of records) {
              await env.DB.prepare(
                'INSERT INTO AttendanceRecord (id, studentId, subjectId, classDate, status, remarks, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
              )
                .bind(uid('att'), rec.studentId, subjectId, dateStr, rec.status || 'PRESENT', rec.remarks || null, now)
                .run();
            }
            return jsonResponse({
              success: true,
              message: `Successfully recorded attendance for ${records.length} students.`,
            });
          }

          // POST /api/admin/courses
          if (pathname === '/api/admin/courses' && request.method === 'POST') {
            const formData = await request.formData();
            const action = formData.get('action') as string;
            if (action === 'UPLOAD_RESOURCE') {
              const subjectId = formData.get('subjectId') as string;
              const title = formData.get('title') as string;
              const topic = formData.get('topic') as string;
              const description = formData.get('description') as string;
              const file = formData.get('file') as File | null;
              const driveUrl = (formData.get('driveUrl') as string) || '';

              if (!subjectId || !title || !topic || (!file && !driveUrl)) {
                return jsonResponse({ error: 'Subject, title, topic, and file or Google Drive URL required.' }, 400);
              }

              let savedUrl = driveUrl.trim();
              let savedSize = 'Drive Link';
              let savedExt = 'GDRIVE';

              if (file && file.size > 0) {
                const saved = await saveFileToD1(env, file, 'drop');
                savedUrl = saved.fileUrl;
                savedSize = saved.fileSize;
                savedExt = saved.ext;
              }

              await env.DB.prepare(
                'INSERT INTO StudyMaterial (id, subjectId, title, topic, description, fileType, fileSize, fileUrl, uploadedByRole, uploadedById, isPublicToClass, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)'
              )
                .bind(
                  uid('mat'),
                  subjectId,
                  title.trim(),
                  topic.trim(),
                  description?.trim() || null,
                  savedExt,
                  savedSize,
                  savedUrl,
                  'TEACHER',
                  user.id,
                  now,
                  now
                )
                .run();

              const { results: enrollments } = await env.DB.prepare(
                "SELECT studentId FROM StudentEnrollment WHERE subjectId = ? AND status = 'ACTIVE'"
              )
                .bind(subjectId)
                .all();

              for (const enr of enrollments) {
                await env.DB.prepare(
                  'INSERT INTO Notification (id, userId, title, message, linkUrl, type, isRead, createdAt) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
                )
                  .bind(
                    uid('not'),
                    enr.studentId,
                    'New Study Drop Published',
                    `Ms. Eleanor Vance added "${title.trim()}" (${topic.trim()}).`,
                    `/student/modules?id=${subjectId}`,
                    'RESOURCE',
                    now
                  )
                  .run();
              }

              return jsonResponse({
                success: true,
                message: driveUrl ? 'Resource attached via Google Drive and published!' : 'Resource uploaded and published to Study Drops!',
              });
            }
            return jsonResponse({ error: 'Invalid action' }, 400);
          }

          // POST /api/admin/announcements
          if (pathname === '/api/admin/announcements' && request.method === 'POST') {
            const { title, content, subjectId, priority } = (await request.json()) as any;
            if (!title || !content) {
              return jsonResponse({ error: 'Title and content are required.' }, 400);
            }
            const annId = uid('ann');
            await env.DB.prepare(
              'INSERT INTO Announcement (id, title, content, subjectId, priority, publishedAt, authorId) VALUES (?, ?, ?, ?, ?, ?, ?)'
            )
              .bind(annId, title.trim(), content.trim(), subjectId || null, priority || 'NORMAL', now, user.id)
              .run();

            let studentIds: string[] = [];
            if (subjectId) {
              const { results } = await env.DB.prepare(
                "SELECT studentId FROM StudentEnrollment WHERE subjectId = ? AND status = 'ACTIVE'"
              )
                .bind(subjectId)
                .all();
              studentIds = results.map((r: any) => r.studentId);
            } else {
              const { results } = await env.DB.prepare("SELECT id FROM User WHERE role = 'STUDENT'").all();
              studentIds = results.map((r: any) => r.id);
            }

            for (const sid of studentIds) {
              await env.DB.prepare(
                'INSERT INTO Notification (id, userId, title, message, linkUrl, type, isRead, createdAt) VALUES (?, ?, ?, ?, ?, ?, 0, ?)'
              )
                .bind(
                  uid('not'),
                  sid,
                  `Announcement: ${title.trim()}`,
                  content.trim().substring(0, 140) + '...',
                  '/student/heads-up',
                  'ANNOUNCEMENT',
                  now
                )
                .run();
            }

            return jsonResponse({
              success: true,
              message: 'Announcement published successfully!',
            });
          }
        }

        return jsonResponse({ error: 'API route not found' }, 404);
      } catch (err: any) {
        console.error('Worker API error:', err);
        return jsonResponse({ error: err.message || 'Internal Server Error' }, 500);
      }
    }

    // 3. Support legacy /student/modules/<id> path by redirecting to /student/modules?id=<id>
    if (pathname.startsWith('/student/modules/') && pathname.length > '/student/modules/'.length) {
      const subId = pathname.replace('/student/modules/', '').replace(/\/$/, '');
      if (subId && !subId.includes('.')) {
        return Response.redirect(`${url.origin}/student/modules?id=${encodeURIComponent(subId)}`, 302);
      }
    }

    // 4. Delegate static assets & Next.js pages to Cloudflare Workers Static Assets
    return env.ASSETS.fetch(request);
  },
};
