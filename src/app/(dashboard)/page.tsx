'use client';

import { CourseListTile } from '@/components/Boards/Course/CourseListTile';
import { TodaysFocusTile } from '@/components/Boards/Task/TasksTile';

export default function Home() {
  return (
    <main className="container mx-auto px-8 flex min-h-screen flex-col gap-6 mt-2 mb-3.5">
      <h1 className="text-3xl font-bold text-foreground">
        🎯 Dashboard
      </h1>

      <section className="space-y-6">
        <CourseListTile />
      </section>
      <section>
        <div className="flex gap-6">
          <div className="flex-1">
            <TodaysFocusTile />
          </div>
        </div>
      </section>
    </main>
  );
}
