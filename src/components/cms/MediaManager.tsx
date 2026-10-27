'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  FileText,
  Copy,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HardDrive,
  Sparkles,
  Layers,
  Filter
} from 'lucide-react';

interface MediaItem {
  id: string;
  key: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
  title?: string | null;
  description?: string | null;
  uploadedBy?: string | null;
  createdAt: string;
}

export default function MediaManager() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('GENERAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [applyingKey, setApplyingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const showToast = (kind: 'ok' | 'err', text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 3500);
  };

  const applyMediaToCmsKey = async (cmsKey: string, url: string, label: string) => {
    setApplyingKey(`${cmsKey}-${url}`);
    try {
      const res = await fetch('/api/cms/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{ key: cmsKey, value: url }],
          items: [{ key: cmsKey, value: url }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update CMS');
      showToast('ok', `Assigned as ${label} ("${url}").`);
    } catch (e: any) {
      showToast('err', e.message || 'Failed to update CMS field');
    } finally {
      setApplyingKey(null);
    }
  };

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/media', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load media.');
      setItems(data.items || []);
    } catch (err: any) {
      showToast('err', err.message || 'Error fetching media items.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', category);
      formData.append('title', title);
      formData.append('description', description);

      const res = await fetch('/api/cms/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      showToast('ok', 'Asset successfully stored in Cloudflare R2 bucket.');
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      await loadMedia();
    } catch (err: any) {
      showToast('err', err.message || 'Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!window.confirm(`Permanently delete "${item.title || item.fileName}" from R2 storage?`)) return;

    try {
      const res = await fetch('/api/cms/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, key: item.key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      showToast('ok', 'Asset deleted from R2.');
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err: any) {
      showToast('err', err.message || 'Failed to delete media');
    }
  };

  const copyToClipboard = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    showToast('ok', `Copied URL: ${url}`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = categoryFilter === 'ALL' || item.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [items, searchQuery, categoryFilter]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              R2 Media Library
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400/10 text-amber-300 border border-amber-400/20">
              <HardDrive className="w-3.5 h-3.5" />
              R2 Bucket: cambridge-maths-media
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-400 max-w-2xl">
            Static assets, teacher portraits, diagrams, syllabus PDFs, and platform media stored in high-performance Cloudflare R2 object storage with global edge distribution.
          </p>
        </div>
      </div>

      {/* Upload Panel */}
      <div className="rounded-3xl bg-[#121920] border border-white/5 p-6 sm:p-7 shadow-xl">
        <div className="flex items-center gap-2 mb-4 text-amber-300">
          <UploadCloud className="w-5 h-5" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Upload New Asset to R2</h2>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Select Asset File (Images, PNG, JPG, WebP, SVG, PDF, DOCX)
              </label>
              <input
                type="file"
                required
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setSelectedFile(f);
                  if (f && !title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
                }}
                className="w-full text-xs text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-400/10 file:text-amber-300 hover:file:bg-amber-400/20 rounded-xl bg-[#0B0F14] border border-white/10 p-2 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl bg-[#0B0F14] border border-white/10 px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              >
                <option value="GENERAL">General Assets</option>
                <option value="HERO">Hero &amp; Banners</option>
                <option value="LOGO">Logos &amp; Brand Badges</option>
                <option value="TEACHER">Faculty &amp; Portraits</option>
                <option value="DOCUMENT">Syllabus &amp; Formula Sheets</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Asset Label / Title</label>
              <input
                type="text"
                placeholder="e.g. Cambridge Mathematics Crest 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-[#0B0F14] border border-white/10 px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Description / Alt Tag</label>
              <input
                type="text"
                placeholder="Optional notes or accessibility text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl bg-[#0B0F14] border border-white/10 px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 text-[#0B0F14] text-xs font-bold hover:brightness-110 disabled:opacity-50 transition shadow-lg shadow-amber-500/10"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {uploading ? 'Storing in R2...' : 'Upload & Store in R2'}
            </button>
          </div>
        </form>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'HERO', 'LOGO', 'TEACHER', 'DOCUMENT', 'GENERAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                categoryFilter === cat
                  ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                  : 'bg-[#121920] text-slate-400 hover:text-slate-200 border border-white/5'
              }`}
            >
              {cat === 'ALL' ? 'All Assets' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search media by title or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-[#121920] border border-white/10 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Connecting to R2 Bucket...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-3xl bg-[#121920] border border-white/5 p-12 text-center text-slate-500">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40 text-amber-400" />
          <p className="text-sm font-medium text-slate-300">No media items found</p>
          <p className="text-xs text-slate-500 mt-1">
            {searchQuery || categoryFilter !== 'ALL'
              ? 'Try modifying your search or filter settings.'
              : 'Upload your first image, syllabus PDF, or logo to start using R2 media storage.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isImage = item.mimeType.startsWith('image/');
            return (
              <div
                key={item.id}
                className="group rounded-2xl bg-[#121920] border border-white/5 overflow-hidden flex flex-col hover:border-amber-400/30 transition-all shadow-md"
              >
                {/* Media Thumbnail */}
                <div className="h-44 bg-[#0B0F14] relative flex items-center justify-center overflow-hidden border-b border-white/5">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.url}
                      alt={item.title || item.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FileText className="w-10 h-10 text-amber-300" />
                      <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-500">
                        {item.fileName.split('.').pop()} Document
                      </span>
                    </div>
                  )}

                  <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-amber-300 border border-white/10">
                    {item.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white truncate" title={item.title || item.fileName}>
                      {item.title || item.fileName}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono truncate mt-0.5" title={item.fileName}>
                      {item.fileName}
                    </p>
                    {item.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{formatSize(item.sizeBytes)}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Quick Set Buttons for images */}
                  {isImage && (
                    <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-500 font-medium">Quick Apply:</span>
                      <button
                        type="button"
                        onClick={() => applyMediaToCmsKey('global_site_logo_url', item.url, 'Site Brand Logo')}
                        disabled={applyingKey !== null}
                        className="px-2 py-0.5 rounded-md bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/20 text-[10px] font-semibold transition"
                        title="Set as global site brand logo"
                      >
                        Set as Logo
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMediaToCmsKey('global_site_favicon_url', item.url, 'Favicon Icon')}
                        disabled={applyingKey !== null}
                        className="px-2 py-0.5 rounded-md bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/20 text-[10px] font-semibold transition"
                        title="Set as browser tab favicon icon"
                      >
                        Set as Favicon
                      </button>
                      <button
                        type="button"
                        onClick={() => applyMediaToCmsKey('global_instructor_avatar_url', item.url, 'Teacher Profile Avatar')}
                        disabled={applyingKey !== null}
                        className="px-2 py-0.5 rounded-md bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/20 text-[10px] font-semibold transition"
                        title="Set as lead instructor portrait avatar"
                      >
                        Set as Avatar
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => copyToClipboard(item.url, item.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-amber-400/10 hover:text-amber-300 text-xs font-medium text-slate-300 transition"
                      title="Copy public CDN link to paste into CMS"
                    >
                      {copiedKey === item.id ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === item.id ? 'Copied URL!' : 'Copy URL'}</span>
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                      title="Open asset directly"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-red-500/15 text-slate-400 hover:text-red-300 transition"
                      title="Delete asset from R2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Notification */}
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
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
