import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    buildTerm,
    calculateWeekFromDueDate,
    getCurrentOrUpcomingTerm,
    getCurrentTerm,
    getDatesForTerm,
    parseTermId,
} from '@/lib/utils/term-util';

import { TRIMESTER } from '@/types/term';
import { ensureViSetSystemTime } from '../helpers/time';

ensureViSetSystemTime(vi);

describe('term-workflow - e2e integration', () => {
    describe('complete term workflow', () => {
        it('should handle full term parse and build cycle', () => {
            // Scenario: Get information about Winter 2025 term
            const termId = '20251';

            // Step 1: Parse term ID
            const { year, trimester } = parseTermId(termId);

            expect(year).toBe(2025);
            expect(trimester).toBe(TRIMESTER.WINTER);

            // Step 2: Build term object
            const term = buildTerm({ trimester, year });

            expect(term.id).toBe(termId);
            expect(term.label).toBe('Hiver 2025');

            // Step 3: Get dates for term
            const dates = getDatesForTerm(termId);

            expect(dates.start).toEqual(new Date(2025, 0, 5));
            expect(dates.end).toEqual(new Date(2025, 3, 27));

            // Step 4: Verify dates match term
            expect(dates).toBeDefined();
            expect(dates.start.getTime()).toBeLessThan(dates.end.getTime());
        });

        it('should handle all three terms in sequence', () => {
            const termIds = ['20251', '20252', '20253'];
            const expectedTrimesters = [TRIMESTER.WINTER, TRIMESTER.SUMMER, TRIMESTER.AUTUMN];
            const expectedLabels = ['Hiver 2025', 'Été 2025', 'Automne 2025'];

            termIds.forEach((termId, index) => {
                const { trimester } = parseTermId(termId);
                const term = buildTerm({ trimester, year: 2025 });
                const dates = getDatesForTerm(termId);

                expect(trimester).toBe(expectedTrimesters[index]);
                expect(term.label).toBe(expectedLabels[index]);
                expect(dates).toBeDefined();
                expect(dates.start.getTime()).toBeLessThan(dates.end.getTime());
            });
        });
    });

    describe('date navigation workflow', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should navigate through terms chronologically', () => {
            // Start at Jan 1, 2025
            vi.setSystemTime(new Date(2025, 0, 1));

            let current = getCurrentOrUpcomingTerm();

            expect(current.trimester).toBe(TRIMESTER.WINTER);
            expect(current.year).toBe(2025);

            // Move to May 1, 2025
            vi.setSystemTime(new Date(2025, 4, 1));

            current = getCurrentOrUpcomingTerm();

            expect(current.trimester).toBe(TRIMESTER.SUMMER);
            expect(current.year).toBe(2025);

            // Move to Sep 1, 2025
            vi.setSystemTime(new Date(2025, 8, 1));

            current = getCurrentOrUpcomingTerm();

            expect(current.trimester).toBe(TRIMESTER.AUTUMN);
            expect(current.year).toBe(2025);

            // Move to Dec 25, 2025 (between terms)
            vi.setSystemTime(new Date(2025, 11, 25));

            current = getCurrentOrUpcomingTerm();

            expect(current.trimester).toBe(TRIMESTER.WINTER);
            expect(current.year).toBe(2026);
        });

        it('should correctly identify term transitions', () => {
            const transitions = [
                { date: new Date(2025, 3, 27), expectedTrimester: TRIMESTER.WINTER, description: 'Last day of winter' },
                { date: new Date(2025, 3, 28), expectedTrimester: TRIMESTER.SUMMER, description: 'Day after winter' },
                { date: new Date(2025, 7, 15), expectedTrimester: TRIMESTER.SUMMER, description: 'Last day of summer' },
                { date: new Date(2025, 7, 16), expectedTrimester: TRIMESTER.AUTUMN, description: 'Day after summer' },
                { date: new Date(2025, 11, 18), expectedTrimester: TRIMESTER.AUTUMN, description: 'Last day of autumn' },
                {
                    date: new Date(2025, 11, 19),
                    expectedTrimester: TRIMESTER.WINTER,
                    description: 'Day after autumn (next year)',
                },
            ];

            transitions.forEach(({ date, expectedTrimester }) => {
                vi.setSystemTime(date);

                const current = getCurrentOrUpcomingTerm();

                expect(current.trimester).toBe(expectedTrimester);
            });
        });
    });

    describe('week calculation within term context', () => {
        it('should calculate weeks correctly across term boundaries', () => {
            // Early term
            const earlyDate = new Date(2025, 0, 12);
            const earlyWeek = calculateWeekFromDueDate(earlyDate);

            expect(earlyWeek).toBe(1);

            // Mid term
            const midDate = new Date(2025, 1, 23);
            const midWeek = calculateWeekFromDueDate(midDate);

            expect(midWeek).toBeGreaterThan(earlyWeek);
            expect(midWeek).toBeLessThan(13);

            // Late term
            const lateDate = new Date(2025, 3, 20);
            const lateWeek = calculateWeekFromDueDate(lateDate);

            expect(lateWeek).toBeGreaterThan(midWeek);
            expect(lateWeek).toBe(13);
        });

        it('should handle between-term dates appropriately', () => {
            // Between Winter and Summer
            const betweenDate1 = new Date(2025, 3, 28);
            const week1 = calculateWeekFromDueDate(betweenDate1);

            expect(week1).toBe(1); // Maps to next term (Summer)

            // Between Summer and Autumn
            const betweenDate2 = new Date(2025, 7, 16);
            const week2 = calculateWeekFromDueDate(betweenDate2);

            expect(week2).toBe(1); // Maps to next term (Autumn)

            // Between Autumn and Winter (next year)
            const betweenDate3 = new Date(2025, 11, 19);
            const week3 = calculateWeekFromDueDate(betweenDate3);

            expect(week3).toBe(13); // Falls back to Autumn as last term of 2025
        });
    });

    describe('multi-term coordination', () => {
        it('should correctly identify all terms for a given year', () => {
            const termIds = ['20251', '20252', '20253'];
            const builtTerms = termIds.map((id) => {
                const { year, trimester } = parseTermId(id);

                return buildTerm({ trimester, year });
            });

            expect(builtTerms).toHaveLength(3);
            expect(builtTerms[0]?.label).toContain('Hiver');
            expect(builtTerms[1]?.label).toContain('Été');
            expect(builtTerms[2]?.label).toContain('Automne');
            expect(builtTerms.every(term => term.label.includes('2025'))).toBe(true);
        });

        it('should maintain consistency across year boundaries', () => {
            // Get autumn 2025
            const autumn2025Id = '20253';
            const { year: autumnYear, trimester: autumnTrimester } = parseTermId(autumn2025Id);
            const autumn2025 = buildTerm({ trimester: autumnTrimester, year: autumnYear });

            expect(autumn2025.label).toBe('Automne 2025');

            // Get winter 2026 (next year)
            const winter2026Id = '20261';
            const { year: winterYear, trimester: winterTrimester } = parseTermId(winter2026Id);
            const winter2026 = buildTerm({ trimester: winterTrimester, year: winterYear });

            expect(winter2026.label).toBe('Hiver 2026');

            // Verify they're sequential
            expect(winterYear).toBe(autumnYear + 1);
        });
    });

    describe('real-world scenarios', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should handle student checking current term on Dec 19, 2025', () => {
            // Student checks current term on Dec 19, 2025 (after autumn ends)
            vi.setSystemTime(new Date(2025, 11, 19));

            const currentTerm = getCurrentTerm();

            expect(currentTerm).toBeNull(); // Between terms

            const upcomingTerm = getCurrentOrUpcomingTerm();

            expect(upcomingTerm.trimester).toBe(TRIMESTER.WINTER);
            expect(upcomingTerm.year).toBe(2026);

            const term = buildTerm(upcomingTerm);

            expect(term.label).toBe('Hiver 2026');
        });

        it('should handle assignment due date calculation mid-semester', () => {
            // We're in the middle of Winter 2025
            vi.setSystemTime(new Date(2025, 1, 15));

            // Assignment due on March 1, 2025
            const dueDate = new Date(2025, 2, 1);

            const currentTerm = getCurrentTerm();

            expect(currentTerm).toBe(TRIMESTER.WINTER);

            const weekOfAssignment = calculateWeekFromDueDate(dueDate);

            expect(weekOfAssignment).toBeGreaterThan(1);
            expect(weekOfAssignment).toBeLessThanOrEqual(13);
        });
    });
});
