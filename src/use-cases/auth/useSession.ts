'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/src/infrastructure/supabase/browser';
import type { User } from '@/src/domain/entities/User';

interface SessionState {
  session: unknown | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useSession() {
  const [state, setState] = useState<SessionState>({
    session: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name ?? session.user.email ?? '',
          email: session.user.email ?? '',
          role: session.user.app_metadata?.role ?? 'USER',
          tokenBalance: session.user.user_metadata?.tokenBalance ?? 0,
          isSuspended: session.user.app_metadata?.isSuspended ?? session.user.user_metadata?.isSuspended ?? false,
          createdAt: session.user.created_at ?? '',
        };

        setState({ session, user, isLoading: false, isAuthenticated: true });
      } else {
        setState({ session: null, user: null, isLoading: false, isAuthenticated: false });
      }
    });
  }, []);

  return state;
}
