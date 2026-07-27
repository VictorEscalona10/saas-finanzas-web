'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ProductionBatchRepositoryImpl } from '@/src/infrastructure/repositories/ProductionBatchRepositoryImpl';
import type { ProductionBatch } from '@/src/domain/entities/ProductionBatch';
import type { PaginationMeta } from '@/src/domain/entities/Pagination';

interface BatchListState {
  batches: ProductionBatch[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

export function useBatchList(companyId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<BatchListState>({
    batches: [],
    meta: null,
    isLoading: true,
    error: null,
  });
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchBatches = useCallback(async () => {
    if (!session || !isAuthenticated || !companyId) return;

    const token = (session as { access_token: string }).access_token;
    const repo = new ProductionBatchRepositoryImpl(token);

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await repo.list(companyId, page, limit);
      setState({ batches: result.data, meta: result.meta, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar lotes de producción';
      setState({ batches: [], meta: null, isLoading: false, error: message });
    }
  }, [session, isAuthenticated, companyId, page]);

  useEffect(() => {
    if (!sessionLoading) {
      fetchBatches();
    }
  }, [sessionLoading, fetchBatches]);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return { ...state, page, limit, refetch: fetchBatches, goToPage };
}
