'use client';

import type { ReactNode } from 'react';
import Modal from '@/src/components/shared/Modal';
import Button from '@/src/components/shared/Button';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  loading = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="confirm-dialog">
        <div className="confirm-dialog__icon">
          <span className="material-symbols-outlined">delete</span>
        </div>
        <p className="confirm-dialog__message">{message}</p>
        {error && (
          <div className="confirm-dialog__error">
            <span className="material-symbols-outlined">error_outline</span>
            <span>{error}</span>
          </div>
        )}
      </div>
      <div className="confirm-dialog__actions">
        <Button variant="outline" size="lg" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant="danger" size="lg" onClick={onConfirm} loading={loading}>
          {loading ? 'Eliminando...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
