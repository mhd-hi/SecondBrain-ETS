import type { TEvent } from '@/calendar/types';

import { format } from 'date-fns';

import { AgendaEventCard } from '@/calendar/components/agenda-view/agenda-event-card';

type IProps = {
  date: Date;
  events: TEvent[];
};

export function AgendaDayGroup({ date, events }: IProps) {
  const sortedEvents = [...events].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  return (
    <div className="space-y-1">
      <div className="sticky top-0 flex items-center gap-4 py-2 rounded-md p-1.5">
        <p className="text-sm font-semibold">{format(date, 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="space-y-2">
        {sortedEvents.length > 0 && sortedEvents.map(event => <AgendaEventCard key={event.id} event={event} />)}
      </div>
    </div>
  );
}
