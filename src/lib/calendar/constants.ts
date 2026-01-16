import type { TVisibleHours } from '@/calendar/types';

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const VISIBLE_HOURS = { from: 8, to: 23 } as TVisibleHours; /// Visible hours for the calendar: 8 AM to 11 PM

/// Week View Settings
export const WEEK_VIEW_SLOT_INTERVAL_MINUTES = 30; // interval in minutes for each time slot (15, 30, or 60)
export const WEEK_VIEW_HOUR_BLOCK_HEIGHT = 48; // Height of one hour block in pixels

/// Day View Settings
export const DAY_VIEW_HOUR_BLOCK_HEIGHT = 96; // Height of one hour block in pixels for day view
