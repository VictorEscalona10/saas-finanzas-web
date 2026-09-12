'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { BalancePointRepositoryImpl } from '@/src/infrastructure/repositories/BalancePointRepositoryImpl';
import type { BalancePoint } from '@/src/domain/repositories/IBalancePointRepository';

export const BALANCE_POINT_IMPORT_COLUMN_COUNT = 2;

export const BALANCE_POINT_IMPORT_COLUMN_LABELS = ['Métrica', 'Valor'];

const STATUS_LABELS: Record<string, string> = {
  negative: 'Negativo',
  safe: 'Seguro',
  at_risk: 'En riesgo',
};

function balancePointToRows(data: BalancePoint): string[][] {
  const { financialsActual, breakEven } = data;
  const usd = financialsActual.dollars;
  const bs = financialsActual.bs;

  return [
    ['Ventas Totales USD', usd.totalSales.toString()],
    ['Ventas Totales Bs', bs.totalSalesBs.toString()],
    ['Costos Variables USD', usd.totalVariableCosts.toString()],
    ['Costos Variables Bs', bs.totalVariableCostsBs.toString()],
    ['Costos Fijos USD', usd.totalFixedCosts.toString()],
    ['Costos Fijos Bs', bs.totalFixedCostsBs.toString()],
    ['Ratio Margen USD', `${(usd.globalMarginRatio * 100).toFixed(2)}%`],
    ['Ratio Margen Bs', `${(bs.globalMarginRatioBs * 100).toFixed(2)}%`],
    ['Vol. Requerido USD', breakEven.salesVolumeRequired?.toString() ?? 'N/A'],
    ['Vol. Requerido Bs', breakEven.salesVolumeRequiredBs?.toString() ?? 'N/A'],
    ['Distancia Equilibrio USD', breakEven.distanceToBreakEven?.toString() ?? 'N/A'],
    ['Distancia Equilibrio Bs', breakEven.distanceToBreakEvenBs?.toString() ?? 'N/A'],
    ['Estado Margen', STATUS_LABELS[breakEven.marginStatus] ?? breakEven.marginStatus],
    ['Estado Margen USD', STATUS_LABELS[breakEven.marginStatusUsd] ?? breakEven.marginStatusUsd],
    ['Estado Margen Bs', STATUS_LABELS[breakEven.marginStatusBs] ?? breakEven.marginStatusBs],
  ];
}

interface ImportState {
  data: BalancePoint | null;
  isLoading: boolean;
  error: string | null;
}

export function useImportBalancePoint(
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

  const fetchData = useCallback(async (): Promise<BalancePoint | null> => {
    if (!session || !isAuthenticated || !companyId || !startDate || !endDate) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new BalancePointRepositoryImpl(token);

    return repo.get(companyId, startDate, endDate);
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
          err instanceof Error ? err.message : 'Error al importar punto de equilibrio';
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
    return balancePointToRows(state.data);
  }, [state.data]);

  return { ...state, rows, refetch, canFetch };
}
