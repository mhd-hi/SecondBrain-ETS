import type { Term, TermBuildInput, TrimesterKey } from '@/types/term';
import { TRIMESTER_DIGIT } from '@/types/term';

// convert PlanETS numeric term code (e.g. '20252') to a localized label
export const convertTermCodeToLabel = (code: string) => {
    // Expect format YYYY[1-3]
    if (!/\d{4}[1-3]$/.test(code)) {
        return code;
    }

    const year = code.slice(0, 4);
    const digit = code.charAt(4);
    const map: Record<string, string> = {
        1: 'Hiver',
        2: 'Été',
        3: 'Automne',
    };
    const season = map[Number(digit)] ?? '';
    return `${season} ${year}`.trim();
};

export const buildTerm = (term: TermBuildInput): Term => {
    // Validate trimester: ensure a digit mapping exists for the given trimester
    if (!(term.trimester in TRIMESTER_DIGIT)) {
        throw new Error(`Unknown term key: ${term.trimester}`);
    }
    const digit = TRIMESTER_DIGIT[term.trimester as TrimesterKey];
    const id = `${term.year}${digit}`;
    return { id, label: convertTermCodeToLabel(id) };
};

// Canonical term helpers used across the app.
export const STANDARD_WEEKS_PER_TERM = 15;

const getTermDates = () => {
    const currentYear = new Date().getFullYear();

    return {
        winter: {
            start: new Date(currentYear, 0, 5),
            end: new Date(currentYear, 3, 27),
            weeks: STANDARD_WEEKS_PER_TERM,
        },
        summer: {
            start: new Date(currentYear, 4, 1),
            end: new Date(currentYear, 7, 16),
            weeks: STANDARD_WEEKS_PER_TERM,
        },
        autumn: {
            start: new Date(currentYear, 8, 2),
            end: new Date(currentYear, 11, 18),
            weeks: STANDARD_WEEKS_PER_TERM,
        },
    } as const;
};

export const TERM_DATES = getTermDates();

export function getCurrentTerm(): keyof typeof TERM_DATES | null {
    const now = new Date();

    for (const [term, dates] of Object.entries(TERM_DATES)) {
        if (now >= dates.start && now <= dates.end) {
            return term as keyof typeof TERM_DATES;
        }
    }

    return null;
}

export function getNextTerm(): keyof typeof TERM_DATES {
    const now = new Date();

    if (now < TERM_DATES.winter.start) {
        return 'winter';
    } else if (now < TERM_DATES.summer.start) {
        return 'summer';
    } else if (now < TERM_DATES.autumn.start) {
        return 'autumn';
    } else {
        return 'winter';
    }
}

export const prevTerm = (trimester: TrimesterKey, year: number) => {
    if (trimester === 'winter') {
        return { trimester: 'autumn' as const, year: year - 1 };
    }

    if (trimester === 'summer') {
        return { trimester: 'winter' as const, year };
    }

    // autumn
    return { trimester: 'summer' as const, year };
};

export const nextTerm = (trimester: TrimesterKey, year: number) => {
    if (trimester === 'autumn') {
        return { trimester: 'winter' as const, year: year + 1 };
    }

    if (trimester === 'winter') {
        return { trimester: 'summer' as const, year };
    }

    // summer
    return { trimester: 'autumn' as const, year };
};

/**
 * Calculates the week number from a due date based on trimesters
 * This is the inverse of calculateTaskDueDate
 * @param dueDate The due date to calculate week from
 * @param totalCourseWeeks The total number of weeks in the course
 * @returns The calculated week number
 */
export function calculateWeekFromDueDate(dueDate: Date, totalCourseWeeks = 15): number {
    // Determine which term the due date falls into
    let trimester: TrimesterKey;

    if (dueDate >= TERM_DATES.winter.start && dueDate <= TERM_DATES.winter.end) {
        trimester = 'winter';
    } else if (dueDate >= TERM_DATES.summer.start && dueDate <= TERM_DATES.summer.end) {
        trimester = 'summer';
    } else if (dueDate >= TERM_DATES.autumn.start && dueDate <= TERM_DATES.autumn.end) {
        trimester = 'autumn';
    } else {
        // If the date doesn't fall in any term, find the closest one
        const now = new Date();
        if (now < TERM_DATES.winter.start) {
            trimester = 'winter';
        } else if (now < TERM_DATES.summer.start) {
            trimester = 'summer';
        } else if (now < TERM_DATES.autumn.start) {
            trimester = 'autumn';
        } else {
            trimester = 'winter';
        }
    }

    const termDates = TERM_DATES[trimester];

    // Calculate the number of days from term start to due date
    const daysDiff = Math.max(0, Math.floor((dueDate.getTime() - termDates.start.getTime()) / (1000 * 60 * 60 * 24)));

    // Convert days to weeks within the term
    const weeksFromStart = daysDiff / 7;

    // Convert from term weeks back to course weeks
    const adjustedWeek = (weeksFromStart / STANDARD_WEEKS_PER_TERM) * totalCourseWeeks;

    // Ensure we return at least week 1 and don't exceed total course weeks
    return Math.max(1, Math.min(Math.round(adjustedWeek), totalCourseWeeks));
}
