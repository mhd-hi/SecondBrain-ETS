export type ProgressMetrics = {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    completionPercentage: number;
};

export type TrimesterProgressBar = {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    todoCourses: number;
    completionPercentage: number;
};

export type CourseProgressBar = {
    courseId: string;
    courseName: string;
    courseCode: string;
    color: string;
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    completionPercentage: number;
    dueTasksCount: number;
};

export type StatsProgressBar = {
    trimester: TrimesterProgressBar;
    courses: CourseProgressBar[];
    currentSession: {
        date: Date;
        sessionIndicator: string;
        weekOfTrimester: number;
        totalWeeks: number;
    };
};
