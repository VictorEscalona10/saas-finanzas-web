'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { TransactionRepositoryImpl } from '@/src/infrastructure/repositories/TransactionRepositoryImpl';

interface DeleteTransactionState {
  loading: boolean;
  error: string | null;
}

export function useDeleteTransaction() {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<DeleteTransactionState>({ loading: false, error: null });

  const deleteTransaction = useCallback(async (companyId: string, transactionId: string): Promise<boolean> => {
    if (!session || !isAuthenticated) {
      setState({ loading: false, error: 'No autenticado' });
      return false;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new TransactionRepositoryImpl(token);

    setState({ loading: true, error: null });

    try {
      await repo.delete(companyId, transactionId);
      setState({ loading: false, error: null });
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar transacción';
      setState({ loading: false, error: message });
      return false;
    }
  }, [session, isAuthenticated]);

  return { deleteTransaction, ...state };
}
