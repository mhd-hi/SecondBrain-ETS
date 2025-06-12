'use client';

import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Safety checks for session data - middleware guarantees session exists
  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const userImage = session?.user?.image;

  return (
    <main className="container mx-auto px-8 flex min-h-screen flex-col gap-6 mt-2 mb-3.5">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      <Card className="mb-6">
        <CardHeader>
          {' '}
          <CardTitle>
            Welcome back,
            {' '}
            {userName}
            !
          </CardTitle>
          <CardDescription>
            You&apos;re successfully authenticated.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          {userImage && (
            <Image
              src={userImage}
              alt="Profile"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div>
            <p className="font-medium">{userName}</p>
            <p className="text-sm text-gray-500">{userEmail}</p>
          </div>
          <Button onClick={() => signOut()} variant="outline">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
