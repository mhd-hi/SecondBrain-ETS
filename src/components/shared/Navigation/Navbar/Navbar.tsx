'use client';

import { Search } from 'lucide-react';
import { AppLogo } from '@/components/shared/atoms/AppLogo';
import { NavigationItems } from '@/components/shared/Navigation/NavigationItems';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { openCommandPalette } from '@/lib/command-palette';
import { getShortcutDisplayText, KEYBOARD_SHORTCUTS } from '@/lib/keyboard-shortcuts';

export default function Navbar() {
  // Find the command palette shortcut
  const commandPaletteShortcut = KEYBOARD_SHORTCUTS.find(
    shortcut => shortcut.action.type === 'toggle' && shortcut.action.target === 'command-palette',
  );
  const shortcutText = commandPaletteShortcut ? getShortcutDisplayText(commandPaletteShortcut) : '⌘K';

  return (
    <Card className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {/* Tooltip for Close sidebar button */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarTrigger />
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Close sidebar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Logo and app name - only visible on mobile */}
          <AppLogo className="md:hidden" />
        </div>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationItems variant="horizontal" />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* User authentication and theme toggle moved to sidebar footer */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => openCommandPalette()}>
            <Search className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
            <span className="ml-2 text-xs text-muted-foreground">{shortcutText}</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
