'use client';

import { useCallback, useEffect, useState } from 'react';
import { CalendarView } from '@/calendar/components/calendar-view';

import { useCalendarViewStore } from '@/calendar/contexts/calendar-view-store';
import { NavigationControls } from '@/components/WeeklyRoadmap/NavigationControls';
import { getWeekDates } from '@/lib/utils/date-util';

export function CalendarWrapper() {
  const setSelectedDate = useCalendarViewStore(state => state.setSelectedDate);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const newSelectedDate = new Date();
    newSelectedDate.setDate(newSelectedDate.getDate() + (weekOffset * 7));
    setSelectedDate(newSelectedDate);
  }, [weekOffset, setSelectedDate]);

  const weekDates = getWeekDates(weekOffset);

  const handleWeekChange = useCallback((direction: 'prev' | 'next') => {
    setWeekOffset(prev => direction === 'prev' ? prev - 1 : prev + 1);
  }, []);

  const handleTodayClick = useCallback(() => {
    setWeekOffset(0);
    setSelectedDate(new Date());
  }, [setSelectedDate]);

  return (
    <div className="bg-card rounded-lg flex flex-col">
      <NavigationControls
        weekDates={weekDates}
        isLoading={false}
        onWeekChange={handleWeekChange}
        onTodayClick={handleTodayClick}
      />
      <div className="flex-1 min-h-0">
        <CalendarView />
      </div>
    </div>
  );
}
