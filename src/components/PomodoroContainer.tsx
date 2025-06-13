'use client';

import React from 'react';
import { usePomodoro } from '../contexts/pomodoro-context'; // Corrected import path
import { Button } from '@/components/ui/button'; // Assuming Button component is available

// PREFFERED_POMODORO_DURATION is handled by the context, so no need to define it here.

export const PomodoroContainer = () => {
  // Use the pomodoro context to get the startPomodoro function
  const { startPomodoro, isTimerVisible } = usePomodoro();

  const handleStartPomodoro = () => {
    // Call startPomodoro with null for the task and let the context handle default duration
    // The context's startPomodoro will set its internal duration state,
    // which then becomes initialDurationMinutes for the usePomodoroTimer hook.
    startPomodoro(null);
  };

  // Do not show the button if the timer is already visible
  if (isTimerVisible) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Button
        onClick={handleStartPomodoro}
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
        aria-label="Start a new Pomodoro session"
      >
        Start Pomodoro Session
      </Button>
      <p className="mt-2 text-sm text-muted-foreground">
        Click to start a default 25-minute focus session.
      </p>
    </div>
  );
};
