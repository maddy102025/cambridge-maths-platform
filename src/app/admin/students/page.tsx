'use client';

import React, { useEffect, useState } from 'react';
import StudentManagementView from '@/components/admin/StudentManagementView';

export default function AdminStudentsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/portal?view=admin-students')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res) setData(res);
      })
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="py-12 text-center text-xs text-slate-light font-medium">
        Loading student roster...
      </div>
    );
  }

  return <StudentManagementView students={data.students || []} allSubjects={data.allSubjects || []} />;
}
