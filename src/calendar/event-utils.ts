import type { TEvent } from '@/calendar/types';
import type { StudyBlock } from '@/types/study-block';
import type { Task } from '@/types/task';
import { getDaypartTimes } from '@/lib/utils/daypart';

/**
 * Converts a StudyBlock to an TEvent for calendar display
 */
export function studyBlockToEvent(studyBlock: StudyBlock): TEvent {
    // Create description from study block items
    const courseCodes = studyBlock.studyBlockItems?.map(item => item.course?.code).filter(Boolean).join(', ') || '';
    const description = courseCodes ? `Courses: ${courseCodes}` : undefined;

    // Use the color from the first course, or default to blue
    const color = studyBlock.studyBlockItems?.[0]?.course?.color || 'blue';

    // Use daypart times based on the study block's date and daypart
    const date = new Date(studyBlock.startAt);
    date.setHours(0, 0, 0, 0); // Reset time to start of day
    const { startDate, endDate } = getDaypartTimes(date, studyBlock.daypart);

    return {
        id: studyBlock.id,
        startDate,
        endDate,
        title: `Study Block - ${studyBlock.daypart}`,
        description,
        color: color as TEvent['color'],
        type: 'studyBlock',
    };
}

/**
 * Converts a Task to an TEvent for calendar display
 */
export function taskToEvent(task: Task): TEvent {
    // For tasks, use due date as both start and end (all-day event)
    const dueDate = task.dueDate.toISOString().split('T')[0]; // Get date part only
    const startDate = `${dueDate}T00:00:00.000Z`;
    const endDate = `${dueDate}T23:59:59.999Z`;

    let color: TEvent['color'];
    switch (task.status) {
        case 'COMPLETED':
            color = 'green';
            break;
        case 'IN_PROGRESS':
            color = 'orange';
            break;
        case 'TODO':
        default:
            color = 'yellow';
            break;
    }

    return {
        id: task.id,
        startDate,
        endDate,
        title: task.title,
        description: task.notes || undefined,
        color,
        type: 'task',
    };
}
