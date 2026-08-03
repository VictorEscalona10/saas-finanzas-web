'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ContributionMarginRepositoryImpl } from '@/src/infrastructure/repositories/ContributionMarginRepositoryImpl';
import type { ContributionTrendPoint } from '@/src/domain/repositories/IContributionMarginRepository';

interface ContributionTrendState {
  data: ContributionTrendPoint[];
  isLoading: boolean;
  error: string | null;
}

export function useContributionTrend(companyId: string | undefined, startDate: string, endDate: string) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<ContributionTrendState>({
    data: [],
    isLoading: true,
    error: null,
  });

  const fetchTrend = useCallback(async () => {
    if (!session || !isAuthenticated || !companyId) return;

    const token = (session as { access_token: string }).access_token;
    const repo = new ContributionMarginRepositoryImpl(token);

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await repo.getTrend(companyId, startDate, endDate);
      setState({ data, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar tendencia de margen de contribución';
      setState({ data: [], isLoading: false, error: message });
    }
  }, [session, isAuthenticated, companyId, startDate, endDate]);

  useEffect(() => {
    if (!sessionLoading) {
      fetchTrend();
    }
  }, [sessionLoading, fetchTrend]);

  return { ...state, refetch: fetchTrend };
}
