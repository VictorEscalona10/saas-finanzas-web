'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { CompanyRepositoryImpl } from '@/src/infrastructure/repositories/CompanyRepositoryImpl';
import type { Company } from '@/src/domain/entities/Company';

interface MyCompaniesState {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
}

export function useMyCompanies() {
  const { session, isAuthenticated, isLoading: sessionLoading } = useSession();
  const [state, setState] = useState<MyCompaniesState>({
    companies: [],
    isLoading: true,
    error: null,
  });

  const fetchCompanies = useCallback(async () => {
    if (!session || !isAuthenticated) return;

    const token = (session as { access_token: string }).access_token;
    const repo = new CompanyRepositoryImpl(token);

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const companies = await repo.listMyCompanies();
      setState({ companies, isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar compañías';
      setState({ companies: [], isLoading: false, error: message });
    }
  }, [session, isAuthenticated]);

  useEffect(() => {
    if (!sessionLoading) {
      fetchCompanies();
    }
  }, [sessionLoading, fetchCompanies]);

  return { ...state, refetch: fetchCompanies };
}
