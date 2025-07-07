import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withAuthSimple } from '@/lib/auth/api';
import { db } from '@/server/db';
import { users } from '@/server/db/schema';

export const GET = withAuthSimple(
  async (_, user) => {
    try {
      // Get user's streak information
      const result = await db
        .select({
          streakDays: users.streakDays,
          lastCompletedPomodoroDate: users.lastCompletedPomodoroDate,
        })
        .from(users)
        .where(eq(users.id, user.id))
        .limit(1);

      if (!result.length) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 },
        );
      }

      const userData = result[0];
      if (!userData) {
        return NextResponse.json(
          { error: 'User data not found' },
          { status: 404 },
        );
      }

      return NextResponse.json({
        streakDays: userData.streakDays ?? 0,
        lastCompletedPomodoroDate: userData.lastCompletedPomodoroDate,
      });
    } catch (error) {
      console.error('Failed to fetch user streak:', error);
      return NextResponse.json(
        { error: 'Failed to fetch streak information' },
        { status: 500 },
      );
    }
  },
);
