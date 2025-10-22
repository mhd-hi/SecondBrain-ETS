import type { IEvent } from '@/calendar/interfaces';
import type { TCalendarView } from '@/calendar/types';
import { format } from 'date-fns';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { useMemo } from 'react';
import { useCalendar } from '@/calendar/contexts/calendar-context';

import { getEventsCount, navigateDate, rangeText } from '@/calendar/helpers';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type IProps = {
  view: TCalendarView;
  events: IEvent[];
};

export function DateNavigator({ view, events }: IProps) {
  const { selectedDate, setSelectedDate } = useCalendar();
  const isValidDate = (d: unknown): d is Date => d instanceof Date && !Number.isNaN(d.getTime());
  const safeDate = isValidDate(selectedDate) ? selectedDate : null;

  const month = safeDate ? format(safeDate, 'MMMM') : '—';
  const year = safeDate ? String(safeDate.getFullYear()) : '';

  const eventCount = useMemo(() => {
    return safeDate ? getEventsCount(events, safeDate, view) : 0;
  }, [events, view, safeDate]);

  const handlePrevious = () => {
    if (!safeDate) {
      return;
    }
    const newDate = navigateDate(safeDate, view, 'previous');
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    if (!safeDate) {
      return;
    }
    const newDate = navigateDate(safeDate, view, 'next');
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">
          {month}
{' '}
{year}
        </span>
        <Badge variant="outline" className="px-1.5">
          {eventCount}
{' '}
events
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" className="size-6.5 px-0 [&_svg]:size-4.5" onClick={handlePrevious}>
          <ChevronLeft />
        </Button>

  <p className="text-sm text-muted-foreground">{safeDate ? rangeText(view, safeDate) : '—'}</p>

        <Button variant="outline" className="size-6.5 px-0 [&_svg]:size-4.5" onClick={handleNext}>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
