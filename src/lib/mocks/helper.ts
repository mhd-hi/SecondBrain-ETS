import type { CourseImportResponse } from '@/types/course';
import { MOCK_COURSES } from './openai-data';

export function setMockOpenAI(courseCode: string): CourseImportResponse {
    const course = MOCK_COURSES[courseCode];
    if (!course) {
      throw new Error(`Invalid course code: ${courseCode}`);
    }

    // Transform ParseCourseResponse to CourseImportResponse
    return {
      courseCode: course.courseCode,
      term: course.term,
      tasks: course.tasks.map(task => ({
        ...task,
        subtasks: task.subtasks?.map(subtask => ({
          ...subtask,
          id: crypto.randomUUID(),
          completed: false
        }))
      }))
    };
  } 