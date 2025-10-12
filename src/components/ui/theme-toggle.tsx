'use client';

import { Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle() {
  const { setTheme } = useTheme() as { setTheme: (theme: Theme) => void };

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Sun className="size-4 mr-2" />
        Theme
      </DropdownMenuSubTrigger>

      <DropdownMenuSubContent className="w-44">
        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
