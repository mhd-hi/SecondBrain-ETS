import type { TVisibleHours } from '@/calendar/types';

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Default visible hours for the calendar: midnight (0) to noon (12)
export const VISIBLE_HOURS = { from: 8, to: 24 } as TVisibleHours;
