'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Search,
  Loader2,
  HardDrive,
  ExternalLink,
  Sparkles,
  Filter
} from 'lucide-react';

export interface MediaItem {
  id: string;
  key: string;
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
  title: string;
  description?: string;
  createdAt: string;
}

interface R2MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentValue?: string;
  title?: string;
  targetHint?: 'logo' | 'favicon' | 'avatar' | 'media';
}

export default function R2MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentValue = '',
  title = 'Select Media from Cloudflare R2',
  targetHint = 'media',
}: R2MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/media');
      const data = await res.json();
      if (res.ok && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (e) {
      console.error('Error fetching R2 media items:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', targetHint === 'avatar' ? 'TEACHER' : 'BRANDING');
      formData.append('title', file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));

      const res = await fetch('/api/cms/media', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload asset to R2');

      await fetchMedia();
      if (data.media?.url) {
        onSelect(data.media.url);
        onClose();
      }
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.fileName.toLowerCase().includes(search.toLowerCase()) ||
      item.key.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['ALL', 'BRANDING', 'BADGES', 'COURSES', 'TEACHER', 'STUDENT', 'GENERAL'];

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0E1318] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#121920]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">{title}</h2>
              <p className="text-xs text-slate-400">
                Browse stored Cloudflare R2 assets or upload a new {targetHint} directly.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Upload, Search, and Category Pills */}
        <div className="p-5 border-b border-white/5 space-y-4 bg-[#0B0F14]/70">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search media by title or filename..."
                className="w-full bg-[#151C24] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
              />
            </div>

            {/* Quick Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.ico,.svg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading to R2...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" /> Upload New {targetHint.toUpperCase()} to R2
                </>
              )}
            </button>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 mr-1 text-[11px] font-semibold flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {uploadError && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg">
              {uploadError}
            </p>
          )}
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <p className="text-xs">Fetching Cloudflare R2 bucket contents...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <ImageIcon className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-300">No media assets found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {search
                  ? `No media matches "${search}".`
                  : 'Upload your brand logos, teacher avatars, and site icons directly to Cloudflare R2.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const isSelected = currentValue === item.url || currentValue.endsWith(item.key);
                const isImage = item.mimeType.startsWith('image/') || item.fileName.endsWith('.svg') || item.fileName.endsWith('.ico');

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelect(item.url);
                      onClose();
                    }}
                    className={`group relative rounded-xl border p-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-amber-400/10 ring-2 ring-amber-400/30'
                        : 'border-white/10 bg-[#121920] hover:border-white/20 hover:bg-[#161F28]'
                    }`}
                  >
                    {/* Thumbnail preview */}
                    <div className="relative aspect-square w-full rounded-lg bg-black/40 overflow-hidden flex items-center justify-center border border-white/5 p-2">
                      {isImage ? (
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <HardDrive className="w-8 h-8 text-slate-600" />
                      )}

                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="mt-2.5 space-y-1">
                      <p className="text-xs font-semibold text-slate-200 truncate" title={item.title}>
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate max-w-[80px]">{formatSize(item.sizeBytes)}</span>
                        <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-[9px] uppercase">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="mt-2 w-full py-1.5 px-2 rounded-lg bg-white/5 hover:bg-amber-400 hover:text-slate-950 text-slate-300 font-semibold text-[11px] transition text-center"
                    >
                      Use in Field
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 bg-[#121920] text-xs">
          <div className="text-slate-400">
            {currentValue && (
              <span className="truncate max-w-sm block">
                Current:{' '}
                <span className="font-mono text-amber-300 text-[11px]">{currentValue}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentValue && (
              <button
                type="button"
                onClick={() => {
                  onSelect('');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
              >
                Clear URL
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
