/* eslint-disable ts/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('trimester-util', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-14T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  it('uses term dates from `getDatesForTerm` and computes totalWeeks and weekOfTrimester', async () => {
    // Spy on term-util exports before importing module under test
    const termUtil = (await import('@/lib/utils/term-util')) as any;
    vi.spyOn(termUtil, 'getCurrentOrUpcomingTerm').mockReturnValue({ trimester: 'winter', year: 2026 } as any);
    vi.spyOn(termUtil, 'getDatesForTerm').mockImplementation((..._args: unknown[]) => ({
      start: new Date('2026-02-01'),
      end: new Date('2026-02-28'),
      weeks: 4,
    }) as any);

    const { getCurrentTrimesterInfo } = await import('../../src/lib/utils/trimester-util');

    const info = getCurrentTrimesterInfo();

    expect(info.startOfTrimester.getTime()).toBe(new Date('2026-02-01').getTime());
    expect(info.endOfTrimester.getTime()).toBe(new Date('2026-02-28').getTime());
    // (28-1)=27 days -> Math.ceil(27/7) = 4
    expect(info.totalWeeks).toBe(4);
    // current 14th - start 1st = 13 days -> Math.ceil(13/7) = 2
    expect(info.weekOfTrimester).toBe(2);
  });

  it('falls back to default dates when getDatesForTerm throws', async () => {
    const termUtil2 = (await import('@/lib/utils/term-util')) as any;
    vi.spyOn(termUtil2, 'getCurrentOrUpcomingTerm').mockReturnValue({ trimester: 'summer', year: 2026 } as any);
    vi.spyOn(termUtil2, 'getDatesForTerm').mockImplementation((..._args: unknown[]) => {
      throw new Error('no data');
    }) as any;

    const { getCurrentTrimesterInfo } = await import('../../src/lib/utils/trimester-util');

    const info = getCurrentTrimesterInfo();

    // Fallbacks are based on current year (2026): start = Aug 1, 2026; end = Jan 15, 2027
    expect(info.startOfTrimester.getTime()).toBe(new Date(2026, 7, 1).getTime());
    expect(info.endOfTrimester.getTime()).toBe(new Date(2027, 0, 15).getTime());
    // current date is before start, so weekOfTrimester should be 1
    expect(info.weekOfTrimester).toBe(1);
  });

  it('computes current trimester position as a percentage (0-100)', async () => {
    // Make term start Feb 10 and end Feb 20 so current Feb 14 is 4/10 = 40%
    const termUtil3 = (await import('@/lib/utils/term-util')) as any;
    vi.spyOn(termUtil3, 'getCurrentOrUpcomingTerm').mockReturnValue({ trimester: 'winter', year: 2026 } as any);
    vi.spyOn(termUtil3, 'getDatesForTerm').mockImplementation((..._args: unknown[]) => ({
      start: new Date('2026-02-10'),
      end: new Date('2026-02-20'),
      weeks: 2,
    }) as any);

    const { getCurrentTrimesterPosition } = await import('../../src/lib/utils/trimester-util');

    const pos = getCurrentTrimesterPosition();

    // Allow a reasonable rounding tolerance due to timezone/time-of-day differences
    expect(pos).toBeGreaterThanOrEqual(35);
    expect(pos).toBeLessThanOrEqual(50);
  });
});
