'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { usePresence } from '@/src/components/shared/hooks/usePresence';
import './TransactionDrawer.css';

interface TransactionDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  disableClose?: boolean;
}

export default function TransactionDrawer({ open, onClose, title, subtitle, children, footer, disableClose }: TransactionDrawerProps) {
  const { isVisible, phase } = usePresence(open, 400, 400);
  const animate = phase === 'entered' ? 'entered' : 'entering';

  useEffect(() => {
    if (!isVisible) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableClose) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isVisible, onClose, disableClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !disableClose) onClose();
  }, [onClose, disableClose]);

  if (!isVisible) return null;

  return (
    <div className="transaction-drawer">
      <div
        className={`transaction-drawer__backdrop transaction-drawer__backdrop--${animate}`}
        onClick={handleBackdropClick}
      />
      <aside className={`transaction-drawer__panel transaction-drawer__panel--${animate}`}>
        <div className="transaction-drawer__header">
          <div className="transaction-drawer__header-info">
            <h2 className="transaction-drawer__title">{title}</h2>
            {subtitle && <p className="transaction-drawer__subtitle">{subtitle}</p>}
          </div>
          <button className="transaction-drawer__close" onClick={onClose} aria-label="Cerrar" disabled={disableClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="transaction-drawer__body">
          {children}
        </div>

        {footer && (
          <div className="transaction-drawer__footer">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
}
