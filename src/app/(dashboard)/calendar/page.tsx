'use client';

import { useEffect } from 'react';
import { CalendarWrapper } from '@/components/Calendar/CalendarWrapper';
import { useCalendarTasks } from '@/hooks/use-task';
import { useCalendarViewStore } from '@/lib/stores/calendar-view-store';

export default function CalendarPage() {
  const { getCalendarTasks, isLoading: _isLoading, error } = useCalendarTasks();
  const setStoreEvents = useCalendarViewStore(state => state.setEvents);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch events for a wider range to ensure we get all relevant events
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30); // 30 days ago
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30); // 30 days from now

        const fetchedEvents = await getCalendarTasks(startDate, endDate);
        setStoreEvents(fetchedEvents);
      } catch (err) {
        console.error('Failed to fetch calendar events:', err);
      }
    };

    fetchEvents();
  }, [getCalendarTasks, setStoreEvents]);

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
  <div className="h-full mx-6 flex flex-col">
      <div className="flex-1 min-h-0">
        <CalendarWrapper />
      </div>
  </div>
  );
}
