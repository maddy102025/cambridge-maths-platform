'use client';

import React, { useEffect, useState } from 'react';
import AnnouncementsManagementView from '@/components/admin/AnnouncementsManagementView';

export default function AdminAnnouncementsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/portal?view=admin-announcements')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res) setData(res);
      })
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="py-12 text-center text-xs text-slate-light font-medium">
        Loading announcements feed...
      </div>
    );
  }

  return <AnnouncementsManagementView announcements={data.announcements || []} subjects={data.subjects || []} />;
}
