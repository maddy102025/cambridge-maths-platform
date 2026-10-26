import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Mail, Phone, Calendar, CheckCircle2, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminInquiriesPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
    redirect('/login');
  }

  const inquiries = await prisma.contactInquiry.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-muted tracking-tight">
          Admissions & Contact Inquiries
        </h1>
        <p className="text-sm text-slate-soft mt-1">
          Review incoming questions from parents and students submitted via the teacher landing page.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-sage-200 subtle-paper-shadow p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-slate-muted text-base pb-3 border-b border-sage-200">
          Inquiry Log ({inquiries.length})
        </h3>

        {inquiries.length === 0 ? (
          <p className="text-xs text-slate-light py-8 text-center">No inquiries received yet.</p>
        ) : (
          <div className="divide-y divide-sage-100">
            {inquiries.map((inq) => (
              <div key={inq.id} className="py-4 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-muted text-sm">{inq.name}</span>
                    <span className="px-2 py-0.5 rounded bg-sage-100 text-slate-800 font-semibold text-[10px]">
                      {inq.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-light">
                    Received {new Date(inq.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-slate-soft text-xs">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-light" />
                    <span>{inq.email}</span>
                  </div>
                  {inq.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-light" />
                      <span>{inq.phone}</span>
                    </div>
                  )}
                  <span className="font-semibold text-slate-muted">
                    Subject of Interest: {inq.subjectOfInterest || 'General'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-ivory-50 border border-sage-200/80 text-slate-soft leading-relaxed">
                  "{inq.message}"
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
