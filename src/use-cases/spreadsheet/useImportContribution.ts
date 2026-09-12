'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ContributionMarginRepositoryImpl } from '@/src/infrastructure/repositories/ContributionMarginRepositoryImpl';
import type { ContributionGlobal } from '@/src/domain/repositories/IContributionMarginRepository';

export const CONTRIBUTION_IMPORT_COLUMN_COUNT = 8;

export const CONTRIBUTION_IMPORT_COLUMN_LABELS = [
  'Métrica',
  'Ventas Totales USD',
  'Ventas Totales Bs',
  'Costos Variables USD',
  'Costos Variables Bs',
  'Margen USD',
  'Margen Bs',
  'Ratio',
];

function contributionToRows(data: ContributionGlobal): string[][] {
  const ratioPct = (data.globalMarginRatio * 100).toFixed(2);
  const ratioBsPct = (data.globalMarginRatioBs * 100).toFixed(2);

  return [
    [
      'Global',
      data.totalSales.toString(),
      data.totalSalesBs.toString(),
      data.totalVariableCosts.toString(),
      data.totalVariableCostsBs.toString(),
      data.totalMargin.toString(),
      data.totalMarginBs.toString(),
      `${ratioPct}%`,
    ],
    [
      'Ratio Bs',
      '',
      '',
      '',
      '',
      '',
      '',
      `${ratioBsPct}%`,
    ],
  ];
}

interface ImportState {
  data: ContributionGlobal | null;
  isLoading: boolean;
  error: string | null;
}

export function useImportContribution(
  companyId: string | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<ImportState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const canFetch = !!companyId && !!startDate && !!endDate;

  const fetchData = useCallback(async (): Promise<ContributionGlobal | null> => {
    if (!session || !isAuthenticated || !companyId || !startDate || !endDate) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new ContributionMarginRepositoryImpl(token);

    return repo.getGlobal(companyId, startDate, endDate);
  }, [session, isAuthenticated, companyId, startDate, endDate]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!canFetch) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await fetchData();
        setState({ data, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al importar margen de contribución';
        setState({ data: null, isLoading: false, error: message });
      }
    })();
  }, [canFetch, fetchData]);

  useEffect(() => {
    if (!sessionLoading && canFetch) {
      void refetch();
    }
  }, [sessionLoading, canFetch, refetch]);

  const rows = useMemo(() => {
    if (!state.data) return [];
    return contributionToRows(state.data);
  }, [state.data]);

  return { ...state, rows, refetch, canFetch };
}
