import type { TEvent } from '@/calendar/types';

import { useMemo } from 'react';

import { DayCell } from '@/calendar/components/month-view/day-cell';

import { useCalendarViewStore } from '@/calendar/contexts/calendar-view-store';

import { getCalendarCells } from '@/calendar/helpers';
import { WEEK_DAYS } from '@/lib/calendar/constants';

type Props = {
  events: TEvent[];
};

export function CalendarMonthView({ events }: Props) {
  const selectedDate = useCalendarViewStore(state => state.selectedDate);
  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

  return (
    <div>
      <div className="grid grid-cols-7 divide-x">
        {WEEK_DAYS.map(day => (
          <div key={day} className="flex items-center justify-center py-2">
            <span className="text-xs font-medium text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden">
        {cells.map(cell => (
          <DayCell key={cell.date.toISOString()} cell={cell} events={events} />
        ))}
      </div>
    </div>
  );
}
