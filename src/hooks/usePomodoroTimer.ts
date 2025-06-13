import { useCallback, useEffect, useRef, useState } from 'react';

export type SessionType = 'work' | 'shortBreak' | 'longBreak';

const SHORT_BREAK_DURATION = 5; // minutes
const LONG_BREAK_DURATION = 20; // minutes
const POMODOROS_BEFORE_LONG_BREAK = 4;

type UsePomodoroTimerProps = {
  initialDurationMinutes: number;
  onCompleteCallback: (completedDurationHours: number) => void;
  onStopCallback: () => void;
  onSessionChangeCallback?: (
    newSessionType: SessionType,
    newDurationMinutes: number,
  ) => void;
};

export const usePomodoroTimer = ({
  initialDurationMinutes,
  onCompleteCallback,
  onStopCallback,
  onSessionChangeCallback,
}: UsePomodoroTimerProps) => {
  const [timeLeftSec, setTimeLeftSec] = useState(initialDurationMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [totalTimeSec, setTotalTimeSec] = useState(initialDurationMinutes * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const playCompletionSound = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioContext = new AudioContextClass();

      const createBeep = (
        startTime: number,
        frequency: number,
        duration = 0.3,
      ) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(
          frequency,
          audioContext.currentTime + startTime,
        );
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(
          0.2,
          audioContext.currentTime + startTime + 0.05,
        );
        gainNode.gain.linearRampToValueAtTime(
          0.15,
          audioContext.currentTime + startTime + duration * 0.7,
        );
        gainNode.gain.linearRampToValueAtTime(
          0,
          audioContext.currentTime + startTime + duration,
        );

        oscillator.start(audioContext.currentTime + startTime);
        oscillator.stop(audioContext.currentTime + startTime + duration);
      };

      createBeep(0, 330, 0.4);
      createBeep(0.25, 392, 0.4);
      createBeep(0.5, 523, 0.6);
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }, []);

  const getSessionDurationMinutes = useCallback(
    (type: SessionType) => {
      switch (type) {
        case 'work':
          return initialDurationMinutes;
        case 'shortBreak':
          return SHORT_BREAK_DURATION;
        case 'longBreak':
          return LONG_BREAK_DURATION;
      }
    },
    [initialDurationMinutes],
  );

  const switchToNextSession = useCallback(() => {
    let newCompletedPomodoros = completedPomodoros;
    if (sessionType === 'work') {
      newCompletedPomodoros = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedPomodoros);
    }

    const nextSessionType =
      sessionType === 'work'
        ? newCompletedPomodoros % POMODOROS_BEFORE_LONG_BREAK === 0
          ? 'longBreak'
          : 'shortBreak'
        : 'work';

    const newDurationMinutes = getSessionDurationMinutes(nextSessionType);
    const newDurationSec = newDurationMinutes * 60;

    setSessionType(nextSessionType);
    setTimeLeftSec(newDurationSec);
    setTotalTimeSec(newDurationSec);
    setIsRunning(false);

    if (onSessionChangeCallback) {
      onSessionChangeCallback(nextSessionType, newDurationMinutes);
    }
  }, [
    sessionType,
    completedPomodoros,
    getSessionDurationMinutes,
    onSessionChangeCallback,
  ]);

  useEffect(() => {
    if (isRunning && timeLeftSec > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeftSec((prev) => {
          if (prev <= 1) {
            setIsRunning(false); // Stop timer before it hits 0 to trigger completion effect
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeftSec]);

  useEffect(() => {
    if (timeLeftSec === 0 && !isRunning && totalTimeSec > 0) { // Ensure totalTimeSec > 0 to avoid running on initial mount if duration is 0
      playCompletionSound();

      if (sessionType === 'work') {
        onCompleteCallback(totalTimeSec / 3600); // Convert seconds to hours
      }
      switchToNextSession();
    }
  }, [
    timeLeftSec,
    isRunning,
    totalTimeSec,
    sessionType,
    onCompleteCallback,
    playCompletionSound,
    switchToNextSession,
  ]);

  const handlePlayPause = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const handleStop = useCallback(() => {
    setIsRunning(false);
    setTimeLeftSec(getSessionDurationMinutes(sessionType) * 60); // Reset to current session's initial duration
    // Note: totalTimeSec for the *current* session type doesn't change on stop,
    // it resets to its defined duration. If it was a work session that was extended,
    // it resets to initialDurationMinutes.
    setTotalTimeSec(getSessionDurationMinutes(sessionType) * 60);
    onStopCallback();
  }, [getSessionDurationMinutes, sessionType, onStopCallback]);

  const handleAddFiveMinutes = useCallback(() => {
    setTimeLeftSec((prev) => prev + 5 * 60);
    setTotalTimeSec((prev) => prev + 5 * 60); // Also update totalTimeSec to reflect the extension
  }, []);

  // Effect to reset timer state when initialDurationMinutes changes
  useEffect(() => {
    const newWorkDurationSec = initialDurationMinutes * 60;
    setTimeLeftSec(newWorkDurationSec);
    setTotalTimeSec(newWorkDurationSec);
    setIsRunning(false);
    setSessionType('work');
    setCompletedPomodoros(0);
    // No need to call onSessionChangeCallback here as it's an initial setup/reset
  }, [initialDurationMinutes]);


  const setWorkSessionDuration = useCallback((newDurationMinutes: number) => {
    if (sessionType === 'work' && !isRunning) {
      const newDurationSec = newDurationMinutes * 60;
      setTimeLeftSec(newDurationSec);
      setTotalTimeSec(newDurationSec);
      // This function is intended to be called by DurationSelector,
      // so initialDurationMinutes prop should also be updated by the parent component
      // to keep the hook's internal logic consistent if a reset happens.
    }
  }, [sessionType, isRunning]);


  const progress = totalTimeSec > 0 ? ((totalTimeSec - timeLeftSec) / totalTimeSec) * 100 : 0;
  const currentSessionDurationMinutes = totalTimeSec / 60;

  return {
    timeLeftSec,
    isRunning,
    sessionType,
    completedPomodoros,
    totalTimeSec,
    progress,
    handlePlayPause,
    handleStop,
    handleAddFiveMinutes,
    currentSessionDurationMinutes,
    // Expose setTotalTimeSec and setIsRunning for more direct control if needed,
    // e.g., when DurationSelector changes work duration while timer is not running.
    setTotalTimeSec, // Be cautious with direct manipulation, prefer setWorkSessionDuration for work sessions
    setIsRunning,
    setWorkSessionDuration, // Allow external update of work session duration
  };
};
