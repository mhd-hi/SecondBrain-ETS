'use client';

import type { PomodoroType } from '@/types/pomodoro';
import { Pause, Play, Plus, Square } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePomodoro } from '@/contexts/use-pomodoro';
import { fetchPomodoroStreak } from '@/hooks/use-pomodoro';
import { StreakBadge } from '../shared/atoms/StreakBadge';
import { DurationSelector } from './DurationSelector';

export function PomodoroContainer() {
  const {
    isRunning,
    timeLeftSec,
    totalTimeSec,
    pomodoroType,
    currentTask,
    currentDuration,
    isPomodoroActive,
    toggleTimer,
    stopPomodoro,
    addFiveMinutes,
    switchToPomodoroType,
    updateDuration,
  } = usePomodoro();

  const [streak, setStreak] = useState<number | null>(null);
  const _streakCalledRef = useRef(false);
  if (!_streakCalledRef.current) {
    _streakCalledRef.current = true;
      (async () => {
          const streakDays = await fetchPomodoroStreak();
          setStreak(streakDays);
      })();
  }

  const getProgress = () => {
    return ((totalTimeSec - timeLeftSec) / totalTimeSec) * 100;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show duration selector when not running and at the start of any pomodoro session
  const showDurationSelector = !isRunning && timeLeftSec === totalTimeSec;

  const handlePlayClick = () => {
    // If pomodoro session is not active, we need to start it first
    if (!isPomodoroActive) {
      // This will activate the pomodoro session with current duration
      switchToPomodoroType(pomodoroType);
    }
    toggleTimer();
  };

  const handleAddFiveMinutes = () => {
    // If timer is not running and we're at the start of a pomodoro session, add to duration selector
    if (!isRunning && timeLeftSec === totalTimeSec && pomodoroType === 'work') {
      const newDuration = currentDuration + 5;
      updateDuration(newDuration);
    } else {
      // Otherwise, add to the running timer
      addFiveMinutes();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Main Pomodoro Session Card */}
      <Card className="border-2">

        <CardContent className="space-y-6 mt-7">
          {/* Task Display */}
          {currentTask && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground">Working on:</p>
              <p className="text-lg font-medium">{currentTask.title}</p>
            </div>
          )}

          {/* Pomodoro Type Tabs */}
          <div className="flex justify-center">
            <Tabs value={pomodoroType} onValueChange={value => switchToPomodoroType(value as PomodoroType)}>
              <TabsList className="relative grid w-fit grid-cols-3 h-10 bg-muted/50 p-1 rounded-xl">
                {/* Sliding background indicator */}
                <div
                  className="absolute top-1 bottom-1 bg-background text-foreground rounded-lg shadow-sm transition-all duration-300 ease-out border"
                  style={{
                    left: `${pomodoroType === 'work' ? '4px' : pomodoroType === 'shortBreak' ? 'calc(33.333% + 1px)' : 'calc(66.666% - 2px)'}`,
                    width: 'calc(33.333% - 2px)',
                  }}
                />
                <TabsTrigger
                  value="work"
                  className="relative z-10 h-8 px-3 text-sm font-medium rounded-lg border-0 bg-transparent data-[state=active]:!bg-transparent data-[state=active]:!text-foreground data-[state=active]:shadow-none transition-colors duration-200"
                >
                  Pomodoro
                </TabsTrigger>
                <TabsTrigger
                  value="shortBreak"
                  className="relative z-10 h-8 px-3 text-sm font-medium rounded-lg border-0 bg-transparent data-[state=active]:!bg-transparent data-[state=active]:!text-foreground data-[state=active]:shadow-none transition-colors duration-200"
                >
                  Short Break
                </TabsTrigger>
                <TabsTrigger
                  value="longBreak"
                  className="relative z-10 h-8 px-3 text-sm font-medium rounded-lg border-0 bg-transparent data-[state=active]:!bg-transparent data-[state=active]:!text-foreground data-[state=active]:shadow-none transition-colors duration-200"
                >
                  Long Break
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Timer Display */}
          <div className="text-center space-y-4">
            {showDurationSelector
              ? (
                <DurationSelector
                  duration={currentDuration}
                  onDurationChange={updateDuration}
                />
              )
              : (
                <div className="text-foreground flex h-16 items-center justify-center font-mono text-6xl font-bold">
                  {formatTime(timeLeftSec)}
                </div>
              )}

            {/* Progress bar */}
            <div className="mx-8 sm:mx-12 md:mx-16 lg:mx-20">
              <div className="bg-muted mb-4 h-1.5 w-full rounded-full">
                <div
                  className={`h-1.5 rounded-full transition-all duration-1000 
                    ${pomodoroType === 'work' ? 'bg-blue-500' : 'bg-green-500'}`}
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
            </div>
          </div>

          {/* Session Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handlePlayClick}
                variant="outline"
                size="lg"
                className="pomodoro-button flex h-16 w-16 items-center justify-center rounded-full shadow-md"
              >
                {isRunning ? <Pause className="h-6 w-6" /> : <Play className="ml-1 h-6 w-6" />}
              </Button>

              <Button
                onClick={stopPomodoro}
                variant="outline"
                size="lg"
                className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg"
              >
                <Square className="h-6 w-6" />
              </Button>

              <Button
                onClick={handleAddFiveMinutes}
                variant="outline"
                size="lg"
                className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg"
                title="Add 5 minutes"
              >
                <div className="flex flex-col items-center gap-1">
                  <Plus className="h-4 w-4" />
                  <span className="text-xs leading-none">5min</span>
                </div>
              </Button>
            </div>
          </div>

          <StreakBadge streak={streak ?? 0} />
        </CardContent>
      </Card>

    </div>
  );
}
