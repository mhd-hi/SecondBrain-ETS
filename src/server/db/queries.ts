import { db } from '@/server/db';
import { deleteOldCourses } from './schema';

export const cleanupOldCourses = async () => {
  return await db.execute(deleteOldCourses);
};
