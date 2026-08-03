'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ContributionMarginRepositoryImpl } from '@/src/infrastructure/repositories/ContributionMarginRepositoryImpl';
import type { ContributionGlobal } from '@/src/domain/repositories/IContributionMarginRepository';

interface ContributionGlobalState {
  data: ContributionGlobal | null;
  isLoading: boolean;
  error: string | null;
}

export function useContributionGlobal(companyId: string | undefined, startDate: string, endDate: string) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<ContributionGlobalState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchGlobal = useCallback(async () => {
    if (!session || !isAuthenticated || !companyId) return;

    const token = (session as { access_token: string }).access_token;
    const repo = new ContributionMarginRepositoryImpl(token);

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await repo.getGlobal(companyId, startDate, endDate);
      setState({ data, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar margen de contribución global';
      setState({ data: null, isLoading: false, error: message });
    }
  }, [session, isAuthenticated, companyId, startDate, endDate]);

  useEffect(() => {
    if (!sessionLoading) {
      fetchGlobal();
    }
  }, [sessionLoading, fetchGlobal]);

  return { ...state, refetch: fetchGlobal };
}
