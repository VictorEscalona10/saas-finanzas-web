'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { ItemRepositoryImpl } from '@/src/infrastructure/repositories/ItemRepositoryImpl';
import type { FuzzySearchResult } from '@/src/domain/entities/FuzzySearch';
import type { Item } from '@/src/domain/entities/Item';

interface ItemSearchState {
  result: FuzzySearchResult<Item> | null;
  loading: boolean;
  error: string | null;
}

export function useItemSearch() {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<ItemSearchState>({ result: null, loading: false, error: null });

  const searchItem = useCallback(async (name: string, companyId: string): Promise<FuzzySearchResult<Item> | null> => {
    if (!session || !isAuthenticated) {
      setState({ result: null, loading: false, error: 'No autenticado' });
      return null;
    }

    if (!name.trim()) {
      setState({ result: null, loading: false, error: null });
      return null;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new ItemRepositoryImpl(token);

    setState({ result: null, loading: true, error: null });

    try {
      const result = await repo.getByName(name, companyId);
      setState({ result, loading: false, error: null });
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al buscar items';
      setState({ result: null, loading: false, error: message });
      return null;
    }
  }, [session, isAuthenticated]);

  const listItems = useCallback(async (companyId: string): Promise<FuzzySearchResult<Item> | null> => {
    if (!session || !isAuthenticated) {
      setState({ result: null, loading: false, error: 'No autenticado' });
      return null;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new ItemRepositoryImpl(token);

    setState({ result: null, loading: true, error: null });

    try {
      const paginated = await repo.list(companyId, 1, 200);
      const result: FuzzySearchResult<Item> = {
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
        err instanceof Error ? err.message : 'Error al listar items';
      setState({ result: null, loading: false, error: message });
      return null;
    }
  }, [session, isAuthenticated]);

  const listProducts = useCallback(async (companyId: string): Promise<FuzzySearchResult<Item> | null> => {
    if (!session || !isAuthenticated) {
      setState({ result: null, loading: false, error: 'No autenticado' });
      return null;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new ItemRepositoryImpl(token);

    setState({ result: null, loading: true, error: null });

    try {
      const paginated = await repo.listProducts(companyId, 1, 200);
      const result: FuzzySearchResult<Item> = {
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
        err instanceof Error ? err.message : 'Error al listar productos';
      setState({ result: null, loading: false, error: message });
      return null;
    }
  }, [session, isAuthenticated]);

  const listServices = useCallback(async (companyId: string): Promise<FuzzySearchResult<Item> | null> => {
    if (!session || !isAuthenticated) {
      setState({ result: null, loading: false, error: 'No autenticado' });
      return null;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new ItemRepositoryImpl(token);

    setState({ result: null, loading: true, error: null });

    try {
      const paginated = await repo.listServices(companyId, 1, 200);
      const result: FuzzySearchResult<Item> = {
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
        err instanceof Error ? err.message : 'Error al listar servicios';
      setState({ result: null, loading: false, error: message });
      return null;
    }
  }, [session, isAuthenticated]);

  return { searchItem, listItems, listProducts, listServices, ...state };
}
