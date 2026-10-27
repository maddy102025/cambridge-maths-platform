-- Migration 0002: SuperAdmin CMS content table (idempotent)
CREATE TABLE IF NOT EXISTS CmsContent (
  id TEXT PRIMARY KEY NOT NULL,
  key TEXT NOT NULL,
  section TEXT NOT NULL,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text',
  description TEXT,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedBy TEXT DEFAULT 'CMS Administrator'
);
CREATE UNIQUE INDEX IF NOT EXISTS CmsContent_key_key ON CmsContent(key);
CREATE INDEX IF NOT EXISTS CmsContent_category_idx ON CmsContent(category);
