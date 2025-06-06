import type { CourseAIResponse } from '@/types/api';
import { TaskStatus } from '@/types/task';
import { MOCK_COURSES } from './openai-data';

export function setMockOpenAI(courseCode: string): CourseAIResponse {
    const course = MOCK_COURSES[courseCode];
    if (!course) {
      throw new Error(`Invalid course code: ${courseCode}`);
    }

    // Transform ParseCourseResponse to CourseAIResponse
    return {
      courseCode: course.courseCode,
      term: course.term,
      tasks: course.tasks.map(task => ({
        ...task,
        subtasks: task.subtasks?.map(subtask => ({
          ...subtask,
          id: crypto.randomUUID(),
          status: TaskStatus.TODO
        }))
      }))
    };
} 