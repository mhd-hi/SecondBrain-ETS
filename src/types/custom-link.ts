export const LINK_TYPES = {
    PLANETS: 'PlanETS',
    MOODLE: 'Moodle',
    NOTEBOOK_LM: 'NotebookLM',
    SPOTIFY: 'Spotify',
    YOUTUBE: 'Youtube',
    CUSTOM: 'custom',
} as const;

export type CustomLink = typeof LINK_TYPES[keyof typeof LINK_TYPES];

export type CustomLinkItem = {
    id: string;
    url: string;
    title: string;
    type: CustomLink;
    imageUrl?: string | null;
    userId?: string | null;
    courseId?: string | null;
    createdAt: string;
    updatedAt: string;
};
