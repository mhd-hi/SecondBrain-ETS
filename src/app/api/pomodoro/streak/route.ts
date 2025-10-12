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

      // Calculate actual streak based on completion dates
      let actualStreakDays = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (userData.lastCompletedPomodoroDate) {
        const lastCompletedDate = new Date(userData.lastCompletedPomodoroDate);
        lastCompletedDate.setHours(0, 0, 0, 0);

        const timeDiff = today.getTime() - lastCompletedDate.getTime();
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) {
          // Completed today - use stored streak
          actualStreakDays = userData.streakDays ?? 1;
        } else if (daysDiff === 1) {
          // Last completed yesterday - streak is broken for today
          // Show current streak minus 1 (since today isn't completed)
          actualStreakDays = Math.max(0, (userData.streakDays ?? 1) - 1);
        } else {
          // More than 1 day gap - streak is broken
          actualStreakDays = 0;
        }
      } else {
        // Never completed a pomodoro
        actualStreakDays = 0;
      }

      return NextResponse.json({
        streakDays: actualStreakDays,
        lastCompletedPomodoroDate: userData.lastCompletedPomodoroDate,
      });
    } catch (error) {
      console.error('Failed to fetch user streak:', { error, userId: user?.id, endpoint: '/api/pomodoro/streak' });
      return NextResponse.json(
        { error: 'Failed to fetch streak information' },
        { status: 500 },
      );
    }
  },
);
