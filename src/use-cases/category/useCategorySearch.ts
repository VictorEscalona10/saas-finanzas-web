'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { CategoryRepositoryImpl } from '@/src/infrastructure/repositories/CategoryRepositoryImpl';
import type { FuzzySearchResult } from '@/src/domain/entities/FuzzySearch';
import type { Category } from '@/src/domain/entities/Category';

interface CategorySearchState {
  result: FuzzySearchResult<Category> | null;
  loading: boolean;
  error: string | null;
}

export function useCategorySearch() {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<CategorySearchState>({ result: null, loading: false, error: null });

  const searchCategory = useCallback(async (name: string, companyId: string): Promise<FuzzySearchResult<Category> | null> => {
    if (!session || !isAuthenticated) {
      setState({ result: null, loading: false, error: 'No autenticado' });
      return null;
    }

    if (!name.trim()) {
      setState({ result: null, loading: false, error: null });
      return null;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new CategoryRepositoryImpl(token);

    setState({ result: null, loading: true, error: null });

    try {
      const result = await repo.getByName(name, companyId);
      setState({ result, loading: false, error: null });
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al buscar categorías';
      setState({ result: null, loading: false, error: message });
      return null;
    }
  }, [session, isAuthenticated]);

  return { searchCategory, ...state };
}
