'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ProductionBatchRepositoryImpl } from '@/src/infrastructure/repositories/ProductionBatchRepositoryImpl';
import type { ProductionBatch } from '@/src/domain/entities/ProductionBatch';
import { parseISODate, formatForDisplay } from '@/src/shared/utils/dateUtils';

const PAGE_SIZE = 100;

export const BATCH_IMPORT_COLUMN_COUNT = 5;

export const BATCH_IMPORT_COLUMN_LABELS = ['Producto', 'Cantidad', 'Estado', 'Fecha', 'ID'];

function batchToSheetRow(batch: ProductionBatch): string[] {
  let date = '';
  if (batch.batchDate) {
    const parsed = parseISODate(batch.batchDate);
    date = parsed ? formatForDisplay(parsed) : '';
  }

  return [
    batch.item?.name ?? '',
    batch.quantity.toString(),
    batch.status === 'OPEN' ? 'Abierto' : 'Cerrado',
    date,
    batch.id,
  ];
}

interface ImportState {
  batches: ProductionBatch[];
  isLoading: boolean;
  error: string | null;
}

export function useImportBatches(companyId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<ImportState>({
    batches: [],
    isLoading: true,
    error: null,
  });

  const fetchAll = useCallback(async (): Promise<ProductionBatch[]> => {
    if (!session || !isAuthenticated || !companyId) return [];

    const token = (session as { access_token: string }).access_token;
    const repo = new ProductionBatchRepositoryImpl(token);

    const all: ProductionBatch[] = [];
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
        const batches = await fetchAll();
        setState({ batches, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al importar lotes';
        setState({ batches: [], isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, fetchAll]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  const rows = useMemo(
    () => state.batches.map(batchToSheetRow),
    [state.batches],
  );

  return { ...state, rows, refetch };
}
