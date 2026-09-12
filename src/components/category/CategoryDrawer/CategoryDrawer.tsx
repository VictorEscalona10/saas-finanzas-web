'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { usePresence } from '@/src/components/shared/hooks/usePresence';
import './CategoryDrawer.css';

interface CategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  disableClose?: boolean;
}

export default function CategoryDrawer({ open, onClose, title, subtitle, children, footer, disableClose }: CategoryDrawerProps) {
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
    <div className="category-drawer">
      <div
        className={`category-drawer__backdrop category-drawer__backdrop--${animate}`}
        onClick={handleBackdropClick}
      />
      <aside className={`category-drawer__panel category-drawer__panel--${animate}`}>
        <div className="category-drawer__header">
          <div className="category-drawer__header-info">
            <h2 className="category-drawer__title">{title}</h2>
            {subtitle && <p className="category-drawer__subtitle">{subtitle}</p>}
          </div>
          <button className="category-drawer__close" onClick={onClose} aria-label="Cerrar" disabled={disableClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="category-drawer__body">
          {children}
        </div>

        {footer && (
          <div className="category-drawer__footer">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
}
