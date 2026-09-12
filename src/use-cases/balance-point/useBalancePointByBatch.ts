'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { BalancePointRepositoryImpl } from '@/src/infrastructure/repositories/BalancePointRepositoryImpl';
import type { BreakEvenBatch } from '@/src/domain/repositories/IBalancePointRepository';

interface BalancePointBatchState {
  data: BreakEvenBatch | null;
  isLoading: boolean;
  error: string | null;
}

export function useBalancePointByBatch(batchId: string | undefined, companyId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<BalancePointBatchState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchBatch = useCallback(async (): Promise<BreakEvenBatch | null> => {
    if (!session || !isAuthenticated || !companyId || !batchId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new BalancePointRepositoryImpl(token);

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
          err instanceof Error ? err.message : 'Error al cargar punto de equilibrio del lote';
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
