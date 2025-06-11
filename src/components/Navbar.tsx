'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <Card className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <Button variant="ghost" asChild className="font-bold text-xl">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/pochita-bread.png"
              alt="Favicon"
              width={39}
              height={39}
              priority={true}
              className="object-contain"
            />
            Second Brain
          </Link>
        </Button>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Button variant="ghost" asChild>
                <Link href="/" className={navigationMenuTriggerStyle()}>
                  Dashboard
                </Link>
              </Button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Button variant="ghost" asChild>
                <Link href="/weekly-roadmap" className={navigationMenuTriggerStyle()}>
                  Weekly Roadmap
                </Link>
              </Button>
            </NavigationMenuItem>
            {session && (
              <NavigationMenuItem>
                <Button variant="ghost" asChild>
                  <Link href="/profile" className={navigationMenuTriggerStyle()}>
                    Profile
                  </Link>
                </Button>
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          {status === 'loading'
            ? (
              <Skeleton className="w-8 h-8 rounded-full" />
            )
            : session
              ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      {session.user?.image && (
                        <Image
                          src={session.user.image}
                          alt="Profile"
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="hidden sm:inline">{session.user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled>
                      {session.user?.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )
              : (
                <Button variant="outline" onClick={() => signIn()}>
                  Sign In
                </Button>
              )}
          <ThemeToggle />
        </div>
      </div>
    </Card>
  );
}
