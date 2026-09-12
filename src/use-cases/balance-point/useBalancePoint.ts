'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { BalancePointRepositoryImpl } from '@/src/infrastructure/repositories/BalancePointRepositoryImpl';
import type { BalancePoint } from '@/src/domain/repositories/IBalancePointRepository';

interface BalancePointState {
  data: BalancePoint | null;
  isLoading: boolean;
  error: string | null;
}

export function useBalancePoint(companyId: string | undefined, startDate: string, endDate: string) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<BalancePointState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchBalancePoint = useCallback(async (): Promise<BalancePoint | null> => {
    if (!session || !isAuthenticated || !companyId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new BalancePointRepositoryImpl(token);

    return repo.get(companyId, startDate, endDate);
  }, [session, isAuthenticated, companyId, startDate, endDate]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await fetchBalancePoint();
        setState({ data, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar el punto de equilibrio';
        setState({ data: null, isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, fetchBalancePoint]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  return { ...state, refetch };
}