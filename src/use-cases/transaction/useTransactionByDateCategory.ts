'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { TransactionRepositoryImpl } from '@/src/infrastructure/repositories/TransactionRepositoryImpl';
import type { Transaction } from '@/src/domain/entities/Transaction';

interface TransactionByDateCategoryState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

export function useTransactionByDateCategory(companyId: string | undefined, categoryId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<TransactionByDateCategoryState>({
    transactions: [],
    isLoading: true,
    error: null,
  });

  const fetchTransactions = useCallback(async () => {
    if (!session || !isAuthenticated || !companyId || !categoryId) return;

    const token = (session as { access_token: string }).access_token;
    const repo = new TransactionRepositoryImpl(token);

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const transactions = await repo.getByDateCategory(companyId, categoryId);
      setState({ transactions, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar transacciones por categoría';
      setState({ transactions: [], isLoading: false, error: message });
    }
  }, [session, isAuthenticated, companyId, categoryId]);

  useEffect(() => {
    if (!sessionLoading) {
      fetchTransactions();
    }
  }, [sessionLoading, fetchTransactions]);

  return { ...state, refetch: fetchTransactions };
}
