'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { loginSchema } from '@/src/shared/schemas/auth';
import type { LoginInput } from '@/src/shared/schemas/auth';

interface FieldErrors {
  email?: string;
  password?: string;
}

interface LoginState {
  loading: boolean;
  error: string | null;
  fieldErrors: FieldErrors;
}

export function useLogin() {
  const [state, setState] = useState<LoginState>({ loading: false, error: null, fieldErrors: {} });
  const router = useRouter();

  const login = useCallback(async ({ email, password }: LoginInput) => {
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setState({ loading: false, error: null, fieldErrors });
      return;
    }

    setState({ loading: true, error: null, fieldErrors: {} });

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      if (!res.ok) {
        const message =
          data.message === 'Invalid login credentials'
            ? 'Correo o contraseña incorrectos'
            : data.message || 'Error al iniciar sesión';
        setState({ loading: false, error: message, fieldErrors: {} });
        return;
      }

      setState({ loading: false, error: null, fieldErrors: {} });
      router.push('/companies');
    } catch {
      setState({ loading: false, error: 'Error de conexión. Verifica tu conexión a internet.', fieldErrors: {} });
    }
  }, [router]);

  return { login, ...state };
}
