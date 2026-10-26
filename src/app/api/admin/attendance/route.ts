import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { subjectId, classDate, records } = await request.json();

    if (!subjectId || !classDate || !records || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Subject, date, and attendance records required.' }, { status: 400 });
    }

    const dateObj = new Date(classDate);

    // Save records
    for (const rec of records) {
      await prisma.attendanceRecord.create({
        data: {
          studentId: rec.studentId,
          subjectId,
          classDate: dateObj,
          status: rec.status || 'PRESENT',
          remarks: rec.remarks || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully recorded attendance for ${records.length} students.`,
    });
  } catch (error: any) {
    console.error('Attendance recording error:', error);
    return NextResponse.json({ error: 'Server error recording attendance.' }, { status: 500 });
  }
}
