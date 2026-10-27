'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Globe, GraduationCap, Presentation, Settings2, Loader2 } from 'lucide-react';
import { CMS_CATEGORIES, CmsCategory } from '@/lib/cmsMeta';
import { DEFAULT_CMS_MAP } from '@/lib/cmsData';
import { useCmsSession } from '@/components/cms/CmsSessionContext';

interface Item {
  key: string;
  label: string;
  category: CmsCategory;
  value: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

const ICONS = { PUBLIC: Globe, STUDENT: GraduationCap, TEACHER: Presentation, GLOBAL: Settings2 };

export default function CmsOverviewPage() {
  const { user } = useCmsSession();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/cms/content', { cache: 'no-store' })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed to load');
        setItems(d.items);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(
    () =>
      CMS_CATEGORIES.map((c) => {
        const list = items.filter((i) => i.category === c.id);
        return { meta: c, total: list.length, custom: list.filter((i) => i.value !== DEFAULT_CMS_MAP[i.key]).length };
      }),
    [items]
  );

  const recent = useMemo(
    () =>
      items
        .filter((i) => i.updatedAt && i.updatedBy)
        .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
        .slice(0, 6),
    [items]
  );

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
        Welcome back, {user.fullName.split(' ')[0]}
      </h1>
      <p className="mt-2 text-sm text-slate-400 max-w-2xl">
        Every headline, button label and description across the public site, student portal and teacher workspace is
        managed here. Changes publish instantly to the live database.
      </p>

      {error && <p className="mt-6 text-sm text-red-300">{error}</p>}

      {loading ? (
        <div className="py-20 flex justify-center text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {stats.map(({ meta, total, custom }) => {
              const Icon = ICONS[meta.id];
              return (
                <Link
                  key={meta.id}
                  href={meta.href}
                  className="group rounded-2xl bg-[#121920] border border-white/5 p-6 hover:border-amber-400/30 hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-300 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-300 transition" />
                  </div>
                  <h2 className="mt-4 text-lg font-medium text-white">{meta.title}</h2>
                  <p className="mt-1 text-sm text-slate-400 line-clamp-2">{meta.description}</p>
                  <p className="mt-4 text-xs text-slate-500">
                    <span className="text-slate-200 font-medium">{total}</span> fields ·{' '}
                    <span className="text-amber-300 font-medium">{custom}</span> customised
                  </p>
                </Link>
              );
            })}
          </div>

          <h2 className="mt-12 mb-4 text-sm uppercase tracking-widest text-slate-500">Recent activity</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500">No edits recorded yet.</p>
          ) : (
            <ul className="rounded-2xl bg-[#121920] border border-white/5 divide-y divide-white/5">
              {recent.map((i) => (
                <li key={i.key} className="px-5 py-3 flex items-center justify-between gap-4 text-sm">
                  <div className="min-w-0">
                    <p className="text-slate-200 truncate">{i.label}</p>
                    <p className="text-xs text-slate-500 truncate">{i.value}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500 shrink-0">
                    <p>{i.updatedBy}</p>
                    <p>{new Date(i.updatedAt as string).toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
