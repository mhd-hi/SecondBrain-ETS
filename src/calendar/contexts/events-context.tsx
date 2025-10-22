/* eslint-disable react-refresh/only-export-components */
import type { IEvent } from '@/calendar/interfaces';
import { createContext, use, useMemo } from 'react';

type EventsContextType = {
  events: IEvent[];
  setLocalEvents: React.Dispatch<React.SetStateAction<IEvent[]>>;
};

const EventsContext = createContext<EventsContextType | undefined>(undefined);

type EventsProviderProps = {
  children: React.ReactNode;
  events: IEvent[];
  setLocalEvents: React.Dispatch<React.SetStateAction<IEvent[]>>;
};

export function EventsProvider({ children, events, setLocalEvents }: EventsProviderProps) {
  const value = useMemo(() => ({ events, setLocalEvents }), [events, setLocalEvents]);

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
