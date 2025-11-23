import type { TEvent } from '@/calendar/types';
import { addDays, differenceInDays, endOfWeek, isAfter, isBefore, startOfDay, startOfWeek } from 'date-fns';

import React, { useMemo } from 'react';
import { MonthEventBadge } from '@/calendar/components/month-view/month-event-badge';
import { getEventEnd, getEventStart } from '@/calendar/date-utils';

type IProps = {
  selectedDate: Date;
  multiDayEvents: TEvent[];
};

function WeekViewMultiDayEventsRowImpl({ selectedDate, multiDayEvents }: IProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const processedEvents = useMemo(() => {
    return multiDayEvents
      .map((event) => {
        const start = getEventStart(event);
        const end = getEventEnd(event);
        const adjustedStart = isBefore(start, weekStart) ? weekStart : start;
        const adjustedEnd = isAfter(end, weekEnd) ? weekEnd : end;
        const startIndex = differenceInDays(adjustedStart, weekStart);
        const endIndex = differenceInDays(adjustedEnd, weekStart);

        return {
          ...event,
          adjustedStart,
          adjustedEnd,
          startIndex,
          endIndex,
        };
      })
      .sort((a, b) => {
        const startDiff = a.adjustedStart.getTime() - b.adjustedStart.getTime();
        if (startDiff !== 0) {
          return startDiff;
        }
        return b.endIndex - b.startIndex - (a.endIndex - a.startIndex);
      });
  }, [multiDayEvents, weekStart, weekEnd]);

  type ProcessedEvent = TEvent & { adjustedStart: Date; adjustedEnd: Date; startIndex: number; endIndex: number };

  const eventRows = useMemo(() => {
    const rows: ProcessedEvent[][] = [];

    processedEvents.forEach((event) => {
      let rowIndex = rows.findIndex(row => row.every(e => e.endIndex < event.startIndex || e.startIndex > event.endIndex));

      if (rowIndex === -1) {
        rowIndex = rows.length;
        rows.push([]);
      }

      const targetRow = rows[rowIndex] ?? (rows[rowIndex] = []);
      targetRow.push(event as ProcessedEvent);
    });

    return rows;
  }, [processedEvents]);

  const hasEventsInWeek = useMemo(() => {
    return multiDayEvents.some((event) => {
      const start = getEventStart(event);
      const end = getEventEnd(event);

      return (
        // Event starts within the week
        (start >= weekStart && start <= weekEnd)
        // Event ends within the week
        || (end >= weekStart && end <= weekEnd)
        // Event spans the entire week
        || (start <= weekStart && end >= weekEnd)
      );
    });
  }, [multiDayEvents, weekStart, weekEnd]);

  if (!hasEventsInWeek) {
    return null;
  }

  return (
    <div className="hidden overflow-hidden sm:flex">
      <div className="w-18 border-b"></div>
      <div className="grid flex-1 grid-cols-7 divide-x border-b border-l">
        {weekDays.map((day, dayIndex) => (
          <div key={day.toISOString()} className="flex h-full flex-col gap-1 py-1">
            {eventRows.map((row) => {
              const event = row.find(e => e.startIndex <= dayIndex && e.endIndex >= dayIndex);

              if (!event) {
                return <div key={`${day.toISOString()}-${Math.random()}`} className="h-6.5" />;
              }

              let position: 'first' | 'middle' | 'last' | 'none' = 'none';

              if (dayIndex === event.startIndex && dayIndex === event.endIndex) {
                position = 'none';
              } else if (dayIndex === event.startIndex) {
                position = 'first';
              } else if (dayIndex === event.endIndex) {
                position = 'last';
              } else {
                position = 'middle';
              }

              return <MonthEventBadge key={`${event.id}-${event.startIndex}-${event.endIndex}`} event={event} cellDate={startOfDay(day)} position={position} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export const WeekViewMultiDayEventsRow = React.memo(WeekViewMultiDayEventsRowImpl);
