'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { CashFlowRepositoryImpl } from '@/src/infrastructure/repositories/CashFlowRepositoryImpl';
import type { DetailedCashFlow } from '@/src/domain/repositories/ICashFlowRepository';

export const CASHFLOW_IMPORT_COLUMN_COUNT = 4;

export const CASHFLOW_IMPORT_COLUMN_LABELS = ['Sección', 'Categoría', 'Monto USD', 'Monto Bs'];

interface CashFlowRow {
  section: string;
  category: string;
  amountUsd: number;
  amountBs: number;
}

function cashFlowToRows(data: DetailedCashFlow): CashFlowRow[] {
  const rows: CashFlowRow[] = [];

  const sections = [
    { key: 'operating' as const, label: 'Operación' },
    { key: 'investing' as const, label: 'Inversión' },
    { key: 'financing' as const, label: 'Financiamiento' },
  ];

  for (const section of sections) {
    const usdStatement = data.usd?.cash_flow_statement?.[section.key];
    const bsStatement = data.bs?.cash_flow_statement?.[section.key];

    const categoryMap = new Map<string, { usd: number; bs: number }>();

    if (usdStatement?.categories) {
      for (const cat of usdStatement.categories) {
        categoryMap.set(cat.name, { usd: cat.amount, bs: 0 });
      }
    }

    if (bsStatement?.categories) {
      for (const cat of bsStatement.categories) {
        const existing = categoryMap.get(cat.name) ?? { usd: 0, bs: 0 };
        existing.bs = cat.amount;
        categoryMap.set(cat.name, existing);
      }
    }

    for (const [name, amounts] of categoryMap) {
      rows.push({
        section: section.label,
        category: name,
        amountUsd: amounts.usd,
        amountBs: amounts.bs,
      });
    }
  }

  const summaryUsd = data.usd?.summary;
  const summaryBs = data.bs?.summary;

  if (summaryUsd || summaryBs) {
    rows.push({
      section: 'Resumen',
      category: 'Saldo actual',
      amountUsd: summaryUsd?.current_balance ?? 0,
      amountBs: summaryBs?.current_balance ?? 0,
    });
    rows.push({
      section: 'Resumen',
      category: 'Flujo neto',
      amountUsd: summaryUsd?.net_cash_flow ?? 0,
      amountBs: summaryBs?.net_cash_flow ?? 0,
    });
    rows.push({
      section: 'Resumen',
      category: 'Ingreso pendiente',
      amountUsd: summaryUsd?.pending_inflow ?? 0,
      amountBs: summaryBs?.pending_inflow ?? 0,
    });
    rows.push({
      section: 'Resumen',
      category: 'Egreso pendiente',
      amountUsd: summaryUsd?.pending_outflow ?? 0,
      amountBs: summaryBs?.pending_outflow ?? 0,
    });
  }

  return rows;
}

function rowToSheetRow(row: CashFlowRow): string[] {
  return [
    row.section,
    row.category,
    row.amountUsd.toString(),
    row.amountBs.toString(),
  ];
}

interface ImportState {
  data: DetailedCashFlow | null;
  isLoading: boolean;
  error: string | null;
}

export function useImportCashFlow(
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

  const fetchData = useCallback(async (): Promise<DetailedCashFlow | null> => {
    if (!session || !isAuthenticated || !companyId || !startDate || !endDate) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new CashFlowRepositoryImpl(token);

    return repo.getByRange(companyId, startDate, endDate);
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
          err instanceof Error ? err.message : 'Error al importar flujo de caja';
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
    return cashFlowToRows(state.data).map(rowToSheetRow);
  }, [state.data]);

  return { ...state, rows, refetch, canFetch };
}
