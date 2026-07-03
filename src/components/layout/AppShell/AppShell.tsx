'use client';

import type { ReactNode } from 'react';
import { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Header from '@/src/components/layout/Header';
import { useCompany } from '@/src/use-cases/company/useCompany';
import { useMyCompanies } from '@/src/use-cases/company/useMyCompanies';
import './AppShell.css';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { label: 'Categories', href: '/categories', icon: 'category' },
  { label: 'Products', href: '/products', icon: 'inventory_2' },
  { label: 'Transactions', href: '/transactions', icon: 'receipt_long' },
  { label: 'Production Batches', href: '/batches', icon: 'precision_manufacturing' },
  { label: 'Cash Flow', href: '/cash-flow', icon: 'payments' },
  { label: 'Contribution Margin', href: '/contribution-margin', icon: 'analytics' },
  { label: 'Break-even Point', href: '/balance-point', icon: 'show_chart' },
  { label: 'Gross Profit', href: '/gross-profit', icon: 'trending_up' },
  { label: 'Net Profit / P&L', href: '/net-profit', icon: 'account_balance' },
  { label: 'Unit Cost', href: '/unit-cost', icon: 'request_quote' },
  { label: 'Price with Margin', href: '/price-margin', icon: 'sell' },
  { label: 'AI Financial Chat', href: '/finance-chat', icon: 'smart_toy' },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const companyId = params.companyId as string;

  const { company } = useCompany(companyId);
  const { companies } = useMyCompanies();

  const sidebarRef = useRef<HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      el.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
    };
    el.addEventListener('mousemove', handler);
    return () => el.removeEventListener('mousemove', handler);
  }, []);

  const prefixedHref = (href: string) => `/${companyId}${href}`;

  const isActive = (href: string) => {
    const full = prefixedHref(href);
    if (href === '/dashboard') return pathname === full;
    return pathname.startsWith(full);
  };

  const handleCompanySwitch = (id: string) => {
    router.push(`/${id}/dashboard`);
  };

  return (
    <div className="app-shell">
      <Header
        onToggleSidebar={toggleSidebar}
        companyId={companyId}
        companyName={company?.name}
        companies={companies}
        onCompanySwitch={handleCompanySwitch}
      />
      <div className="app-shell__body">
        {sidebarOpen && <div className="app-shell__backdrop" onClick={closeSidebar} />}
        <aside
          className={`app-shell__sidebar${sidebarOpen ? ' app-shell__sidebar--open' : ''}`}
          ref={sidebarRef}
        >
          <div className="app-shell__sidebar-header">
            <div className="app-shell__sidebar-brand">
              <span className="app-shell__sidebar-brand-icon material-symbols-outlined">shield</span>
              <div>
                <div className="app-shell__sidebar-title">V-Vault</div>
                <div className="app-shell__sidebar-subtitle">Institutional Modernism</div>
              </div>
            </div>
          </div>

          <nav className="app-shell__sidebar-nav">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={prefixedHref(item.href)}
                className={`app-shell__nav-link${isActive(item.href) ? ' app-shell__nav-link--active' : ''}`}
              >
                <span className="app-shell__nav-icon material-symbols-outlined">{item.icon}</span>
                <span className="app-shell__nav-label">{item.label}</span>
              </Link>
            ))}

          </nav>
        </aside>
        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}
