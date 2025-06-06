'use client';

/**
 * Generic confirmation dialog handler
 * @param message The confirmation message to display
 * @param onConfirm Callback to execute if confirmed
 * @param onCancel Optional callback to execute if cancelled
 */
export const handleConfirm = async (
  message: string,
  onConfirm: () => void | Promise<void>,
  onCancel?: () => void
) => {
  const confirmed = window.confirm(message);
  if (!confirmed) {
    onCancel?.();
    return;
  }
  await onConfirm();
}; 