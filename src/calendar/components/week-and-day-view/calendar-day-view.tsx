import type { TEvent } from '@/calendar/types';
import { areIntervalsOverlapping, format, isSameDay, parseISO } from 'date-fns';

import { Calendar, Clock } from 'lucide-react';

import { CalendarTimeline } from '@/calendar/components/week-and-day-view/calendar-time-line';
import { EventBlock } from '@/calendar/components/week-and-day-view/event-block';
// import { useCalendar } from '@/calendar/contexts/calendar-context';
import { useCalendarViewStore } from '@/calendar/contexts/calendar-view-store';
import { getCurrentEvents, getEventBlockStyle, getVisibleHours, groupEvents } from '@/calendar/helpers';

import { ScrollArea } from '@/components/ui/scroll-area';
import { SingleCalendar } from '@/components/ui/single-calendar';

import { cn } from '@/lib/utils';

type IProps = {
  events: TEvent[];
};

export function CalendarDayView({ events }: IProps) {
  const visibleHours = useCalendarViewStore(state => state.visibleHours);
  const selectedDate = useCalendarViewStore(state => state.selectedDate);
  const setSelectedDate = useCalendarViewStore(state => state.setSelectedDate);
  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const dayEvents = events.filter((event) => {
    const eventDate = parseISO(event.startDate);
    return isSameDay(eventDate, selectedDate);
  });

  const { hours, earliestEventHour, latestEventHour } = getVisibleHours(visibleHours, dayEvents);
  const currentEvents = getCurrentEvents(dayEvents);
  const groupedEvents = groupEvents(dayEvents);

  return (
    <div className="flex">
      <div className="flex flex-1 flex-col">
        <div>

          {/* Day header */}
          <div className="relative z-20 flex border-b">
            <div className="w-18"></div>
            <span className="flex-1 border-l py-2 text-center text-xs font-medium text-muted-foreground">
              {format(selectedDate, 'EE')}
              {' '}
              <span className="font-semibold text-foreground">
                {format(selectedDate, 'd')}
              </span>
            </span>
          </div>
        </div>

        <ScrollArea className="h-[800px]" type="always">
          <div className="flex">
            {/* Hours column */}
            <div className="relative w-18">
              {hours.map((hour, index) => (
                <div key={hour} className="relative" style={{ height: '96px' }}>
                  <div className="absolute -top-3 right-2 flex h-6 items-center">
                    {index !== 0 && <span className="text-xs text-muted-foreground">{format(new Date().setHours(hour, 0, 0, 0), 'hh a')}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="relative flex-1 border-l">
              <div className="relative">
                {hours.map((hour) => {
                  return (
                    <div key={hour} className={cn('relative')} style={{ height: '96px' }}>
                      <div className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>

                      {/* TODO: change this to open dropdown that has TaskDialog and StudyBlockDialog
                      <DroppableTimeBlock date={selectedDate} hour={hour} minute={0}>
                        <AddEventDialog startDate={selectedDate} startTime={{ hour, minute: 0 }}>
                          <div className="absolute inset-x-0 top-0 h-[12px] cursor-pointer transition-colors hover:bg-accent" />
                        </AddEventDialog>
                      </DroppableTimeBlock>

                      <DroppableTimeBlock date={selectedDate} hour={hour} minute={15}>
                        <AddEventDialog startDate={selectedDate} startTime={{ hour, minute: 15 }}>
                          <div className="absolute inset-x-0 top-[12px] h-[12px] cursor-pointer transition-colors hover:bg-accent" />
                        </AddEventDialog>
                      </DroppableTimeBlock>

                      <div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed"></div>

                      <DroppableTimeBlock date={selectedDate} hour={hour} minute={30}>
                        <AddEventDialog startDate={selectedDate} startTime={{ hour, minute: 30 }}>
                          <div className="absolute inset-x-0 top-[24px] h-[12px] cursor-pointer transition-colors hover:bg-accent" />
                        </AddEventDialog>
                      </DroppableTimeBlock>

                      <DroppableTimeBlock date={selectedDate} hour={hour} minute={45}>
                        <AddEventDialog startDate={selectedDate} startTime={{ hour, minute: 45 }}>
                          <div className="absolute inset-x-0 top-[36px] h-[12px] cursor-pointer transition-colors hover:bg-accent" />
                        </AddEventDialog>
                      </DroppableTimeBlock> */}
                    </div>
                  );
                })}

                {groupedEvents.map((group, groupIndex) =>
                  group.map((event) => {
                    let style = getEventBlockStyle(event, selectedDate, groupIndex, groupedEvents.length, { from: earliestEventHour, to: latestEventHour });
                    const hasOverlap = groupedEvents.some(
                      (otherGroup, otherIndex) =>
                        otherIndex !== groupIndex
                        && otherGroup.some(otherEvent =>
                          areIntervalsOverlapping(
                            { start: parseISO(event.startDate), end: parseISO(event.endDate) },
                            { start: parseISO(otherEvent.startDate), end: parseISO(otherEvent.endDate) },
                          ),
                        ),
                    );

                    if (!hasOverlap) {
                      style = { ...style, width: '100%', left: '0%' };
                    }

                    return (
                      <div key={event.id} className="absolute p-1" style={style}>
                        <EventBlock event={event} />
                      </div>
                    );
                  }),
                )}
              </div>

              <CalendarTimeline firstVisibleHour={earliestEventHour} lastVisibleHour={latestEventHour} />
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="hidden w-64 divide-y border-l md:block">
  <SingleCalendar className="mx-auto w-fit" mode="single" selected={selectedDate} onSelect={handleSelect} initialFocus />

        <div className="flex-1 space-y-3">
          {currentEvents.length > 0
? (
            <div className="flex items-start gap-2 px-4 pt-4">
              <span className="relative mt-[5px] flex size-2.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex size-2.5 rounded-full bg-green-600"></span>
              </span>

              <p className="text-sm font-semibold text-foreground">Happening now</p>
            </div>
          )
: (
            <p className="p-4 text-center text-sm italic text-muted-foreground">No appointments or consultations at the moment</p>
          )}

          {currentEvents.length > 0 && (
            <ScrollArea className="h-[422px] px-4" type="always">
              <div className="space-y-6 pb-4">
                {currentEvents.map(event => (
                  <div key={event.id} className="space-y-1.5">
                    <p className="line-clamp-2 text-sm font-semibold">{event.title}</p>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="size-3.5" />
                      <span className="text-sm">{format(new Date(), 'MMM d, yyyy')}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-3.5" />
                      <span className="text-sm">
                        {format(parseISO(event.startDate), 'h:mm a')}
                        {' '}
                        -
                        {format(parseISO(event.endDate), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
