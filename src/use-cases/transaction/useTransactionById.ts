'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { TransactionRepositoryImpl } from '@/src/infrastructure/repositories/TransactionRepositoryImpl';
import type { Transaction } from '@/src/domain/entities/Transaction';

interface TransactionState {
  transaction: Transaction | null;
  isLoading: boolean;
  error: string | null;
}

export function useTransactionById(companyId: string | undefined, transactionId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<TransactionState>({
    transaction: null,
    isLoading: true,
    error: null,
  });

  const fetchTransaction = useCallback(async () => {
    if (!session || !isAuthenticated || !companyId || !transactionId) return;

    const token = (session as { access_token: string }).access_token;
    const repo = new TransactionRepositoryImpl(token);

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const transaction = await repo.getById(companyId, transactionId);
      setState({ transaction, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar transacción';
      setState({ transaction: null, isLoading: false, error: message });
    }
  }, [session, isAuthenticated, companyId, transactionId]);

  useEffect(() => {
    if (!sessionLoading) {
      fetchTransaction();
    }
  }, [sessionLoading, fetchTransaction]);

  return { ...state, refetch: fetchTransaction };
}
