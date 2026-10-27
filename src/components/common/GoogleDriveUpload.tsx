'use client';

import React, { useState } from 'react';
import {
  Link2,
  UploadCloud,
  FileText,
  Table,
  Presentation,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Info,
  X,
  FileCheck
} from 'lucide-react';
import { parseGoogleDriveUrl, isValidGoogleDriveUrl } from '@/lib/googleDrive';

export interface GoogleDriveUploadResult {
  fileUrl: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  isGoogleDrive: boolean;
  googleDriveFileId?: string;
  rawFile?: File | null;
}

interface GoogleDriveUploadProps {
  onSelected: (result: GoogleDriveUploadResult | null) => void;
  allowedExtensions?: string[];
  maxSizeMb?: number;
  label?: string;
  hint?: string;
}

export default function GoogleDriveUpload({
  onSelected,
  allowedExtensions = ['.pdf', '.docx', '.doc', '.zip', '.jpg', '.jpeg', '.png'],
  maxSizeMb = 15,
  label = 'Resource / File Attachment (Google Drive Supported)',
  hint = 'Share lecture notes, worksheets, past papers, or submissions via Google Drive link or local upload.',
}: GoogleDriveUploadProps) {
  const [mode, setMode] = useState<'drive' | 'local'>('drive');
  const [driveUrl, setDriveUrl] = useState('');
  const [driveTitle, setDriveTitle] = useState('');
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifiedDrive, setVerifiedDrive] = useState<ReturnType<typeof parseGoogleDriveUrl> | null>(null);

  const handleDriveUrlChange = (val: string) => {
    setDriveUrl(val);
    setError(null);

    if (!val.trim()) {
      setVerifiedDrive(null);
      onSelected(null);
      return;
    }

    const parsed = parseGoogleDriveUrl(val);
    if (parsed.isGoogleDrive && parsed.fileId) {
      setVerifiedDrive(parsed);
      const fileName = driveTitle.trim() || `${parsed.label} (Google Drive)`;
      const fileType = parsed.kind === 'document' ? 'DOC' : parsed.kind === 'spreadsheet' ? 'SHEET' : parsed.kind === 'presentation' ? 'SLIDE' : 'PDF';
      onSelected({
        fileUrl: parsed.viewUrl,
        fileName,
        fileSize: 'Cloud (Google Drive)',
        fileType,
        isGoogleDrive: true,
        googleDriveFileId: parsed.fileId,
        rawFile: null,
      });
    } else {
      setVerifiedDrive(null);
      onSelected(null);
      if (val.length > 10) {
        setError('Please enter a valid Google Drive, Google Docs, Sheets, or Slides link.');
      }
    }
  };

  const handleDriveTitleChange = (val: string) => {
    setDriveTitle(val);
    if (verifiedDrive && verifiedDrive.fileId) {
      const fileName = val.trim() || `${verifiedDrive.label} (Google Drive)`;
      const fileType = verifiedDrive.kind === 'document' ? 'DOC' : verifiedDrive.kind === 'spreadsheet' ? 'SHEET' : verifiedDrive.kind === 'presentation' ? 'SLIDE' : 'PDF';
      onSelected({
        fileUrl: verifiedDrive.viewUrl,
        fileName,
        fileSize: 'Cloud (Google Drive)',
        fileType,
        isGoogleDrive: true,
        googleDriveFileId: verifiedDrive.fileId,
        rawFile: null,
      });
    }
  };

  const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setLocalFile(null);
      onSelected(null);
      return;
    }

    // Validate size
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMb} MB limit. File is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`);
      setLocalFile(null);
      onSelected(null);
      return;
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      setError(`Format ${ext} is not allowed. Supported formats: ${allowedExtensions.join(', ')}.`);
      setLocalFile(null);
      onSelected(null);
      return;
    }

    setLocalFile(file);
    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    onSelected({
      fileUrl: '', // Will be assigned on API upload
      fileName: file.name,
      fileSize: sizeStr,
      fileType: ext.replace('.', '').toUpperCase(),
      isGoogleDrive: false,
      rawFile: file,
    });
  };

  const clearSelection = () => {
    setDriveUrl('');
    setDriveTitle('');
    setLocalFile(null);
    setVerifiedDrive(null);
    setError(null);
    onSelected(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-soft flex items-center gap-1.5">
          <span>{label}</span>
        </label>
        {/* Toggle Mode */}
        <div className="flex rounded-lg bg-ivory-200 p-0.5 border border-sage-200">
          <button
            type="button"
            onClick={() => {
              setMode('drive');
              clearSelection();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              mode === 'drive'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-soft hover:text-slate-900'
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 87.3 78" fill="none">
              <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
              <path d="M43.65 25 29.9 1.2C28.55.4 27 0 25.45 0H18.2c1.55 0 3.1.4 4.45 1.2L66.3 76.8c1.35-.8 2.5-1.9 3.3-3.3l16.5-28.55c.8-1.4 1.2-2.95 1.2-4.5H43.65z" fill="#00ac47"/>
              <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3L63.1 49.7H35.6L49.35 73.5c.8 1.4 1.95 2.5 3.3 3.3h20.9z" fill="#ea4335"/>
              <path d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.95 0h-27.5c-1.55 0-3.1.4-4.45 1.2z" fill="#00832d"/>
              <path d="M87.3 40.45 73.55 16.65c-.8-1.4-1.95-2.5-3.3-3.3L56.5 37.15l13.75 23.8h17.05c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
              <path d="m27.5 53 13.75-23.8H13.75L0 53h27.5z" fill="#2684fc"/>
            </svg>
            <span>Google Drive Link</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('local');
              clearSelection();
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              mode === 'local'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-soft hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-sage-600" />
            <span>Direct Upload</span>
          </button>
        </div>
      </div>

      {mode === 'drive' ? (
        <div className="space-y-2.5">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <Link2 className="w-4 h-4" />
            </div>
            <input
              type="url"
              placeholder="Paste Google Drive shareable link (Docs, Sheets, Slides, Drive PDF, or Folder)..."
              value={driveUrl}
              onChange={(e) => handleDriveUrlChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sage-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 transition-all"
            />
          </div>

          {verifiedDrive && (
            <div className="p-3.5 rounded-xl bg-sage-50 border border-sage-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Google Drive Asset: <strong className="text-emerald-700">{verifiedDrive.label}</strong></span>
                </div>
                <a
                  href={verifiedDrive.viewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sage-700 hover:text-sage-900 font-medium inline-flex items-center gap-1"
                >
                  Test Link <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Custom Resource Display Title (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cambridge 2024 Past Paper Solution (Google Drive)"
                  value={driveTitle}
                  onChange={(e) => handleDriveTitleChange(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-sage-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sage-400"
                />
              </div>

              <div className="flex items-start gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-sage-200">
                <Info className="w-3.5 h-3.5 text-sage-600 shrink-0 mt-0.5" />
                <span>Tip: Ensure sharing permission is set to <strong>&quot;Anyone with the link can view&quot;</strong> on Google Drive.</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {!localFile ? (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-sage-300 hover:border-sage-500 rounded-2xl bg-ivory-50/70 hover:bg-ivory-100/80 cursor-pointer transition-all group text-center">
              <div className="w-10 h-10 rounded-full bg-sage-100 group-hover:bg-sage-200 flex items-center justify-center text-sage-700 mb-2 transition-colors">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Click to browse or drag file here
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Supported: {allowedExtensions.join(', ')} (Max {maxSizeMb} MB)
              </p>
              <input
                type="file"
                className="hidden"
                accept={allowedExtensions.join(',')}
                onChange={handleLocalFileChange}
              />
            </label>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-sage-50 border border-sage-300">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{localFile.name}</p>
                  <p className="text-[10px] text-slate-500">{(localFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearSelection}
                className="p-1 rounded-lg hover:bg-sage-200 text-slate-500 hover:text-slate-800 transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p className="text-[11px] text-slate-light">{hint}</p>
    </div>
  );
}
