'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { BalancePointRepositoryImpl } from '@/src/infrastructure/repositories/BalancePointRepositoryImpl';
import type { BreakEvenProduct } from '@/src/domain/repositories/IBalancePointRepository';

interface BalancePointProductState {
  data: BreakEvenProduct | null;
  isLoading: boolean;
  error: string | null;
}

export function useBalancePointProduct(itemId: string | undefined, companyId: string | undefined, startDate: string, endDate: string) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<BalancePointProductState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchProduct = useCallback(async (): Promise<BreakEvenProduct | null> => {
    if (!session || !isAuthenticated || !companyId || !itemId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new BalancePointRepositoryImpl(token);

    return repo.getProduct(itemId, companyId, startDate, endDate);
  }, [session, isAuthenticated, companyId, itemId, startDate, endDate]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId || !itemId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await fetchProduct();
        setState({ data, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar punto de equilibrio del producto';
        setState({ data: null, isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, itemId, fetchProduct]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  return { ...state, refetch };
}
