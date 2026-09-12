'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ContributionMarginRepositoryImpl } from '@/src/infrastructure/repositories/ContributionMarginRepositoryImpl';
import type { ContributionProduct } from '@/src/domain/repositories/IContributionMarginRepository';

interface ContributionBatchState {
  data: ContributionProduct | null;
  isLoading: boolean;
  error: string | null;
}

export function useContributionByBatch(batchId: string | undefined, companyId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<ContributionBatchState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchBatch = useCallback(async (): Promise<ContributionProduct | null> => {
    if (!session || !isAuthenticated || !companyId || !batchId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new ContributionMarginRepositoryImpl(token);

    return repo.getProductByBatch(batchId, companyId);
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
          err instanceof Error ? err.message : 'Error al cargar margen de contribución del lote';
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
