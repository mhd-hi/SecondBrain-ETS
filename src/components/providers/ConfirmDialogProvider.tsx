'use client';

import type { ConfirmDialogContextType, ConfirmFunction } from '@/lib/dialog/types';
import type { ConfirmOptions } from '@/lib/dialog/util';

import { AlertTriangle } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GlobalConfirmDialogContext } from '@/lib/dialog/hooks';
import { setGlobalConfirmFunction } from '@/lib/dialog/util';

type DialogState = {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onClose: () => void;
};

export function GlobalConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'default',
    onClose: () => {},
    onConfirm: () => {},
  });
  const confirm: ConfirmFunction = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      const handleConfirm = () => {
        resolve(true);
        setDialogState(prev => ({ ...prev, isOpen: false }));
      };

      const handleClose = () => {
        resolve(false);
        setDialogState(prev => ({ ...prev, isOpen: false }));
      };

      setDialogState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText,
        cancelText: options.cancelText,
        variant: options.variant,
        onConfirm: handleConfirm,
        onClose: handleClose,
      });
    });
  }, []);

  // Register the confirm function globally
  useEffect(() => {
    setGlobalConfirmFunction(confirm);
  }, [confirm]);

  const contextValue = useMemo<ConfirmDialogContextType>(() => ({
    confirm,
  }), [confirm]);
  return (
    <GlobalConfirmDialogContext.Provider value={contextValue}>
      {children}
      <Dialog open={dialogState.isOpen} onOpenChange={dialogState.onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogState.variant === 'destructive' && (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
              {dialogState.title}
            </DialogTitle>
            <DialogDescription>
              {dialogState.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={dialogState.onClose}>
              {dialogState.cancelText}
            </Button>
            <Button
              variant={dialogState.variant === 'destructive' ? 'destructive' : 'default'}
              onClick={() => {
                dialogState.onConfirm();
                dialogState.onClose();
              }}
            >
              {dialogState.confirmText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </GlobalConfirmDialogContext.Provider>
  );
}
