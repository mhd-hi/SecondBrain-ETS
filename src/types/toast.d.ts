declare module 'sonner' {
  interface ToastOptions {
    description?: string;
    className?: string;
  }

  interface Toast {
    success: (message: string, options?: ToastOptions) => void;
    error: (message: string, options?: ToastOptions) => void;
  }

  export const toast: Toast;
} 