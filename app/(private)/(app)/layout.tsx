import type { ReactNode } from 'react';
import ProtectedRoute from '@/src/components/auth/ProtectedRoute';
import AppShell from '@/src/components/layout/AppShell';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
