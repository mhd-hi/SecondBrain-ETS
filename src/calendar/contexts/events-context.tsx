/* eslint-disable react-refresh/only-export-components */
import type { TEvent } from '@/calendar/types';
import { createContext, use, useMemo } from 'react';

type EventsContextType = {
  events: TEvent[];
};

const EventsContext = createContext<EventsContextType | undefined>(undefined);

type EventsProviderProps = {
  children: React.ReactNode;
  events: TEvent[];
};

export function EventsProvider({ children, events }: EventsProviderProps) {
  const value = useMemo(() => ({ events }), [events]);
  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const ctx = use(EventsContext as React.Context<EventsContextType | undefined>);
  if (!ctx) {
    throw new Error('useEvents must be used within EventsProvider');
  }

  return ctx;
}

export default EventsContext;
