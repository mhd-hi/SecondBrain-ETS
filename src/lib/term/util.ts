import type { Term, TermBuildInput, TrimesterDates, TrimesterKey } from '@/types/term';
import { TRIMESTER, TRIMESTER_DIGIT } from '@/types/term';

// Term ID validation regex - expects format YYYY[1-3]
const TERM_ID_REGEX = /^\d{4}[1-3]$/;

// Expected format YYYY[1-3]
export const isValidTermId = (termId: string): boolean => {
    return TERM_ID_REGEX.test(termId);
};

export const validateTermId = (termId: string): void => {
    if (!isValidTermId(termId)) {
        throw new Error(`Invalid term ID format: ${termId}. Expected format: YYYY[1-3]`);
    }
};

// convert PlanETS numeric term code (e.g. '20252') to a localized label
export const convertTermCodeToLabel = (code: string) => {
    // Expect format YYYY[1-3]
    if (!isValidTermId(code)) {
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

const getTrimesterDates = (): TrimesterDates => {
    const currentYear = new Date().getFullYear();

    return {
        [TRIMESTER.WINTER]: {
            start: new Date(currentYear, 0, 5),
            end: new Date(currentYear, 3, 27),
            weeks: STANDARD_WEEKS_PER_TERM,
        },
        [TRIMESTER.SUMMER]: {
            start: new Date(currentYear, 4, 1),
            end: new Date(currentYear, 7, 16),
            weeks: STANDARD_WEEKS_PER_TERM,
        },
        [TRIMESTER.AUTUMN]: {
            start: new Date(currentYear, 8, 2),
            end: new Date(currentYear, 11, 18),
            weeks: STANDARD_WEEKS_PER_TERM,
        },
    };
};

export const TRIMESTER_DATES = getTrimesterDates();

export function getCurrentTerm(): TrimesterKey | null {
    const now = new Date();

    // Iterate over the known trimester keys to ensure type safety
    for (const term of Object.values(TRIMESTER)) {
        const dates = TRIMESTER_DATES[term];
        if (now >= dates.start && now <= dates.end) {
            return term;
        }
    }

    return null;
}

export function getNextTerm(): TrimesterKey {
    const now = new Date();

    if (now < TRIMESTER_DATES[TRIMESTER.WINTER].start) {
        return TRIMESTER.WINTER;
    } else if (now < TRIMESTER_DATES[TRIMESTER.SUMMER].start) {
        return TRIMESTER.SUMMER;
    } else if (now < TRIMESTER_DATES[TRIMESTER.AUTUMN].start) {
        return TRIMESTER.AUTUMN;
    } else {
        return TRIMESTER.WINTER;
    }
}

export const prevTerm = (trimester: TrimesterKey, year: number) => {
    if (trimester === TRIMESTER.WINTER) {
        return { trimester: TRIMESTER.AUTUMN, year: year - 1 };
    }

    if (trimester === TRIMESTER.SUMMER) {
        return { trimester: TRIMESTER.WINTER, year };
    }

    // autumn
    return { trimester: TRIMESTER.SUMMER, year };
};

export const nextTerm = (trimester: TrimesterKey, year: number) => {
    if (trimester === TRIMESTER.AUTUMN) {
        return { trimester: TRIMESTER.WINTER, year: year + 1 };
    }

    if (trimester === TRIMESTER.WINTER) {
        return { trimester: TRIMESTER.SUMMER, year };
    }

    // summer
    return { trimester: TRIMESTER.AUTUMN, year };
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

    if (dueDate >= TRIMESTER_DATES[TRIMESTER.WINTER].start && dueDate <= TRIMESTER_DATES[TRIMESTER.WINTER].end) {
        trimester = TRIMESTER.WINTER;
    } else if (dueDate >= TRIMESTER_DATES[TRIMESTER.SUMMER].start && dueDate <= TRIMESTER_DATES[TRIMESTER.SUMMER].end) {
        trimester = TRIMESTER.SUMMER;
    } else if (dueDate >= TRIMESTER_DATES[TRIMESTER.AUTUMN].start && dueDate <= TRIMESTER_DATES[TRIMESTER.AUTUMN].end) {
        trimester = TRIMESTER.AUTUMN;
    } else {
        // If the date doesn't fall in any term, find the closest one
        const now = new Date();
        if (now < TRIMESTER_DATES[TRIMESTER.WINTER].start) {
            trimester = TRIMESTER.WINTER;
        } else if (now < TRIMESTER_DATES[TRIMESTER.SUMMER].start) {
            trimester = TRIMESTER.SUMMER;
        } else if (now < TRIMESTER_DATES[TRIMESTER.AUTUMN].start) {
            trimester = TRIMESTER.AUTUMN;
        } else {
            trimester = TRIMESTER.WINTER;
        }
    }

    const termDates = TRIMESTER_DATES[trimester];

    // Calculate the number of days from term start to due date
    const daysDiff = Math.max(0, Math.floor((dueDate.getTime() - termDates.start.getTime()) / (1000 * 60 * 60 * 24)));

    // Convert days to weeks within the term
    const weeksFromStart = daysDiff / 7;

    // Convert from term weeks back to course weeks
    const adjustedWeek = (weeksFromStart / STANDARD_WEEKS_PER_TERM) * totalCourseWeeks;

    // Ensure we return at least week 1 and don't exceed total course weeks
    return Math.max(1, Math.min(Math.round(adjustedWeek), totalCourseWeeks));
}
