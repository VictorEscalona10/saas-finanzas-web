'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { CashFlowRepositoryImpl } from '@/src/infrastructure/repositories/CashFlowRepositoryImpl';
import type { TotalCashFlow } from '@/src/domain/repositories/ICashFlowRepository';

interface CashFlowTotalState {
  data: TotalCashFlow | null;
  isLoading: boolean;
  error: string | null;
}

export function useCashFlowTotal(companyId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<CashFlowTotalState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchTotal = useCallback(async (): Promise<TotalCashFlow | null> => {
    if (!session || !isAuthenticated || !companyId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new CashFlowRepositoryImpl(token);

    return repo.getTotal(companyId);
  }, [session, isAuthenticated, companyId]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await fetchTotal();
        setState({ data, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar flujo de caja';
        setState({ data: null, isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, fetchTotal]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  return { ...state, refetch };
}