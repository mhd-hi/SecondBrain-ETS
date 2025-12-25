'use client';

import type { PomodoroSettings } from '@/lib/localstorage/pomodoro';

import { useCallback, useEffect, useReducer, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { loadPomodoroSettings, savePomodoroSettings } from '@/lib/localstorage/pomodoro';
import { initialPomodoroSettingsState, pomodoroSettingsReducer } from '@/lib/localstorage/pomodoro-settings-reducer';
import { SOUND_KEYS, soundManager } from '@/lib/sound-manager';
import { playSelectedNotificationSound } from '@/lib/utils/audio-util';

export function PomodoroTab() {
  const [state, dispatch] = useReducer(pomodoroSettingsReducer, initialPomodoroSettingsState);
  const [soundReady, setSoundReady] = useState(soundManager.isReady());

  // Load settings from localStorage on mount
  useEffect(() => {
    const settings = loadPomodoroSettings();
    dispatch({ type: 'LOAD_SETTINGS', payload: settings });
  }, []);

  // Monitor sound manager readiness via event listener
  useEffect(() => {
    // Subscribe to ready state changes
    const unsubscribe = soundManager.onReadyStateChange((ready) => {
      setSoundReady(ready);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-save settings whenever they change
  useEffect(() => {
    if (!state.isLoading) {
      savePomodoroSettings(state.pomodoroSettings);
    }
  }, [state.pomodoroSettings, state.isLoading]);

  const [isTestPlaying, setIsTestPlaying] = useState(false);

  const updatePomodoroSetting = useCallback((key: keyof PomodoroSettings, value: number | string) => {
    dispatch({ type: 'UPDATE_SETTING', key, value });
    // Update volume in real-time while sound is playing
    if (key === 'soundVolume' && isTestPlaying) {
      const normalizedVolume = Math.max(0, Math.min(1, (value as number) / 100));
      soundManager.setVolume(normalizedVolume);
    }
  }, [isTestPlaying]);

  const testNotificationSound = useCallback(async () => {
    if (isTestPlaying) {
      soundManager.stop();
      setIsTestPlaying(false);
    } else {
      const normalizedVolume = Math.max(0, Math.min(1, state.pomodoroSettings.soundVolume / 100));
      await playSelectedNotificationSound(state.pomodoroSettings.notificationSound, normalizedVolume);
      setIsTestPlaying(true);
      // Stop after a reasonable time to reset the state
      setTimeout(() => setIsTestPlaying(false), 5000);
    }
  }, [state.pomodoroSettings.notificationSound, state.pomodoroSettings.soundVolume, isTestPlaying]);

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

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
                  {Object.keys(SOUND_KEYS).map(key => (
                    <SelectItem key={key} value={key.toLowerCase().replace(/ /g, '_')}>
                      {key}
                    </SelectItem>
                  ))}
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
              {
                soundReady
                  ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testNotificationSound}
                      disabled={state.pomodoroSettings.notificationSound === 'none'}
                    >
                      {isTestPlaying ? 'Stop' : 'Test'}
                    </Button>
                  )
                  : (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      Loading sounds...
                    </div>
                  )
              }
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
