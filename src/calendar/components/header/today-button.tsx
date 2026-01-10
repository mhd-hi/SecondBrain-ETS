import { formatDate } from 'date-fns';

import { useCalendarViewStore } from '@/lib/stores/calendar-view-store';

export function TodayButton() {
  const setSelectedDate = useCalendarViewStore(state => state.setSelectedDate);

  const today = new Date();
  const handleClick = () => setSelectedDate(today);

  return (
    <button
      className="flex size-14 flex-col items-start overflow-hidden rounded-lg border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      onClick={handleClick}
      type="button"
    >
      <p className="flex h-6 w-full items-center justify-center bg-primary text-center text-xs font-semibold text-primary-foreground">
        {formatDate(today, 'MMM').toUpperCase()}
      </p>
      <p className="flex w-full items-center justify-center text-lg font-bold">{today.getDate()}</p>
    </button>
  );
}
