'use client';

import { CourseListTile } from '@/components/Boards/Course/CourseListTile';
import { DashboardProgressTile } from '@/components/Boards/Progress/DashboardProgressTile';
import { TodaysFocusTile } from '@/components/Boards/Task/TasksTile';

export default function Home() {
  return (
    <main className="container mx-auto px-8 flex min-h-screen flex-col gap-6 mt-2 mb-3.5">
      <h1 className="text-3xl font-bold text-foreground">
        🎯 Dashboard
      </h1>

      <section>
        <DashboardProgressTile />
      </section>
      <section className="space-y-6">
        <CourseListTile />
      </section>
      <section>
        <TodaysFocusTile />
      </section>
    </main>
  );
}
