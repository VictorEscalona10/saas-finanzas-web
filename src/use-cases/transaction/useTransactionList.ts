'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { TransactionRepositoryImpl } from '@/src/infrastructure/repositories/TransactionRepositoryImpl';
import type { Transaction } from '@/src/domain/entities/Transaction';
import type { PaginationMeta } from '@/src/domain/entities/Pagination';
import type { TransactionListFilters } from '@/src/domain/repositories/ITransactionRepository';

interface TransactionListState {
  transactions: Transaction[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

export function useTransactionList(companyId: string | undefined, filters?: TransactionListFilters) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<TransactionListState>({
    transactions: [],
    meta: null,
    isLoading: true,
    error: null,
  });
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchTransactions = useCallback(async (): Promise<{ data: Transaction[]; meta: PaginationMeta } | null> => {
    if (!session || !isAuthenticated || !companyId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new TransactionRepositoryImpl(token);

    return repo.list(companyId, page, limit, filters);
  }, [session, isAuthenticated, companyId, page, filters]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await fetchTransactions();
        if (!result) return;
        setState({ transactions: result.data, meta: result.meta, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar transacciones';
        setState({ transactions: [], meta: null, isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, fetchTransactions]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
  }, []);

  return { ...state, page, limit, refetch, goToPage };
}
