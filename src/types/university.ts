/**
 * University identifiers and configuration
 */
export const UNIVERSITY = {
    NONE: 'none',
    ETS: 'ets',
} as const;

export type UniversityId = (typeof UNIVERSITY)[keyof typeof UNIVERSITY];

/**
 * Default university selection for the add course form
 * Change this to set a different default university
 */
export const DEFAULT_UNIVERSITY: UniversityId = UNIVERSITY.ETS;

/**
 * University display information
 */
export const UNIVERSITY_INFO: Record<UniversityId, { label: string }> = {
    [UNIVERSITY.NONE]: {
        label: 'None',
    },
    [UNIVERSITY.ETS]: {
        label: 'ÉTS - École de technologie supérieure',
    },
};
