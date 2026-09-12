'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { TransactionRepositoryImpl } from '@/src/infrastructure/repositories/TransactionRepositoryImpl';
import type { Transaction } from '@/src/domain/entities/Transaction';

interface TransactionByDateRangeState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

export function useTransactionByDateRange(companyId: string | undefined, startDate: string | undefined, endDate: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<TransactionByDateRangeState>({
    transactions: [],
    isLoading: true,
    error: null,
  });

  const fetchTransactions = useCallback(async (): Promise<Transaction[]> => {
    if (!session || !isAuthenticated || !companyId || !startDate || !endDate) return [];

    const token = (session as { access_token: string }).access_token;
    const repo = new TransactionRepositoryImpl(token);

    return repo.getByDateRange(companyId, startDate, endDate);
  }, [session, isAuthenticated, companyId, startDate, endDate]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId || !startDate || !endDate) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const transactions = await fetchTransactions();
        setState({ transactions, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar transacciones por rango de fechas';
        setState({ transactions: [], isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, startDate, endDate, fetchTransactions]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  return { ...state, refetch };
}
