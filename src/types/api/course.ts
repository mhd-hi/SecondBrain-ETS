import type { Course } from '@/types/course';
import type { Task, TaskType } from '@/types/task';
import type { TaskStatus } from '@/types/task-status';

export type CourseApiResponse = {
    id: string;
    code: string;
    name: string;
    color: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    tasks: Array<{
        id: string;
        title: string;
        notes?: string;
        dueDate?: string;
        week: number;
        type: TaskType;
        status: TaskStatus;
        estimatedEffort: number;
        actualEffort: number;
        courseId: string;
        createdAt: string;
        updatedAt: string;
    }>;
};

export type CourseResponse = {
    data: Course;
    error?: string;
};

export type TaskResponse = {
    data: Task;
    error?: string;
};

export type TasksResponse = {
    data: Task[];
    error?: string;
};

// Error Types
export type ApiError = {
    error: string;
};

export type CourseListItem = {
    id: string;
    code: string;
    overdueCount: number;
};
