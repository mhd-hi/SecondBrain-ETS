'use client';

import { PomodoroContainer } from '@/components/Pomodoro/PomodoroContainer';

export default function PomodoroPage() {
  return (
    <main className="container mx-auto px-8 flex flex-col gap-6 mt-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            🍅 Pomodoro
          </h1>
          <p className="text-muted-foreground mt-2">
            Focus Session with the Pomodoro Technique
          </p>
        </div>
      </div>
      <section className="flex-1">

        <PomodoroContainer />
      </section>
    </main>

  );
}
