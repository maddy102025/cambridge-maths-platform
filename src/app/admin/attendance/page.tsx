'use client';

import React, { useEffect, useState } from 'react';
import AttendanceManagementView from '@/components/admin/AttendanceManagementView';

export default function AdminAttendancePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/portal?view=admin-attendance')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res) setData(res);
      })
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="py-12 text-center text-xs text-slate-light font-medium">
        Loading attendance records...
      </div>
    );
  }

  return <AttendanceManagementView subjects={data.subjects || []} allAttendance={data.allAttendance || []} />;
}
