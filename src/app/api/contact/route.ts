import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subjectOfInterest, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    // Save inquiry to SQLite / PostgreSQL database
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        subjectOfInterest: subjectOfInterest || 'General Inquiry',
        message: message.trim(),
        status: 'NEW',
      },
    });

    // Development-safe email fallback notification
    console.log('--- NEW CONTACT INQUIRY RECEIVED ---');
    console.log(`From: ${inquiry.name} <${inquiry.email}>`);
    console.log(`Phone: ${inquiry.phone || 'N/A'}`);
    console.log(`Subject: ${inquiry.subjectOfInterest}`);
    console.log(`Message: ${inquiry.message}`);
    console.log('(To configure real SMTP delivery, set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env)');

    return NextResponse.json(
      {
        success: true,
        message: 'Inquiry received successfully. Our team will contact you soon.',
        inquiryId: inquiry.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Contact inquiry error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred while processing your inquiry.' },
      { status: 500 }
    );
  }
}
