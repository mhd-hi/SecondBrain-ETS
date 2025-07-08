'use client';

import { WeeklyRoadmap } from '@/components/Boards/WeeklyRoadmap/WeeklyRoadmap';

export default function WeeklyRoadmapPage() {
  return (
    <main className="container mx-auto px-8 flex flex-col gap-6 mt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            🗺️ Weekly Roadmap
          </h1>
          <p className="text-muted-foreground mt-2">
            Plan and organize your tasks across the week with drag-and-drop functionality.
          </p>
        </div>
      </div>

      <section className="flex-1">
        <WeeklyRoadmap />
      </section>
    </main>
  );
}
