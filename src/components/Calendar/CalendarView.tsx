'use client';

import { useCallback, useEffect, useState } from 'react';

import { ClientContainer } from '@/calendar/components/client-container';
import { useCalendar } from '@/calendar/contexts/calendar-context';
import { useEvents } from '@/calendar/contexts/events-context';
import { NavigationControls } from '@/components/WeeklyRoadmap/NavigationControls';
import { getWeekDates } from '@/lib/utils/date-util';

export function CalendarView() {
  const { setSelectedDate, selectedDate: _selectedDate } = useCalendar();
  const { events: _events } = useEvents();
  const [weekOffset, setWeekOffset] = useState(0);

  // Update selectedDate when weekOffset changes
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
    <div className="bg-card w-full h-full rounded-lg flex flex-col">
      <NavigationControls
        weekDates={weekDates}
        isLoading={false}
        onWeekChange={handleWeekChange}
        onTodayClick={handleTodayClick}
      />
      <div className="flex-1 min-h-0">
        <ClientContainer view="week" />
      </div>
    </div>
  );
}
