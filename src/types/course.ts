import type { CustomLinkItem } from './custom-link';
import type { Task } from './task';

export type Course = {
  id: string;
  code: string;
  name: string;
  color: string;
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
};
