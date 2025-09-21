import type { ConfirmOptions } from '@/lib/dialog/util';

type ConfirmFunction = (options: ConfirmOptions) => Promise<boolean>;

type ConfirmDialogContextType = {
  confirm: ConfirmFunction;
};

export type { ConfirmDialogContextType, ConfirmFunction };
