'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import './CategoryDrawer.css';

interface CategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function CategoryDrawer({ open, onClose, title, subtitle, children, footer }: CategoryDrawerProps) {
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
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!mounted) return null;

  return (
    <div className={`category-drawer${!mounted ? ' category-drawer--hidden' : ''}`}>
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
          <button className="category-drawer__close" onClick={onClose} aria-label="Cerrar">
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
