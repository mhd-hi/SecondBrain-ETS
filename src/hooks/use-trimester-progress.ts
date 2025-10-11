'use client';

import type { CourseProgressBar, StatsProgressBar, TrimesterProgressBar } from '@/types/trimester-progressbar';
import { useMemo } from 'react';

import { useCoursesContext } from '@/contexts/use-courses';
import { getCurrentTrimesterInfo } from '@/lib/utils/trimester-util';
import { StatusTask } from '@/types/status-task';

export function useTrimesterProgress(): StatsProgressBar | null {
    const { courses, isLoading } = useCoursesContext();

    return useMemo(() => {
        if (isLoading || !courses) {
            return null;
        }

        // Calculate current session info dynamically
        const currentDate = new Date();
        const { totalWeeks, weekOfTrimester } = getCurrentTrimesterInfo();

        // Calculate course progress
        const courseProgresses: CourseProgressBar[] = courses.map((course) => {
            const tasks = course.tasks || [];
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.status === StatusTask.COMPLETED).length;
            const inProgressTasks = tasks.filter(task => task.status === StatusTask.IN_PROGRESS).length;
            const todoTasks = tasks.filter(task => task.status === StatusTask.TODO).length;

            // Tasks due within the next week
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            const dueTasksCount = tasks.filter(task =>
                task.status !== StatusTask.COMPLETED
                && new Date(task.dueDate) <= nextWeek,
            ).length;

            const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return {
                courseId: course.id,
                courseName: course.name,
                courseCode: course.code,
                color: course.color,
                totalTasks,
                completedTasks,
                inProgressTasks,
                todoTasks,
                completionPercentage,
                dueTasksCount,
            };
        });

        // Calculate trimester progress based on completion percentages
        const totalCourses = courses.length;
        const completedCourses = courseProgresses.filter(cp => cp.completionPercentage === 100).length;
        const inProgressCourses = courseProgresses.filter(cp => cp.completionPercentage > 0 && cp.completionPercentage < 100).length;
        const todoCourses = courseProgresses.filter(cp => cp.completionPercentage === 0).length;
        const completionPercentage = totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;

        const trimesterProgress: TrimesterProgressBar = {
            totalCourses,
            completedCourses,
            inProgressCourses,
            todoCourses,
            completionPercentage,
        };

        return {
            trimester: trimesterProgress,
            courses: courseProgresses,
            currentSession: {
                date: currentDate,
                sessionIndicator: `Week ${weekOfTrimester} of ${totalWeeks}`,
                weekOfTrimester,
                totalWeeks,
            },
        };
    }, [courses, isLoading]);
}
