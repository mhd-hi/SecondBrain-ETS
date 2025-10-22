import type { IEvent } from '@/calendar/interfaces';
import { format, getDaysInMonth, isSameDay, startOfMonth } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { YearViewDayCell } from '@/calendar/components/year-view/year-view-day-cell';

import { useSelectedDate } from '@/calendar/contexts/selected-date-context';

import { getEventEnd, getEventStart } from '@/calendar/date-utils';

type IProps = {
  month: Date;
  events: IEvent[];
};

export function YearViewMonth({ month, events }: IProps) {
  const { push } = useRouter();
  const { setSelectedDate } = useSelectedDate();

  const monthName = format(month, 'MMMM');

  const daysInMonth = useMemo(() => {
    const totalDays = getDaysInMonth(month);
    const firstDay = startOfMonth(month).getDay();

    const blanks = Array.from({ length: firstDay }, (_, i) => ({ type: 'blank' as const, id: `blank-${i}` }));
    const days = Array.from({ length: totalDays }, (_, i) => ({ type: 'day' as const, day: i + 1, id: `day-${i + 1}` }));

    return [...blanks, ...days];
  }, [month]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleClick = () => {
    setSelectedDate(new Date(month.getFullYear(), month.getMonth(), 1));
    push('/month-view');
  };

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={handleClick}
        className="w-full rounded-t-lg border px-3 py-2 text-sm font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {monthName}
      </button>

      <div className="flex-1 space-y-2 rounded-b-lg border border-t-0 p-3">
        <div className="grid grid-cols-7 gap-x-0.5 text-center">
          {weekDays.map(day => (
            <div key={day} className="text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-x-0.5 gap-y-2">
          {daysInMonth.map((item) => {
            if (item.type === 'blank') {
              return <div key={item.id} className="h-10" />;
            }

            const date = new Date(month.getFullYear(), month.getMonth(), item.day);
            const dayEvents = events.filter(event => isSameDay(getEventStart(event), date) || isSameDay(getEventEnd(event), date));

            return <YearViewDayCell key={item.id} day={item.day} date={date} events={dayEvents} />;
          })}
        </div>
      </div>
    </div>
  );
}
