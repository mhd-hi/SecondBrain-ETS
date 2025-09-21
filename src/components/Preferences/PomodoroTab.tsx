'use client';

import type { PomodoroSettings } from '@/lib/localstorage/pomodoro';

import { useCallback, useEffect, useReducer } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { loadPomodoroSettings, savePomodoroSettings } from '@/lib/localstorage/pomodoro';
import { initialPomodoroSettingsState, pomodoroSettingsReducer } from '@/lib/localstorage/pomodoro-settings-reducer';
import { playSelectedNotificationSound } from '@/lib/utils/audio-util';

export function PomodoroTab() {
  const [state, dispatch] = useReducer(pomodoroSettingsReducer, initialPomodoroSettingsState);

  // Load settings from localStorage on mount
  useEffect(() => {
    const settings = loadPomodoroSettings();
    dispatch({ type: 'LOAD_SETTINGS', payload: settings });
  }, []);

  // Save settings to localStorage
  const savePomodoroSettingsHandler = useCallback(() => {
    savePomodoroSettings(state.pomodoroSettings);
    toast.success('Pomodoro settings saved!');
  }, [state.pomodoroSettings]);

  const updatePomodoroSetting = useCallback((key: keyof PomodoroSettings, value: number | string) => {
    dispatch({ type: 'UPDATE_SETTING', key, value });
  }, []);

  const testNotificationSound = useCallback(() => {
    const normalizedVolume = Math.max(0, Math.min(1, state.pomodoroSettings.soundVolume / 100));

    playSelectedNotificationSound(state.pomodoroSettings.notificationSound, normalizedVolume);
  }, [state.pomodoroSettings.notificationSound, state.pomodoroSettings.soundVolume]);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Compare current state to loaded settings to determine if changes exist
  const loadedSettings = loadPomodoroSettings();
  const isDirty = Object.keys(state.pomodoroSettings).some(
    key => state.pomodoroSettings[key as keyof PomodoroSettings] !== loadedSettings[key as keyof PomodoroSettings],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold pb-0 mb-0">Pomodoro</CardTitle>
        <CardDescription>
          Configure your focus timer preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Durations */}
        <div className="space-y-4">
          {/* Work Duration */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-base">Pomodoro</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="5"
                step="5"
                value={state.pomodoroSettings.workDuration}
                onChange={e => updatePomodoroSetting('workDuration', Number.parseInt(e.target.value) || 25)}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          </div>

          {/* Short Break Duration */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="space-y-0.5">
              <Label className="text-base">Short Break</Label>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="5"
                step="5"
                value={state.pomodoroSettings.shortBreakDuration}
                onChange={e => updatePomodoroSetting('shortBreakDuration', Number.parseInt(e.target.value) || 5)}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          </div>

          {/* Long Break Duration */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <Label className="text-base">Long Break</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="5"
                step="5"
                value={state.pomodoroSettings.longBreakDuration}
                onChange={e => updatePomodoroSetting('longBreakDuration', Number.parseInt(e.target.value) || 15)}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground">min</span>
            </div>
          </div>
        </div>

        {/* Sound Settings */}
        <div className="text-lg font-semibold pb-0 mb-0">Alarm</div>
        <div className="text-sm text-muted-foreground">
          Alarm when a pomodoro session is completed
        </div>

        <div className="space-y-4">
          {/* Volume */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="space-y-0.5">
              <Label className="text-base">Alarm volume level</Label>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[state.pomodoroSettings.soundVolume]}
                onValueChange={value => updatePomodoroSetting('soundVolume', value[0] || 10)}
                max={100}
                step={10}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground w-10">
                {state.pomodoroSettings.soundVolume}
                %
              </span>
            </div>
          </div>

          {/* Notification Sound */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="space-y-0.5">
              <Label className="text-base">Notification Sound</Label>
              <div className="text-sm text-muted-foreground">
                Choose your completion sound
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={state.pomodoroSettings.notificationSound}
                onValueChange={(value: string) => updatePomodoroSetting('notificationSound', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="chime">Chime</SelectItem>
                  <SelectItem value="bell">Bell</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={testNotificationSound}
                disabled={state.pomodoroSettings.notificationSound === 'none'}
              >
                Test
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={savePomodoroSettingsHandler}
            className="w-full sm:w-auto"
            disabled={!isDirty}
          >
            Save Pomodoro Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
