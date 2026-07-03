'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/src/use-cases/auth/useSession';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="protected-route">
        <div className="protected-route__spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="protected-route">
        <div className="protected-route__spinner" />
      </div>
    );
  }

  return <>{children}</>;
}
