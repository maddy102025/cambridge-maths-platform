import fs from 'fs';
import path from 'path';

const bcryptHash = '$2b$10$Aqs0I9ATglpoHBgkXPShWOWx8AVeGkqKOI3aKn5ML/mHCIDiPfmEm';
const now = new Date().toISOString();

// Load initial CMS data from cmsData.ts
const cmsDataContent = fs.readFileSync('src/lib/cmsData.ts', 'utf8');
const arrayStart = cmsDataContent.indexOf('export const INITIAL_CMS_DATA: CmsItem[] = [');
const arrayEnd = cmsDataContent.indexOf('];\n\n// Fast', arrayStart);
const arrayStr = cmsDataContent.substring(arrayStart + 'export const INITIAL_CMS_DATA: CmsItem[] = '.length, arrayEnd + 1);

const items = eval(arrayStr);

let sql = '-- Seed CMS Content and SuperAdmin\n';
sql += `INSERT OR IGNORE INTO User (id, email, passwordHash, fullName, role, phone, phoneVerified, emailVerified, bio, createdAt, updatedAt) VALUES ('usr_superadmin_01', 'superadmin@cambridgemaths.edu', '${bcryptHash}', 'Master CMS SuperAdmin', 'SuperAdmin', '+44 20 7946 0999', 1, 1, 'SuperAdmin with master authority over all CMS site contents', '${now}', '${now}');\n\n`;

for (const item of items) {
  const safeVal = item.value.replace(/'/g, "''");
  const safeLabel = item.label.replace(/'/g, "''");
  const safeDesc = (item.description || '').replace(/'/g, "''");
  sql += `INSERT OR IGNORE INTO CmsContent (id, key, section, category, label, value, type, description, updatedAt, updatedBy) VALUES ('${item.id}', '${item.key}', '${item.section}', '${item.category}', '${safeLabel}', '${safeVal}', '${item.type}', '${safeDesc}', '${now}', 'SuperAdmin');\n`;
}

fs.writeFileSync('cloudflare/seed-cms.sql', sql);
console.log(`Generated cloudflare/seed-cms.sql with ${items.length} CMS items and SuperAdmin account.`);
