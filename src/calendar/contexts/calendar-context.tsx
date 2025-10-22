'use client';
/* eslint-disable react-refresh/only-export-components */

import type { Dispatch, SetStateAction } from 'react';

import type { IEvent } from '@/calendar/interfaces';
import type { TBadgeVariant, TVisibleHours } from '@/calendar/types';
import { createContext, use, useMemo, useState } from 'react';
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
  events: IEvent[];
  setLocalEvents: Dispatch<SetStateAction<IEvent[]>>;
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

export function CalendarProvider({ children, events }: { children: React.ReactNode; events: IEvent[] }) {
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>('colored');
  const [visibleHours, setVisibleHours] = useState<TVisibleHours>(VISIBLE_HOURS);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // This localEvents doesn't need to exists in a real scenario.
  // It's used here just to simulate the update of the events.
  // In a real scenario, the events would be updated in the backend
  // and the request that fetches the events should be refetched
  const [localEvents, setLocalEvents] = useState<IEvent[]>(events);

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) {
      return;
    }
    setSelectedDate(date);
  };

  const value = useMemo(
    () => ({
      selectedDate,
      setSelectedDate: handleSelectDate,
      badgeVariant,
      setBadgeVariant,
      visibleHours,
      setVisibleHours,
      events: localEvents,
      setLocalEvents,
    }),
    [selectedDate, badgeVariant, visibleHours, localEvents],
  );

  return (
    <CalendarContext.Provider value={value}>
      <SelectedDateProvider selectedDate={selectedDate} setSelectedDate={handleSelectDate}>
        <EventsProvider events={localEvents} setLocalEvents={setLocalEvents}>{children}</EventsProvider>
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
