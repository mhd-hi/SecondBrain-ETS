'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PomodoroTab } from './PomodoroTab';
import { ProfileTab } from './ProfileTab';
import { SettingsTab } from './SettingsTab';

export function PreferencesContainer() {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="profile" className="text-sm" tabIndex={0}>Profile</TabsTrigger>
        <TabsTrigger value="pomodoro" className="text-sm" tabIndex={0}>Pomodoro</TabsTrigger>
        <TabsTrigger value="settings" className="text-sm" tabIndex={0}>Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <ProfileTab />
      </TabsContent>

      <TabsContent value="pomodoro" className="space-y-6">
        <PomodoroTab />
      </TabsContent>

      <TabsContent value="settings" className="space-y-6">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  );
}
