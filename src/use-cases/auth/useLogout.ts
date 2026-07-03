'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface LogoutState {
  loading: boolean;
  error: string | null;
}

export function useLogout() {
  const [state, setState] = useState<LogoutState>({ loading: false, error: null });
  const router = useRouter();

  const logout = useCallback(async () => {
    setState({ loading: true, error: null });

    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setState({ loading: false, error: data.message || 'Error al cerrar sesión' });
        return;
      }

      setState({ loading: false, error: null });
      router.push('/login');
    } catch {
      setState({ loading: false, error: 'Error de conexión' });
    }
  }, [router]);

  return { logout, ...state };
}
