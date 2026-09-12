'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { TransactionRepositoryImpl } from '@/src/infrastructure/repositories/TransactionRepositoryImpl';
import type { Transaction } from '@/src/domain/entities/Transaction';
import { parseISODate, formatForDisplay } from '@/src/shared/utils/dateUtils';

const PAGE_SIZE = 100;

export const TRANSACTION_IMPORT_COLUMN_COUNT = 7;

export const TRANSACTION_IMPORT_COLUMN_LABELS = [
  'Fecha',
  'Categoría',
  'Descripción',
  'Cantidad',
  'Precio',
  'USD',
  'Tasa',
];

export function transactionToSheetRow(transaction: Transaction): string[] {
  let date = '';
  if (transaction.paymentDate) {
    const parsed = parseISODate(transaction.paymentDate);
    date = parsed ? formatForDisplay(parsed) : '';
  }

  return [
    date,
    transaction.category?.name ?? '',
    transaction.description ?? '',
    transaction.quantity?.toString() ?? '',
    transaction.unitPrice?.toString() ?? '',
    transaction.amountUSD.toString(),
    transaction.dollarRate.toString(),
  ];
}

export function transactionsToSheetRows(
  transactions: Transaction[]
): string[][] {
  return transactions
    .slice()
    .sort((a, b) => {
      const aTime = a.paymentDate ? parseISODate(a.paymentDate)?.getTime() ?? 0 : 0;
      const bTime = b.paymentDate ? parseISODate(b.paymentDate)?.getTime() ?? 0 : 0;
      return aTime - bTime;
    })
    .map(transactionToSheetRow);
}

interface ImportState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

export function useImportTransactions(companyId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<ImportState>({
    transactions: [],
    isLoading: true,
    error: null,
  });

  const fetchAll = useCallback(async (): Promise<Transaction[]> => {
    if (!session || !isAuthenticated || !companyId) return [];

    const token = (session as { access_token: string }).access_token;
    const repo = new TransactionRepositoryImpl(token);

    const all: Transaction[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const result = await repo.list(companyId, page, PAGE_SIZE);
      all.push(...result.data);
      totalPages = result.meta.totalPages;
      page += 1;
    } while (page <= totalPages);

    return all;
  }, [session, isAuthenticated, companyId]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const transactions = await fetchAll();
        setState({ transactions, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al importar transacciones';
        setState({ transactions: [], isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, fetchAll]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  const rows = useMemo(() => transactionsToSheetRows(state.transactions), [state.transactions]);

  return { ...state, rows, refetch };
}