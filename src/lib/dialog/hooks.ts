import type { ConfirmDialogContextType } from '@/types/dialog';

import { createContext, use } from 'react';

export const GlobalConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export function useGlobalConfirmDialog(): ConfirmDialogContextType {
  const context = use(GlobalConfirmDialogContext);
  if (!context) {
    throw new Error('useGlobalConfirmDialog must be used within a GlobalConfirmDialogProvider');
  }
  return context;
}
