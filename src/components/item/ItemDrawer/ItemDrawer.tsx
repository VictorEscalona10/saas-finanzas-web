'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { usePresence } from '@/src/components/shared/hooks/usePresence';
import './ItemDrawer.css';

interface ItemDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  disableClose?: boolean;
}

export default function ItemDrawer({ open, onClose, title, subtitle, children, footer, disableClose }: ItemDrawerProps) {
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
    <div className="item-drawer">
      <div
        className={`item-drawer__backdrop item-drawer__backdrop--${animate}`}
        onClick={handleBackdropClick}
      />
      <aside className={`item-drawer__panel item-drawer__panel--${animate}`}>
        <div className="item-drawer__header">
          <div className="item-drawer__header-info">
            <h2 className="item-drawer__title">{title}</h2>
            {subtitle && <p className="item-drawer__subtitle">{subtitle}</p>}
          </div>
          <button className="item-drawer__close" onClick={onClose} aria-label="Cerrar" disabled={disableClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="item-drawer__body">
          {children}
        </div>

        {footer && (
          <div className="item-drawer__footer">
            {footer}
          </div>
        )}
      </aside>
    </div>
  );
}
