'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { CategoryRepositoryImpl } from '@/src/infrastructure/repositories/CategoryRepositoryImpl';
import type { CreateCategoryDto } from '@/src/domain/repositories/ICategoryRepository';
import type { Category } from '@/src/domain/entities/Category';

interface CreateCategoryState {
  loading: boolean;
  error: string | null;
}

export function useCreateCategory() {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<CreateCategoryState>({ loading: false, error: null });

  const createCategory = useCallback(async (companyId: string, data: CreateCategoryDto): Promise<Category | null> => {
    if (!session || !isAuthenticated) {
      setState({ loading: false, error: 'No autenticado' });
      return null;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new CategoryRepositoryImpl(token);

    setState({ loading: true, error: null });

    try {
      const category = await repo.create(companyId, data);
      setState({ loading: false, error: null });
      return category;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al crear categoría';
      setState({ loading: false, error: message });
      return null;
    }
  }, [session, isAuthenticated]);

  return { createCategory, ...state };
}
