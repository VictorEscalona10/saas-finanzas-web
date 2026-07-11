'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ItemRepositoryImpl } from '@/src/infrastructure/repositories/ItemRepositoryImpl';

interface DeleteItemState {
  loading: boolean;
  error: string | null;
}

export function useDeleteItem() {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<DeleteItemState>({ loading: false, error: null });

  const deleteItem = useCallback(async (itemId: string, companyId: string): Promise<boolean> => {
    if (!session || !isAuthenticated) {
      setState({ loading: false, error: 'No autenticado' });
      return false;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new ItemRepositoryImpl(token);

    setState({ loading: true, error: null });

    try {
      await repo.delete(itemId, companyId);
      setState({ loading: false, error: null });
      return true;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar item';
      setState({ loading: false, error: message });
      return false;
    }
  }, [session, isAuthenticated]);

  return { deleteItem, ...state };
}
