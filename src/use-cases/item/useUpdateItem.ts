'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ItemRepositoryImpl } from '@/src/infrastructure/repositories/ItemRepositoryImpl';
import type { UpdateItemDto } from '@/src/domain/repositories/IItemRepository';
import type { Item } from '@/src/domain/entities/Item';

interface UpdateItemState {
  loading: boolean;
  error: string | null;
}

export function useUpdateItem() {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<UpdateItemState>({ loading: false, error: null });

  const updateItem = useCallback(async (itemId: string, companyId: string, data: UpdateItemDto): Promise<Item | null> => {
    if (!session || !isAuthenticated) {
      setState({ loading: false, error: 'No autenticado' });
      return null;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new ItemRepositoryImpl(token);

    setState({ loading: true, error: null });

    try {
      const item = await repo.update(itemId, companyId, data);
      setState({ loading: false, error: null });
      return item;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al actualizar item';
      setState({ loading: false, error: message });
      return null;
    }
  }, [session, isAuthenticated]);

  return { updateItem, ...state };
}
