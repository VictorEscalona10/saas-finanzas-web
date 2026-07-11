'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ItemRepositoryImpl } from '@/src/infrastructure/repositories/ItemRepositoryImpl';
import type { Item, ItemType } from '@/src/domain/entities/Item';
import type { PaginationMeta } from '@/src/domain/entities/Pagination';

export type ItemTypeFilter = ItemType | 'all';

interface ItemListState {
  items: Item[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

export function useItemList(companyId: string | undefined, typeFilter: ItemTypeFilter = 'all') {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<ItemListState>({
    items: [],
    meta: null,
    isLoading: true,
    error: null,
  });
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchItems = useCallback(async () => {
    if (!session || !isAuthenticated || !companyId) return;

    const token = (session as { access_token: string }).access_token;
    const repo = new ItemRepositoryImpl(token);

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      let result;
      if (typeFilter === 'PRODUCT') {
        result = await repo.listProducts(companyId, page, limit);
      } else if (typeFilter === 'SERVICE') {
        result = await repo.listServices(companyId, page, limit);
      } else {
        result = await repo.list(companyId, page, limit);
      }
      setState({ items: result.data, meta: result.meta, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar items';
      setState({ items: [], meta: null, isLoading: false, error: message });
    }
  }, [session, isAuthenticated, companyId, page, typeFilter]);

  useEffect(() => {
    if (!sessionLoading) {
      fetchItems();
    }
  }, [sessionLoading, fetchItems]);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return { ...state, page, limit, refetch: fetchItems, goToPage };
}
