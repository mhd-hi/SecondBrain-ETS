'use client';

import type { TEvent } from '@/calendar/types';
import { useMemo } from 'react';

import { CalendarAgendaView } from '@/calendar/components/agenda-view/calendar-agenda-view';

import { DndProviderWrapper } from '@/calendar/components/dnd/dnd-provider';
import { CalendarHeader } from '@/calendar/components/header/calendar-header';
import { CalendarMonthView } from '@/calendar/components/month-view/calendar-month-view';
import { CalendarDayView } from '@/calendar/components/week-and-day-view/calendar-day-view';
import { CalendarWeekView } from '@/calendar/components/week-and-day-view/calendar-week-view';
import { CalendarYearView } from '@/calendar/components/year-view/calendar-year-view';

import { useCalendarViewStore } from '@/calendar/contexts/calendar-view-store';
import { getEventEnd, getEventStart } from '@/calendar/date-utils';
import { useCoursesContext } from '@/contexts/use-courses';

export function CalendarView() {
  const view = useCalendarViewStore(state => state.view);
  const events = useCalendarViewStore(state => state.events);
  const { courses } = useCoursesContext();

  // Pre-parse dates once per event to avoid repeated parseISO calls on every render
  type ParsedEvent = TEvent & { startDateObj: Date; endDateObj: Date };

  const parsedEvents = useMemo(() => {
    return (events ?? []).map((evt) => {
      const e = { ...evt } as Partial<ParsedEvent> & TEvent;
      try {
        e.startDateObj = getEventStart(e as TEvent);
        e.endDateObj = getEventEnd(e as TEvent);
      } catch {
        e.startDateObj = new Date(e.startDate as string);
        e.endDateObj = new Date(e.endDate as string);
      }
      return e as ParsedEvent;
    });
  }, [events]);

  const filteredEvents = useMemo(() => {
    const evts = parsedEvents as ParsedEvent[] ?? [];
    return evts;
  }, [parsedEvents]);

  // For year view, we only care about the start date
  // by using the same date for both start and end,
  // we ensure only the start day will show a dot
  const eventStartDates = useMemo(() => filteredEvents.map(event => ({ ...event, endDate: event.startDate })), [filteredEvents]);

  return (
    <div className="rounded-xl border flex flex-col">
      <CalendarHeader />
      <div className="flex-1 min-h-0 flex flex-col">
        <DndProviderWrapper>
          {view === 'day' && <CalendarDayView events={filteredEvents} />}
          {view === 'month' && <CalendarMonthView events={filteredEvents} />}
          {view === 'week' && <CalendarWeekView events={filteredEvents} courses={courses} />}
          {view === 'year' && <CalendarYearView allEvents={eventStartDates} />}
          {view === 'agenda' && <CalendarAgendaView events={filteredEvents} />}
        </DndProviderWrapper>
      </div>
    </div>
  );
}
