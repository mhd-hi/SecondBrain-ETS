'use client';

import { AppLogo } from '@/components/shared/atoms/AppLogo';
import { NavigationItems } from '@/components/shared/Navigation/NavigationItems';
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

export default function Navbar() {
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
          {/* Empty space for future navbar items */}
        </div>
      </div>
    </Card>
  );
}
