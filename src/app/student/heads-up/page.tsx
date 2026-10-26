'use client';

import React, { useEffect, useState } from 'react';
import HeadsUpView from '@/components/headsup/HeadsUpView';

export default function HeadsUpPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/portal?view=student-heads-up')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res) setData(res);
      })
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="py-12 text-center text-xs text-slate-light font-medium">
        Loading announcements & notifications...
      </div>
    );
  }

  return (
    <HeadsUpView
      notifications={data.notifications || []}
      announcements={data.announcements || []}
    />
  );
}
