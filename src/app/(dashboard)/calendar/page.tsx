'use client';

import type { TEvent } from '@/calendar/types';

import { useEffect, useState } from 'react';
import { CalendarProvider } from '@/calendar/contexts/calendar-context';
import { CalendarWrapper } from '@/components/Calendar/CalendarWrapper';
import { useCalendarTasks } from '@/hooks/use-task';

export default function CalendarPage() {
  const { getCalendarTasks, isLoading: _isLoading, error } = useCalendarTasks();
  const [events, setEvents] = useState<TEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch events for a wider range to ensure we get all relevant events
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // 30 days ago
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30); // 30 days from now

        const fetchedEvents = await getCalendarTasks(startDate, endDate);
        setEvents(fetchedEvents);
      } catch (err) {
        console.error('Failed to fetch calendar events:', err);
      }
    };

    fetchEvents();
  }, [getCalendarTasks]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">Error loading calendar</h2>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full m-6 flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold">📅 Calendar</h1>
        <p className="text-gray-600">View your tasks and study blocks in a unified calendar</p>
      </div>

      <div className="flex-1 min-h-0">
        <CalendarProvider events={events}>
          <CalendarWrapper />
        </CalendarProvider>
      </div>
    </div>
  );
}
