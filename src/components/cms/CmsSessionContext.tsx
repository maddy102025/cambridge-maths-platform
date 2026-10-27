'use client';

import { createContext, useContext } from 'react';

export interface CmsSessionUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface CmsSessionValue {
  user: CmsSessionUser;
  signOut: () => Promise<void>;
}

export const CmsSessionContext = createContext<CmsSessionValue | null>(null);

export function useCmsSession(): CmsSessionValue {
  const ctx = useContext(CmsSessionContext);
  if (!ctx) throw new Error('useCmsSession must be used inside the CMS shell');
  return ctx;
}
