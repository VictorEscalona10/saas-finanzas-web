'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { CategoryRepositoryImpl } from '@/src/infrastructure/repositories/CategoryRepositoryImpl';
import type { UpdateCategoryDto } from '@/src/domain/repositories/ICategoryRepository';
import type { Category } from '@/src/domain/entities/Category';

interface UpdateCategoryState {
  loading: boolean;
  error: string | null;
}

export function useUpdateCategory() {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<UpdateCategoryState>({ loading: false, error: null });

  const updateCategory = useCallback(async (companyId: string, categoryId: string, data: UpdateCategoryDto): Promise<Category | null> => {
    if (!session || !isAuthenticated) {
      setState({ loading: false, error: 'No autenticado' });
      return null;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new CategoryRepositoryImpl(token);

    setState({ loading: true, error: null });

    try {
      const category = await repo.update(companyId, categoryId, data);
      setState({ loading: false, error: null });
      return category;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al actualizar categoría';
      setState({ loading: false, error: message });
      return null;
    }
  }, [session, isAuthenticated]);

  return { updateCategory, ...state };
}
