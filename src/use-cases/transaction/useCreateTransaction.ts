'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { TransactionRepositoryImpl } from '@/src/infrastructure/repositories/TransactionRepositoryImpl';
import type { CreateTransactionDto } from '@/src/domain/repositories/ITransactionRepository';
import type { Transaction } from '@/src/domain/entities/Transaction';

interface CreateTransactionState {
  loading: boolean;
  error: string | null;
}

export function useCreateTransaction() {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<CreateTransactionState>({ loading: false, error: null });

  const createTransactions = useCallback(async (companyId: string, transactions: CreateTransactionDto[]): Promise<{ data: Transaction[] | null; error: string | null }> => {
    if (!session || !isAuthenticated) {
      setState({ loading: false, error: 'No autenticado' });
      return { data: null, error: 'No autenticado' };
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new TransactionRepositoryImpl(token);

    setState({ loading: true, error: null });

    try {
      const result = await repo.batchCreate(companyId, transactions);
      setState({ loading: false, error: null });
      return { data: result, error: null };
    } catch (err: unknown) {
      let message = 'Error al crear transacciones';

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response: { status: number; data: { message?: string | string[] } } };
        const status = axiosErr.response?.status;
        const data = axiosErr.response?.data;

        if (status === 400 && data?.message) {
          const msgs = Array.isArray(data.message) ? data.message : [data.message];
          message = msgs.join('\n');
        } else if (status && status >= 500) {
          message = 'Error interno del servidor. Intenta de nuevo.';
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setState({ loading: false, error: message });
      return { data: null, error: message };
    }
  }, [session, isAuthenticated]);

  return { createTransactions, ...state };
}
