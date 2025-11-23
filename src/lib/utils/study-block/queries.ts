import type { StudyBlock } from '@/types/study-block';
import { and, eq, gte, inArray, lt } from 'drizzle-orm';
import { db } from '@/server/db';
import { courses, studyBlockItems, studyBlocks } from '@/server/db/schema';

export const getStudyBlocksForDateRange = async (startDate: Date, endDate: Date, userId: string): Promise<StudyBlock[]> => {
  try {
    if (!userId) {
      throw new Error('User authentication required');
    }

    // First get all study blocks in the date range
    const studyBlocksResult = await db
      .select()
      .from(studyBlocks)
      .where(and(
        gte(studyBlocks.startAt, startDate),
        lt(studyBlocks.startAt, endDate),
        eq(studyBlocks.userId, userId),
      ));

    if (studyBlocksResult.length === 0) {
      return [];
    }

    const studyBlockIds = studyBlocksResult.map(sb => sb.id);

    // Then get all study block items with their courses
    const itemsResult = await db
      .select({
        item: studyBlockItems,
        course: courses,
      })
      .from(studyBlockItems)
      .where(inArray(studyBlockItems.studyBlockId, studyBlockIds))
      .leftJoin(courses, eq(studyBlockItems.courseId, courses.id));

    // Group items by study block ID
    const itemsByBlockId = new Map<string, StudyBlock['studyBlockItems']>();
    for (const row of itemsResult) {
      const blockId = row.item.studyBlockId;
      if (!itemsByBlockId.has(blockId)) {
        itemsByBlockId.set(blockId, []);
      }
      if (row.course) {
        itemsByBlockId.get(blockId)!.push({
          id: row.item.id,
          studyBlockId: row.item.studyBlockId,
          courseId: row.item.courseId,
          order: row.item.order,
          course: {
            id: row.course.id,
            name: row.course.name,
            code: row.course.code,
            daypart: row.course.daypart,
            color: row.course.color,
            createdAt: row.course.createdAt,
            updatedAt: row.course.updatedAt,
          },
        });
      }
    }

    // Combine study blocks with their items
    return studyBlocksResult.map(sb => ({
      id: sb.id,
      userId: sb.userId,
      daypart: sb.daypart as StudyBlock['daypart'],
      startAt: sb.startAt,
      endAt: sb.endAt,
      isCompleted: sb.isCompleted,
      studyBlockItems: itemsByBlockId.get(sb.id) || [],
    }));
  } catch (error) {
    console.error('Error fetching study blocks for date range:', error);
    throw new Error('Failed to fetch study blocks for date range');
  }
};
