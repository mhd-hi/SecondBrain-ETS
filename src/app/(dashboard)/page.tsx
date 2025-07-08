'use client';

import { CoursesTile } from '@/components/Boards/Course/CoursesTile';
import { PomodoroTile } from '@/components/Boards/DeepWork/PomodoroTile';
import { TodaysFocusTile } from '@/components/Boards/TodaysFocus/TodaysFocusTile';

export default function Home() {
  return (
    <main className="container mx-auto px-8 flex min-h-screen flex-col gap-6 mt-2 mb-3.5">
      <h1 className="text-3xl font-bold text-foreground">
        🎯 Dashboard
      </h1>

      <section className="space-y-6">
        <CoursesTile />
      </section>
      <section>
        <div className="flex gap-6">
          <div className="flex-1 w-2/3">
            <TodaysFocusTile />
          </div>
          <div className="w-1/3">
            <PomodoroTile />
          </div>
        </div>
      </section>
    </main>
  );
}
