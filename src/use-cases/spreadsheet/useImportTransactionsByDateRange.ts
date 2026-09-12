'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { TransactionRepositoryImpl } from '@/src/infrastructure/repositories/TransactionRepositoryImpl';
import { transactionsToSheetRows } from '@/src/use-cases/spreadsheet/useImportTransactions';

export const TRANSACTION_DATE_RANGE_COLUMN_COUNT = 7;

export const TRANSACTION_DATE_RANGE_COLUMN_LABELS = [
  'Fecha',
  'Categoría',
  'Descripción',
  'Cantidad',
  'Precio',
  'USD',
  'Tasa',
];

interface ImportState {
  transactions: import('@/src/domain/entities/Transaction').Transaction[];
  isLoading: boolean;
  error: string | null;
}

export function useImportTransactionsByDateRange(
  companyId: string | undefined,
  startDate: string | undefined,
  endDate: string | undefined,
) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<ImportState>({
    transactions: [],
    isLoading: false,
    error: null,
  });

  const canFetch = !!companyId && !!startDate && !!endDate;

  const fetchAll = useCallback(async (): Promise<import('@/src/domain/entities/Transaction').Transaction[]> => {
    if (!session || !isAuthenticated || !companyId || !startDate || !endDate) return [];

    const token = (session as { access_token: string }).access_token;
    const repo = new TransactionRepositoryImpl(token);

    return repo.getByDateRange(companyId, startDate, endDate);
  }, [session, isAuthenticated, companyId, startDate, endDate]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!canFetch) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const transactions = await fetchAll();
        setState({ transactions, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al importar transacciones por rango';
        setState({ transactions: [], isLoading: false, error: message });
      }
    })();
  }, [canFetch, fetchAll]);

  useEffect(() => {
    if (!sessionLoading && canFetch) {
      void refetch();
    }
  }, [sessionLoading, canFetch, refetch]);

  const rows = useMemo(() => transactionsToSheetRows(state.transactions), [state.transactions]);

  return { ...state, rows, refetch, canFetch };
}
