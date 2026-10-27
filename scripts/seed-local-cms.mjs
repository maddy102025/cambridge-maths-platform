import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function run() {
  const hash = await bcrypt.hash('SuperAdminPass2026!', 10);
  await prisma.user.upsert({
    where: { email: 'superadmin@cambridgemaths.edu' },
    update: {
      role: 'SuperAdmin',
      passwordHash: hash,
      fullName: 'Master CMS SuperAdmin',
    },
    create: {
      id: 'usr_superadmin_01',
      email: 'superadmin@cambridgemaths.edu',
      passwordHash: hash,
      fullName: 'Master CMS SuperAdmin',
      role: 'SuperAdmin',
      phone: '+44 20 7946 0999',
      phoneVerified: true,
      emailVerified: true,
      bio: 'SuperAdmin with master authority over all CMS site contents',
    },
  });

  const sql = fs.readFileSync('cloudflare/seed-cms.sql', 'utf8');
  const cleanSql = sql.replace(/--.*$/gm, '');
  const stmts = cleanSql
    .split(';\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Seeding ${stmts.length} statements into local SQLite...`);
  for (const s of stmts) {
    await prisma.$executeRawUnsafe(s);
  }
  console.log('✓ Local SQLite seeded successfully with SuperAdmin and CMS data!');
  await prisma.$disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
