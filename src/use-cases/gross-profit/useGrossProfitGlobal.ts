'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { GrossProfitRepositoryImpl } from '@/src/infrastructure/repositories/GrossProfitRepositoryImpl';
import type { GrossProfitGlobal } from '@/src/domain/repositories/IGrossProfitRepository';

interface GrossProfitGlobalState {
  data: GrossProfitGlobal | null;
  isLoading: boolean;
  error: string | null;
}

export function useGrossProfitGlobal(companyId: string | undefined, startDate: string, endDate: string) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<GrossProfitGlobalState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchGlobal = useCallback(async (): Promise<GrossProfitGlobal | null> => {
    if (!session || !isAuthenticated || !companyId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new GrossProfitRepositoryImpl(token);

    return repo.getGlobal(companyId, startDate, endDate);
  }, [session, isAuthenticated, companyId, startDate, endDate]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await fetchGlobal();
        setState({ data, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar utilidad bruta global';
        setState({ data: null, isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, fetchGlobal]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  return { ...state, refetch };
}
