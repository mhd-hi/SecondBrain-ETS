'use client';

import type { TimeBlock } from '@/types/time-block-calendar';
import React from 'react';
import TimeBlockCalendar from '@/components/ui/time-block-calendar';

export function TimeBlockCalendarDemo() {
  const now = new Date();
  const mockBlocks: TimeBlock[] = [
    {
      weekIndex: 1,
      dayOfWeek: 0,
      startHour: 9,
      startMinute: 0,
      durationHours: 1.5,
      title: 'Study Algorithms',
      color: 'bg-green-600 text-white',
      start_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0).toISOString(),
      end_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30).toISOString(),
    },
    {
      weekIndex: 2,
      dayOfWeek: 2,
      startHour: 14,
      startMinute: 30,
      durationHours: 2,
      title: 'Project Work',
      color: 'bg-blue-600 text-white',
      start_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30).toISOString(),
      end_at: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 30).toISOString(),
    },
  ];

  return <TimeBlockCalendar initialBlocks={mockBlocks} className="h-[600px]" />;
}

export default TimeBlockCalendarDemo;
