'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ItemRepositoryImpl } from '@/src/infrastructure/repositories/ItemRepositoryImpl';
import type { Item } from '@/src/domain/entities/Item';

const PAGE_SIZE = 100;

export const ITEM_IMPORT_COLUMN_COUNT = 5;

export const ITEM_IMPORT_COLUMN_LABELS = ['Nombre', 'Tipo', 'Precio', 'Cantidad', 'Tasa'];

export function itemToSheetRow(item: Item): string[] {
  return [
    item.name,
    item.type === 'PRODUCT' ? 'Producto' : 'Servicio',
    item.basePrice.toString(),
    item.stockCurrent.toString(),
    '',
  ];
}

export function itemsToSheetRows(items: Item[]): string[][] {
  return items
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
    .map(itemToSheetRow);
}

interface ImportState {
  items: Item[];
  isLoading: boolean;
  error: string | null;
}

export function useImportItems(companyId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<ImportState>({
    items: [],
    isLoading: true,
    error: null,
  });

  const fetchAll = useCallback(async (): Promise<Item[]> => {
    if (!session || !isAuthenticated || !companyId) return [];

    const token = (session as { access_token: string }).access_token;
    const repo = new ItemRepositoryImpl(token);

    const all: Item[] = [];
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
        const items = await fetchAll();
        setState({ items, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al importar items';
        setState({ items: [], isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, fetchAll]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  const rows = useMemo(() => itemsToSheetRows(state.items), [state.items]);

  return { ...state, rows, refetch };
}