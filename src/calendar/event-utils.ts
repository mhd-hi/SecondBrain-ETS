import type { TEvent } from '@/calendar/types';
import type { StudyBlock } from '@/types/study-block';
import type { Task } from '@/types/task';
import { getStatusBgClass } from '@/lib/utils';
import { getDaypartTimes } from '@/lib/utils/daypart';

/**
 * Converts a StudyBlock to an TEvent for calendar display
 */
export function studyBlockToEvent(studyBlock: StudyBlock): TEvent {
    const courseCodes = studyBlock.studyBlockItems?.map(item => item.course.code).filter(Boolean).join(', ') || '';
    const date = new Date(studyBlock.startAt);
    date.setHours(0, 0, 0, 0);
    const { startDate, endDate } = getDaypartTimes(date, studyBlock.daypart);

    return {
        id: studyBlock.id,
        startDate,
        endDate,
        title: `${courseCodes} - ${studyBlock.daypart}`,
        description: courseCodes ? `Courses: ${courseCodes}` : undefined,
        color: studyBlock.studyBlockItems?.[0]?.course.color || 'green',
        type: 'studyBlock',
    };
}

/**
 * Converts a Task to an TEvent for calendar display
 */
export function taskToEvent(task: Task): TEvent {
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0); // Reset time to start of day
    const daypartTimes = getDaypartTimes(dueDate, task.course.daypart);
    const startDate = daypartTimes.startDate;
    const endDate = daypartTimes.endDate;

    return {
        id: task.id,
        startDate,
        endDate,
        title: task.title,
        description: task.notes,
        color: task.course.color,
        secondaryColor: getStatusBgClass(task.status),
        type: 'task',
        courseCode: task.course.code,
    };
}
