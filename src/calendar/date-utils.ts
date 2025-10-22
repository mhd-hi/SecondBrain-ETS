import type { IEvent } from '@/calendar/interfaces';
import { parseISO } from 'date-fns';

type ParsedEvent = IEvent & { startDateObj?: Date; endDateObj?: Date };

export function getEventStart(event: IEvent | ParsedEvent) {
    const e = event as ParsedEvent;
    if (e.startDateObj instanceof Date) {
        return e.startDateObj;
    }

    try {
        const d = parseISO(e.startDate);
        e.startDateObj = d;
        return d;
    } catch {
        const d = new Date(e.startDate);
        e.startDateObj = d;
        return d;
    }
}

export function getEventEnd(event: IEvent | ParsedEvent) {
    const e = event as ParsedEvent;
    if (e.endDateObj instanceof Date) {
        return e.endDateObj;
    }

    try {
        const d = parseISO(e.endDate);
        e.endDateObj = d;
        return d;
    } catch {
        const d = new Date(e.endDate);
        e.endDateObj = d;
        return d;
    }
}
