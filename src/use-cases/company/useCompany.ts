'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { CompanyRepositoryImpl } from '@/src/infrastructure/repositories/CompanyRepositoryImpl';
import type { Company } from '@/src/domain/entities/Company';

interface CompanyState {
  company: Company | null;
  isLoading: boolean;
  error: string | null;
}

export function useCompany(id: string | undefined) {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<CompanyState>({
    company: null,
    isLoading: true,
    error: null,
  });

  const fetchCompany = useCallback(async (): Promise<Company | null> => {
    if (!session || !isAuthenticated || !id) return null;

    const token = (session as { access_token: string }).access_token;
    const repo = new CompanyRepositoryImpl(token);

    return repo.getById(id);
  }, [session, isAuthenticated, id]);

  const refetch = useCallback(() => {
    void (async () => {
      if (!session || !isAuthenticated || !id) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const company = await fetchCompany();
        setState({ company, isLoading: false, error: null });
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Error al cargar compañía';
        setState({ company: null, isLoading: false, error: message });
      }
    })();
  }, [session, isAuthenticated, id, fetchCompany]);

  useEffect(() => {
    if (!sessionLoading) {
      void refetch();
    }
  }, [sessionLoading, refetch]);

  return { ...state, refetch };
}
