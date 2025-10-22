import type { Course } from './course';

export type Daypart = 'EVEN' | 'AM' | 'PM';

export type StudyBlock = {
    id: string;
    userId: string;
    daypart: Daypart;
    startAt: Date;
    endAt: Date;
    isCompleted: boolean;
    studyBlockItems?: StudyBlockItem[];
    createdAt?: Date;
    updatedAt?: Date;
};

export type StudyBlockItem = {
    id: string;
    studyBlockId: string;
    courseId: string;
    order: number;
    course?: Course;
};
