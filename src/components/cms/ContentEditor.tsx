'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Save,
  Undo2,
  RotateCcw,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  HardDrive,
  Image as ImageIcon,
} from 'lucide-react';
import { CMS_CATEGORIES, CmsCategory, sectionLabel } from '@/lib/cmsMeta';
import { DEFAULT_CMS_MAP } from '@/lib/cmsData';
import R2MediaPickerModal from './R2MediaPickerModal';

interface Item {
  key: string;
  section: string;
  category: string;
  label: string;
  value: string;
  type: 'text' | 'textarea' | 'number' | 'image';
  description?: string;
}

export default function ContentEditor({ category }: { category: CmsCategory }) {
  const meta = CMS_CATEGORIES.find((c) => c.id === category)!;
  const [items, setItems] = useState<Item[]>([]);
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{
    key: string;
    label: string;
    hint: 'logo' | 'favicon' | 'avatar' | 'media';
  } | null>(null);

  const showToast = (kind: 'ok' | 'err', text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/content', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load content');
      const list: Item[] = (data.items as Item[]).filter((i) => i.category === category);
      const map: Record<string, string> = {};
      list.forEach((i) => (map[i.key] = i.value));
      setItems(list);
      setSaved(map);
      setDraft(map);
    } catch (e: any) {
      showToast('err', e.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  const dirtyKeys = useMemo(() => items.filter((i) => draft[i.key] !== saved[i.key]).map((i) => i.key), [items, draft, saved]);

  useEffect(() => {
    if (!dirtyKeys.length) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirtyKeys.length]);

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const groups: Record<string, Item[]> = {};
    for (const i of items) {
      if (q && !`${i.label} ${i.key} ${draft[i.key] ?? ''}`.toLowerCase().includes(q)) continue;
      (groups[i.section] ||= []).push(i);
    }
    return Object.entries(groups);
  }, [items, query, draft]);

  const save = async () => {
    if (!dirtyKeys.length) return;
    setSaving(true);
    try {
      const updates = dirtyKeys.map((key) => ({ key, value: draft[key] }));
      const res = await fetch('/api/cms/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, items: updates }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSaved((s) => ({ ...s, ...Object.fromEntries(updates.map((u) => [u.key, u.value])) }));
      showToast('ok', `Published ${data.updatedCount ?? updates.length} field(s) to the live site.`);
    } catch (e: any) {
      showToast('err', e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const resetSection = async (section: string) => {
    if (!window.confirm(`Reset every field in "${sectionLabel(section)}" to its original default?`)) return;
    try {
      const res = await fetch('/api/cms/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      showToast('ok', data.message || 'Section reset.');
      await load();
    } catch (e: any) {
      showToast('err', e.message || 'Reset failed');
    }
  };

  const inputCls =
    'w-full rounded-xl bg-[#0B0F14] border border-white/10 px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400/40 transition';

  return (
    <div className="pb-28">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{meta.title}</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">{meta.description}</p>
        </div>
        <a
          href={meta.previewHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm text-amber-300 hover:text-amber-200"
        >
          Open live page <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          id="cms-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search fields by label, key or text"
          className={`${inputCls} pl-10`}
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-400 text-sm py-16 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading content…
        </div>
      ) : sections.length === 0 ? (
        <p className="text-center text-slate-500 py-16 text-sm">No fields match your search.</p>
      ) : (
        <div className="space-y-5">
          {sections.map(([section, list]) => {
            const isCollapsed = collapsed[section];
            const modifiedInSection = list.filter((i) => draft[i.key] !== DEFAULT_CMS_MAP[i.key]).length;
            return (
              <section key={section} className="rounded-2xl bg-[#121920] border border-white/5 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4">
                  <button
                    onClick={() => setCollapsed((c) => ({ ...c, [section]: !c[section] }))}
                    className="flex items-center gap-3 text-left flex-1"
                  >
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                    <span className="font-medium text-white">{sectionLabel(section)}</span>
                    <span className="text-xs text-slate-500">{list.length} fields</span>
                    {modifiedInSection > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300">
                        {modifiedInSection} customised
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => resetSection(section)}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-300 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset section
                  </button>
                </div>
                {!isCollapsed && (
                  <div className="px-5 pb-5 grid gap-5 md:grid-cols-2 border-t border-white/5 pt-5">
                    {list.map((i) => {
                      const isDirty = draft[i.key] !== saved[i.key];
                      const isImageField =
                        i.type === 'image' ||
                        i.key.includes('logo') ||
                        i.key.includes('avatar') ||
                        i.key.includes('favicon') ||
                        i.key.includes('image') ||
                        i.key.includes('media');
                      const wide = i.type === 'textarea' || isImageField;
                      return (
                        <div key={i.key} className={wide ? 'md:col-span-2' : ''}>
                          <div className="flex items-center justify-between mb-1.5">
                            <label htmlFor={`f-${i.key}`} className="text-sm font-medium text-slate-200">
                              {i.label}
                              {isDirty && <span className="ml-2 text-[10px] text-amber-300">● unsaved</span>}
                            </label>
                            {isDirty && (
                              <button
                                onClick={() => setDraft((d) => ({ ...d, [i.key]: saved[i.key] }))}
                                className="text-xs text-slate-500 hover:text-slate-200 inline-flex items-center gap-1"
                              >
                                <Undo2 className="w-3 h-3" /> Revert
                              </button>
                            )}
                          </div>
                          {wide ? (
                            <textarea
                              id={`f-${i.key}`}
                              rows={4}
                              maxLength={5000}
                              value={draft[i.key] ?? ''}
                              onChange={(e) => setDraft((d) => ({ ...d, [i.key]: e.target.value }))}
                              className={`${inputCls} resize-y`}
                            />
                          ) : isImageField ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 shrink-0 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden p-1 shadow-inner">
                                  {draft[i.key] ? (
                                    <img
                                      src={draft[i.key]}
                                      alt={i.label}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <ImageIcon className="w-4 h-4 text-slate-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <input
                                    id={`f-${i.key}`}
                                    type="text"
                                    maxLength={5000}
                                    placeholder="e.g. /media/media_... or paste direct link"
                                    value={draft[i.key] ?? ''}
                                    onChange={(e) => setDraft((d) => ({ ...d, [i.key]: e.target.value }))}
                                    className={inputCls}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setMediaPickerTarget({
                                      key: i.key,
                                      label: i.label,
                                      hint: i.key.includes('logo')
                                        ? 'logo'
                                        : i.key.includes('favicon')
                                        ? 'favicon'
                                        : i.key.includes('avatar')
                                        ? 'avatar'
                                        : 'media',
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/20 text-xs font-semibold shrink-0 transition"
                                  title="Browse or upload to Cloudflare R2"
                                >
                                  <HardDrive className="w-3.5 h-3.5" />
                                  <span>R2 Media</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <input
                              id={`f-${i.key}`}
                              type="text"
                              maxLength={5000}
                              value={draft[i.key] ?? ''}
                              onChange={(e) => setDraft((d) => ({ ...d, [i.key]: e.target.value }))}
                              className={inputCls}
                            />
                          )}
                          {i.description && <p className="mt-1.5 text-xs text-slate-500">{i.description}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Sticky save bar */}
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 lg:left-[calc(50%+9rem)] z-40 transition-all ${
          dirtyKeys.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4 pl-5 pr-3 py-2.5 rounded-2xl bg-[#1a232d] border border-amber-400/20 shadow-2xl shadow-black/50">
          <span className="text-sm text-slate-300">{dirtyKeys.length} unsaved change(s)</span>
          <button
            onClick={() => setDraft(saved)}
            className="text-sm text-slate-400 hover:text-white px-2"
          >
            Discard
          </button>
          <button
            id="cms-save"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 text-[#0B0F14] text-sm font-semibold hover:brightness-110 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm shadow-xl border ${
            toast.kind === 'ok'
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
              : 'bg-red-950/90 border-red-500/30 text-red-200'
          }`}
        >
          {toast.kind === 'ok' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.text}
        </div>
      )}

      {mediaPickerTarget && (
        <R2MediaPickerModal
          isOpen={Boolean(mediaPickerTarget)}
          onClose={() => setMediaPickerTarget(null)}
          onSelect={(url) => {
            setDraft((d) => ({ ...d, [mediaPickerTarget.key]: url }));
          }}
          currentValue={draft[mediaPickerTarget.key] ?? ''}
          title={`Select ${mediaPickerTarget.label} from R2`}
          targetHint={mediaPickerTarget.hint}
        />
      )}
    </div>
  );
}
