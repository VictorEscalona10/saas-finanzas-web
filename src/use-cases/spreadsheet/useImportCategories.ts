'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { CategoryRepositoryImpl } from '@/src/infrastructure/repositories/CategoryRepositoryImpl';
import type { Category } from '@/src/domain/entities/Category';

const PAGE_SIZE = 100;

export const CATEGORY_IMPORT_COLUMN_COUNT = 3;

export const CATEGORY_IMPORT_COLUMN_LABELS = ['Nombre', 'Tipo', 'Flujo'];

const TYPE_LABELS: Record<string, string> = {
  OPERATING: 'Operación',
  INVESTING: 'Inversión',
  FINANCING: 'Financiamiento',
};

const FLOW_LABELS: Record<string, string> = {
  INFLOW: 'Ingreso',
  OUTFLOW: 'Egreso',
};

function categoryToSheetRow(category: Category): string[] {
  return [
    category.name,
    TYPE_LABELS[category.type] ?? category.type,
    FLOW_LABELS[category.flowDirection] ?? category.flowDirection,
  ];
}

interface ImportState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

export function useImportCategories(companyId: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<ImportState>({
    categories: [],
    isLoading: true,
    error: null,
  });

  const fetchAll = useCallback(async (): Promise<Category[]> => {
    if (!session || !isAuthenticated || !companyId) return [];

    const token = (session as { access_token: string }).access_token;
    const repo = new CategoryRepositoryImpl(token);

    const all: Category[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const result = await repo.list(companyId, page, PAGE_SIZE);
      all.push(...result.data);
      totalPages = result.meta.totalPages;
      page += 1;
    } while (page <= totalPages);

    return all;
  }, [session, isAuthenticated, companyId]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !companyId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const categories = await fetchAll();
        setState({ categories, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al importar categorías';
        setState({ categories: [], isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, companyId, fetchAll]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  const rows = useMemo(
    () => state.categories.map(categoryToSheetRow),
    [state.categories],
  );

  return { ...state, rows, refetch };
}
