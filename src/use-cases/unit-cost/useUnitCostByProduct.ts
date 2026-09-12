'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { UnitCostRepositoryImpl } from '@/src/infrastructure/repositories/UnitCostRepositoryImpl';
import type { UnitCostResult } from '@/src/domain/repositories/IUnitCostRepository';

interface UnitCostByProductState {
  data: UnitCostResult | null;
  isLoading: boolean;
  error: string | null;
}

export function useUnitCostByProduct(itemId: string | undefined, companyId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<UnitCostByProductState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchByProduct = useCallback(async (): Promise<UnitCostResult | null> => {
    if (!session || !isAuthenticated || !companyId || !itemId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new UnitCostRepositoryImpl(token);

    return repo.getByProduct(itemId, companyId);
  }, [session, isAuthenticated, companyId, itemId]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId || !itemId) {
        setState({ data: null, isLoading: false, error: null });
        return;
      }
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await fetchByProduct();
        setState({ data, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar costo unitario por producto';
        setState({ data: null, isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, itemId, fetchByProduct]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  return { ...state, refetch };
}
