'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { DashboardRepositoryImpl } from '@/src/infrastructure/repositories/DashboardRepositoryImpl';
import type { DashboardResponse } from '@/src/domain/repositories/IDashboardRepository';

interface DashboardState {
  data: DashboardResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useDashboard(companyId: string, month?: string) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<DashboardState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchDashboard = useCallback(async (): Promise<DashboardResponse | null> => {
    if (!session || !isAuthenticated) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new DashboardRepositoryImpl(token);

    return repo.getDashboard(companyId, month);
  }, [session, isAuthenticated, companyId, month]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await fetchDashboard();
        setState({ data, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar dashboard';
        setState({ data: null, isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, fetchDashboard]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  return { ...state, refetch };
}
