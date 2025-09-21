export type TermId = string; // PlanETS numeric term code, e.g. '20252'

export type TermLabel = string; // Localized label, e.g. 'Automne 2025'

export type Term = {
    id: TermId;
    label: TermLabel;
};

// Trimester keys (used across the app)
export const TRIMESTER = {
    AUTUMN: 'autumn',
    SUMMER: 'summer',
    WINTER: 'winter',
} as const;

export type TrimesterKey = (typeof TRIMESTER)[keyof typeof TRIMESTER];

// Canonical trimester letters used by PlanETS numeric codes
export const TRIMESTER_LETTER: Record<TrimesterKey, 'A' | 'E' | 'H'> = {
    [TRIMESTER.AUTUMN]: 'A',
    [TRIMESTER.SUMMER]: 'E',
    [TRIMESTER.WINTER]: 'H',
};

// Canonical trimester digit used by PlanETS numeric codes (1..3)
export const TRIMESTER_DIGIT: Record<TrimesterKey, '1' | '2' | '3'> = {
    [TRIMESTER.WINTER]: '1',
    [TRIMESTER.SUMMER]: '2',
    [TRIMESTER.AUTUMN]: '3',
};

// Localized labels for trimesters (fr)
export const TRIMESTER_LABEL: Record<TrimesterKey, string> = {
    [TRIMESTER.WINTER]: 'Hiver',
    [TRIMESTER.SUMMER]: 'Été',
    [TRIMESTER.AUTUMN]: 'Automne',
};

export type TermBuildInput = { trimester: TrimesterKey; year: number };
