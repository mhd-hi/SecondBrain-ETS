'use client';

import type { Dispatch, SetStateAction } from 'react';

export const withLoadingState = async <T>(
  asyncOperation: () => Promise<T>,
  setLoading: Dispatch<SetStateAction<boolean>>,
): Promise<T> => {
  setLoading(true);
  try {
    return await asyncOperation();
  } finally {
    setLoading(false);
  }
};

export const withLoadingAndErrorHandling = async <T>(
  asyncOperation: () => Promise<T>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  onError?: (error: unknown) => void,
): Promise<T | undefined> => {
  setLoading(true);
  try {
    return await asyncOperation();
  } catch (error) {
    if (onError) {
      onError(error);
    }
    return undefined;
  } finally {
    setLoading(false);
  }
};
