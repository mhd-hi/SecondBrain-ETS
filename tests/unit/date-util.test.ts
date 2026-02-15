/* eslint-disable ts/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  formatBadgeDate,
  formatDueDate,
  formatWeekRange,
  getWeekNumberFromDueDate,
} from '../../src/lib/utils/date-util';
import { STANDARD_WEEKS_PER_TERM } from '../../src/lib/utils/term-util';

describe('date-util', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Freeze system time to a known date (2026-02-14)
    vi.setSystemTime(new Date('2026-02-14T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  it('formatWeekRange handles empty and returns a short range', () => {
    expect(formatWeekRange([])).toBe('');

    const dates = [new Date('2026-02-14'), new Date('2026-02-16')];
    const r = formatWeekRange(dates);

    expect(r).toContain(' - ');
  });

  it('formatBadgeDate returns weekday, month and day (en-US)', () => {
    const res = formatBadgeDate(new Date('2026-02-14'));

    expect(res).toContain('Sat');
    expect(res).toContain('Feb');
    expect(res).toContain('14');
  });

  it('formatWeekRange formats a start-end range', () => {
    const dates = [new Date('2026-02-14'), new Date('2026-02-20')];
    const res = formatWeekRange(dates);

    expect(res).toMatch(/\d{1,2}/);
    expect(res).toContain(' - ');
  });

  it('formatDueDate handles today, tomorrow, future, overdue and invalid', () => {
    expect(formatDueDate(new Date('2026-02-14'))).toBe('Due today');
    expect(formatDueDate(new Date('2026-02-15'))).toBe('Due tomorrow');
    expect(formatDueDate(new Date('2026-02-17'))).toBe('Due in 3 days');
    expect(formatDueDate(new Date('2026-02-13'))).toBe('Overdue by 1 day');
    expect(formatDueDate(new Date('2026-02-11'))).toBe('Overdue by 3 days');
    expect(formatDueDate('invalid-date')).toBe('Invalid date');
  });

  it('getWeekNumberFromDueDate returns a valid week number within range', () => {
    const week = getWeekNumberFromDueDate(new Date('2026-02-14'));

    expect(typeof week).toBe('number');
    expect(week).toBeGreaterThanOrEqual(1);
    expect(week).toBeLessThanOrEqual(STANDARD_WEEKS_PER_TERM);
  });

  describe('calendar date-utils', () => {
    it('parses ISO start/end and caches the Date objects', async () => {
      const { getEventStart, getEventEnd } = await import('../../src/calendar/date-utils');

      const ev: any = {
        id: '1',
        startDate: '2026-02-14',
        endDate: '2026-02-15',
        title: 't',
        type: 'task',
        color: 'red',
      };

      const s = getEventStart(ev);
      const e = getEventEnd(ev);

      expect(s).toBeInstanceOf(Date);
      expect(e).toBeInstanceOf(Date);
      expect((ev as any).startDateObj).toBe(s);
      expect((ev as any).endDateObj).toBe(e);
      expect(s.getTime()).toBe(new Date('2026-02-14').getTime());
      expect(e.getTime()).toBe(new Date('2026-02-15').getTime());
    });

    it('returns existing startDateObj/endDateObj when present', async () => {
      const { getEventStart, getEventEnd } = await import('../../src/calendar/date-utils');
      const start = new Date(2020, 0, 1);
      const end = new Date(2020, 0, 2);

      const ev: any = {
        id: '2',
        startDate: '2020-01-01',
        endDate: '2020-01-02',
        title: 't2',
        type: 'task',
        color: 'blue',
        startDateObj: start,
        endDateObj: end,
      };

      expect(getEventStart(ev)).toBe(start);
      expect(getEventEnd(ev)).toBe(end);
    });

    it('falls back to `new Date` when parseISO throws', async () => {
      // Mock date-fns.parseISO in an ESM-safe way before importing the module under test
      // Provide a minimal ESM-safe mock that only overrides `parseISO`
      vi.mock('date-fns', () => ({
        parseISO: () => {
          throw new Error('boom');
        },
      }));

      const { getEventStart: getStartMocked } = await import('../../src/calendar/date-utils');

      const ev: any = {
        id: '3',
        startDate: '02/14/2026',
        endDate: '02/15/2026',
        title: 't3',
        type: 'task',
        color: 'green',
      };

      const d = getStartMocked(ev);

      expect(d).toBeInstanceOf(Date);
      expect(ev.startDateObj).toBe(d);

      // mocked module cleanup not required in this environment
    });
  });
});
