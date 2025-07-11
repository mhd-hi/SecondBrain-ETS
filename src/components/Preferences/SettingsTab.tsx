'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function SettingsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Settings</CardTitle>
        <CardDescription>
          Customize the appearance and behavior of your application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-0.5">
            <Label className="text-base">Theme</Label>
            <div className="text-sm text-muted-foreground">
              Select your preferred color scheme
            </div>
          </div>
          <ThemeToggle />
        </div>
      </CardContent>
    </Card>
  );
}
