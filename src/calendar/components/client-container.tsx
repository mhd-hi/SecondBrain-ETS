'use client';

import type { TCalendarView, TEvent } from '@/calendar/types';
import { isSameDay } from 'date-fns';
import { useMemo } from 'react';

import { CalendarAgendaView } from '@/calendar/components/agenda-view/calendar-agenda-view';

import { DndProviderWrapper } from '@/calendar/components/dnd/dnd-provider';
import { CalendarHeader } from '@/calendar/components/header/calendar-header';
import { CalendarMonthView } from '@/calendar/components/month-view/calendar-month-view';
import { CalendarDayView } from '@/calendar/components/week-and-day-view/calendar-day-view';
import { CalendarWeekView } from '@/calendar/components/week-and-day-view/calendar-week-view';
import { CalendarYearView } from '@/calendar/components/year-view/calendar-year-view';

import { useCalendar } from '@/calendar/contexts/calendar-context';
import { useEvents } from '@/calendar/contexts/events-context';
import { getEventEnd, getEventStart } from '@/calendar/date-utils';

type IProps = {
  view: TCalendarView;
};

export function ClientContainer({ view }: IProps) {
  const { selectedDate } = useCalendar();
  const { events } = useEvents();

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

    // For WeeklyRoadmap, we only care about week view - simplified 7-day view
    if (view === 'week') {
      // Simple approach: show events for the next 7 days starting from selected date
      const weekStart = new Date(selectedDate);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      return evts.filter((event) => {
        const eventStartDate = event.startDateObj;
        return eventStartDate >= weekStart && eventStartDate < weekEnd;
      });
    }

    // Fallback for other views (simplified)
    return evts.filter((event) => {
      const eventStartDate = event.startDateObj;

      switch (view) {
        case 'day':
          return eventStartDate.toDateString() === selectedDate.toDateString();
        case 'month':
        case 'agenda':
          return eventStartDate.getMonth() === selectedDate.getMonth()
            && eventStartDate.getFullYear() === selectedDate.getFullYear();
        case 'year':
          return eventStartDate.getFullYear() === selectedDate.getFullYear();
        default:
          return false;
      }
    });
  }, [selectedDate, parsedEvents, view]);

  const singleDayEvents = filteredEvents.filter((event) => {
    return isSameDay(event.startDateObj, event.endDateObj);
  });

  const multiDayEvents = filteredEvents.filter((event) => {
    return !isSameDay(event.startDateObj, event.endDateObj);
  });

  // For year view, we only care about the start date
  // by using the same date for both start and end,
  // we ensure only the start day will show a dot
  const eventStartDates = useMemo(() => filteredEvents.map(event => ({ ...event, endDate: event.startDate })), [filteredEvents]);

  return (
    <div className="overflow-hidden rounded-xl border h-full flex flex-col">
      <CalendarHeader view={view} />

      <div className="flex-1 min-h-0">
        <DndProviderWrapper>
          {view === 'day' && <CalendarDayView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
          {view === 'month' && <CalendarMonthView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
          {view === 'week' && <CalendarWeekView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
          {view === 'year' && <CalendarYearView allEvents={eventStartDates} />}
          {view === 'agenda' && <CalendarAgendaView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />}
        </DndProviderWrapper>
      </div>
    </div>
  );
}
