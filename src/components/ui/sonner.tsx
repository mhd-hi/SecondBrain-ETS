'use client';

import { useTheme } from 'next-themes';
import * as React from 'react';
import { Toaster } from 'sonner';

// Re-export toast from sonner for convenience
// eslint-disable-next-line react-refresh/only-export-components
export { toast } from 'sonner';

const CustomToaster = () => {
  const { theme = 'system' } = useTheme();

  return (
    <Toaster
      theme={theme as 'light' | 'dark' | 'system'}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
    />
  );
};

export { CustomToaster as Toaster };
