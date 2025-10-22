'use client';
/* eslint-disable react-refresh/only-export-components */

import type { Dispatch, SetStateAction } from 'react';

import type { TBadgeVariant, TEvent, TVisibleHours } from '@/calendar/types';
import { createContext, use, useCallback, useMemo, useState } from 'react';
import { EventsProvider } from '@/calendar/contexts/events-context';
import { SelectedDateProvider } from '@/calendar/contexts/selected-date-context';
import { VISIBLE_HOURS } from '@/lib/calendar/constants';

type ICalendarContext = {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  visibleHours: TVisibleHours;
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>;
  events: TEvent[];
  setLocalEvents: Dispatch<SetStateAction<TEvent[]>>;
};

const CalendarContext = createContext<ICalendarContext>({
  selectedDate: new Date(),
  setSelectedDate: () => {},
  badgeVariant: 'colored',
  setBadgeVariant: () => {},
  visibleHours: { from: 0, to: 12 },
  setVisibleHours: () => {},
  events: [],
  setLocalEvents: () => {},
});

export function CalendarProvider({ children, events }: { children: React.ReactNode; events: TEvent[] }) {
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>('colored');
  const [visibleHours, setVisibleHours] = useState<TVisibleHours>(VISIBLE_HOURS);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // For now, we'll provide a no-op setter for compatibility
  const setLocalEvents = (newEvents: SetStateAction<TEvent[]>) => {
    console.log('setLocalEvents called with:', newEvents);
    // This is just for compatibility - in real usage, events would be managed at a higher level
  };

  const handleSelectDate = useCallback((date: Date | undefined) => {
    if (!date) {
      return;
    }
    setSelectedDate(date);
  }, []);

  const value = useMemo(
    () => ({
      selectedDate,
      setSelectedDate: handleSelectDate,
      badgeVariant,
      setBadgeVariant,
      visibleHours,
      setVisibleHours,
      events,
      setLocalEvents,
    }),
    [selectedDate, handleSelectDate, badgeVariant, visibleHours, events],
  );

  return (
    <CalendarContext.Provider value={value}>
      <SelectedDateProvider selectedDate={selectedDate} setSelectedDate={handleSelectDate}>
        <EventsProvider events={events} setLocalEvents={setLocalEvents}>{children}</EventsProvider>
      </SelectedDateProvider>
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
