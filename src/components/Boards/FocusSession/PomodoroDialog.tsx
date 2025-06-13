'use client';

import { Briefcase, Coffee, Pause, Play, Plus, Square } from 'lucide-react';
import { DurationSelector } from '@/components/shared/atoms/DurationSelector';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { usePomodoro } from '@/contexts/use-pomodoro';

type PomodoroDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  taskTitle: string;
  streak: number;
  duration: number; // Duration in minutes
  setDuration: (duration: number) => void;
  onComplete: (durationHours: number) => void;
};

export const PomodoroDialog = ({
  isOpen,
  onClose,
  taskTitle,
  streak,
  duration,
  setDuration,
  onComplete,
}: PomodoroDialogProps) => {
  const {
    isRunning,
    timeLeftSec,
    totalTimeSec,
    sessionType,
    completedPomodoros,
    toggleTimer,
    stopSession,
    addFiveMinutes,
    switchToNextSession,
  } = usePomodoro();

  const handlePlayPause = () => {
    toggleTimer();
  };

  const handleStop = () => {
    stopSession();
  };

  const handleComplete = () => {
    if (sessionType === 'work') {
      const completedMinutes = (totalTimeSec - timeLeftSec) / 60;
      const durationHours = completedMinutes / 60;
      onComplete(durationHours);
      onClose();
    }
  };

  const handleAddFiveMinutes = () => {
    addFiveMinutes();
  };

  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    // Note: Duration changes are handled by the context when not running
  };

  const getElapsedMinutes = () => {
    return Math.floor((totalTimeSec - timeLeftSec) / 60);
  };

  const getProgress = () => {
    return ((totalTimeSec - timeLeftSec) / totalTimeSec) * 100;
  };

  // Break activity suggestions
  const getBreakActivities = (type: string) => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {sessionType === 'work' && <Briefcase className="h-5 w-5" />}
            {sessionType !== 'work' && <Coffee className="h-5 w-5" />}
            {sessionType === 'work' && 'Focus Session'}
            {sessionType === 'shortBreak' && 'Short Break'}
            {sessionType === 'longBreak' && 'Long Break'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Session Type Indicator */}
          <div className="text-center">
            <div
              className={`inline-block rounded-full px-3 py-1 text-sm ${sessionType === 'work'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}
            >
              {sessionType === 'work' && `Pomodoro ${completedPomodoros + 1}`}
              {sessionType === 'shortBreak' && 'Short Break'}
              {sessionType === 'longBreak' && 'Long Break'}
            </div>
          </div>
          <div className="text-center">
            <div className="mb-4">
              {sessionType === 'work'
                && (isRunning || timeLeftSec < totalTimeSec)
                ? (
                  <div className="text-foreground flex h-16 items-center justify-center font-mono text-4xl font-bold">
                    {Math.floor(timeLeftSec / 60)
                      .toString()
                      .padStart(2, '0')}
                    :
                    {(timeLeftSec % 60).toString().padStart(2, '0')}
                  </div>
                )
                : sessionType === 'work'
                  && !isRunning
                  && timeLeftSec === totalTimeSec
                  ? (
                    <DurationSelector
                      duration={duration}
                      onDurationChange={handleDurationChange}
                      variant="large"
                    />
                  )
                  : sessionType !== 'work'
                    ? (
                      <div className="text-foreground flex h-16 items-center justify-center font-mono text-4xl font-bold">
                        {Math.floor(timeLeftSec / 60)
                          .toString()
                          .padStart(2, '0')}
                        :
                        {(timeLeftSec % 60).toString().padStart(2, '0')}
                      </div>
                    )
                    : null}
            </div>

            {/* Progress bar */}
            <div className="mx-4">
              <div className="bg-muted mb-4 h-2 w-full rounded-full">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 
                    ${sessionType === 'work' ? 'bg-blue-500' : 'bg-green-500'}`}
                  style={{ width: `${getProgress()}%` }}
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
                <h3 className="mb-3 text-center text-sm font-medium">
                  {sessionType === 'shortBreak'
                    ? '✨ Quick Break Ideas (5 min)'
                    : '🌟 Long Break Ideas (20 min)'}
                </h3>
                <div className="space-y-1">
                  {getBreakActivities(sessionType).map(activity => (
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
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={handlePlayPause}
              size="lg"
              className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500 text-white shadow-lg hover:bg-violet-600"
            >
              {isRunning
                ? (
                  <Pause className="h-6 w-6" />
                )
                : (
                  <Play className="ml-1 h-6 w-6" />
                )}
            </Button>

            <Button
              onClick={handleStop}
              variant="outline"
              size="lg"
              className="h-16 w-16 rounded-full shadow-md"
            >
              <Square className="h-6 w-6" />
            </Button>

            <Button
              onClick={handleAddFiveMinutes}
              variant="outline"
              size="lg"
              className="flex h-16 w-16 flex-col gap-1 rounded-full shadow-md"
              title="Add 5 minutes"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs leading-none">5min</span>
            </Button>
          </div>

          {/* Skip Break Button - only show during break sessions */}
          {sessionType !== 'work' && (
            <div className="text-center">
              <Button
                onClick={switchToNextSession}
                variant="outline"
                className="w-full"
              >
                Skip Break & Start Work
              </Button>
            </div>
          )}
          {/* Stats */}
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            {streak > 0
              ? (
                <div className="flex items-center gap-1">
                  <span>
                    {'🔥Streak: '}
                    {' '}
                    {streak}
                    {' '}
                    day
                    {streak !== 1 ? 's' : ''}
                  </span>
                </div>
              )
              : (
                <div></div>
              )}
            <div>
              {sessionType === 'work'
                ? (
                  <span>
                    {getElapsedMinutes()}
                    {'  min of '}
                    {Math.floor(totalTimeSec / 60)}
                    {' '}
                    min
                  </span>
                )
                : (
                  <span>
                    {'Completed: '}
                    {completedPomodoros}
                    {' '}
                    pomodoro
                    {completedPomodoros !== 1 ? 's' : ''}
                  </span>
                )}
            </div>
          </div>

          {/* Complete Button - only show for work sessions */}
          {sessionType === 'work' && getElapsedMinutes() > 0 && (
            <div className="text-center">
              <Button
                onClick={handleComplete}
                variant="default"
                className="w-full"
              >
                Complete Session (
                {getElapsedMinutes()}
                {' '}
                min)
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
