'use client';

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
};

// This will be set by the GlobalConfirmDialogProvider
let globalConfirmFunction: ((options: ConfirmOptions) => Promise<boolean>) | null = null;

export const setGlobalConfirmFunction = (confirmFn: (options: ConfirmOptions) => Promise<boolean>) => {
  globalConfirmFunction = confirmFn;
};

/**
 * Shows a confirmation dialog and returns a promise that resolves to boolean
 */
export const showConfirmDialog = (options: ConfirmOptions): Promise<boolean> => {
  if (globalConfirmFunction) {
    return globalConfirmFunction(options);
  }

  // Fallback to window.confirm if no global function is available
  console.warn('No global confirm function available, falling back to window.confirm');
  // eslint-disable-next-line no-alert
  const confirmed = window.confirm(options.message);
  return Promise.resolve(confirmed);
};

/**
 * Generic confirmation dialog handler
 * @param message The confirmation message to display
 * @param onConfirm Callback to execute if confirmed
 * @param onCancel Optional callback to execute if cancelled
 * @param options Additional options for the confirmation dialog
 */
export const handleConfirm = async (
  message: string,
  onConfirm: () => void | Promise<void>,
  onCancel?: () => void,
  options?: Omit<ConfirmOptions, 'message'>,
) => {
  const confirmed = await showConfirmDialog({
    message,
    ...options,
  });

  if (!confirmed) {
    onCancel?.();
    return;
  }

  await onConfirm();
};
