import type { SoundStorageKey } from '@/lib/sound-manager';
import type { PomodoroStage } from '@/types/pomodoro';
import type { Task } from '@/types/task';
import { toast } from 'sonner';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SOUND_DEFAULT_STORAGE, soundManager } from '@/lib/sound-manager';
import { api } from '@/lib/utils/api/api-client-util';
import { playSelectedNotificationSound } from '@/lib/utils/audio-util';

export const DEFAULT_WORK_DURATION = 25;
const DEFAULT_SHORT_BREAK_DURATION = 5;
const DEFAULT_LONG_BREAK_DURATION = 15;
const DEFAULT_SOUND_VOLUME = 60;
const LONG_BREAK_THRESHOLD = 45;

type SessionDurations = {
  work: number;
  shortBreak: number;
  longBreak: number;
};

type PomodoroSettings = {
  soundVolume: number;
  notificationSound: SoundStorageKey;
};

type PomodoroStore = {
  currentTask: Task | null;
  pomodoroStage: PomodoroStage;
  isPomodoroActive: boolean;
  isRunning: boolean;
  timeLeftSec: number;
  totalTimeSec: number;
  sessionDurations: SessionDurations;
  settings: PomodoroSettings;
  streak: number;
  isLoaded: boolean;

  startPomodoro: (task: Task | null, duration?: number, autoStart?: boolean) => void;
  toggleTimer: () => void;
  stopPomodoro: () => void;
  addFiveMinutes: () => void;
  switchToPomodoroStage: (pomodoroStage: PomodoroStage) => void;
  updateDuration: (duration: number) => void;
  updateSessionDuration: (type: 'work' | 'shortBreak' | 'longBreak', duration: number) => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  tick: () => void;
  handleTimerComplete: () => Promise<void>;
  setStreak: (streak: number) => void;
  fetchStreak: () => Promise<void>;
  startTimerInterval: () => void;
  stopTimerInterval: () => void;

  reset: () => void;
};

