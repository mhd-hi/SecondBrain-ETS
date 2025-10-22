import type { TEventColor } from '@/calendar/types';

export type IEvent = {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  color: TEventColor;
};

export type ICalendarCell = {
  day: number;
  currentMonth: boolean;
  date: Date;
};
