import type { TCourseColor } from './colors';
import type { CustomLinkItem } from './custom-link';
import type { Task } from './task';

export type Daypart = 'EVEN' | 'AM' | 'PM';

export type Course = {
  id: string;
  code: string;
  name: string;
  daypart: Daypart;
  color: TCourseColor;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  tasks?: Task[];
  customLinks?: CustomLinkItem[];
};

export type CourseCreateRequest = {
  code: string;
  name: string;
  description: string;
  daypart: Daypart;
};
