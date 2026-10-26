'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import QuestTrackerView from '@/components/quest/QuestTrackerView';

function QuestContent() {
  const searchParams = useSearchParams();
  const initialSelectedId = searchParams.get('id') || undefined;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/portal?view=student-quest')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res) setData(res);
      })
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="py-12 text-center text-xs text-slate-light font-medium">
        Loading quest assignments...
      </div>
    );
  }

  return (
    <QuestTrackerView
      assignments={data.assignments || []}
      initialSelectedId={initialSelectedId}
      userId={data.user?.id}
    />
  );
}

export default function StudentQuestPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-slate-light">Loading quest tracker...</div>}>
      <QuestContent />
    </Suspense>
  );
}
