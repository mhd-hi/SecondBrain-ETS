import type { IEvent } from '@/calendar/interfaces';

import { areIntervalsOverlapping, format, isSameDay } from 'date-fns';
import React, { useMemo } from 'react';

import { AddEventDialog } from '@/calendar/components/dialogs/add-event-dialog';
import { DroppableTimeBlock } from '@/calendar/components/dnd/droppable-time-block';
import { CalendarTimeline } from '@/calendar/components/week-and-day-view/calendar-time-line';
import { EventBlock } from '@/calendar/components/week-and-day-view/event-block';
import { WeekViewMultiDayEventsRow } from '@/calendar/components/week-and-day-view/week-view-multi-day-events-row';
import { useCalendar } from '@/calendar/contexts/calendar-context';
import { useSelectedDate } from '@/calendar/contexts/selected-date-context';

import { getEventEnd, getEventStart } from '@/calendar/date-utils';
import { getEventBlockStyle, getVisibleHours, groupEvents } from '@/calendar/helpers';
import { ScrollArea } from '@/components/ui/scroll-area';

import { cn } from '@/lib/utils';

type IProps = {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
};

export function CalendarWeekView({ singleDayEvents, multiDayEvents }: IProps) {
  const { visibleHours } = useCalendar();
  const { selectedDate } = useSelectedDate();

  const { hours, earliestEventHour, latestEventHour } = getVisibleHours(visibleHours, singleDayEvents);

  const weekDays = useMemo(() => {
    const safeDate = selectedDate instanceof Date && !Number.isNaN(selectedDate.getTime()) ? selectedDate : new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(safeDate);
      day.setDate(safeDate.getDate() + i);
      return day;
    });
  }, [selectedDate]);

  const isValidDate = (d: unknown): d is Date => d instanceof Date && !Number.isNaN((d as Date).getTime());

  // Precompute dayEvents and groupedEvents for each day to avoid repeated work in the render loop
  type DayGroup = { day: Date; dayEvents: IEvent[]; groupedEvents: IEvent[][] };

  const dayGroups = useMemo<DayGroup[]>(() => {
    return weekDays.map((day) => {
      const dayEvents = singleDayEvents.filter((event) => {
        return isSameDay(getEventStart(event), day) || isSameDay(getEventEnd(event), day);
      });

      return {
        day,
        dayEvents,
        groupedEvents: groupEvents(dayEvents),
      };
    });
  }, [weekDays, singleDayEvents]);

  // Pre-compute event styles and overlap information
  const eventStylesAndOverlaps = useMemo(() => {
    const result: Record<string, { style: React.CSSProperties; hasOverlap: boolean }> = {};

    dayGroups.forEach(({ day, groupedEvents }) => {
      groupedEvents.forEach((group, groupIndex) => {
        group.forEach((event) => {
          const style = getEventBlockStyle(event, day, groupIndex, groupedEvents.length, { from: earliestEventHour, to: latestEventHour });

          const hasOverlap = groupedEvents.some(
            (otherGroup, otherIndex) =>
              otherIndex !== groupIndex
              && otherGroup.some(otherEvent =>
                areIntervalsOverlapping(
                  { start: getEventStart(event), end: getEventEnd(event) },
                  { start: getEventStart(otherEvent), end: getEventEnd(otherEvent) },
                ),
              ),
          );

          if (!hasOverlap) {
            result[event.id] = { style: { ...style, width: '100%', left: '0%' }, hasOverlap: false };
          } else {
            result[event.id] = { style, hasOverlap: true };
          }
        });
      });
    });

    return result;
  }, [dayGroups, earliestEventHour, latestEventHour]);

  return (
    <>
      <div className="flex flex-col items-center justify-center border-b py-4 text-sm text-muted-foreground sm:hidden">
        <p>Weekly view is not available on smaller devices.</p>
        <p>Please switch to daily or monthly view.</p>
      </div>

      <div className="hidden flex-col sm:flex">
        <div>
          <WeekViewMultiDayEventsRow selectedDate={selectedDate} multiDayEvents={multiDayEvents} />

          {/* Week header */}
          <div className="relative z-20 flex border-b">
            <div className="w-18"></div>
            <div className="grid flex-1 grid-cols-7 divide-x border-l">
              {weekDays.map((day) => {
                const dayLabel = isValidDate(day) ? format(day, 'EE') : '—';
                const dayNumber = isValidDate(day) ? format(day, 'd') : '-';
                return (
                  <span key={isValidDate(day) ? day.toISOString() : String(Math.random())} className="py-2 text-center text-xs font-medium text-muted-foreground">
                    {dayLabel}
                    {' '}
                    <span className="ml-1 font-semibold text-foreground">{dayNumber}</span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <ScrollArea className="h-[736px]" type="always">
          <div className="flex overflow-hidden">
            {/* Hours column */}
            <div className="relative w-18">
              {hours.map((hour, index) => (
                <div key={hour} className="relative" style={{ height: '96px' }}>
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && (() => {
                      const labelDate = new Date();
                      labelDate.setHours(hour, 0, 0, 0);
                      return <span className="text-xs text-muted-foreground">{format(labelDate, 'hh a')}</span>;
                    })()}
                  </div>
                </div>
              ))}
            </div>

            {/* Week grid */}
            <div className="relative flex-1 border-l">
              <div className="grid grid-cols-7 divide-x">
          {dayGroups.map(({ day, groupedEvents }) => {
                  return (
                    <div key={`${day.toISOString()}`} className="relative">
                      {hours.map((hour, index) => {
                        return (
                          <div key={hour} className={cn('relative')} style={{ height: '96px' }}>
                            {index !== 0 && <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>}

                            <DroppableTimeBlock date={day} hour={hour} minute={0}>
                              <AddEventDialog startDate={day} startTime={{ hour, minute: 0 }}>
                                <div className="absolute inset-x-0 top-0 h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                              </AddEventDialog>
                            </DroppableTimeBlock>

                            <DroppableTimeBlock date={day} hour={hour} minute={15}>
                              <AddEventDialog startDate={day} startTime={{ hour, minute: 15 }}>
                                <div className="absolute inset-x-0 top-[24px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                              </AddEventDialog>
                            </DroppableTimeBlock>

                            <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed"></div>

                            <DroppableTimeBlock date={day} hour={hour} minute={30}>
                              <AddEventDialog startDate={day} startTime={{ hour, minute: 30 }}>
                                <div className="absolute inset-x-0 top-[48px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                              </AddEventDialog>
                            </DroppableTimeBlock>

                            <DroppableTimeBlock date={day} hour={hour} minute={45}>
                              <AddEventDialog startDate={day} startTime={{ hour, minute: 45 }}>
                                <div className="absolute inset-x-0 top-[72px] h-[24px] cursor-pointer transition-colors hover:bg-accent" />
                              </AddEventDialog>
                            </DroppableTimeBlock>
                          </div>
                        );
                      })}

                      {groupedEvents.map(group => (
                        group.map((event) => {
                          const { style } = eventStylesAndOverlaps[event.id] || { style: {} };

                          return (
                            <div key={event.id} className="absolute p-1" style={style}>
                              <EventBlock event={event} />
                            </div>
                          );
                        })
                      ))}
                    </div>
                  );
                })}
              </div>

              <CalendarTimeline firstVisibleHour={earliestEventHour} lastVisibleHour={latestEventHour} />
            </div>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
