/**
 * Google Drive Integration Utility
 * Handles parsing, validation, preview generation, and direct download links
 * for student and teacher study materials, assignments, and submissions.
 */

export interface GoogleDriveInfo {
  isGoogleDrive: boolean;
  fileId: string | null;
  kind: 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'folder' | 'file';
  viewUrl: string;
  previewUrl: string;
  downloadUrl: string;
  label: string;
  iconName: 'file-text' | 'table' | 'presentation' | 'folder' | 'file';
}

/**
 * Extracts Google Drive / Docs / Sheets / Slides file ID and constructs preview/view/download URLs.
 */
export function parseGoogleDriveUrl(inputUrl: string): GoogleDriveInfo {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return {
      isGoogleDrive: false,
      fileId: null,
      kind: 'file',
      viewUrl: '',
      previewUrl: '',
      downloadUrl: '',
      label: 'Standard File',
      iconName: 'file',
    };
  }

  const url = inputUrl.trim();

  // Pattern checks
  const docMatch = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  const sheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  const slideMatch = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);

  let fileId: string | null = null;
  let kind: GoogleDriveInfo['kind'] = 'file';
  let label = 'Google Drive File';
  let iconName: GoogleDriveInfo['iconName'] = 'file';

  if (docMatch) {
    fileId = docMatch[1];
    kind = 'document';
    label = 'Google Docs Document';
    iconName = 'file-text';
  } else if (sheetMatch) {
    fileId = sheetMatch[1];
    kind = 'spreadsheet';
    label = 'Google Sheets Spreadsheet';
    iconName = 'table';
  } else if (slideMatch) {
    fileId = slideMatch[1];
    kind = 'presentation';
    label = 'Google Slides Presentation';
    iconName = 'presentation';
  } else if (folderMatch) {
    fileId = folderMatch[1];
    kind = 'folder';
    label = 'Google Drive Folder';
    iconName = 'folder';
  } else if (fileMatch) {
    fileId = fileMatch[1];
    kind = 'file';
    label = 'Google Drive File';
    iconName = 'file';
  } else if (idParamMatch && (url.includes('drive.google.com') || url.includes('docs.google.com'))) {
    fileId = idParamMatch[1];
    kind = 'file';
    label = 'Google Drive File';
    iconName = 'file';
  } else if (/^[a-zA-Z0-9_-]{25,}$/.test(url)) {
    // Direct Google Drive file ID input
    fileId = url;
    kind = 'file';
    label = 'Google Drive File';
    iconName = 'file';
  }

  const isGoogleDrive = !!fileId || url.includes('drive.google.com') || url.includes('docs.google.com');

  if (!isGoogleDrive || !fileId) {
    return {
      isGoogleDrive: false,
      fileId: null,
      kind: 'file',
      viewUrl: url,
      previewUrl: url,
      downloadUrl: url,
      label: 'Standard File',
      iconName: 'file',
    };
  }

  // Construct standard urls
  let viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
  let previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  let downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

  if (kind === 'document') {
    viewUrl = `https://docs.google.com/document/d/${fileId}/view`;
    previewUrl = `https://docs.google.com/document/d/${fileId}/preview`;
    downloadUrl = `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
  } else if (kind === 'spreadsheet') {
    viewUrl = `https://docs.google.com/spreadsheets/d/${fileId}/view`;
    previewUrl = `https://docs.google.com/spreadsheets/d/${fileId}/preview`;
    downloadUrl = `https://docs.google.com/spreadsheets/d/${fileId}/export?format=pdf`;
  } else if (kind === 'presentation') {
    viewUrl = `https://docs.google.com/presentation/d/${fileId}/view`;
    previewUrl = `https://docs.google.com/presentation/d/${fileId}/preview`;
    downloadUrl = `https://docs.google.com/presentation/d/${fileId}/export/pdf`;
  } else if (kind === 'folder') {
    viewUrl = `https://drive.google.com/drive/folders/${fileId}`;
    previewUrl = viewUrl;
    downloadUrl = viewUrl;
  }

  return {
    isGoogleDrive: true,
    fileId,
    kind,
    viewUrl,
    previewUrl,
    downloadUrl,
    label,
    iconName,
  };
}

/**
 * Validates whether a string is a valid Google Drive shareable link or file ID.
 */
export function isValidGoogleDriveUrl(url: string): boolean {
  if (!url) return false;
  const parsed = parseGoogleDriveUrl(url);
  return parsed.isGoogleDrive && parsed.fileId !== null;
}
