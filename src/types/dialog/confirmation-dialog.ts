import type { ConfirmOptions } from '@/lib/utils/dialog-util';

type ConfirmFunction = (options: ConfirmOptions) => Promise<boolean>;

type ConfirmDialogContextType = {
  confirm: ConfirmFunction;
};

export type { ConfirmDialogContextType, ConfirmFunction };
