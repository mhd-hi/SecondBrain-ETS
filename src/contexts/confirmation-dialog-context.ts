import type { ConfirmDialogContextType } from '@/types/dialog/confirmation-dialog';

import { createContext } from 'react';

export const GlobalConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);
