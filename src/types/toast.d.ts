declare module 'sonner' {
  import type React from 'react';

  interface ToastOptions {
    description?: string;
    className?: string;
  }

  interface Toast {
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
  }

  interface ToasterProps {
    theme?: 'light' | 'dark' | 'system';
    className?: string;
    toastOptions?: {
      classNames?: {
        toast?: string;
        description?: string;
        actionButton?: string;
        cancelButton?: string;
      };
    };
  }

  export const toast: Toast;
  export const Toaster: React.ComponentType<ToasterProps>;
}