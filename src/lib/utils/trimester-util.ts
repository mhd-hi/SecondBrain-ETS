import { getCurrentTerm, getDatesForTerm, getCurrentOrUpcomingTerm } from '@/lib/utils/term-util';
import { TRIMESTER } from '@/types/term';

export type TrimesterInfo = {
    startOfTrimester: Date;
    endOfTrimester: Date;
    totalWeeks: number;
    weekOfTrimester: number;
};

/**
 * Calculate current trimester information including dates and week position
 */
export function getCurrentTrimesterInfo(): TrimesterInfo {
    const currentDate = new Date();

    // Use getCurrentOrUpcomingTerm to handle between-term periods correctly
    const { trimester, year } = getCurrentOrUpcomingTerm();
    const termDigit = trimester === TRIMESTER.WINTER
        ? '1'
        : trimester === TRIMESTER.SUMMER
            ? '2'
            : '3';
    const termId = `${year}${termDigit}`;

    let startOfTrimester = new Date(currentDate.getFullYear(), 7, 1);
    let endOfTrimester = new Date(currentDate.getFullYear() + 1, 0, 15);

    try {
        const dates = getDatesForTerm(termId);
        startOfTrimester = dates.start;
        endOfTrimester = dates.end;
    } catch {
        // Keep fallback dates if term calculation fails
    }

    const totalWeeks = Math.ceil((endOfTrimester.getTime() - startOfTrimester.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const weekOfTrimester = Math.max(1, Math.ceil((currentDate.getTime() - startOfTrimester.getTime()) / (7 * 24 * 60 * 60 * 1000)));

    return {
        startOfTrimester,
        endOfTrimester,
        totalWeeks,
        weekOfTrimester,
    };
}

/**
 * Calculate current position as percentage within the trimester (0-100)
 */
export function getCurrentTrimesterPosition(): number {
    const currentDate = new Date();
    const { startOfTrimester, endOfTrimester } = getCurrentTrimesterInfo();

    const totalDuration = endOfTrimester.getTime() - startOfTrimester.getTime();
    const currentProgress = currentDate.getTime() - startOfTrimester.getTime();

    return Math.max(0, Math.min(100, (currentProgress / totalDuration) * 100));
}
