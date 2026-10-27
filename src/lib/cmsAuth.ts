import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import prisma from './prisma';

const CMS_JWT_SECRET = new TextEncoder().encode(
  (process.env.JWT_SECRET || 'cambridge_maths_super_secure_jwt_secret_change_in_production_2026') + '_superadmin_cms_layer'
);

export const CMS_COOKIE_NAME = 'cambridge_cms_token';

/** Emergency passkey, only enabled when CMS_MASTER_PASSKEY is set in the environment. */
export function getMasterPasskey(): string | null {
  const key = process.env.CMS_MASTER_PASSKEY;
  return key && key.length >= 12 ? key : null;
}

export interface CmsTokenPayload {
  userId: string;
  email: string;
  fullName: string;
  role: 'SuperAdmin' | 'SUPERADMIN' | string;
  cmsLayer: boolean;
  authenticatedAt: string;
}

export function isSuperAdmin(role?: string | null): boolean {
  if (!role) return false;
  const clean = role.trim().toUpperCase();
  return clean === 'SUPERADMIN' || clean === 'SUPER_ADMIN';
}

export async function createCmsSessionToken(user: {
  id: string;
  email: string;
  fullName: string;
  role: string;
}): Promise<string> {
  return new SignJWT({
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    cmsLayer: true,
    authenticatedAt: new Date().toISOString(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(CMS_JWT_SECRET);
}

export async function verifyCmsSessionToken(token: string): Promise<CmsTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, CMS_JWT_SECRET);
    if (!payload || !payload.userId || !payload.cmsLayer) return null;
    if (!isSuperAdmin(payload.role as string)) return null;
    return payload as unknown as CmsTokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentCmsSession(): Promise<CmsTokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CMS_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifyCmsSessionToken(token);
  } catch {
    return null;
  }
}
