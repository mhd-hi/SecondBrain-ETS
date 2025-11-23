import type { TEvent } from '@/calendar/types';

import { useCalendarViewStore } from '@/calendar/contexts/calendar-view-store';

export function useUpdateEvent() {
  const setEvents = useCalendarViewStore(state => state.setEvents);

  // This is just and example, in a real scenario
  // you would call an API to update the event
  const updateEvent = (event: TEvent) => {
    const newEvent: TEvent = {
      ...event,
      startDate: new Date(event.startDate).toISOString(),
      endDate: new Date(event.endDate).toISOString(),
    };
    setEvents((prev) => {
      const index = prev.findIndex(e => e.id === event.id);
      if (index === -1) {
        return prev;
      }
      return [...prev.slice(0, index), newEvent, ...prev.slice(index + 1)];
    });
  };

  return { updateEvent };
}
