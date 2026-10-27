'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Loader2, ShieldCheck } from 'lucide-react';
import CmsSidebar from './CmsSidebar';
import { CmsSessionContext, CmsSessionUser } from './CmsSessionContext';

export default function CmsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const isLogin = pathname.startsWith('/cms/login');
  const [user, setUser] = useState<CmsSessionUser | null>(null);
  const [checking, setChecking] = useState(!isLogin);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (isLogin) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/cms/session', { cache: 'no-store' });
        if (!res.ok) throw new Error('unauthorized');
        const data = await res.json();
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) router.replace('/cms/login');
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLogin, router]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const signOut = useCallback(async () => {
    await Promise.allSettled([
      fetch('/api/cms/logout', { method: 'POST' }),
      fetch('/api/auth/logout', { method: 'POST' }),
    ]);
    setUser(null);
    router.replace('/cms/login');
  }, [router]);

  if (isLogin) return <>{children}</>;

  if (checking || !user) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center text-amber-400">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          Verifying SuperAdmin session…
        </div>
      </div>
    );
  }

  return (
    <CmsSessionContext.Provider value={{ user, signOut }}>
      <div className="min-h-screen bg-[#0B0F14] text-slate-200 lg:flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 border-r border-white/5 sticky top-0 h-screen">
          <CmsSidebar />
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="w-72 max-w-[85%] h-full shadow-2xl">
              <CmsSidebar onNavigate={() => setDrawerOpen(false)} />
            </div>
            <button
              aria-label="Close navigation"
              className="flex-1 bg-black/60 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col">
          <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 h-14 bg-[#121920]/95 backdrop-blur border-b border-white/5">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <ShieldCheck className="w-5 h-5" /> SuperAdmin Console
            </div>
            <button
              id="cms-mobile-menu"
              aria-label="Open navigation"
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-lg hover:bg-white/5 text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-6xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </CmsSessionContext.Provider>
  );
}
