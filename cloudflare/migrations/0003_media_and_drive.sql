-- Migration 0003: R2 Media Library and Google Drive Integration metadata
CREATE TABLE IF NOT EXISTS MediaItem (
  id TEXT PRIMARY KEY NOT NULL,
  key TEXT NOT NULL,
  url TEXT NOT NULL,
  fileName TEXT NOT NULL,
  mimeType TEXT NOT NULL,
  sizeBytes INTEGER NOT NULL,
  category TEXT NOT NULL DEFAULT 'GENERAL',
  title TEXT,
  description TEXT,
  uploadedBy TEXT DEFAULT 'SuperAdmin',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS MediaItem_key_key ON MediaItem(key);
CREATE INDEX IF NOT EXISTS MediaItem_category_idx ON MediaItem(category);
