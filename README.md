# Cambridge O & A Levels Mathematics Learning Platform

A modern, responsive educational web application combining a professional Cambridge Mathematics teacher portfolio and course enrollment landing page with a secure, authenticated student Learning Management System (LMS) and teacher management portal.

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

## 3. Demo Credentials

| Role | Email | Password | Details |
|---|---|---|---|
| **Teacher / Admin** | `teacher@cambridgemaths.edu` | `AdminPass123!` | Ms. Eleanor Vance |
| **Student** | `student@cambridgemaths.edu` | `StudentPass123!` | Sarah Ahmed (O Level Math & Add Math, 11/19 attended) |
| **Student (Alt)** | `liam@cambridgemaths.edu` | `StudentPass123!` | Liam Chen (A Level Pure Math & Mechanics) |

*(Note: On the `/login` page, you can also click the quick demo buttons to autofill these credentials immediately).*

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

## 5. Production Database Deployment (Supabase / PostgreSQL)

To switch from the default local SQLite database to Supabase or PostgreSQL:

1. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres?schema=public"
   ```
2. Apply the Supabase migration script containing Row Level Security (RLS) policies:
   The migration file is available at `supabase/migrations/20261026000000_init.sql`.
3. In `prisma/schema.prisma`, update the datasource provider to `postgresql`.
4. Run `pnpm exec prisma db push`.
