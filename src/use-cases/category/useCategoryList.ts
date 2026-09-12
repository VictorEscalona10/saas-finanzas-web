'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { CategoryRepositoryImpl } from '@/src/infrastructure/repositories/CategoryRepositoryImpl';
import type { Category } from '@/src/domain/entities/Category';
import type { PaginationMeta } from '@/src/domain/entities/Pagination';

interface CategoryListState {
  categories: Category[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

export function useCategoryList(companyId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<CategoryListState>({
    categories: [],
    meta: null,
    isLoading: true,
    error: null,
  });
  const [page, setPage] = useState(1);
  const limit = 50;

  const fetchCategories = useCallback(async (): Promise<{ data: Category[]; meta: PaginationMeta } | null> => {
    if (!session || !isAuthenticated || !companyId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new CategoryRepositoryImpl(token);

    return repo.list(companyId, page, limit);
  }, [session, isAuthenticated, companyId, page]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await fetchCategories();
        if (!result) return;
        setState({ categories: result.data, meta: result.meta, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar categorías';
        setState({ categories: [], meta: null, isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, fetchCategories]);

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
