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

  const fetchCategories = useCallback(async () => {
    if (!session || !isAuthenticated || !companyId) return;

    const token = (session as { access_token: string }).access_token;
    const repo = new CategoryRepositoryImpl(token);

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await repo.list(companyId, page, limit);
      setState({ categories: result.data, meta: result.meta, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar categorías';
      setState({ categories: [], meta: null, isLoading: false, error: message });
    }
  }, [session, isAuthenticated, companyId, page]);

  useEffect(() => {
    if (!sessionLoading) {
      fetchCategories();
    }
  }, [sessionLoading, fetchCategories]);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return { ...state, page, limit, refetch: fetchCategories, goToPage };
}
