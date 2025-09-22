export type Link = 'PlanETS' | 'Moodle' | 'NotebookLM' | 'Spotify' | 'Youtube' | 'custom';

export type LinkItem = {
    id: string;
    url: string;
    title: string;
    type: Link;
    imageUrl?: string | null;
    userId?: string | null;
    courseId?: string | null;
    createdAt: string;
    updatedAt: string;
};
