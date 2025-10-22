import type { TEvent } from '@/calendar/types';
import type { StudyBlock } from '@/types/study-block';
import type { Task } from '@/types/task';
import { getStatusBgClass } from '@/lib/utils';
import { getDaypartTimes } from '@/lib/utils/daypart';

/**
 * Converts a StudyBlock to an TEvent for calendar display
 */
export function studyBlockToEvent(studyBlock: StudyBlock): TEvent {
    // Create description from study block items - every study block item now has a course
    const courseCodes = studyBlock.studyBlockItems?.map(item => item.course.code).filter(Boolean).join(', ') || '';
    const description = courseCodes ? `Courses: ${courseCodes}` : undefined;

    // Use the color from the first course
    const color = studyBlock.studyBlockItems?.[0]?.course.color;

    // Use daypart times based on the study block's date and daypart
    const date = new Date(studyBlock.startAt);
    date.setHours(0, 0, 0, 0); // Reset time to start of day
    const { startDate, endDate } = getDaypartTimes(date, studyBlock.daypart);

    return {
        id: studyBlock.id,
        startDate,
        endDate,
        title: `${courseCodes} - ${studyBlock.daypart}`,
        description,
        color: color ?? 'blue',
        type: 'studyBlock',
    };
}

/**
 * Converts a Task to an TEvent for calendar display
 */
export function taskToEvent(task: Task): TEvent {
    // Use course daypart for timing - every task now has a course
    let startDate: string;
    let endDate: string;

    if (task.course.daypart) {
        // Use daypart timing based on the due date
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0); // Reset time to start of day
        const daypartTimes = getDaypartTimes(dueDate, task.course.daypart);
        startDate = daypartTimes.startDate;
        endDate = daypartTimes.endDate;
    } else {
        // Fallback to all-day event if course exists but no daypart
        const dueDate = task.dueDate.toISOString().split('T')[0]; // Get date part only
        startDate = `${dueDate}T00:00:00.000Z`;
        endDate = `${dueDate}T23:59:59.999Z`;
    }

    return {
        id: task.id,
        startDate,
        endDate,
        title: `${task.course.code} - ${task.title}`,
        description: task.notes,
        color: task.course.color,
        secondaryColor: getStatusBgClass(task.status),
        type: 'task',
    };
}
