'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { CompanyRepositoryImpl } from '@/src/infrastructure/repositories/CompanyRepositoryImpl';
import type { Company } from '@/src/domain/entities/Company';

interface CreateCompanyState {
  loading: boolean;
  error: string | null;
}

export function useCreateCompany() {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<CreateCompanyState>({ loading: false, error: null });

  const createCompany = useCallback(async (name: string): Promise<Company | null> => {
    if (!session || !isAuthenticated) {
      setState({ loading: false, error: 'No autenticado' });
      return null;
    }

    const token = (session as { access_token: string }).access_token;
    const repo = new CompanyRepositoryImpl(token);

    setState({ loading: true, error: null });

    try {
      const company = await repo.create({ name });
      setState({ loading: false, error: null });
      return company;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al crear compañía';
      setState({ loading: false, error: message });
      return null;
    }
  }, [session, isAuthenticated]);

  return { createCompany, ...state };
}
