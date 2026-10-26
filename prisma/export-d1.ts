import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function esc(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (typeof val === 'number') return String(val);
  if (val instanceof Date) return `'${val.toISOString()}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

async function main() {
  const lines: string[] = [
    '-- Cloudflare D1 Schema & Initial Seed for Cambridge O & A Levels Mathematics Platform',
    'DROP TABLE IF EXISTS FileStorage;',
    'DROP TABLE IF EXISTS ContactInquiry;',
    'DROP TABLE IF EXISTS Notification;',
    'DROP TABLE IF EXISTS Announcement;',
    'DROP TABLE IF EXISTS AttendanceRecord;',
    'DROP TABLE IF EXISTS SubmissionVersion;',
    'DROP TABLE IF EXISTS Submission;',
    'DROP TABLE IF EXISTS Assignment;',
    'DROP TABLE IF EXISTS StudyMaterial;',
    'DROP TABLE IF EXISTS Lesson;',
    'DROP TABLE IF EXISTS StudentEnrollment;',
    'DROP TABLE IF EXISTS Subject;',
    'DROP TABLE IF EXISTS User;',
    '',
    `CREATE TABLE User (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      fullName TEXT NOT NULL,
      phone TEXT,
      phoneVerified INTEGER DEFAULT 0,
      emailVerified INTEGER DEFAULT 1,
      role TEXT DEFAULT 'STUDENT',
      avatarUrl TEXT,
      bio TEXT,
      projectedGrade TEXT DEFAULT 'A*',
      studyStreakDays INTEGER DEFAULT 7,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );`,
    `CREATE TABLE Subject (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      syllabusInfo TEXT NOT NULL,
      description TEXT NOT NULL,
      level TEXT NOT NULL,
      instructorName TEXT DEFAULT 'Ms. Eleanor Vance',
      isAvailable INTEGER DEFAULT 1,
      scheduleInfo TEXT,
      iconName TEXT,
      orderIndex INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );`,
    `CREATE TABLE StudentEnrollment (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE',
      enrolledAt TEXT NOT NULL,
      UNIQUE(studentId, subjectId)
    );`,
    `CREATE TABLE Lesson (
      id TEXT PRIMARY KEY,
      subjectId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      videoUrl TEXT,
      durationMinutes INTEGER DEFAULT 45,
      orderIndex INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );`,
    `CREATE TABLE StudyMaterial (
      id TEXT PRIMARY KEY,
      subjectId TEXT NOT NULL,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      description TEXT,
      fileType TEXT NOT NULL,
      fileSize TEXT NOT NULL,
      fileUrl TEXT NOT NULL,
      uploadedByRole TEXT DEFAULT 'TEACHER',
      uploadedById TEXT NOT NULL,
      isPublicToClass INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );`,
    `CREATE TABLE Assignment (
      id TEXT PRIMARY KEY,
      subjectId TEXT NOT NULL,
      title TEXT NOT NULL,
      instructions TEXT NOT NULL,
      maxMarks INTEGER DEFAULT 100,
      dueDate TEXT NOT NULL,
      assignedDate TEXT NOT NULL,
      allowLateSubmissions INTEGER DEFAULT 1,
      allowResubmissions INTEGER DEFAULT 1,
      referenceFileUrl TEXT,
      referenceFileName TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );`,
    `CREATE TABLE Submission (
      id TEXT PRIMARY KEY,
      assignmentId TEXT NOT NULL,
      studentId TEXT NOT NULL,
      status TEXT DEFAULT 'SUBMITTED',
      currentVersion INTEGER DEFAULT 1,
      submittedAt TEXT,
      gradeScore REAL,
      gradeMax REAL DEFAULT 100,
      gradeLetter TEXT,
      feedback TEXT,
      gradedAt TEXT,
      gradedById TEXT,
      isPublished INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      UNIQUE(assignmentId, studentId)
    );`,
    `CREATE TABLE SubmissionVersion (
      id TEXT PRIMARY KEY,
      submissionId TEXT NOT NULL,
      versionNumber INTEGER DEFAULT 1,
      fileUrl TEXT NOT NULL,
      fileName TEXT NOT NULL,
      fileSize TEXT NOT NULL,
      fileType TEXT NOT NULL,
      studentNote TEXT,
      submittedAt TEXT NOT NULL
    );`,
    `CREATE TABLE AttendanceRecord (
      id TEXT PRIMARY KEY,
      studentId TEXT NOT NULL,
      subjectId TEXT NOT NULL,
      classDate TEXT NOT NULL,
      status TEXT DEFAULT 'PRESENT',
      remarks TEXT,
      createdAt TEXT NOT NULL
    );`,
    `CREATE TABLE Announcement (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      subjectId TEXT,
      priority TEXT DEFAULT 'NORMAL',
      publishedAt TEXT NOT NULL,
      authorId TEXT NOT NULL
    );`,
    `CREATE TABLE Notification (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      linkUrl TEXT,
      type TEXT DEFAULT 'SYSTEM',
      isRead INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );`,
    `CREATE TABLE ContactInquiry (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subjectOfInterest TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'NEW',
      createdAt TEXT NOT NULL
    );`,
    `CREATE TABLE FileStorage (
      fileName TEXT PRIMARY KEY,
      mimeType TEXT NOT NULL,
      sizeBytes INTEGER NOT NULL,
      dataBase64 TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );`,
    '',
  ];

  // Re-run clean seed first so we don't have test artifacts
  const users = await prisma.user.findMany();
  for (const u of users) {
    lines.push(
      `INSERT INTO User VALUES (${esc(u.id)}, ${esc(u.email)}, ${esc(u.passwordHash)}, ${esc(u.fullName)}, ${esc(u.phone)}, ${esc(u.phoneVerified)}, ${esc(u.emailVerified)}, ${esc(u.role)}, ${esc(u.avatarUrl)}, ${esc(u.bio)}, ${esc(u.projectedGrade)}, ${esc(u.studyStreakDays)}, ${esc(u.createdAt)}, ${esc(u.updatedAt)});`
    );
  }

  const subjects = await prisma.subject.findMany();
  for (const s of subjects) {
    lines.push(
      `INSERT INTO Subject VALUES (${esc(s.id)}, ${esc(s.code)}, ${esc(s.name)}, ${esc(s.syllabusInfo)}, ${esc(s.description)}, ${esc(s.level)}, ${esc(s.instructorName)}, ${esc(s.isAvailable)}, ${esc(s.scheduleInfo)}, ${esc(s.iconName)}, ${esc(s.orderIndex)}, ${esc(s.createdAt)}, ${esc(s.updatedAt)});`
    );
  }

  const enrollments = await prisma.studentEnrollment.findMany();
  for (const e of enrollments) {
    lines.push(
      `INSERT INTO StudentEnrollment VALUES (${esc(e.id)}, ${esc(e.studentId)}, ${esc(e.subjectId)}, ${esc(e.status)}, ${esc(e.enrolledAt)});`
    );
  }

  const lessons = await prisma.lesson.findMany();
  for (const l of lessons) {
    lines.push(
      `INSERT INTO Lesson VALUES (${esc(l.id)}, ${esc(l.subjectId)}, ${esc(l.title)}, ${esc(l.description)}, ${esc(l.videoUrl)}, ${esc(l.durationMinutes)}, ${esc(l.orderIndex)}, ${esc(l.createdAt)}, ${esc(l.updatedAt)});`
    );
  }

  const materials = await prisma.studyMaterial.findMany();
  for (const m of materials) {
    lines.push(
      `INSERT INTO StudyMaterial VALUES (${esc(m.id)}, ${esc(m.subjectId)}, ${esc(m.title)}, ${esc(m.topic)}, ${esc(m.description)}, ${esc(m.fileType)}, ${esc(m.fileSize)}, ${esc(m.fileUrl)}, ${esc(m.uploadedByRole)}, ${esc(m.uploadedById)}, ${esc(m.isPublicToClass)}, ${esc(m.createdAt)}, ${esc(m.updatedAt)});`
    );
  }

  const assignments = await prisma.assignment.findMany();
  for (const a of assignments) {
    lines.push(
      `INSERT INTO Assignment VALUES (${esc(a.id)}, ${esc(a.subjectId)}, ${esc(a.title)}, ${esc(a.instructions)}, ${esc(a.maxMarks)}, ${esc(a.dueDate)}, ${esc(a.assignedDate)}, ${esc(a.allowLateSubmissions)}, ${esc(a.allowResubmissions)}, ${esc(a.referenceFileUrl)}, ${esc(a.referenceFileName)}, ${esc(a.createdAt)}, ${esc(a.updatedAt)});`
    );
  }

  const submissions = await prisma.submission.findMany();
  for (const s of submissions) {
    lines.push(
      `INSERT INTO Submission VALUES (${esc(s.id)}, ${esc(s.assignmentId)}, ${esc(s.studentId)}, ${esc(s.status)}, ${esc(s.currentVersion)}, ${esc(s.submittedAt)}, ${esc(s.gradeScore)}, ${esc(s.gradeMax)}, ${esc(s.gradeLetter)}, ${esc(s.feedback)}, ${esc(s.gradedAt)}, ${esc(s.gradedById)}, ${esc(s.isPublished)}, ${esc(s.createdAt)}, ${esc(s.updatedAt)});`
    );
  }

  const versions = await prisma.submissionVersion.findMany();
  for (const v of versions) {
    lines.push(
      `INSERT INTO SubmissionVersion VALUES (${esc(v.id)}, ${esc(v.submissionId)}, ${esc(v.versionNumber)}, ${esc(v.fileUrl)}, ${esc(v.fileName)}, ${esc(v.fileSize)}, ${esc(v.fileType)}, ${esc(v.studentNote)}, ${esc(v.submittedAt)});`
    );
  }

  const attendance = await prisma.attendanceRecord.findMany();
  for (const a of attendance) {
    lines.push(
      `INSERT INTO AttendanceRecord VALUES (${esc(a.id)}, ${esc(a.studentId)}, ${esc(a.subjectId)}, ${esc(a.classDate)}, ${esc(a.status)}, ${esc(a.remarks)}, ${esc(a.createdAt)});`
    );
  }

  const announcements = await prisma.announcement.findMany();
  for (const a of announcements) {
    lines.push(
      `INSERT INTO Announcement VALUES (${esc(a.id)}, ${esc(a.title)}, ${esc(a.content)}, ${esc(a.subjectId)}, ${esc(a.priority)}, ${esc(a.publishedAt)}, ${esc(a.authorId)});`
    );
  }

  const notifications = await prisma.notification.findMany();
  for (const n of notifications) {
    lines.push(
      `INSERT INTO Notification VALUES (${esc(n.id)}, ${esc(n.userId)}, ${esc(n.title)}, ${esc(n.message)}, ${esc(n.linkUrl)}, ${esc(n.type)}, ${esc(n.isRead)}, ${esc(n.createdAt)});`
    );
  }

  const inquiries = await prisma.contactInquiry.findMany();
  for (const c of inquiries) {
    lines.push(
      `INSERT INTO ContactInquiry VALUES (${esc(c.id)}, ${esc(c.name)}, ${esc(c.email)}, ${esc(c.phone)}, ${esc(c.subjectOfInterest)}, ${esc(c.message)}, ${esc(c.status)}, ${esc(c.createdAt)});`
    );
  }

  const outDir = path.join(process.cwd(), 'cloudflare');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'd1-schema.sql'), lines.join('\n'), 'utf8');
  console.log('Generated cloudflare/d1-schema.sql successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
