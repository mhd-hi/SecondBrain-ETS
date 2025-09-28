export type Term = {
    id: string; // '20253'
    label: string; // 'Automne 2025'
};

// Trimester keys (used across the app)
export const TRIMESTER = {
    AUTUMN: 'autumn',
    SUMMER: 'summer',
    WINTER: 'winter',
} as const;

export type TrimesterKey = (typeof TRIMESTER)[keyof typeof TRIMESTER];

// Canonical trimester digit used by PlanETS numeric codes (1..3)
export const TRIMESTER_DIGIT: Record<TrimesterKey, '1' | '2' | '3'> = {
    [TRIMESTER.WINTER]: '1',
    [TRIMESTER.SUMMER]: '2',
    [TRIMESTER.AUTUMN]: '3',
};

export type TermBuildInput = { trimester: TrimesterKey; year: number };

export type TrimesterDates = Record<TrimesterKey, { start: Date; end: Date; weeks: number }>;
