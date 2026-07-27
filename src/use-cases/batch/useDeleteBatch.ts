'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ProductionBatchRepositoryImpl } from '@/src/infrastructure/repositories/ProductionBatchRepositoryImpl';

interface DeleteBatchState {
  loading: boolean;
  error: string | null;
}

export function useDeleteBatch() {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<DeleteBatchState>({ loading: false, error: null });

  const deleteBatch = useCallback(async (companyId: string, batchId: string): Promise<boolean> => {
    if (!session || !isAuthenticated) {
      setState({ loading: false, error: 'No autenticado' });
      return false;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new ProductionBatchRepositoryImpl(token);

    setState({ loading: true, error: null });

    try {
      await repo.delete(companyId, batchId);
      setState({ loading: false, error: null });
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar lote de producción';
      setState({ loading: false, error: message });
      return false;
    }
  }, [session, isAuthenticated]);

  return { deleteBatch, ...state };
}
