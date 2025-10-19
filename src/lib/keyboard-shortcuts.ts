'use client';

import { useEffect } from 'react';
import { ROUTES } from './routes';

type Dialog = 'add-course' | 'add-task';

export type ShortcutAction =
  | { type: 'navigate'; path: string }
  | { type: 'dialog'; dialog: Dialog }
  | { type: 'toggle'; target: 'command-palette' };

export type KeyboardShortcut = {
  key: string;
  ctrl: boolean;
  alt: boolean;
  meta?: boolean;
  action: ShortcutAction;
  description: string;
};

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Command palette
  {
    key: 'k',
    ctrl: true,
    alt: true,
    action: { type: 'toggle', target: 'command-palette' },
    description: 'Open command palette',
  },
  // Navigation shortcuts
  {
    key: 'd',
    ctrl: true,
    alt: true,
    action: { type: 'navigate', path: ROUTES.DASHBOARD },
    description: 'Go to Dashboard',
  },
  {
    key: 'p',
    ctrl: true,
    alt: true,
    action: { type: 'navigate', path: ROUTES.POMODORO },
    description: 'Go to Pomodoro',
  },
  {
    key: 'w',
    ctrl: true,
    alt: true,
    action: { type: 'navigate', path: ROUTES.WEEKLY_ROADMAP },
    description: 'Go to Weekly Roadmap',
  },
  // Dialog shortcuts
  {
    key: 'c',
    ctrl: true,
    alt: true,
    action: { type: 'dialog', dialog: 'add-course' },
    description: 'Add Course',
  },
  {
    key: 't',
    ctrl: true,
    alt: true,
    action: { type: 'dialog', dialog: 'add-task' },
    description: 'Add Task',
  },
];

export function getShortcutForPath(path: string): KeyboardShortcut | undefined {
  return KEYBOARD_SHORTCUTS.find(
    shortcut =>
      shortcut.action.type === 'navigate' && shortcut.action.path === path,
  );
}

export function getShortcutForDialog(dialog: Dialog): KeyboardShortcut | undefined {
  return KEYBOARD_SHORTCUTS.find(
    shortcut =>
      shortcut.action.type === 'dialog' && shortcut.action.dialog === dialog,
  );
}

export type ShortcutHandlers = {
  onToggleCommandPalette: () => void;
  onOpenAddCourseDialog: () => void;
  onOpenAddTaskDialog: () => void;
  onNavigate: (path: string) => void;
};

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

      const matchingShortcut = KEYBOARD_SHORTCUTS.find((shortcut) => {
        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl === (isMac ? e.metaKey : e.ctrlKey);
        const altMatches = shortcut.alt === e.altKey;

        return keyMatches && ctrlMatches && altMatches;
      });

      if (matchingShortcut) {
        e.preventDefault();

        switch (matchingShortcut.action.type) {
          case 'navigate':
            handlers.onNavigate(matchingShortcut.action.path);
            break;
          case 'dialog':
            switch (matchingShortcut.action.dialog) {
              case 'add-course':
                handlers.onOpenAddCourseDialog();
                break;
              case 'add-task':
                handlers.onOpenAddTaskDialog();
                break;
            }
            break;
          case 'toggle':
            handlers.onToggleCommandPalette();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

export function getShortcutDisplayText(shortcut: KeyboardShortcut): string {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push(isMac ? 'Cmd' : 'Ctrl');
  }
  if (shortcut.alt) {
    parts.push('Alt');
  }
  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}
