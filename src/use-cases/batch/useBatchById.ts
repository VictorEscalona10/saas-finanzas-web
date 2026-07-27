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

  const fetchBatch = useCallback(async () => {
    if (!session || !isAuthenticated || !companyId || !batchId) return;

    const token = (session as { access_token: string }).access_token;
    const repo = new ProductionBatchRepositoryImpl(token);

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await repo.getById(companyId, batchId);
      setState({ batch: result, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar el lote';
      setState({ batch: null, isLoading: false, error: message });
    }
  }, [session, isAuthenticated, companyId, batchId]);

  useEffect(() => {
    if (!sessionLoading) {
      fetchBatch();
    }
  }, [sessionLoading, fetchBatch]);

  return { ...state, refetch: fetchBatch };
}
