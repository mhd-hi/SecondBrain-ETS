import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    buildTerm,
    calculateWeekFromDueDate,
    convertTermCodeToLabel,
    getCurrentOrUpcomingTerm,
    getCurrentTerm,
    getDatesForTerm,
    getNextTerm,
    getPrevTerm,
    getTrimesterDatesForYear,
    isValidTermId,
    nextTerm,
    parseTermId,
    STANDARD_WEEKS_PER_TERM,
} from '@/lib/utils/term-util';
import { TRIMESTER } from '@/types/term';

describe('term-util', () => {
    describe('isValidTermId', () => {
        it('should validate correct term IDs', () => {
            expect(isValidTermId('20251')).toBe(true);
            expect(isValidTermId('20252')).toBe(true);
            expect(isValidTermId('20253')).toBe(true);
        });

        it('should reject invalid term IDs', () => {
            expect(isValidTermId('2025')).toBe(false);
            expect(isValidTermId('202500')).toBe(false);
            expect(isValidTermId('20254')).toBe(false);
            expect(isValidTermId('abc1')).toBe(false);
            expect(isValidTermId('202a')).toBe(false);
        });
    });

    describe('convertTermCodeToLabel', () => {
        it('should convert winter term correctly', () => {
            expect(convertTermCodeToLabel('20251')).toBe('Hiver 2025');
        });

        it('should convert summer term correctly', () => {
            expect(convertTermCodeToLabel('20252')).toBe('Été 2025');
        });

        it('should convert autumn term correctly', () => {
            expect(convertTermCodeToLabel('20253')).toBe('Automne 2025');
        });

        it('should return original code for invalid term IDs', () => {
            expect(convertTermCodeToLabel('invalid')).toBe('invalid');
            expect(convertTermCodeToLabel('2025')).toBe('2025');
        });
    });

    describe('buildTerm', () => {
        it('should build winter term correctly', () => {
            const term = buildTerm({ trimester: TRIMESTER.WINTER, year: 2025 });

            expect(term.id).toBe('20251');
            expect(term.label).toBe('Hiver 2025');
        });

        it('should build summer term correctly', () => {
            const term = buildTerm({ trimester: TRIMESTER.SUMMER, year: 2025 });

            expect(term.id).toBe('20252');
            expect(term.label).toBe('Été 2025');
        });

        it('should build autumn term correctly', () => {
            const term = buildTerm({ trimester: TRIMESTER.AUTUMN, year: 2025 });

            expect(term.id).toBe('20253');
            expect(term.label).toBe('Automne 2025');
        });

        it('should throw error for invalid trimester', () => {
            expect(() => buildTerm({ trimester: 'invalid' as unknown as typeof TRIMESTER.WINTER, year: 2025 })).toThrow();
        });
    });

    describe('parseTermId', () => {
        it('should parse winter term ID', () => {
            const { year, trimester } = parseTermId('20251');

            expect(year).toBe(2025);
            expect(trimester).toBe(TRIMESTER.WINTER);
        });

        it('should parse summer term ID', () => {
            const { year, trimester } = parseTermId('20252');

            expect(year).toBe(2025);
            expect(trimester).toBe(TRIMESTER.SUMMER);
        });

        it('should parse autumn term ID', () => {
            const { year, trimester } = parseTermId('20253');

            expect(year).toBe(2025);
            expect(trimester).toBe(TRIMESTER.AUTUMN);
        });

        it('should throw error for invalid term ID', () => {
            expect(() => parseTermId('2025')).toThrow();
            expect(() => parseTermId('invalid')).toThrow();
        });
    });

    describe('getTrimesterDatesForYear', () => {
        it('should return correct winter dates', () => {
            const dates = getTrimesterDatesForYear(2025);

            expect(dates[TRIMESTER.WINTER].start).toEqual(new Date(2025, 0, 5));
            expect(dates[TRIMESTER.WINTER].end).toEqual(new Date(2025, 3, 27));
            expect(dates[TRIMESTER.WINTER].weeks).toBe(STANDARD_WEEKS_PER_TERM);
        });

        it('should return correct summer dates', () => {
            const dates = getTrimesterDatesForYear(2025);

            expect(dates[TRIMESTER.SUMMER].start).toEqual(new Date(2025, 4, 1));
            expect(dates[TRIMESTER.SUMMER].end).toEqual(new Date(2025, 7, 15));
        });

        it('should return correct autumn dates', () => {
            const dates = getTrimesterDatesForYear(2025);

            expect(dates[TRIMESTER.AUTUMN].start).toEqual(new Date(2025, 8, 2));
            expect(dates[TRIMESTER.AUTUMN].end).toEqual(new Date(2025, 11, 18));
        });
    });

    describe('getDatesForTerm', () => {
        it('should get dates for term ID', () => {
            const dates = getDatesForTerm('20251');

            expect(dates.start).toEqual(new Date(2025, 0, 5));
            expect(dates.end).toEqual(new Date(2025, 3, 27));
        });

        it('should throw error for invalid term ID', () => {
            expect(() => getDatesForTerm('invalid')).toThrow();
        });
    });

    describe('getCurrentTerm', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return WINTER when in winter term', () => {
            // Jan 15, 2025 is in winter
            vi.setSystemTime(new Date(2025, 0, 15));

            expect(getCurrentTerm()).toBe(TRIMESTER.WINTER);
        });

        it('should return SUMMER when in summer term', () => {
            // June 1, 2025 is in summer
            vi.setSystemTime(new Date(2025, 5, 1));

            expect(getCurrentTerm()).toBe(TRIMESTER.SUMMER);
        });

        it('should return AUTUMN when in autumn term', () => {
            // Sep 15, 2025 is in autumn
            vi.setSystemTime(new Date(2025, 8, 15));

            expect(getCurrentTerm()).toBe(TRIMESTER.AUTUMN);
        });

        it('should return null when between terms', () => {
            // Dec 25, 2025 is after autumn ends
            vi.setSystemTime(new Date(2025, 11, 25));

            expect(getCurrentTerm()).toBeNull();
        });
    });

    describe('getNextTerm', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return WINTER before winter starts', () => {
            // Jan 1, 2025
            vi.setSystemTime(new Date(2025, 0, 1));

            expect(getNextTerm()).toBe(TRIMESTER.WINTER);
        });

        it('should return SUMMER before summer starts', () => {
            // Apr 30, 2025
            vi.setSystemTime(new Date(2025, 3, 30));

            expect(getNextTerm()).toBe(TRIMESTER.SUMMER);
        });

        it('should return AUTUMN before autumn starts', () => {
            // Aug 20, 2025
            vi.setSystemTime(new Date(2025, 7, 20));

            expect(getNextTerm()).toBe(TRIMESTER.AUTUMN);
        });

        it('should return WINTER after autumn ends', () => {
            // Dec 25, 2025
            vi.setSystemTime(new Date(2025, 11, 25));

            expect(getNextTerm()).toBe(TRIMESTER.WINTER);
        });
    });

    describe('getCurrentOrUpcomingTerm', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should return current term if in one', () => {
            // Jan 15, 2025
            vi.setSystemTime(new Date(2025, 0, 15));

            const result = getCurrentOrUpcomingTerm();

            expect(result.trimester).toBe(TRIMESTER.WINTER);
            expect(result.year).toBe(2025);
        });

        it('should return next term with correct year when between terms before winter', () => {
            // Jan 1, 2025
            vi.setSystemTime(new Date(2025, 0, 1));

            const result = getCurrentOrUpcomingTerm();

            expect(result.trimester).toBe(TRIMESTER.WINTER);
            expect(result.year).toBe(2025);
        });

        it('should return next year winter when after autumn ends', () => {
            // Dec 25, 2025
            vi.setSystemTime(new Date(2025, 11, 25));

            const result = getCurrentOrUpcomingTerm();

            expect(result.trimester).toBe(TRIMESTER.WINTER);
            expect(result.year).toBe(2026);
        });
    });

    describe('getPrevTerm', () => {
        it('should get previous term for winter', () => {
            const result = getPrevTerm(TRIMESTER.WINTER, 2025);

            expect(result.trimester).toBe(TRIMESTER.AUTUMN);
            expect(result.year).toBe(2024);
        });

        it('should get previous term for summer', () => {
            const result = getPrevTerm(TRIMESTER.SUMMER, 2025);

            expect(result.trimester).toBe(TRIMESTER.WINTER);
            expect(result.year).toBe(2025);
        });

        it('should get previous term for autumn', () => {
            const result = getPrevTerm(TRIMESTER.AUTUMN, 2025);

            expect(result.trimester).toBe(TRIMESTER.SUMMER);
            expect(result.year).toBe(2025);
        });
    });

    describe('nextTerm', () => {
        it('should get next term for winter', () => {
            const result = nextTerm(TRIMESTER.WINTER, 2025);

            expect(result.trimester).toBe(TRIMESTER.SUMMER);
            expect(result.year).toBe(2025);
        });

        it('should get next term for summer', () => {
            const result = nextTerm(TRIMESTER.SUMMER, 2025);

            expect(result.trimester).toBe(TRIMESTER.AUTUMN);
            expect(result.year).toBe(2025);
        });

        it('should get next term for autumn', () => {
            const result = nextTerm(TRIMESTER.AUTUMN, 2025);

            expect(result.trimester).toBe(TRIMESTER.WINTER);
            expect(result.year).toBe(2026);
        });
    });

    describe('calculateWeekFromDueDate', () => {
        it('should calculate correct week for date in term', () => {
            // Jan 12, 2025 is 7 days after winter start (Jan 5), which is week 1
            const dueDate = new Date(2025, 0, 12);

            const week = calculateWeekFromDueDate(dueDate);

            expect(week).toBe(1);
        });

        it('should calculate week 1 for date on term start', () => {
            const dueDate = new Date(2025, 0, 5);

            const week = calculateWeekFromDueDate(dueDate);

            expect(week).toBe(1);
        });

        it('should handle custom course weeks', () => {
            // Jan 12, 2025 in a 26-week course
            const dueDate = new Date(2025, 0, 12);

            const week = calculateWeekFromDueDate(dueDate, 26);

            expect(week).toBeGreaterThan(1);
        });

        it('should return at least week 1 for dates before term start', () => {
            const dueDate = new Date(2025, 0, 1);

            const week = calculateWeekFromDueDate(dueDate);

            expect(week).toBe(1);
        });
    });

    describe('STANDARD_WEEKS_PER_TERM', () => {
        it('should be 13 weeks', () => {
            expect(STANDARD_WEEKS_PER_TERM).toBe(13);
        });
    });
});
