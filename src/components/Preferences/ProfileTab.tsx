'use client';

import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { use } from 'react';
import { StreakBadge } from '@/components/shared/atoms/StreakBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PomodoroContext } from '@/contexts/pomodoro-context';

export function ProfileTab() {
  const { data: session } = useSession();
  const pomodoro = use(PomodoroContext);

  // Safety checks for session data - middleware guarantees session exists
  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const userImage = session?.user?.image;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          👋 Welcome back,
          {' '}
          {userName}
          !
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
        <div className="flex items-center gap-3">
          {userImage && (
            <Image
              src={userImage}
              alt="Profile"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div className="text-center sm:text-left">
            <p className="font-medium">{userName}</p>
            <p className="text-sm text-gray-500">{userEmail}</p>
            {pomodoro && <StreakBadge streak={pomodoro.streak} className="mt-2" />}
          </div>
        </div>
        <Button onClick={() => signOut()} variant="outline" className="w-full sm:w-auto">
          Sign Out
        </Button>
      </CardContent>
    </Card>
  );
}
