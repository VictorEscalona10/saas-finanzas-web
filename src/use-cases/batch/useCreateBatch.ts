'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ProductionBatchRepositoryImpl } from '@/src/infrastructure/repositories/ProductionBatchRepositoryImpl';
import type { CreateBatchDto } from '@/src/domain/repositories/IProductionBatchRepository';
import type { ProductionBatch } from '@/src/domain/entities/ProductionBatch';

interface CreateBatchState {
  loading: boolean;
  error: string | null;
}

export function useCreateBatch() {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<CreateBatchState>({ loading: false, error: null });

  const createBatch = useCallback(async (
    companyId: string,
    itemId: string,
    dto: CreateBatchDto,
  ): Promise<ProductionBatch | null> => {
    if (!session || !isAuthenticated) {
      setState({ loading: false, error: 'No autenticado' });
      return null;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new ProductionBatchRepositoryImpl(token);

    setState({ loading: true, error: null });

    try {
      const batch = await repo.create(companyId, itemId, dto);
      setState({ loading: false, error: null });
      return batch;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al crear lote de producción';
      setState({ loading: false, error: message });
      return null;
    }
  }, [session, isAuthenticated]);

  return { createBatch, ...state };
}
