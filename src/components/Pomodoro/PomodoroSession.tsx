'use client';

import { Pause, Play, Plus, Square } from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePomodoro } from '@/contexts/use-pomodoro';
import { getBreakActivities } from '@/lib/pomodoro/util';
import { DurationSelector } from './DurationSelector';

export function PomodoroSession() {
  const {
    isRunning,
    timeLeftSec,
    totalTimeSec,
    pomodoroType,
    currentTask,
    streak,
    currentDuration,
    isPomodoroActive,
    toggleTimer,
    stopPomodoro,
    addFiveMinutes,
    switchToPomodoroType,
    updateDuration,
  } = usePomodoro();

  const getProgress = () => {
    return ((totalTimeSec - timeLeftSec) / totalTimeSec) * 100;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show duration selector when not running and at the start of any session
  const showDurationSelector = !isRunning && timeLeftSec === totalTimeSec;

  const handlePlayClick = () => {
    // If session is not active, we need to start it first
    if (!isPomodoroActive) {
      // This will activate the session with current duration
      switchToPomodoroType(pomodoroType);
    }
    toggleTimer();
  };

  const handleAddFiveMinutes = () => {
    // If timer is not running and we're at the start of a session, add to duration selector
    if (!isRunning && timeLeftSec === totalTimeSec && pomodoroType === 'work') {
      const newDuration = currentDuration + 5;
      updateDuration(newDuration);
    } else {
      // Otherwise, add to the running timer
      addFiveMinutes();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {streak > 0 && (
          <Badge variant="secondary" className="text-sm">
            🔥
            {' '}
            {streak}
            {' '}
            day streak
          </Badge>
        )}
      </div>

      {/* Main Session Card */}
      <Card className="border-2">

        <CardContent className="space-y-6 mt-7">
          {/* Task Display */}
          {currentTask && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Working on:</p>
              <p className="text-lg font-medium">{currentTask.title}</p>
            </div>
          )}

          {/* Session Type Buttons */}
          <div className="flex justify-center">
            <div className="flex gap-2">
              <Button
                variant={pomodoroType === 'work' ? 'default' : 'outline'}
                onClick={() => switchToPomodoroType('work')}
                className="px-4 py-2"
              >
                Pomodoro
              </Button>
              <Button
                variant={pomodoroType === 'shortBreak' ? 'default' : 'outline'}
                onClick={() => switchToPomodoroType('shortBreak')}
                className="px-4 py-2"
              >
                Short Break
              </Button>
              <Button
                variant={pomodoroType === 'longBreak' ? 'default' : 'outline'}
                onClick={() => switchToPomodoroType('longBreak')}
                className="px-4 py-2"
              >
                Long Break
              </Button>
            </div>
          </div>

          {/* Timer Display */}
          <div className="text-center space-y-4">
            {showDurationSelector
              ? (
                <DurationSelector
                  duration={currentDuration}
                  onDurationChange={updateDuration}
                  variant="large"
                />
              )
              : (
                <div className="text-foreground flex h-16 items-center justify-center font-mono text-6xl font-bold">
                  {formatTime(timeLeftSec)}
                </div>
              )}

            {/* Progress bar */}
            <div className="mx-4">
              <div className="bg-muted mb-4 h-2 w-full rounded-full">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 
                    ${pomodoroType === 'work' ? 'bg-blue-500' : 'bg-green-500'}`}
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
            </div>
          </div>

          {/* Break Activity Suggestions */}
          {pomodoroType !== 'work' && (
            <div className="flex justify-center">
              <div className="bg-muted/50 max-w-xs rounded-lg p-4">
                <h3 className="mb-3 text-center text-sm font-medium">
                  {pomodoroType === 'shortBreak'
                    ? '✨ Quick Break Ideas'
                    : '🌟 Long Break Ideas'}
                </h3>
                <div className="space-y-1">
                  {getBreakActivities(pomodoroType).map(activity => (
                    <div key={activity} className="text-muted-foreground text-left text-sm">
                      {activity}
                    </div>
                  ))}
                </div>
                <div className="text-muted-foreground mt-3 text-center text-xs italic">
                  {pomodoroType === 'shortBreak'
                    ? 'Avoid screens - give your mind a real break!'
                    : 'Take a deeper reset to recharge for the next cycle'}
                </div>
              </div>
            </div>
          )}

          {/* Session Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handlePlayClick}
                size="lg"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500 text-white shadow-lg hover:bg-violet-600"
              >
                {isRunning ? <Pause className="h-6 w-6" /> : <Play className="ml-1 h-6 w-6" />}
              </Button>

              <Button
                onClick={stopPomodoro}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
