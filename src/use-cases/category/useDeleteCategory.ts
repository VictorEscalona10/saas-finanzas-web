'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { CategoryRepositoryImpl } from '@/src/infrastructure/repositories/CategoryRepositoryImpl';

interface DeleteCategoryState {
  loading: boolean;
  error: string | null;
}

export function useDeleteCategory() {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<DeleteCategoryState>({ loading: false, error: null });

  const deleteCategory = useCallback(async (companyId: string, categoryId: string): Promise<boolean> => {
    if (!session || !isAuthenticated) {
      setState({ loading: false, error: 'No autenticado' });
      return false;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new CategoryRepositoryImpl(token);

    setState({ loading: true, error: null });

    try {
      await repo.delete(companyId, categoryId);
      setState({ loading: false, error: null });
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar categoría';
      setState({ loading: false, error: message });
      return false;
    }
  }, [session, isAuthenticated]);

  return { deleteCategory, ...state };
}
