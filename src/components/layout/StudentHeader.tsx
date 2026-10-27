'use client';

import React from 'react';
import PortalHeader from './PortalHeader';

interface StudentHeaderProps {
  user: {
    fullName: string;
    projectedGrade?: string | null;
    studyStreakDays?: number;
    email?: string;
    role?: string;
  };
  unreadCount?: number;
  onMenuClick?: () => void;
}

export default function StudentHeader({ user, unreadCount = 0, onMenuClick }: StudentHeaderProps) {
  return (
    <PortalHeader
      role="STUDENT"
      user={user}
      unreadCount={unreadCount}
      onMenuClick={onMenuClick}
    />
  );
}
