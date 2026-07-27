'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ProductionBatchRepositoryImpl } from '@/src/infrastructure/repositories/ProductionBatchRepositoryImpl';
import type { UpdateBatchDto } from '@/src/domain/repositories/IProductionBatchRepository';
import type { ProductionBatch } from '@/src/domain/entities/ProductionBatch';

interface UpdateBatchState {
  loading: boolean;
  error: string | null;
}

export function useUpdateBatch() {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<UpdateBatchState>({ loading: false, error: null });

  const updateBatch = useCallback(async (
    companyId: string,
    batchId: string,
    dto: UpdateBatchDto,
  ): Promise<ProductionBatch | null> => {
    if (!session || !isAuthenticated) {
      setState({ loading: false, error: 'No autenticado' });
      return null;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new ProductionBatchRepositoryImpl(token);

    setState({ loading: true, error: null });

    try {
      const batch = await repo.update(companyId, batchId, dto);
      setState({ loading: false, error: null });
      return batch;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al actualizar lote de producción';
      setState({ loading: false, error: message });
      return null;
    }
  }, [session, isAuthenticated]);

  return { updateBatch, ...state };
}
