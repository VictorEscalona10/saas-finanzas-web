'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useDollarRate, type DollarRate } from '@/src/use-cases/dollar/useDollarRate';

interface DollarRateContextValue {
  dollarRate: DollarRate | null;
  isLoading: boolean;
  error: string | null;
  source: 'official' | 'manual';
  setManualRate: (rate: number) => void;
  resetToOfficial: () => Promise<void>;
}

const DollarRateContext = createContext<DollarRateContextValue | null>(null);

export function DollarRateProvider({ companyId, children }: { companyId?: string; children: ReactNode }) {
  const value = useDollarRate(companyId);
  return (
    <DollarRateContext.Provider value={value}>
      {children}
    </DollarRateContext.Provider>
  );
}

export function useDollarRateContext(): DollarRateContextValue {
  const ctx = useContext(DollarRateContext);
  if (!ctx) {
    throw new Error('useDollarRateContext must be used within a DollarRateProvider');
  }
  return ctx;
}
