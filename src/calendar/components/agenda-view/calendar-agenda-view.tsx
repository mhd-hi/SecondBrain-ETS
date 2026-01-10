import type { TEvent } from '@/calendar/types';
import { format, isSameMonth, parseISO, startOfDay } from 'date-fns';
import { CalendarX2 } from 'lucide-react';

import { useMemo } from 'react';

import { AgendaDayGroup } from '@/calendar/components/agenda-view/agenda-day-group';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useCalendarViewStore } from '@/lib/stores/calendar-view-store';

type Props = {
  events: TEvent[];
};

export function CalendarAgendaView({ events }: Props) {
  const selectedDate = useCalendarViewStore(state => state.selectedDate);

  const eventsByDay = useMemo(() => {
    const allDates = new Map<string, { date: Date; events: TEvent[] }>();

    events.forEach((event) => {
      const eventDate = parseISO(event.startDate);
      if (!isSameMonth(eventDate, selectedDate)) {
        return;
      }

      const dateKey = format(eventDate, 'yyyy-MM-dd');

      if (!allDates.has(dateKey)) {
        allDates.set(dateKey, { date: startOfDay(eventDate), events: [] });
      }

      allDates.get(dateKey)?.events.push(event);
    });

    return Array.from(allDates.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, selectedDate]);

  const hasAnyEvents = events.length > 0;

  return (
    <div>
      <ScrollArea className="h-full" type="always">
        <div className="space-y-6 p-4">
          {eventsByDay.map(dayGroup => (
            <AgendaDayGroup key={format(dayGroup.date, 'yyyy-MM-dd')} date={dayGroup.date} events={dayGroup.events} />
          ))}

          {!hasAnyEvents && (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
              <CalendarX2 className="size-10" />
              <p className="text-sm md:text-base">No events scheduled for the selected month</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
