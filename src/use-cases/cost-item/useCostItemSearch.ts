'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { CostItemRepositoryImpl } from '@/src/infrastructure/repositories/CostItemRepositoryImpl';
import type { FuzzySearchResult } from '@/src/domain/entities/FuzzySearch';
import type { CostItem } from '@/src/domain/entities/CostItem';

interface CostItemSearchState {
  result: FuzzySearchResult<CostItem> | null;
  loading: boolean;
  error: string | null;
}

export function useCostItemSearch() {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<CostItemSearchState>({ result: null, loading: false, error: null });

  const searchCostItem = useCallback(async (name: string, companyId: string): Promise<FuzzySearchResult<CostItem> | null> => {
    if (!session || !isAuthenticated) {
      setState({ result: null, loading: false, error: 'No autenticado' });
      return null;
    }

    if (!name.trim()) {
      setState({ result: null, loading: false, error: null });
      return null;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new CostItemRepositoryImpl(token);

    setState({ result: null, loading: true, error: null });

    try {
      const result = await repo.getByName(name, companyId);
      setState({ result, loading: false, error: null });
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al buscar cost items';
      setState({ result: null, loading: false, error: message });
      return null;
    }
  }, [session, isAuthenticated]);

  const listCostItems = useCallback(async (companyId: string): Promise<FuzzySearchResult<CostItem> | null> => {
    if (!session || !isAuthenticated) {
      setState({ result: null, loading: false, error: 'No autenticado' });
      return null;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new CostItemRepositoryImpl(token);

    setState({ result: null, loading: true, error: null });

    try {
      const paginated = await repo.list(companyId, 1, 200);
      const result: FuzzySearchResult<CostItem> = {
        success: true,
        dataSource: 'prisma',
        searchTerm: '',
        count: paginated.data.length,
        items: paginated.data,
      };
      setState({ result, loading: false, error: null });
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al listar cost items';
      setState({ result: null, loading: false, error: message });
      return null;
    }
  }, [session, isAuthenticated]);

  return { searchCostItem, listCostItems, ...state };
}
