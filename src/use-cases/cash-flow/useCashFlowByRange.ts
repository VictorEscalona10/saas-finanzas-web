'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { CashFlowRepositoryImpl } from '@/src/infrastructure/repositories/CashFlowRepositoryImpl';
import type { DetailedCashFlow } from '@/src/domain/repositories/ICashFlowRepository';

interface CashFlowRangeState {
  data: DetailedCashFlow | null;
  isLoading: boolean;
  error: string | null;
}

export function useCashFlowByRange(companyId: string | undefined, startDate: string, endDate: string) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<CashFlowRangeState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchByRange = useCallback(async () => {
    if (!session || !isAuthenticated || !companyId || !startDate || !endDate) return;

    const token = (session as { access_token: string }).access_token;
    const repo = new CashFlowRepositoryImpl(token);

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await repo.getByRange(companyId, startDate, endDate);
      setState({ data, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar flujo de caja por rango';
      setState({ data: null, isLoading: false, error: message });
    }
  }, [session, isAuthenticated, companyId, startDate, endDate]);

  useEffect(() => {
    if (!sessionLoading) {
      fetchByRange();
    }
  }, [sessionLoading, fetchByRange]);

  return { ...state, refetch: fetchByRange };
}