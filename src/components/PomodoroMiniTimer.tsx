'use client';

import { Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePomodoro } from '@/contexts/use-pomodoro';

export const PomodoroMiniTimer = () => {
  const {
    isSessionActive,
    isRunning,
    timeLeftSec,
    sessionType,
    toggleTimer,
    openDialog,
  } = usePomodoro();

  // Don't show if no active session
  if (!isSessionActive) {
    return null;
  }

  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const getBackgroundColor = () => {
    if (sessionType === 'work') {
      return 'bg-violet-500 hover:bg-violet-600';
    }
    return 'bg-green-500 hover:bg-green-600';
  };

  const getSessionEmoji = () => {
    if (sessionType === 'work') {
      return '💼';
    }
    if (sessionType === 'shortBreak') {
      return '☕';
    }
    return '🌙';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDialog();
    }
  };

  return (
    <div className="fixed top-20 right-6 z-40">
      <div
        className={`
        flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl 
        ${getBackgroundColor()} text-white cursor-pointer
        transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50
        border border-white/20
      `}
        onClick={openDialog}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Open pomodoro timer dialog"
      >
        <span className="text-lg font-mono font-bold">
          {timeDisplay}
        </span>
        <span className="text-lg">
          {getSessionEmoji()}
        </span>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            toggleTimer();
          }}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-white/20 text-white"
        >
          {isRunning
            ? (
              <Pause className="h-4 w-4" />
            )
            : (
              <Play className="h-4 w-4 ml-0.5" />
            )}
        </Button>
      </div>
    </div>
  );
};
