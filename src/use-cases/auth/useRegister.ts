'use client';

import { useState, useCallback } from 'react';
import { registerSchema } from '@/src/shared/schemas/auth';
import type { RegisterInput } from '@/src/shared/schemas/auth';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  repeat_password?: string;
}

interface RegisterState {
  loading: boolean;
  error: string | null;
  fieldErrors: FieldErrors;
  confirmEmail: boolean;
  registeredEmail: string;
}

export function useRegister() {
  const [state, setState] = useState<RegisterState>({
    loading: false,
    error: null,
    fieldErrors: {},
    confirmEmail: false,
    registeredEmail: '',
  });

  const register = useCallback(async ({ name, email, password, repeat_password }: RegisterInput) => {
    const result = registerSchema.safeParse({ name, email, password, repeat_password });

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setState((prev) => ({ ...prev, loading: false, error: null, fieldErrors }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null, fieldErrors: {} }));

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      const data = await res.json();

      if (!res.ok) {
        setState((prev) => ({ ...prev, loading: false, error: data.message || 'Error al registrarse', fieldErrors: {} }));
        return;
      }

      setState({ loading: false, error: null, fieldErrors: {}, confirmEmail: true, registeredEmail: email });
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: 'Error de conexión. Verifica tu conexión a internet.' }));
    }
  }, []);

  return { register, ...state };
}
