import type { ReactNode } from 'react';
import AppShell from '@/src/components/layout/AppShell';

export default function CompaniesLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
