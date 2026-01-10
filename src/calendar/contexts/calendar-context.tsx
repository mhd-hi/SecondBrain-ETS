'use client';
/* eslint-disable react-refresh/only-export-components */

import type { TBadgeVariant, TEvent } from '@/calendar/types';
import { createContext, use, useEffect, useMemo, useState } from 'react';
import { EventsProvider } from '@/calendar/contexts/events-context';
import { useCalendarViewStore } from '@/lib/stores/calendar-view-store';

type ICalendarContext = {
  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  events: TEvent[];
};

const CalendarContext = createContext<ICalendarContext>({
  badgeVariant: 'colored',
  setBadgeVariant: () => {},
  events: [],
});

export function CalendarProvider({ children, events }: { children: React.ReactNode; events: TEvent[] }) {
  const setEvents = useCalendarViewStore(state => state.setEvents);
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>('colored');

  useEffect(() => {
    setEvents(events);
  }, [events, setEvents]);

  const value = useMemo(
    () => ({
      badgeVariant,
      setBadgeVariant,
      events,
    }),
    [badgeVariant, events],
  );

  return (
    <CalendarContext.Provider value={value}>
      <EventsProvider events={events}>{children}</EventsProvider>
    </CalendarContext.Provider>
  );
}

export function useCalendar(): ICalendarContext {
  const context = use(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider.');
  }

  return context;
}
