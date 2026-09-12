'use client';

import { useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { usePresence } from '@/src/components/shared/hooks/usePresence';
import './Modal.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const EXIT_DURATION = 150;

export default function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const { isVisible, phase } = usePresence(open, EXIT_DURATION);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isVisible) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isVisible, handleClose]);

  if (!isVisible) return null;

  const overlayClass = `modal-overlay${phase === 'exiting' ? ' modal-overlay--closing' : ''}`;

  return (
    <div className={overlayClass} onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="modal__header">
            <h2 className="modal__title">{title}</h2>
            <button className="modal__close" onClick={handleClose} aria-label="Cerrar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
