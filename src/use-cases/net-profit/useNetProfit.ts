'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { NetProfitRepositoryImpl } from '@/src/infrastructure/repositories/NetProfitRepositoryImpl';
import type { NetProfitSummary } from '@/src/domain/repositories/INetProfitRepository';

interface NetProfitState {
  data: NetProfitSummary | null;
  isLoading: boolean;
  error: string | null;
}

export function useNetProfit(companyId: string | undefined, startDate: string, endDate: string) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<NetProfitState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchNetProfit = useCallback(async (): Promise<NetProfitSummary | null> => {
    if (!session || !isAuthenticated || !companyId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new NetProfitRepositoryImpl(token);

    return repo.get(companyId, startDate, endDate);
  }, [session, isAuthenticated, companyId, startDate, endDate]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await fetchNetProfit();
        setState({ data, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar utilidad neta';
        setState({ data: null, isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, fetchNetProfit]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  return { ...state, refetch };
}
