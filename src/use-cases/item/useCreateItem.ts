'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ItemRepositoryImpl } from '@/src/infrastructure/repositories/ItemRepositoryImpl';
import type { CreateItemDto } from '@/src/domain/repositories/IItemRepository';

interface CreateItemState {
  loading: boolean;
  error: string | null;
}

export function useCreateItem() {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<CreateItemState>({ loading: false, error: null });

  const createItems = useCallback(async (companyId: string, items: CreateItemDto[]): Promise<{ count: number } | null> => {
    if (!session || !isAuthenticated) {
      setState({ loading: false, error: 'No autenticado' });
      return null;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new ItemRepositoryImpl(token);

    setState({ loading: true, error: null });

    try {
      const result = await repo.batchCreate(companyId, items);
      setState({ loading: false, error: null });
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al crear items';
      setState({ loading: false, error: message });
      return null;
    }
  }, [session, isAuthenticated]);

  return { createItems, ...state };
}
