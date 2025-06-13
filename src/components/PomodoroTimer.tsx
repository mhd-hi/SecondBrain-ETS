'use client';

import { Briefcase, Coffee, Pause, Play, Plus, Square } from 'lucide-react';
import { DurationSelector } from '@/components/shared/atoms/DurationSelector';
import { Button } from '@/components/ui/button';
import { SessionType } from '@/hooks/usePomodoroTimer'; // Assuming SessionType is exported from the hook

type PomodoroTimerProps = {
  taskTitle?: string;
  streak: number;
  timeLeftSec: number;
  isRunning: boolean;
  sessionType: SessionType;
  completedPomodoros: number;
  totalTimeSec: number;
  progress: number;
  initialDurationMinutes: number; // Current work session duration from hook, used by DurationSelector
  onPlayPause: () => void;
  onStop: () => void;
  onAddFiveMinutes: () => void;
  onSetWorkSessionDuration: (newDuration: number) => void;
  onSkipBreak: () => void;
};

// Helper function to format time (seconds to MM:SS)
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Helper function for break activities
const getBreakActivities = (type: SessionType) => {
  if (type === 'shortBreak') {
    return [
      '🚶 Take a short walk',
      '🧘 Do some deep breathing',
      '💧 Drink water & hydrate',
      '🤸 Stretch your body',
      '👀 Rest your eyes (look far away)',
    ];
  } else if (type === 'longBreak') {
    return [
      '🌳 Go for a walk outside',
      '💪 Do a quick workout',
      '😴 Take a 20-minute power nap',
      '🧘‍♀️ Meditate or do NSDR',
      '🥙 Have a healthy snack',
      '📞 Call a friend or family',
    ];
  }
  return [];
};

export const PomodoroTimer = ({
  taskTitle,
  streak,
  timeLeftSec,
  isRunning,
  sessionType,
  completedPomodoros,
  totalTimeSec,
  progress,
  initialDurationMinutes,
  onPlayPause,
  onStop,
  onAddFiveMinutes,
  onSetWorkSessionDuration,
  onSkipBreak,
}: PomodoroTimerProps) => {
  const getElapsedMinutes = () => {
    return Math.floor((totalTimeSec - timeLeftSec) / 60);
  };

  const currentSessionTotalMinutes = Math.floor(totalTimeSec / 60);

  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
      {/* Header: Session Type Icon and Title */}
      <div className="mb-6 flex items-center justify-center gap-2 text-xl font-semibold">
        {sessionType === 'work' && <Briefcase className="h-6 w-6 text-blue-500" />}
        {sessionType !== 'work' && <Coffee className="h-6 w-6 text-green-500" />}
        <span>
          {sessionType === 'work' && 'Focus Session'}
          {sessionType === 'shortBreak' && 'Short Break'}
          {sessionType === 'longBreak' && 'Long Break'}
        </span>
      </div>

      <div className="space-y-6">
        {/* Session Type Indicator (e.g., Pomodoro 1) */}
        <div className="text-center">
          <div
            className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
              sessionType === 'work'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}
          >
            {sessionType === 'work' && `Pomodoro ${completedPomodoros + 1}`}
            {sessionType === 'shortBreak' && 'Short Break'}
            {sessionType === 'longBreak' && 'Long Break'}
          </div>
        </div>

        {/* Timer Display or Duration Selector */}
        <div className="text-center">
          <div className="mb-4">
            {sessionType === 'work' &&
            (isRunning || timeLeftSec < totalTimeSec) ? (
              <div className="text-foreground flex h-16 items-center justify-center font-mono text-5xl font-bold">
                {formatTime(timeLeftSec)}
              </div>
            ) : sessionType === 'work' &&
              !isRunning &&
              timeLeftSec === totalTimeSec ? (
              <DurationSelector
                duration={initialDurationMinutes} // Use initialDurationMinutes from props
                onDurationChange={onSetWorkSessionDuration} // Hook's function to update duration
                variant="large"
              />
            ) : sessionType !== 'work' ? (
              <div className="text-foreground flex h-16 items-center justify-center font-mono text-5xl font-bold">
                {formatTime(timeLeftSec)}
              </div>
            ) : null}
          </div>

          {/* Progress bar */}
          <div className="mx-4">
            <div className="bg-muted mb-4 h-2.5 w-full rounded-full">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ease-out
                  ${sessionType === 'work' ? 'bg-blue-500' : 'bg-green-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Task Title - only show during work sessions and when there's a task */}
        {sessionType === 'work' && taskTitle && (
          <div className="text-center">
            <p className="text-foreground text-lg font-medium">{taskTitle}</p>
          </div>
        )}

        {/* Break Activity Suggestions - only show during break sessions */}
        {sessionType !== 'work' && (
          <div className="flex justify-center">
            <div className="bg-muted/50 max-w-xs rounded-lg p-4">
              <h3 className="mb-3 text-center text-sm font-medium text-foreground">
                {sessionType === 'shortBreak'
                  ? '✨ Quick Break Ideas (5 min)'
                  : '🌟 Long Break Ideas (20 min)'}
              </h3>
              <div className="space-y-1">
                {getBreakActivities(sessionType).map((activity) => (
                  <div
                    key={activity}
                    className="text-muted-foreground text-left text-sm"
                  >
                    {activity}
                  </div>
                ))}
              </div>
              <div className="text-muted-foreground mt-3 text-center text-xs italic">
                {sessionType === 'shortBreak'
                  ? 'Avoid screens - give your mind a real break!'
                  : 'Take a deeper reset to recharge for the next cycle'}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button
            onClick={onPlayPause}
            size="lg"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500 text-white shadow-lg transition-transform hover:scale-105 hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-opacity-50"
            aria-label={isRunning ? 'Pause timer' : 'Play timer'}
          >
            {isRunning ? (
              <Pause className="h-7 w-7" />
            ) : (
              <Play className="ml-1 h-7 w-7" />
            )}
          </Button>

          <Button
            onClick={onStop}
            variant="outline"
            size="lg"
            className="h-16 w-16 rounded-full border-2 shadow-md transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
            aria-label="Stop timer and reset current session"
          >
            <Square className="h-6 w-6" />
          </Button>

          <Button
            onClick={onAddFiveMinutes}
            variant="outline"
            size="lg"
            className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-full border-2 shadow-md transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
            title="Add 5 minutes"
            aria-label="Add 5 minutes to current session"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-medium leading-none">5min</span>
          </Button>
        </div>

        {/* Skip Break Button - only show during break sessions */}
        {sessionType !== 'work' && (
          <div className="pt-4 text-center">
            <Button
              onClick={onSkipBreak}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
              aria-label="Skip current break and start work session"
            >
              Skip Break & Start Work
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="text-muted-foreground flex items-center justify-between pt-4 text-sm">
          {streak > 0 ? (
            <div className="flex items-center gap-1">
              <span>
                {'🔥 Streak: '}
                {streak} day{streak !== 1 ? 's' : ''}
              </span>
            </div>
          ) : (
            <div></div> // Empty div to maintain layout if no streak
          )}
          <div>
            {sessionType === 'work' ? (
              <span>
                {getElapsedMinutes()} min of {currentSessionTotalMinutes} min
              </span>
            ) : (
              <span>
                Completed: {completedPomodoros} pomodoro
                {completedPomodoros !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
