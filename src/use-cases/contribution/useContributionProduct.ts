'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ContributionMarginRepositoryImpl } from '@/src/infrastructure/repositories/ContributionMarginRepositoryImpl';
import type { ContributionProduct } from '@/src/domain/repositories/IContributionMarginRepository';

interface ContributionProductState {
  data: ContributionProduct | null;
  isLoading: boolean;
  error: string | null;
}

export function useContributionProduct(itemId: string | undefined, companyId: string | undefined, startDate: string, endDate: string) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<ContributionProductState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchProduct = useCallback(async () => {
    if (!session || !isAuthenticated || !companyId || !itemId) return;

    const token = (session as { access_token: string }).access_token;
    const repo = new ContributionMarginRepositoryImpl(token);

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await repo.getProductGlobal(itemId, companyId, startDate, endDate);
      setState({ data, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar margen de contribución del producto';
      setState({ data: null, isLoading: false, error: message });
    }
  }, [session, isAuthenticated, companyId, itemId, startDate, endDate]);

  useEffect(() => {
    if (!sessionLoading) {
      fetchProduct();
    }
  }, [sessionLoading, fetchProduct]);

  return { ...state, refetch: fetchProduct };
}
