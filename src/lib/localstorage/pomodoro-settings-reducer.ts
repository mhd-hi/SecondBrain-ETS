import type { PomodoroSettings } from './pomodoro';
import { DEFAULT_POMODORO_SETTINGS } from './pomodoro';

export type PomodoroSettingsState = {
  pomodoroSettings: PomodoroSettings;
  isLoading: boolean;
};

export type PomodoroSettingsAction =
  | { type: 'LOAD_SETTINGS'; payload: PomodoroSettings }
  | { type: 'UPDATE_SETTING'; key: keyof PomodoroSettings; value: number | string }
  | { type: 'SET_LOADING'; value: boolean };

export const initialPomodoroSettingsState: PomodoroSettingsState = {
  pomodoroSettings: DEFAULT_POMODORO_SETTINGS,
  isLoading: true,
};

export function pomodoroSettingsReducer(
  state: PomodoroSettingsState = initialPomodoroSettingsState,
  action: PomodoroSettingsAction,
): PomodoroSettingsState {
  switch (action.type) {
    case 'LOAD_SETTINGS':
      return { ...state, pomodoroSettings: action.payload, isLoading: false };
    case 'UPDATE_SETTING':
      return {
        ...state,
        pomodoroSettings: {
          ...state.pomodoroSettings,
          [action.key]: action.value,
        },
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.value };
    default:
      return state;
  }
}
