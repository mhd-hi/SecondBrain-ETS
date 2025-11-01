'use client';

import { CalendarView } from '@/calendar/components/calendar-view';

export function CalendarWrapper() {
  return (
    <div className="bg-card rounded-lg flex flex-col flex-1 min-h-0">
      <CalendarView />
    </div>
  );
}