// Timer interval stored outside the store to avoid reactivity issues
let timerIntervalId: NodeJS.Timeout | null = null;

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      currentTask: null,
      pomodoroStage: 'work',
      isPomodoroActive: false,
      isRunning: false,
      timeLeftSec: DEFAULT_WORK_DURATION * 60,
      totalTimeSec: DEFAULT_WORK_DURATION * 60,
      sessionDurations: {
        work: DEFAULT_WORK_DURATION,
        shortBreak: DEFAULT_SHORT_BREAK_DURATION,
        longBreak: DEFAULT_LONG_BREAK_DURATION,
      },
      settings: {
        soundVolume: DEFAULT_SOUND_VOLUME,
        notificationSound: SOUND_DEFAULT_STORAGE,
      },
      streak: 0,
      isLoaded: true,

      startPomodoro: (task, duration, autoStart = false) => {
        const state = get();
        const workDuration = duration || state.sessionDurations.work;

        // Update session durations if custom duration provided
        const newSessionDurations = duration
          ? { ...state.sessionDurations, work: duration }
          : state.sessionDurations;

        const durationInSeconds = workDuration * 60;

        set({
          currentTask: task,
          pomodoroStage: 'work',
          sessionDurations: newSessionDurations,
          timeLeftSec: durationInSeconds,
          totalTimeSec: durationInSeconds,
          isPomodoroActive: true,
          isRunning: autoStart,
        });

        if (autoStart) {
          get().startTimerInterval();
        }
      },

      toggleTimer: () => {
        const state = get();

        // Ensure session is active when starting timer
        if (!state.isPomodoroActive) {
          set({ isPomodoroActive: true });
        }

        // Unlock audio context and preload sounds on first timer start
        if (typeof window !== 'undefined' && !soundManager.isReady()) {
          soundManager.init();
        }

        const newIsRunning = !state.isRunning;
        set({ isRunning: newIsRunning });

        // Start or stop interval based on new state
        if (newIsRunning) {
          get().startTimerInterval();
        } else {
          get().stopTimerInterval();
        }
      },

      stopPomodoro: () => {
        const state = get();

        // Stop timer interval
        get().stopTimerInterval();

        const durationInSeconds = state.sessionDurations.work * 60;

        set({
          isRunning: false,
          isPomodoroActive: false,
          currentTask: null,
          pomodoroStage: 'work',
          timeLeftSec: durationInSeconds,
          totalTimeSec: durationInSeconds,
        });
      },

      addFiveMinutes: () => {
        set(state => ({
          timeLeftSec: state.timeLeftSec + 5 * 60,
          totalTimeSec: state.totalTimeSec + 5 * 60,
        }));
      },

      switchToPomodoroStage: (newPomodoroStage) => {
        const state = get();
        if (!Object.hasOwn(state.sessionDurations, newPomodoroStage)) {
          console.error('Invalid pomodoro stage:', newPomodoroStage);
          return;
        }
        const duration = state.sessionDurations[newPomodoroStage];
        const durationInSeconds = duration * 60;

        set({
          pomodoroStage: newPomodoroStage,
          timeLeftSec: durationInSeconds,
          totalTimeSec: durationInSeconds,
          isRunning: false,
          isPomodoroActive: true,
        });
      },

      updateDuration: (newDuration) => {
        const state = get();

        // Update the duration for the current session type
        const newSessionDurations = {
          ...state.sessionDurations,
          [state.pomodoroStage]: newDuration,
        };

        set({ sessionDurations: newSessionDurations });

        // If not running, update the timer
        if (!state.isRunning) {
          const durationInSeconds = newDuration * 60;
          set({
            timeLeftSec: durationInSeconds,
            totalTimeSec: durationInSeconds,
          });
        }
      },

      updateSessionDuration: (type, duration) => {
        const state = get();
        const newSessionDurations = {
          ...state.sessionDurations,
          [type]: duration,
        };

        set({ sessionDurations: newSessionDurations });

        // If currently on this session type and not running, update the timer
        if (state.pomodoroStage === type && !state.isRunning) {
          const durationInSeconds = duration * 60;
          set({
            timeLeftSec: durationInSeconds,
            totalTimeSec: durationInSeconds,
          });
        }
      },

      updateSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      tick: () => {
        const state = get();

        if (state.timeLeftSec > 0) {
          set({ timeLeftSec: state.timeLeftSec - 1 });
        } else {
          set({ isRunning: false });
          get().stopTimerInterval();
          // Trigger completion after a small delay
          setTimeout(() => {
            get().handleTimerComplete();
          }, 0);
        }
      },

      handleTimerComplete: async () => {
        const state = get();

        // Use settings from store
        const sound = state.settings.notificationSound;
        const volume = Math.max(0, Math.min(1, state.settings.soundVolume / 100));

        playSelectedNotificationSound(sound, volume);

        // Complete pomodoro session if work session
        if (state.pomodoroStage === 'work' && state.totalTimeSec > 0) {
          const completedMinutes = state.totalTimeSec / 60;
          const durationHours = completedMinutes / 60;

          try {
            const data = await api.post<{ streakDays?: number }>('/api/pomodoro/complete', {
              durationHours,
              taskId: state.currentTask?.id,
            });

            const streakDays = (data && typeof data.streakDays === 'number') ? data.streakDays : 0;
            set({ streak: streakDays });
            toast.success('Pomodoro completed!', {
              description: `You've worked for ${completedMinutes.toFixed(0)} minutes!`,
            });
          } catch (error) {
            console.error('Failed to complete Pomodoro:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to complete Pomodoro');
          }
        }

        // Auto-progress to next session
        if (state.pomodoroStage === 'work' && state.totalTimeSec > 0) {
          const workMinutes = state.totalTimeSec / 60;
          const nextBreakType = workMinutes >= LONG_BREAK_THRESHOLD ? 'longBreak' : 'shortBreak';
          get().switchToPomodoroStage(nextBreakType);
        } else {
          get().switchToPomodoroStage('work');
        }
      },

      setStreak: (streak) => {
        set({ streak });
      },

      fetchStreak: async () => {
        try {
          const data = await api.get<{ streakDays?: number }>('/api/pomodoro/streak');
          const streakDays = (data && typeof data.streakDays === 'number') ? data.streakDays : 0;
          set({ streak: streakDays });
        } catch (error) {
          // If user has no sessions yet (404) or other errors, just set to 0
          console.error('Error fetching pomodoro streak:', error);
          set({ streak: 0 });
        }
      },

      startTimerInterval: () => {
        // Clear any existing interval
        if (timerIntervalId) {
          clearInterval(timerIntervalId);
        }

        // Start new interval
        timerIntervalId = setInterval(() => {
          get().tick();
        }, 1000);
      },

      stopTimerInterval: () => {
        if (timerIntervalId) {
          clearInterval(timerIntervalId);
          timerIntervalId = null;
        }
      },

      reset: () => {
        get().stopTimerInterval();

        set({
          currentTask: null,
          pomodoroStage: 'work',
          isPomodoroActive: false,
          isRunning: false,
          timeLeftSec: DEFAULT_WORK_DURATION * 60,
          totalTimeSec: DEFAULT_WORK_DURATION * 60,
          sessionDurations: {
            work: DEFAULT_WORK_DURATION,
            shortBreak: DEFAULT_SHORT_BREAK_DURATION,
            longBreak: DEFAULT_LONG_BREAK_DURATION,
          },
          streak: 0,
        });
      },
    }),
    {
      name: 'pomodoro-storage',
      partialize: state => ({
        sessionDurations: state.sessionDurations,
        settings: state.settings,
      }),
    },
  ),
);

// Initialize sound manager on client side
if (typeof window !== 'undefined') {
  soundManager.init();
  // Fetch streak on initialization
  usePomodoroStore.getState().fetchStreak();
}
