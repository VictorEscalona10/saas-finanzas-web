'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { NetProfitRepositoryImpl } from '@/src/infrastructure/repositories/NetProfitRepositoryImpl';
import type { ProfitLossReport } from '@/src/domain/repositories/INetProfitRepository';

interface NetProfitStatementState {
  data: ProfitLossReport | null;
  isLoading: boolean;
  error: string | null;
}

export function useNetProfitStatement(companyId: string | undefined, startDate: string, endDate: string) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<NetProfitStatementState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchStatement = useCallback(async (): Promise<ProfitLossReport | null> => {
    if (!session || !isAuthenticated || !companyId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new NetProfitRepositoryImpl(token);

    return repo.getStatement(companyId, startDate, endDate);
  }, [session, isAuthenticated, companyId, startDate, endDate]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await fetchStatement();
        setState({ data, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar estado de resultados';
        setState({ data: null, isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, fetchStatement]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  return { ...state, refetch };
}
