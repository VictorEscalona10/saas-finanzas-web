'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { usePresence } from '@/src/components/shared/hooks/usePresence';
import './BatchDrawer.css';

interface BatchDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  disableClose?: boolean;
}

export default function BatchDrawer({ open, onClose, title, subtitle, children, footer, disableClose }: BatchDrawerProps) {
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
    <div className="batch-drawer">
      <div
        className={`batch-drawer__backdrop batch-drawer__backdrop--${animate}`}
        onClick={handleBackdropClick}
      />
      <aside className={`batch-drawer__panel batch-drawer__panel--${animate}`}>
        <div className="batch-drawer__header">
          <div className="batch-drawer__header-info">
            <h2 className="batch-drawer__title">{title}</h2>
            {subtitle && <p className="batch-drawer__subtitle">{subtitle}</p>}
          </div>
          <button className="batch-drawer__close" onClick={onClose} aria-label="Cerrar" disabled={disableClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="batch-drawer__body">
          {children}
        </div>

        {footer && (
          <div className="batch-drawer__footer">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
}
