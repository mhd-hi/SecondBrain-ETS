import type { TCourseColor } from './colors';
import type { Task } from './task';

export type Daypart = 'EVEN' | 'AM' | 'PM';

export type Course = {
  id: string;
  code: string;
  name: string;
  daypart: Daypart;
  color: TCourseColor;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  tasks?: Task[];
};

export type CourseCreateRequest = {
  code: string;
  name: string;
  description: string;
  daypart: Daypart;
};
