'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
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
    <div className={`transaction-drawer${!mounted ? ' transaction-drawer--hidden' : ''}`}>
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
