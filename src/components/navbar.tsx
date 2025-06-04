"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Card } from "./ui/card";

export function Navbar() {
  return (
    <Card className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Button variant="ghost" asChild className="font-bold">
          <Link href="/">Second Brain</Link>
        </Button>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Button variant="ghost" asChild>
                <Link href="/courses" className={navigationMenuTriggerStyle()}>
                  Courses
                </Link>
              </Button>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Tasks</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                  <li className="row-span-3">
                    <Button variant="ghost" asChild className="h-full w-full justify-start">
                      <Link
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/tasks"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          All Tasks
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          View and manage all your tasks across courses
                        </p>
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" asChild className="h-full w-full justify-start">
                      <Link
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        href="/tasks/review"
                      >
                        <div className="text-sm font-medium leading-none">
                          Review Queue
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Review and approve AI-generated tasks
                        </p>
                      </Link>
                    </Button>
                  </li>
                  <li>
                    <Button variant="ghost" asChild className="h-full w-full justify-start">
                      <Link
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        href="/tasks/calendar"
                      >
                        <div className="text-sm font-medium leading-none">
                          Calendar
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          View your tasks in a calendar view
                        </p>
                      </Link>
                    </Button>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <div className="pr-2">
          <ThemeToggle />
        </div>
      </div>
    </Card>
  );
} 