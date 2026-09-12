'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { GrossProfitRepositoryImpl } from '@/src/infrastructure/repositories/GrossProfitRepositoryImpl';
import type { GrossProfitBatch } from '@/src/domain/repositories/IGrossProfitRepository';

interface GrossProfitBatchState {
  data: GrossProfitBatch | null;
  isLoading: boolean;
  error: string | null;
}

export function useGrossProfitBatch(batchId: string | undefined, companyId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<GrossProfitBatchState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchBatch = useCallback(async (): Promise<GrossProfitBatch | null> => {
    if (!session || !isAuthenticated || !companyId || !batchId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new GrossProfitRepositoryImpl(token);

    return repo.getBatch(batchId, companyId);
  }, [session, isAuthenticated, companyId, batchId]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId || !batchId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await fetchBatch();
        setState({ data, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar utilidad bruta del lote';
        setState({ data: null, isLoading: false, error: message });
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
