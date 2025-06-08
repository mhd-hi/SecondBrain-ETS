"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Card } from "./ui/card";

export default function Navbar() {
  return (
    <Card className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <Button variant="ghost" asChild className="font-bold text-xl">
          <Link href="/">Second Brain</Link>
        </Button>        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Button variant="ghost" asChild>
                <Link href="/" className={navigationMenuTriggerStyle()}>
                  Dashboard
                </Link>
              </Button>
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