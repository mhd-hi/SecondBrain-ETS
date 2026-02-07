declare module 'sonner' {
  import type * as React from 'react';

  type ToastOptions = {
    description?: string;
    className?: string;
  };

  type Toast = {
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
  };

  type ToasterProps = {
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
  };

  export const toast: Toast;
  export const Toaster: React.ComponentType<ToasterProps>;
}
