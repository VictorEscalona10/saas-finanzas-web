'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { TransactionRepositoryImpl } from '@/src/infrastructure/repositories/TransactionRepositoryImpl';
import type { Transaction } from '@/src/domain/entities/Transaction';
import type { PaginationMeta } from '@/src/domain/entities/Pagination';

interface TransactionListState {
  transactions: Transaction[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

export function useTransactionList(companyId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<TransactionListState>({
    transactions: [],
    meta: null,
    isLoading: true,
    error: null,
  });
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchTransactions = useCallback(async () => {
    if (!session || !isAuthenticated || !companyId) return;

    const token = (session as { access_token: string }).access_token;
    const repo = new TransactionRepositoryImpl(token);

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await repo.list(companyId, page, limit);
      setState({ transactions: result.data, meta: result.meta, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar transacciones';
      setState({ transactions: [], meta: null, isLoading: false, error: message });
    }
  }, [session, isAuthenticated, companyId, page]);

  useEffect(() => {
    if (!sessionLoading) {
      fetchTransactions();
    }
  }, [sessionLoading, fetchTransactions]);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return { ...state, page, limit, refetch: fetchTransactions, goToPage };
}
