'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { CategoryRepositoryImpl } from '@/src/infrastructure/repositories/CategoryRepositoryImpl';
import type { Category } from '@/src/domain/entities/Category';

interface CategoryState {
  category: Category | null;
  isLoading: boolean;
  error: string | null;
}

export function useCategoryById(companyId: string | undefined, categoryId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<CategoryState>({
    category: null,
    isLoading: true,
    error: null,
  });

  const fetchCategory = useCallback(async (): Promise<Category | null> => {
    if (!session || !isAuthenticated || !companyId || !categoryId) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new CategoryRepositoryImpl(token);

    return repo.getById(companyId, categoryId);
  }, [session, isAuthenticated, companyId, categoryId]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId || !categoryId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const category = await fetchCategory();
        setState({ category, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar categoría';
        setState({ category: null, isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, categoryId, fetchCategory]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  return { ...state, refetch };
}
