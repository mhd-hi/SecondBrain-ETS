/* eslint-disable react-refresh/only-export-components */
import React, { createContext, use, useMemo } from 'react';

type SelectedDateContextType = {
  selectedDate: Date;
  setSelectedDate: (d: Date | undefined) => void;
};

const SelectedDateContext = createContext<SelectedDateContextType | undefined>(undefined);

type SelectedDateProviderProps = {
  children: React.ReactNode;
  selectedDate: Date;
  setSelectedDate: (d: Date | undefined) => void;
};

export function SelectedDateProvider({ children, selectedDate, setSelectedDate }: SelectedDateProviderProps) {
  const value = useMemo(() => ({ selectedDate, setSelectedDate }), [selectedDate, setSelectedDate]);

  return <SelectedDateContext.Provider value={value}>{children}</SelectedDateContext.Provider>;
}

export function useSelectedDate() {
  const ctx = use(SelectedDateContext);
  if (!ctx) {
    throw new Error('useSelectedDate must be used within SelectedDateProvider');
  }

  return ctx;
}
