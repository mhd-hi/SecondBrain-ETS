"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square, Plus, Coffee, Briefcase } from "lucide-react";

type SessionType = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroDialogProps {
    isOpen: boolean;
    onClose: () => void;
    taskTitle: string;
    streak: number;
    duration: number; // Duration in minutes
    onComplete: (durationHours: number) => void;
}

export const PomodoroDialog = ({
    isOpen,
    onClose,
    taskTitle,
    streak,
    duration,
    onComplete
}: PomodoroDialogProps) => {
    const [timeLeftSec, setTimeLeftSec] = useState(duration * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [totalTimeSec, setTotalTimeSec] = useState(duration * 60);
    const [sessionType, setSessionType] = useState<SessionType>('work');
    const [completedPomodoros, setCompletedPomodoros] = useState(0);
    const breakDurationsMinRef = useRef<NodeJS.Timeout | null>(null);
    const SHORT_BREAK_DURATION = 5;
    const LONG_BREAK_DURATION = 20;
    const POMODOROS_BEFORE_LONG_BREAK = 4;// Play completion sound
    const playCompletionSound = useCallback(() => {
        try {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const audioContext = new AudioContextClass();            // Create a more friendly and gentle sound pattern
            const createBeep = (startTime: number, frequency: number, duration = 0.3) => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
                oscillator.type = 'sine'; // Sine wave is softer than square or sawtooth

                // Gentle volume curve for a softer sound
                gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
                gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + startTime + 0.05); // Lower volume
                gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + startTime + duration * 0.7);
                gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + startTime + duration);

                oscillator.start(audioContext.currentTime + startTime);
                oscillator.stop(audioContext.currentTime + startTime + duration);
            };

            // Friendly ascending melody with lower, warmer frequencies
            createBeep(0, 330, 0.4);    // E4 - warm and friendly
            createBeep(0.25, 392, 0.4); // G4 - pleasant interval
            createBeep(0.5, 523, 0.6);  // C5 - satisfying resolution
        } catch (error) {
            console.warn('Could not play sound:', error);
        }
    }, []);

    // Get session duration in minutes
    const getSessionDuration = useCallback((type: SessionType) => {
        switch (type) {
            case 'work':
                return duration;
            case 'shortBreak':
                return SHORT_BREAK_DURATION;
            case 'longBreak':
                return LONG_BREAK_DURATION;
        }
    }, [duration, SHORT_BREAK_DURATION, LONG_BREAK_DURATION]);

    // Switch to next session type
    const switchToNextSession = useCallback(() => {
        if (sessionType === 'work') {
            const newCompletedPomodoros = completedPomodoros + 1;
            setCompletedPomodoros(newCompletedPomodoros);

            // After 4 pomodoros, take a long break
            const nextSessionType = newCompletedPomodoros % POMODOROS_BEFORE_LONG_BREAK === 0
                ? 'longBreak'
                : 'shortBreak';

            setSessionType(nextSessionType);
            const newDuration = getSessionDuration(nextSessionType) * 60;
            setTimeLeftSec(newDuration);
            setTotalTimeSec(newDuration);
        } else {
            // Break ended, back to work
            setSessionType('work');
            const newDuration = duration * 60;
            setTimeLeftSec(newDuration);
            setTotalTimeSec(newDuration);
        }
        setIsRunning(false);
    }, [sessionType, completedPomodoros, POMODOROS_BEFORE_LONG_BREAK, getSessionDuration, duration]);// Reset timer when dialog opens or duration changes
    useEffect(() => {
        if (isOpen) {
            const durationInSeconds = duration * 60;
            setTimeLeftSec(durationInSeconds);
            setTotalTimeSec(durationInSeconds);
            setIsRunning(false);
            setSessionType('work');
            setCompletedPomodoros(0);
        }
    }, [isOpen, duration]);// Timer logic
    useEffect(() => {
        if (isRunning && timeLeftSec > 0) {
            breakDurationsMinRef.current = setInterval(() => {
                setTimeLeftSec((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (breakDurationsMinRef.current) {
                clearInterval(breakDurationsMinRef.current);
                breakDurationsMinRef.current = null;
            }
        }

        return () => {
            if (breakDurationsMinRef.current) {
                clearInterval(breakDurationsMinRef.current);
                breakDurationsMinRef.current = null;
            }
        };
    }, [isRunning, timeLeftSec]);    // Handle auto-completion when timer reaches 0
    useEffect(() => {
        if (timeLeftSec === 0 && !isRunning && totalTimeSec > 0) {
            const timer = setTimeout(() => {
                playCompletionSound();

                // If it was a work session, call the backend API
                if (sessionType === 'work') {
                    const completedMinutes = totalTimeSec / 60;
                    const durationHours = completedMinutes / 60;
                    onComplete(durationHours);
                }

                // Switch to next session (work -> break or break -> work)
                switchToNextSession();
            }, 0);

            return () => clearTimeout(timer);
        }
    }, [timeLeftSec, isRunning, totalTimeSec, sessionType, onComplete, playCompletionSound, switchToNextSession]);
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        setIsRunning(!isRunning);
    };

    const handleStop = () => {
        setIsRunning(false);
        setTimeLeftSec(totalTimeSec);
        onClose();
    }; const handleComplete = () => {
        if (sessionType === 'work') {
            setIsRunning(false);
            const completedMinutes = (totalTimeSec - timeLeftSec) / 60;
            const durationHours = completedMinutes / 60;
            onComplete(durationHours);
            onClose();
        }
    };

    const handleAddFiveMinutes = () => {
        setTimeLeftSec((prev) => prev + (5 * 60));
        setTotalTimeSec((prev) => prev + (5 * 60));
    }; const getElapsedMinutes = () => {
        return Math.floor((totalTimeSec - timeLeftSec) / 60);
    };

    const getProgress = () => {
        return ((totalTimeSec - timeLeftSec) / totalTimeSec) * 100;
    };

    // Break activity suggestions
    const getBreakActivities = (type: SessionType) => {
        if (type === 'shortBreak') {
            return [
                '🚶 Take a short walk',
                '🧘 Do some deep breathing',
                '💧 Drink water & hydrate',
                '🤸 Stretch your body',
                '👀 Rest your eyes (look far away)'
            ];
        } else if (type === 'longBreak') {
            return [
                '🌳 Go for a walk outside',
                '💪 Do a quick workout',
                '😴 Take a 20-minute power nap',
                '🧘‍♀️ Meditate or do NSDR',
                '🥙 Have a healthy snack',
                '📞 Call a friend or family'
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
                        <div className={`text-sm px-3 py-1 rounded-full inline-block ${sessionType === 'work'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                            {sessionType === 'work' && `Pomodoro ${completedPomodoros + 1}`}
                            {sessionType === 'shortBreak' && 'Short Break'}
                            {sessionType === 'longBreak' && 'Long Break'}
                        </div>
                    </div>                    {/* Timer Display */}
                    <div className="text-center">
                        <div className="text-6xl font-mono font-bold text-foreground mb-2">
                            {formatTime(timeLeftSec)}
                        </div>                        {/* Progress bar */}
                        <div className="mx-4">
                            <div className="w-full bg-muted rounded-full h-2 mb-4">
                                <div
                                    className={`h-2 rounded-full transition-all duration-1000 ${sessionType === 'work' ? 'bg-blue-500' : 'bg-green-500'
                                        }`}
                                    style={{ width: `${getProgress()}%` }}
                                />
                            </div>
                        </div>
                    </div>{/* Task Title - only show during work sessions */}
                    {sessionType === 'work' && (
                        <div className="text-center">
                            <p className="text-lg font-medium text-foreground">
                                {taskTitle}
                            </p>
                        </div>
                    )}                {/* Break Activity Suggestions - only show during break sessions */}
                {sessionType !== 'work' && (
                    <div className="flex justify-center">
                        <div className="bg-muted/50 rounded-lg p-4 max-w-xs">
                            <h3 className="text-sm font-medium text-center mb-3">
                                {sessionType === 'shortBreak' ? '✨ Quick Break Ideas (5 min)' : '🌟 Long Break Ideas (20 min)'}
                            </h3>
                            <div className="space-y-1">
                                {getBreakActivities(sessionType).map((activity, index) => (
                                    <div key={index} className="text-sm text-muted-foreground text-left">
                                        {activity}
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs text-center text-muted-foreground mt-3 italic">
                                {sessionType === 'shortBreak'
                                    ? 'Avoid screens - give your mind a real break!'
                                    : 'Take a deeper reset to recharge for the next cycle'}
                            </div>
                        </div>
                    </div>
                )}{/* Controls */}
                    <div className="flex items-center justify-center gap-4">
                        <Button
                            onClick={handlePlayPause}
                            size="lg"
                            className="rounded-full w-16 h-16 shadow-lg"
                        >
                            {isRunning ? (
                                <Pause className="h-6 w-6" />
                            ) : (
                                <Play className="h-6 w-6 ml-1" />
                            )}
                        </Button>

                        <Button
                            onClick={handleStop}
                            variant="outline"
                            size="lg"
                            className="rounded-full w-16 h-16 shadow-md"
                        >
                            <Square className="h-6 w-6" />
                        </Button>

                        <Button
                            onClick={handleAddFiveMinutes}
                            variant="outline"
                            size="lg"
                            className="rounded-full w-16 h-16 flex flex-col gap-1 shadow-md"
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
                    )}{/* Stats */}
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        {streak > 0 ? (
                            <div className="flex items-center gap-1">
                                <span>🔥</span>
                                <span>Streak: {streak} day{streak !== 1 ? 's' : ''}</span>
                            </div>
                        ) : (
                            <div></div>
                        )}
                        <div>
                            {sessionType === 'work' ? (
                                <span>{getElapsedMinutes()} min of {Math.floor(totalTimeSec / 60)} min</span>
                            ) : (
                                <span>Completed: {completedPomodoros} pomodoro{completedPomodoros !== 1 ? 's' : ''}</span>
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
                                Complete Session ({getElapsedMinutes()} min)
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
