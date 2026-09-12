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

export function useItemList(companyId: string | undefined, typeFilter: ItemTypeFilter = 'all', search: string = '') {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<ItemListState>({
    items: [],
    meta: null,
    isLoading: true,
    error: null,
  });
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchItems = useCallback(async (): Promise<{ data: Item[]; meta: PaginationMeta | null } | null> => {
    if (!session || !isAuthenticated || !companyId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new ItemRepositoryImpl(token);

    if (search.trim()) {
      const fuzzy = await repo.getByName(search.trim(), companyId);
      return { data: fuzzy.items, meta: null };
    }
    if (typeFilter === 'PRODUCT') {
      return repo.listProducts(companyId, page, limit);
    }
    if (typeFilter === 'SERVICE') {
      return repo.listServices(companyId, page, limit);
    }
    return repo.list(companyId, page, limit);
  }, [session, isAuthenticated, companyId, page, typeFilter, search]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await fetchItems();
        if (!result) return;
        setState({ items: result.data, meta: result.meta, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar items';
        setState({ items: [], meta: null, isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, fetchItems]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
  }, []);

  return { ...state, page, limit, refetch, goToPage };
}
