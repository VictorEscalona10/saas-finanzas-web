'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ProductionBatchRepositoryImpl } from '@/src/infrastructure/repositories/ProductionBatchRepositoryImpl';
import type { ProductionBatch } from '@/src/domain/entities/ProductionBatch';
import type { PaginationMeta } from '@/src/domain/entities/Pagination';

interface BatchByProductState {
  batches: ProductionBatch[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

export function useBatchByProduct(companyId: string | undefined, itemId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<BatchByProductState>({
    batches: [],
    meta: null,
    isLoading: true,
    error: null,
  });
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchBatches = useCallback(async (): Promise<{ data: ProductionBatch[]; meta: PaginationMeta } | null> => {
    if (!session || !isAuthenticated || !companyId || !itemId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new ProductionBatchRepositoryImpl(token);

    return repo.listByProduct(companyId, itemId, page, limit);
  }, [session, isAuthenticated, companyId, itemId, page]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId || !itemId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await fetchBatches();
        if (!result) return;
        setState({ batches: result.data, meta: result.meta, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar lotes del producto';
        setState({ batches: [], meta: null, isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, itemId, fetchBatches]);

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
