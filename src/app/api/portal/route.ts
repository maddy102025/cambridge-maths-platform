import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view');

    if (view === 'public') {
      const [subjects, cmsRows] = await Promise.all([
        prisma.subject.findMany({
          orderBy: { orderIndex: 'asc' },
        }),
        (prisma as any)
          .$queryRawUnsafe('SELECT key, value FROM CmsContent')
          .catch(() => []),
      ]);

      const contentMap: Record<string, string> = {};
      if (Array.isArray(cmsRows)) {
        for (const row of cmsRows) {
          contentMap[row.key] = row.value;
        }
      }

      return NextResponse.json({ subjects, contentMap });
    }


    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (view === 'student-layout') {
      const unreadCount = await prisma.notification.count({
        where: { userId: user.id, isRead: false },
      });
      return NextResponse.json({ user, unreadCount });
    }

    if (view === 'student-home') {
      const enrollments = await prisma.studentEnrollment.findMany({
        where: { studentId: user.id, status: 'ACTIVE' },
        include: {
          subject: {
            include: {
              lessons: true,
              materials: true,
              assignments: true,
            },
          },
        },
      });

      const enrolledSubjectIds = enrollments.map((e) => e.subjectId);

      const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: { studentId: user.id },
      });

      const allAssignments = await prisma.assignment.findMany({
        where: { subjectId: { in: enrolledSubjectIds } },
        include: {
          subject: true,
          submissions: {
            where: { studentId: user.id },
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      const recentGrades = await prisma.submission.findMany({
        where: {
          studentId: user.id,
          isPublished: true,
          gradeScore: { not: null },
        },
        include: {
          assignment: {
            include: { subject: true },
          },
        },
        orderBy: { gradedAt: 'desc' },
        take: 3,
      });

      const recentMaterials = await prisma.studyMaterial.findMany({
        where: {
          subjectId: { in: enrolledSubjectIds },
          isPublicToClass: true,
        },
        include: { subject: true },
        orderBy: { createdAt: 'desc' },
        take: 4,
      });

      const recentAnnouncements = await prisma.announcement.findMany({
        where: {
          OR: [{ subjectId: null }, { subjectId: { in: enrolledSubjectIds } }],
        },
        include: { subject: true },
        orderBy: { publishedAt: 'desc' },
        take: 3,
      });

      return NextResponse.json({
        user,
        enrollments,
        attendanceRecords,
        allAssignments,
        recentGrades,
        recentMaterials,
        recentAnnouncements,
      });
    }

    if (view === 'student-modules') {
      const enrollments = await prisma.studentEnrollment.findMany({
        where: { studentId: user.id, status: 'ACTIVE' },
        include: {
          subject: {
            include: {
              lessons: true,
              materials: true,
              assignments: {
                include: {
                  submissions: {
                    where: { studentId: user.id },
                  },
                },
              },
            },
          },
        },
      });

      const enrolledSubjectIds = enrollments.map((e) => e.subjectId);
      const otherSubjects = await prisma.subject.findMany({
        where: {
          id: { notIn: enrolledSubjectIds },
          isAvailable: true,
        },
      });

      return NextResponse.json({ user, enrollments, otherSubjects });
    }

    if (view === 'student-module-detail') {
      const id = searchParams.get('id');
      if (!id) return NextResponse.json({ error: 'Missing subject ID' }, { status: 400 });

      const subject = await prisma.subject.findUnique({
        where: { id },
        include: {
          lessons: { orderBy: { orderIndex: 'asc' } },
          materials: { orderBy: { createdAt: 'desc' } },
          assignments: {
            include: {
              submissions: { where: { studentId: user.id } },
            },
            orderBy: { dueDate: 'asc' },
          },
          announcements: { orderBy: { publishedAt: 'desc' }, take: 5 },
          enrollments: { where: { studentId: user.id } },
        },
      });

      if (!subject) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const isEnrolled =
        subject.enrollments.length > 0 || ['TEACHER', 'ADMIN', 'SuperAdmin'].includes(user.role as string);
      if (!isEnrolled) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json({ subject, userRole: user.role });
    }

    if (view === 'student-quest') {
      const enrollments = await prisma.studentEnrollment.findMany({
        where: { studentId: user.id, status: 'ACTIVE' },
        select: { subjectId: true },
      });
      const subjectIds = enrollments.map((e) => e.subjectId);

      const assignments = await prisma.assignment.findMany({
        where: { subjectId: { in: subjectIds } },
        include: {
          subject: true,
          submissions: {
            where: { studentId: user.id },
            include: {
              versions: { orderBy: { versionNumber: 'desc' } },
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      return NextResponse.json({ user, assignments });
    }

    if (view === 'student-heads-up') {
      const enrollments = await prisma.studentEnrollment.findMany({
        where: { studentId: user.id },
        select: { subjectId: true },
      });
      const subjectIds = enrollments.map((e) => e.subjectId);

      const [announcements, notifications] = await Promise.all([
        prisma.announcement.findMany({
          where: {
            OR: [{ subjectId: null }, { subjectId: { in: subjectIds } }],
          },
          include: { subject: true },
          orderBy: { publishedAt: 'desc' },
        }),
        prisma.notification.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return NextResponse.json({ announcements, notifications });
    }

    if (view === 'student-profile') {
      const [enrollments, attendanceRecords] = await Promise.all([
        prisma.studentEnrollment.findMany({
          where: { studentId: user.id },
          include: { subject: true },
        }),
        prisma.attendanceRecord.findMany({
          where: { studentId: user.id },
        }),
      ]);
      return NextResponse.json({ user, enrollments, attendanceRecords });
    }

    // Admin views check RBAC
    if (!['TEACHER', 'ADMIN', 'SuperAdmin'].includes(user.role as string)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (view === 'admin-layout') {
      return NextResponse.json({ user });
    }

    if (view === 'admin-dashboard') {
      const [
        totalStudents,
        totalSubjects,
        totalAssignments,
        pendingSubmissionsCount,
        totalInquiries,
        recentSubmissions,
      ] = await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.subject.count(),
        prisma.assignment.count(),
        prisma.submission.count({ where: { status: { in: ['SUBMITTED', 'LATE'] } } }),
        prisma.contactInquiry.count({ where: { status: 'NEW' } }),
        prisma.submission.findMany({
          where: { status: { in: ['SUBMITTED', 'LATE'] } },
          include: {
            student: true,
            assignment: { include: { subject: true } },
            versions: { orderBy: { versionNumber: 'desc' }, take: 1 },
          },
          orderBy: { submittedAt: 'desc' },
          take: 5,
        }),
      ]);

      return NextResponse.json({
        user,
        totalStudents,
        totalSubjects,
        totalAssignments,
        pendingSubmissionsCount,
        totalInquiries,
        recentSubmissions,
      });
    }

    if (view === 'admin-students') {
      const [students, allSubjects] = await Promise.all([
        prisma.user.findMany({
          where: { role: 'STUDENT' },
          include: {
            enrollments: { include: { subject: true } },
            attendance: true,
          },
          orderBy: { fullName: 'asc' },
        }),
        prisma.subject.findMany({ orderBy: { orderIndex: 'asc' } }),
      ]);
      return NextResponse.json({ students, allSubjects });
    }

    if (view === 'admin-courses') {
      const subjects = await prisma.subject.findMany({
        include: {
          materials: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { orderIndex: 'asc' },
      });
      return NextResponse.json({ subjects });
    }

    if (view === 'admin-assignments') {
      const [assignments, allSubjects, allSubmissions] = await Promise.all([
        prisma.assignment.findMany({
          include: { subject: true },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.subject.findMany({ orderBy: { orderIndex: 'asc' } }),
        prisma.submission.findMany({
          include: {
            student: true,
            assignment: { include: { subject: true } },
            versions: { orderBy: { versionNumber: 'desc' } },
          },
          orderBy: { submittedAt: 'desc' },
        }),
      ]);
      return NextResponse.json({ assignments, allSubjects, allSubmissions });
    }

    if (view === 'admin-attendance') {
      const [subjects, allAttendance] = await Promise.all([
        prisma.subject.findMany({
          include: {
            enrollments: { include: { student: true } },
          },
          orderBy: { orderIndex: 'asc' },
        }),
        prisma.attendanceRecord.findMany({
          orderBy: { classDate: 'desc' },
          take: 20,
        }),
      ]);
      return NextResponse.json({ subjects, allAttendance });
    }

    if (view === 'admin-announcements') {
      const [announcements, subjects] = await Promise.all([
        prisma.announcement.findMany({
          include: { subject: true },
          orderBy: { publishedAt: 'desc' },
        }),
        prisma.subject.findMany({ orderBy: { orderIndex: 'asc' } }),
      ]);
      return NextResponse.json({ announcements, subjects });
    }

    if (view === 'admin-inquiries') {
      const inquiries = await prisma.contactInquiry.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ inquiries });
    }

    return NextResponse.json({ error: 'Unknown view' }, { status: 400 });
  } catch (err: any) {
    console.error('Portal API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
