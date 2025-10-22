import type { TEventColor } from '@/calendar/types';

export type IUser = {
  id: string;
  name: string;
  picturePath: string | null;
};

export type IEvent = {
  id: number;
  startDate: string;
  endDate: string;
  title: string;
  color: TEventColor;
  description: string;
  user: IUser;
};

export type ICalendarCell = {
  day: number;
  currentMonth: boolean;
  date: Date;
};
