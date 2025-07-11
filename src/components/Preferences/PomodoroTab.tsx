'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { playAlertSound, playCompletionSound, playNotificationSound } from '@/lib/audio/util';

export type PomodoroSettings = {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  soundVolume: number;
  notificationSound: string;
};

const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  soundVolume: 50,
  notificationSound: 'default',
};

export function PomodoroTab() {
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>(DEFAULT_POMODORO_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadAndSetSettings = async () => {
      const loadSettings = () => {
        const savedSettings = localStorage.getItem('pomodoroSettings');
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            return { ...DEFAULT_POMODORO_SETTINGS, ...parsed };
          } catch (error) {
            console.error('Failed to parse saved pomodoro settings:', error);
            return DEFAULT_POMODORO_SETTINGS;
          }
        }
        return DEFAULT_POMODORO_SETTINGS;
      };

      const settings = loadSettings();
      setPomodoroSettings(settings);
      setIsLoading(false);
    };

    loadAndSetSettings();
  }, []);

  // Save settings to localStorage
  const savePomodoroSettings = useCallback(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(pomodoroSettings));
  }, [pomodoroSettings]);

  const updatePomodoroSetting = useCallback((key: keyof PomodoroSettings, value: number | string) => {
    setPomodoroSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const testNotificationSound = useCallback(() => {
    switch (pomodoroSettings.notificationSound) {
      case 'chime':
        playNotificationSound();
        break;
      case 'bell':
        playAlertSound();
        break;
      case 'none':
        // No sound
        break;
      default:
        playCompletionSound();
        break;
    }
  }, [pomodoroSettings.notificationSound]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold pb-0 mb-0">Pomodoro Settings (not stable)</CardTitle>
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
                value={pomodoroSettings.workDuration}
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
                value={pomodoroSettings.shortBreakDuration}
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
                value={pomodoroSettings.longBreakDuration}
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
                value={[pomodoroSettings.soundVolume]}
                onValueChange={value => updatePomodoroSetting('soundVolume', value[0] || 10)}
                max={100}
                step={10}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground w-10">
                {pomodoroSettings.soundVolume}
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
                value={pomodoroSettings.notificationSound}
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
                disabled={pomodoroSettings.notificationSound === 'none'}
              >
                Test
              </Button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={savePomodoroSettings} className="w-full sm:w-auto">
            Save Pomodoro Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
