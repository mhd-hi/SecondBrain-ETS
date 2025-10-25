import type { TCalendarView } from '@/calendar/types';
import { create } from 'zustand';

type CalendarViewState = {
    view: TCalendarView;
    setView: (view: TCalendarView) => void;
};

export const useCalendarViewStore = create<CalendarViewState>(set => ({
    view: 'month',
    setView: view => set({ view }),
}));
