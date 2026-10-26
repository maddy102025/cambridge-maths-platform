'use client';

import React, { useEffect, useState } from 'react';
import CoursesManagementView from '@/components/admin/CoursesManagementView';

export default function AdminCoursesPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/portal?view=admin-courses')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res) setData(res);
      })
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="py-12 text-center text-xs text-slate-light font-medium">
        Loading courses and study drops...
      </div>
    );
  }

  return <CoursesManagementView subjects={data.subjects || []} />;
}
