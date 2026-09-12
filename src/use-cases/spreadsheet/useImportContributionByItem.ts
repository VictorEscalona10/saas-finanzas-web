'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ContributionMarginRepositoryImpl } from '@/src/infrastructure/repositories/ContributionMarginRepositoryImpl';
import type { ContributionProduct } from '@/src/domain/repositories/IContributionMarginRepository';

export const CONTRIBUTION_ITEM_IMPORT_COLUMN_COUNT = 8;

export const CONTRIBUTION_ITEM_IMPORT_COLUMN_LABELS = [
  'Métrica',
  'Ingreso Total USD',
  'Ingreso Total Bs',
  'Costo Var. USD',
  'Costo Var. Bs',
  'Margen USD',
  'Margen Bs',
  'Unidades Vendidas',
];

function contributionItemToRows(data: ContributionProduct): string[][] {
  const { financials, unitAnalysis, totalUnitsSold } = data;
  const ratioPct = (financials.contributionMarginRatio * 100).toFixed(2);

  return [
    [
      `${data.itemName} (${data.itemType})`,
      financials.totalInflow.toString(),
      financials.totalInflowBs.toString(),
      financials.totalVariableCost.toString(),
      financials.totalVariableCostBs.toString(),
      financials.contributionMargin.toString(),
      financials.contributionMarginBs.toString(),
      totalUnitsSold.toString(),
    ],
    [
      'Ratio',
      '',
      '',
      '',
      '',
      '',
      '',
      `${ratioPct}%`,
    ],
    [
      'Unitario',
      unitAnalysis.unitInflow.toString(),
      unitAnalysis.unitInflowBs.toString(),
      unitAnalysis.unitVariableCost.toString(),
      unitAnalysis.unitVariableCostBs.toString(),
      unitAnalysis.unitContributionMargin.toString(),
      unitAnalysis.unitContributionMarginBs.toString(),
      '',
    ],
  ];
}

interface ImportState {
  data: ContributionProduct | null;
  isLoading: boolean;
  error: string | null;
}

export function useImportContributionByItem(
  itemId: string | undefined,
  companyId: string | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
  itemType: 'product' | 'service' = 'product',
) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<ImportState>({
    data: null,
    isLoading: false,
    error: null,
  });

  const canFetch = !!itemId && !!companyId && !!startDate && !!endDate;

  const fetchData = useCallback(async (): Promise<ContributionProduct | null> => {
    if (!session || !isAuthenticated || !companyId || !itemId || !startDate || !endDate) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new ContributionMarginRepositoryImpl(token);

    if (itemType === 'service') {
      return repo.getService(itemId, companyId, startDate, endDate);
    }
    return repo.getProductGlobal(itemId, companyId, startDate, endDate);
  }, [session, isAuthenticated, companyId, itemId, startDate, endDate, itemType]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!canFetch) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const data = await fetchData();
        setState({ data, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al importar margen del producto';
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
    return contributionItemToRows(state.data);
  }, [state.data]);

  return { ...state, rows, refetch, canFetch };
}
