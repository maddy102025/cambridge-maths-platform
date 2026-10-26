'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AssignmentGradingView from '@/components/admin/AssignmentGradingView';

function AssignmentsContent() {
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('submissionId') || undefined;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/portal?view=admin-assignments')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res) setData(res);
      })
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="py-12 text-center text-xs text-slate-light font-medium">
        Loading assignments and grading station...
      </div>
    );
  }

  return (
    <AssignmentGradingView
      assignments={data.assignments || []}
      allSubjects={data.allSubjects || []}
      allSubmissions={data.allSubmissions || []}
      initialSubmissionId={submissionId}
    />
  );
}

export default function AdminAssignmentsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-slate-light">Loading assignments...</div>}>
      <AssignmentsContent />
    </Suspense>
  );
}
