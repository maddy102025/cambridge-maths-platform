# Cambridge O & A Levels Mathematics Learning Platform

A modern, responsive educational web application combining a professional Cambridge Mathematics teacher portfolio and course enrollment landing page with a secure, authenticated student Learning Management System (LMS) and teacher management portal.

**Live Production Deployment (Cloudflare Workers + D1):**
- **Live URL:** [https://cambridge-maths-platform.rimo777.workers.dev](https://cambridge-maths-platform.rimo777.workers.dev)
- **Cloudflare Worker Name:** `cambridge-maths-platform`
- **Cloudflare D1 Database:** `cambridge-maths-db` (`3bca9069-8f16-415f-8386-8c6f387c0fda`)

---

## 1. Design System & Visual Identity

The platform adheres to an academic pastel color palette:
- **Soft Sage Green (`#B8CDBA`)**: Primary accents, buttons, and highlights.
- **Warm Ivory (`#FAF8F2`)**: Main background canvas.
- **Muted Slate (`#34443F`)**: Text, typography, headings, and high-contrast elements.
- **Surface Accents**: Pure white cards, subtle geometric border lines, mathematical grid overlays, and formula annotations.

---

## 2. Feature Architecture

### A. Public Teacher Landing Page
- **Hero — Meet the Teacher**: Split layout featuring introductory copy, Cambridge O & A Levels labels, primary and secondary CTAs, and a portrait with mathematical geometric annotations.
- **About the Teacher**: Biography, educational philosophy, focus on conceptual clarity, structured past paper practice, and Cambridge examination techniques.
- **Classes & Subjects Offered**: 6 Cambridge syllabuses:
  1. *Mathematics* — Cambridge O Level, Syllabus D (4024 / 4025)
  2. *Additional Mathematics* — O Level (4037)
  3. *Pure Mathematics* — A Level (Papers 1, 2, and 3)
  4. *Mechanics* — A Level (Paper 4)
  5. *Probability & Statistics* — A Level (Papers 1 and 2)
  6. *Further Mathematics* (9231)
- **Learning Approach**: 4-step framework (Concept First, Practice with Purpose, Track Your Progress, Exam Readiness).
- **Call to Action**: High-conversion enrollment and portal gateway banner.
- **Contact & Inquiries Section**: Contact details, WhatsApp indicators, location info, and an interactive form with database persistence and safe email logging.
- **Footer**: Brand wordmark, navigation links, syllabus shortcuts, and copyright.

### B. Authentication & Security
- Real authentication powered by `bcryptjs` password hashing and `jose` JWT HTTP-only session cookies.
- **Role-Based Access Control (RBAC)**:
  - `STUDENT`: Can access only their enrolled course modules, submissions, grades, and notifications.
  - `TEACHER` / `ADMIN`: Server-protected access to manage courses, enrollments, grading, attendance, and announcements.
- Registration with phone country code validation, duplicate email protection, and password complexity enforcement.
- Demo 1-click login autofill buttons for instant evaluation.

### C. Student Portal
- **Home Dashboard**:
  - Projected Cambridge Grade (e.g., $A^*$, $A$).
  - Attendance summary ($11 / 19$ classes attended = $57.9\% \approx 58\%$).
  - Active study streak counter (e.g., $8$ consecutive days).
  - Quest assignment completion progress.
  - Upcoming deadlines and recent instructor feedback.
- **Modules (Subject Management)**:
  - Filtered to display only enrolled subjects.
  - **Debrief**: Subject overview, syllabus description, recorded lecture videos with player modal, deadlines, and notices.
  - **Study Drops**: Searchable and topic-filtered repository of PDF revision notes, formula sheets, and past paper compilations with direct download capability.
  - **Upload Repository**: Clear separation between instructor resources, student upload queries, and formal assignments, with $15\text{ MB}$ validation.
- **Quest (Assignment Tracker)**:
  - Filters: *All*, *Upcoming*, *Overdue*, *Submitted*, *Graded*.
  - Version-controlled submission workflow (PDF, DOCX, ZIP, PNG, JPG).
  - Audit history retaining timestamps, student notes, and file downloads.
  - Published grades with numerical score, letter grade, and written feedback.
- **Heads-up (Notifications & Announcements)**:
  - Centralized notification stream and official instructor announcements.
  - Mark individual as read, mark all as read, and filter by type (*Grade*, *Assignment*, *Resource*).
- **Profile & Settings**:
  - Candidate profile, contact verification states, and active course enrollments.

### D. Teacher / Administrator Portal (`/admin`)
- **Dashboard Hub**: High-level metrics for registered candidates, pending submissions, live courses, and admissions inquiries.
- **Student Management**: Roster search, individual attendance statistics, quick enroll/unenroll actions, and editable projected Cambridge grades.
- **Courses & Study Drops**: Upload new lecture resources and revision files directly to student Study Drops with instant notification dispatch.
- **Assignment & Grading Workspace**:
  - Assignment creator with deadline scheduling, max mark limits, and reference prompt attachments.
  - Interactive grading station: inspect student solutions, award marks, write examiner comments, return work for revision, or publish grades.
- **Attendance & Lecture Records**: Daily session logger (Present, Absent, Excused, Late) updating student metrics dynamically.
- **Announcements**: School-wide and syllabus-targeted broadcast editor.
- **Admissions Inquiries**: Review submissions from the public website contact form.

---

### E. SuperAdmin Content Console (`/cms`)

A separate auth layer (role `SuperAdmin`, cookie `cambridge_cms_token`, 24h JWT with a `cmsLayer` claim) manages every piece of site copy stored in the `CmsContent` table (83 fields: headlines, buttons, descriptions, contact info).

| Route | Purpose |
|---|---|
| `/cms/login` | SuperAdmin sign-in (no prefilled credentials) |
| `/cms` | Overview: field counts, customised fields, recent edits |
| `/cms/media` | **Cloudflare R2 Media Library**: Upload, search, preview, categorize, copy CDN URLs, and delete static/permanent media assets |
| `/cms/public` · `/cms/student` · `/cms/teacher` · `/cms/global` | Section editors with search, per-field revert, per-section reset, sticky Publish bar |
| `/cms/account` | Session info and security notes |

- **Cloudflare R2 Media Management & Asset Assignment**:
  - Bucket: `cambridge-maths-media` bound to `MEDIA_BUCKET` in `wrangler.toml`.
  - Static and permanent media assets are served directly from the edge via `/media/:key` with HTTP metadata and caching headers.
  - Dedicated CMS interface (`src/components/cms/MediaManager.tsx`, `/cms/media`) for SuperAdmin to upload branding assets, badges, banners, course thumbnails, and static documents with 1-click "Set as Logo", "Set as Favicon", and "Set as Avatar" actions.
  - Interactive **R2 Media Picker Modal** (`src/components/cms/R2MediaPickerModal.tsx`) integrated into all CMS section editors (`ContentEditor.tsx`) allowing direct browsing, searching, live previews, and on-the-spot uploads to R2.
  - Dynamic branding: Brand Logo (`global_site_logo_url`), Browser Favicon (`global_site_favicon_url` via `FaviconHead.tsx`), and Teacher/Student Avatars (`global_instructor_avatar_url`, `global_student_default_avatar_url`) consume R2 links dynamically application-wide.
- **Google Drive Storage Integration**:
  - Student uploads, quest assignment submissions, and teacher study drops support shareable Google Drive links alongside direct file attachments.
  - Automatic URL parsing and metadata formatting (`src/lib/googleDrive.ts`, `src/components/common/GoogleDriveUpload.tsx`) with direct preview links and file type badges (Google Docs, Sheets, Slides, Folders, PDF, ZIP).
  - Teacher grading view (`src/components/admin/AssignmentGradingView.tsx`) allows one-click opening of student Google Drive solutions.
- **Teacher Student Creation**:
  - Teachers and Admins can create new student accounts directly within `/admin/students`.
  - Configures full name, email, auto-generated secure password, phone, Cambridge level, projected grade, target exam date, and course enrollments.
- **Unified Portal Header & Design Tokens**:
  - `src/components/layout/PortalHeader.tsx` provides consistent layout, responsive mobile drawer navigation, live academic dates, role badges, streak indicators, and quick portal switching across Student, Teacher, and CMS portals.
- Layout: persistent sidebar on desktop, drawer on mobile (`src/components/cms/CmsShell.tsx`, `CmsSidebar.tsx`).
- Pages read copy with the `cms(key, fallback)` hook (`src/lib/useCms.ts`); defaults live in `src/lib/cmsData.ts`.
- API: `GET/POST /api/cms/content`, `POST /api/cms/reset`, `POST /api/cms/login|logout`, `GET /api/cms/session`, `GET/POST/DELETE /api/cms/media` (mirrored in `cloudflare/worker.ts`). Writes accept only known keys, max 5000 chars.
- SuperAdmin can also open the teacher workspace (`/admin`) and its APIs.

## 3. Demo Credentials

| Role | Email | Password | Details |
|---|---|---|---|
| **Teacher / Admin** | `teacher@cambridgemaths.edu` | `AdminPass123!` | Ms. Eleanor Vance |
| **Student** | `student@cambridgemaths.edu` | `StudentPass123!` | Sarah Ahmed (O Level Math & Add Math, 11/19 attended) |
| **Student (Alt)** | `liam@cambridgemaths.edu` | `StudentPass123!` | Liam Chen (A Level Pure Math & Mechanics) |

*(Note: On the `/login` page, the Student and Teacher demo buttons autofill these credentials. **Remove them and change these passwords before real use.**)*

**SuperAdmin** (`superadmin@cambridgemaths.edu`) is seeded by `prisma/seed.ts` / `cloudflare/seed-cms.sql`. The initial password is set in the seed; **rotate it immediately in production**. The emergency passkey login is disabled unless the `CMS_MASTER_PASSKEY` secret (12+ chars) is set (`npx wrangler secret put CMS_MASTER_PASSKEY`).

**Secrets:** set `JWT_SECRET` as a Worker secret (`npx wrangler secret put JWT_SECRET`) rather than relying on the value in `wrangler.toml`.

### Database migrations

```bash
# Local
npx prisma db push --skip-generate && node scripts/seed-local-cms.mjs
# Remote D1 (idempotent; seed uses INSERT OR IGNORE so edited content is never overwritten)
npx wrangler d1 execute cambridge-maths-db --remote --file=cloudflare/migrations/0002_cms_content.sql
node scripts/generate-cms-sql.mjs
npx wrangler d1 execute cambridge-maths-db --remote --file=cloudflare/seed-cms.sql
```

---

## 4. Local Setup & Execution Instructions

### Prerequisites
- Node.js (v18+)
- pnpm or npm

### Steps to Run

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Synchronize database & seed demo data:**
   ```bash
   pnpm exec prisma db push
   pnpm exec tsx prisma/seed.ts
   ```

3. **Start development server:**
   ```bash
   pnpm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Production Build & Test:**
   ```bash
   pnpm run build
   pnpm run start
   ```

---

## 5. Cloudflare Workers + D1 Production Deployment

The application is architected to deploy natively to **Cloudflare Workers + Static Assets + Cloudflare D1**:
- **Frontend**: Next.js static export (`output: 'export'` when `BUILD_TARGET=cloudflare`) served at the edge via Cloudflare Workers Static Assets (`[assets]` binding in `wrangler.toml`).
- **Backend API & Auth (`cloudflare/worker.ts`)**: Full edge API handling `/api/portal`, `/api/auth/*`, `/api/student/*`, `/api/admin/*`, `/api/contact`, and `/uploads/*` backed directly by Cloudflare D1 (`env.DB`) and Web Crypto PBKDF2 / `bcryptjs` + `jose` JWT HTTP-only cookies.
- **File Uploads on Edge**: Student assignment submissions and teacher resource uploads are stored in the D1 `FileStorage` table (`base64Data`) and served dynamically at `/uploads/:fileName` with proper MIME types and Content-Disposition headers.
- **Database Schema & Seed**: Located in `cloudflare/d1-schema.sql` (generated via `prisma/export-d1.ts`).

### Cloudflare Deployment Commands
```bash
# 1. Build static frontend for Cloudflare
pnpm run build:cf

# 2. Deploy Worker + Static Assets + D1 binding to Cloudflare
pnpm run deploy:cf
```

### Continuous Deployment (GitHub Actions)
A workflow is configured in `.github/workflows/deploy.yml` to automatically build and deploy to Cloudflare Workers on every push to `main`.

---

## 6. Alternative Database Deployment (Supabase / PostgreSQL)

To switch from the local SQLite / Cloudflare D1 database to Supabase or PostgreSQL:

1. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres?schema=public"
   ```
2. Apply the Supabase migration script containing Row Level Security (RLS) policies:
   The migration file is available at `supabase/migrations/20261026000000_init.sql`.
3. In `prisma/schema.prisma`, update the datasource provider to `postgresql`.
4. Run `pnpm exec prisma db push`.
