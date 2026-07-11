'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
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
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState<'entering' | 'entered'>('entering');

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate('entered');
        });
      });
    } else {
      setAnimate('entering');
      const timer = setTimeout(() => setMounted(false), 400);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableClose) onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose, disableClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !disableClose) onClose();
  }, [onClose, disableClose]);

  if (!mounted) return null;

  return (
    <div className={`item-drawer${!mounted ? ' item-drawer--hidden' : ''}`}>
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
