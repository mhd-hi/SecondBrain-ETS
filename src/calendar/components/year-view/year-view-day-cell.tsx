import type { TEvent } from '@/calendar/types';
import { isToday } from 'date-fns';

// import { useRouter } from 'next/navigation';

import { useCalendarViewStore } from '@/calendar/contexts/calendar-view-store';
import { useSelectedDate } from '@/calendar/contexts/selected-date-context';

import { cn } from '@/lib/utils';

type IProps = {
  day: number;
  date: Date;
  events: TEvent[];
};

export function YearViewDayCell({ day, date, events }: IProps) {
  const { setSelectedDate } = useSelectedDate();

  const maxIndicators = 3;
  const eventCount = events.length;

  const setView = useCalendarViewStore(state => state.setView);
  const handleClick = () => {
    setSelectedDate(date);
    setView('day');
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className="flex h-11 flex-1 flex-col items-center justify-start gap-0.5 rounded-md pt-1 hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <div
        className={cn(
          'flex size-6 items-center justify-center rounded-full text-xs font-medium',
          isToday(date) && 'bg-primary font-semibold text-primary-foreground',
        )}
      >
        {day}
      </div>

      {eventCount > 0 && (
        <div className="mt-0.5 flex gap-0.5">
          {eventCount <= maxIndicators
          ? (
            events.map(event => (
              <div
                key={event.id}
                className={cn(
                  'size-1.5 rounded-full',
                  event.color === 'blue' && 'bg-blue-600',
                  event.color === 'green' && 'bg-green-600',
                  event.color === 'red' && 'bg-red-600',
                  event.color === 'yellow' && 'bg-yellow-600',
                  event.color === 'purple' && 'bg-purple-600',
                  event.color === 'orange' && 'bg-orange-600',
                  event.color === 'gray' && 'bg-neutral-600',
                )}
              />
            ))
          )
          : (
            <>
              {events[0] && (
                <div
                  className={cn(
                    'size-1.5 rounded-full',
                    events[0].color === 'blue' && 'bg-blue-600',
                    events[0].color === 'green' && 'bg-green-600',
                    events[0].color === 'red' && 'bg-red-600',
                    events[0].color === 'yellow' && 'bg-yellow-600',
                    events[0].color === 'purple' && 'bg-purple-600',
                    events[0].color === 'orange' && 'bg-orange-600',
                  )}
                />
              )}
              <span className="text-[7px] text-muted-foreground">{eventCount - 1}</span>
            </>
          )}
        </div>
      )}
    </button>
  );
}
