'use client';

import type { Dispatch, SetStateAction } from 'react';

import type { IEvent, IUser } from '@/calendar/interfaces';
import type { TBadgeVariant, TVisibleHours } from '@/calendar/types';
import { createContext, use, useMemo, useState } from 'react';

type ICalendarContext = {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserId: IUser['id'] | 'all';
  setSelectedUserId: (userId: IUser['id'] | 'all') => void;
  badgeVariant: TBadgeVariant;
  setBadgeVariant: (variant: TBadgeVariant) => void;
  users: IUser[];
  visibleHours: TVisibleHours;
  setVisibleHours: Dispatch<SetStateAction<TVisibleHours>>;
  events: IEvent[];
  setLocalEvents: Dispatch<SetStateAction<IEvent[]>>;
};

const CalendarContext = createContext({} as ICalendarContext);

// Default visible hours for the calendar: midnight (0) to noon (12)
export const VISIBLE_HOURS = { from: 0, to: 12 };

export function CalendarProvider({ children, users, events }: { children: React.ReactNode; users: IUser[]; events: IEvent[] }) {
  const [badgeVariant, setBadgeVariant] = useState<TBadgeVariant>('colored');
  const [visibleHours, setVisibleHours] = useState<TVisibleHours>(VISIBLE_HOURS);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedUserId, setSelectedUserId] = useState<IUser['id'] | 'all'>('all');

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
      selectedUserId,
      setSelectedUserId,
      badgeVariant,
      setBadgeVariant,
      users,
      visibleHours,
      setVisibleHours,
      // If you go to the refetch approach, you can remove the localEvents and pass the events directly
      events: localEvents,
      setLocalEvents,
    }),
    [selectedDate, selectedUserId, badgeVariant, users, visibleHours, localEvents],
  );

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar(): ICalendarContext {
  const context = use(CalendarContext);
  if (!context) {
 throw new Error('useCalendar must be used within a CalendarProvider.');
}
  return context;
}
