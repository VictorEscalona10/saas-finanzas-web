'use client';

import type { Transaction } from '@/src/domain/entities/Transaction';
import { PAYMENT_METHODS } from '@/src/shared/constants';
import Modal from '@/src/components/shared/Modal';
import Button from '@/src/components/shared/Button';
import './TransactionDetailModal.css';

interface TransactionDetailModalProps {
  open: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
}

function getPaymentMethodLabel(method: string): string {
  return (PAYMENT_METHODS as Record<string, string>)[method] ?? method;
}

export default function TransactionDetailModal({ open, transaction, onClose, onEdit, onDelete, deleting }: TransactionDetailModalProps) {
  if (!transaction) return null;

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de eliminar esta transacción?')) {
      onDelete?.();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Detalle de Transacción">
      <div className="transaction-detail">
        <div className="transaction-detail__header-status">
          <span className={`transaction-detail__badge transaction-detail__badge--${transaction.status.toLowerCase()}`}>
            {transaction.status}
          </span>
          <span className="transaction-detail__currency-tag">
            {transaction.currency === 'DOLARES' ? 'USD' : 'Bs'}
          </span>
        </div>

        <div className="transaction-detail__amounts">
          <div className="transaction-detail__amount transaction-detail__amount--usd">
            <span className="transaction-detail__amount-label">Monto USD</span>
            <span className="transaction-detail__amount-value">
              ${' '}{transaction.amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="transaction-detail__amount transaction-detail__amount--bs">
            <span className="transaction-detail__amount-label">Monto Bs</span>
            <span className="transaction-detail__amount-value">
              Bs{' '}{transaction.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="transaction-detail__info">
          <div className="transaction-detail__info-row">
            <span className="transaction-detail__info-label">Tasa del día</span>
            <span className="transaction-detail__info-value">Bs {Number(transaction.dollarRate ?? 0).toFixed(2)}</span>
          </div>
          <div className="transaction-detail__info-row">
            <span className="transaction-detail__info-label">Método de pago</span>
            <span className="transaction-detail__info-value">{getPaymentMethodLabel(transaction.paymentMethod)}</span>
          </div>
          <div className="transaction-detail__info-row">
            <span className="transaction-detail__info-label">Categoría</span>
            <span className="transaction-detail__info-value">{transaction.category.name}</span>
          </div>
          {transaction.itemId && (
            <div className="transaction-detail__info-row">
              <span className="transaction-detail__info-label">Item</span>
              <span className="transaction-detail__info-value">{transaction.item?.name}</span>
            </div>
          )}
          {transaction.paymentReference && (
            <div className="transaction-detail__info-row">
              <span className="transaction-detail__info-label">Referencia</span>
              <span className="transaction-detail__info-value">{transaction.paymentReference}</span>
            </div>
          )}
          {transaction.paymentDate && (
            <div className="transaction-detail__info-row">
              <span className="transaction-detail__info-label">Fecha de pago</span>
              <span className="transaction-detail__info-value">{formatDate(transaction.paymentDate)}</span>
            </div>
          )}
          {transaction.description && (
            <div className="transaction-detail__info-row transaction-detail__info-row--column">
              <span className="transaction-detail__info-label">Descripción</span>
              <span className="transaction-detail__info-value">{transaction.description}</span>
            </div>
          )}
          <div className="transaction-detail__info-row">
            <span className="transaction-detail__info-label">Creado</span>
            <span className="transaction-detail__info-value">
              {formatDate(transaction.createdAt)} a las {formatTime(transaction.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="transaction-detail__modal-footer">
        <div className="transaction-detail__modal-footer-left">
          {onDelete && (
            <Button variant="danger" size="md" onClick={handleDelete} loading={deleting} disabled={deleting}>Eliminar</Button>
          )}
        </div>
        <div className="transaction-detail__modal-footer-right">
          <Button variant="outline" size="md" onClick={onClose} disabled={deleting}>Cerrar</Button>
          {onEdit && (
            <Button variant="primary" size="md" onClick={onEdit} disabled={deleting}>Editar</Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
