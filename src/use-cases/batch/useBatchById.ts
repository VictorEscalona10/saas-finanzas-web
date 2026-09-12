'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ProductionBatchRepositoryImpl } from '@/src/infrastructure/repositories/ProductionBatchRepositoryImpl';
import type { ProductionBatch } from '@/src/domain/entities/ProductionBatch';

interface BatchByIdState {
  batch: ProductionBatch | null;
  isLoading: boolean;
  error: string | null;
}

export function useBatchById(companyId: string | undefined, batchId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<BatchByIdState>({
    batch: null,
    isLoading: true,
    error: null,
  });

  const fetchBatch = useCallback(async (): Promise<ProductionBatch | null> => {
    if (!session || !isAuthenticated || !companyId || !batchId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new ProductionBatchRepositoryImpl(token);

    return repo.getById(companyId, batchId);
  }, [session, isAuthenticated, companyId, batchId]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId || !batchId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await fetchBatch();
        setState({ batch: result, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar el lote';
        setState({ batch: null, isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, batchId, fetchBatch]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  return { ...state, refetch };
}
