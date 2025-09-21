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
};

export type CourseCreateRequest = {
  code: string;
  name: string;
  description: string;
};

export type CourseCreateResponse = {
  id: string;
  code: string;
  name: string;
  description: string;
};
