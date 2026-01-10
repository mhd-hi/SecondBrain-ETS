import type { TEvent } from '@/calendar/types';
import { addMonths, startOfYear } from 'date-fns';

import { useMemo } from 'react';

import { YearViewMonth } from '@/calendar/components/year-view/year-view-month';

import { useCalendarViewStore } from '@/lib/stores/calendar-view-store';

type IProps = {
  allEvents: TEvent[];
};

export function CalendarYearView({ allEvents }: IProps) {
  const selectedDate = useCalendarViewStore(state => state.selectedDate);

  const months = useMemo(() => {
    const yearStart = startOfYear(selectedDate);
    return Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));
  }, [selectedDate]);

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {months.map(month => (
          <YearViewMonth key={month.toString()} month={month} events={allEvents} />
        ))}
      </div>
    </div>
  );
}
