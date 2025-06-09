import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { sql } from 'drizzle-orm';
import { generateRandomCourseColor } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    // Basic API key authentication for admin operations
    const authHeader = request.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized - Admin access required",
          code: "ADMIN_UNAUTHORIZED"
        },
        { status: 401 }
      );
    }
    // First, try to add the color column if it doesn't exist
    try {
      await db.execute(sql`ALTER TABLE courses ADD COLUMN color text`);
      console.log('Color column added successfully');
    } catch (error) {
      // Column might already exist, that's okay
      console.log('Color column may already exist:', error);
    }

    // Get all courses that don't have a color assigned
    const coursesWithoutColors = await db.execute(
      sql`SELECT id FROM courses WHERE color IS NULL`
    );

    console.log(`Found ${coursesWithoutColors.length} courses without colors`);

    // Update each course with a random color
    for (const course of coursesWithoutColors) {
      const randomColor = generateRandomCourseColor();
      await db.execute(
        sql`UPDATE courses SET color = ${randomColor} WHERE id = ${course.id}`
      );
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${coursesWithoutColors.length} courses with random colors`,
      coursesUpdated: coursesWithoutColors.length
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
