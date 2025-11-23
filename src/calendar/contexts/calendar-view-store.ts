import type { TCalendarView, TEvent, TVisibleHours } from '@/calendar/types';
import { create } from 'zustand';
import { VISIBLE_HOURS } from '@/lib/calendar/constants';

type VisibleRange = {
    start: Date;
    end: Date;
};

type CalendarViewState = {
    visibleHours: TVisibleHours;
    setVisibleHours: (hours: TVisibleHours) => void;
    view: TCalendarView;
    setView: (view: TCalendarView) => void;
    selectedDate: Date;
    setSelectedDate: (date: Date) => void;
    visibleRange: VisibleRange;
    setVisibleRange: (range: VisibleRange) => void;
    events: TEvent[];
    setEvents: (events: TEvent[] | ((prev: TEvent[]) => TEvent[])) => void;
};

export const useCalendarViewStore = create<CalendarViewState>(set => ({
    view: 'month',
    setView: view => set({ view }),
    selectedDate: new Date(),
    setSelectedDate: date => set({ selectedDate: date }),
    visibleRange: { start: new Date(), end: new Date() },
    setVisibleRange: range => set({ visibleRange: range }),
    visibleHours: VISIBLE_HOURS,
    setVisibleHours: hours => set({ visibleHours: hours }),
    events: [],
    setEvents: eventsOrUpdater => set((state) => {
        return {
            events: typeof eventsOrUpdater === 'function' ? eventsOrUpdater(state.events) : eventsOrUpdater,
        };
    }),
}));
