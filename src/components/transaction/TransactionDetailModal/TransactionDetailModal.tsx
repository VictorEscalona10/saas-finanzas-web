'use client';

import { useState } from 'react';
import type { Transaction } from '@/src/domain/entities/Transaction';
import { PAYMENT_METHODS } from '@/src/shared/constants';
import { parseISODate } from '@/src/shared/utils/dateUtils';
import Modal from '@/src/components/shared/Modal';
import Button from '@/src/components/shared/Button';
import ConfirmDialog from '@/src/components/shared/ConfirmDialog';
import './TransactionDetailModal.css';

interface TransactionDetailModalProps {
  open: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => Promise<boolean>;
  deleting?: boolean;
  deleteError?: string | null;
}

function formatDate(dateStr: string): string {
  const datePart = dateStr.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  const d = parseISODate(dateStr);
  if (!d) return '';
  return d.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
}

function getPaymentMethodLabel(method: string): string {
  return (PAYMENT_METHODS as Record<string, string>)[method] ?? method;
}

const STOCK_EFFECT_LABELS: Record<string, string> = {
  NONE: 'Sin efecto',
  INCREMENT: 'Aumenta stock',
  DECREMENT: 'Disminuye stock',
};

export default function TransactionDetailModal({ open, transaction, onClose, onEdit, onDelete, deleting, deleteError }: TransactionDetailModalProps) {
  const [confirming, setConfirming] = useState(false);
  if (!transaction) return null;

  const isInflow = transaction.category.flowDirection === 'INFLOW';

  const handleDelete = () => {
    setConfirming(true);
  };

  const handleDeleteConfirm = async () => {
    const success = await onDelete?.();
    if (success) setConfirming(false);
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="Detalle de Transacción">
        <div className="transaction-detail">

          {/* Hero: dirección + montos */}
          <div className={`transaction-detail__hero transaction-detail__hero--${isInflow ? 'inflow' : 'outflow'}`}>
            <div className="transaction-detail__hero-top">
              <div className="transaction-detail__hero-direction">
                <span className="material-symbols-outlined transaction-detail__hero-icon">
                  {isInflow ? 'trending_up' : 'trending_down'}
                </span>
                <span className="transaction-detail__hero-label">
                  {isInflow ? 'INFLOW' : 'OUTFLOW'}
                </span>
              </div>
              <span className={`transaction-detail__badge transaction-detail__badge--${transaction.status.toLowerCase()}`}>
                {transaction.status === 'COMPLETED' ? 'Completado' : 'Pendiente'}
              </span>
            </div>

            <div className="transaction-detail__hero-amounts">
              <div className="transaction-detail__hero-amount">
                <span className="transaction-detail__hero-currency">USD</span>
                <span className="transaction-detail__hero-value transaction-detail__hero-value--usd">
                  $ {transaction.amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="transaction-detail__hero-amount">
                <span className="transaction-detail__hero-currency">Bs</span>
                <span className="transaction-detail__hero-value transaction-detail__hero-value--bs">
                  Bs {transaction.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Detalle */}
          <div className="transaction-detail__section">
            <h4 className="transaction-detail__section-title">Detalle</h4>
            <div className="transaction-detail__rows">
              {transaction.paymentDate && (
                <div className="transaction-detail__row">
                  <span className="material-symbols-outlined transaction-detail__row-icon">calendar_today</span>
                  <span className="transaction-detail__row-label">Fecha de pago</span>
                  <span className="transaction-detail__row-value">{formatDate(transaction.paymentDate)}</span>
                </div>
              )}
              <div className="transaction-detail__row">
                <span className="material-symbols-outlined transaction-detail__row-icon">credit_card</span>
                <span className="transaction-detail__row-label">Método de pago</span>
                <span className="transaction-detail__row-value">{getPaymentMethodLabel(transaction.paymentMethod)}</span>
              </div>
              <div className="transaction-detail__row">
                <span className="material-symbols-outlined transaction-detail__row-icon">category</span>
                <span className="transaction-detail__row-label">Categoría</span>
                <span className="transaction-detail__row-value">{transaction.category.name}</span>
              </div>
              {transaction.item && (
                <div className="transaction-detail__row">
                  <span className="material-symbols-outlined transaction-detail__row-icon">inventory_2</span>
                  <span className="transaction-detail__row-label">Item</span>
                  <span className="transaction-detail__row-value">{transaction.item.name}</span>
                </div>
              )}
              {transaction.costItem && (
                <div className="transaction-detail__row">
                  <span className="material-symbols-outlined transaction-detail__row-icon">receipt_long</span>
                  <span className="transaction-detail__row-label">Costo Directo</span>
                  <span className="transaction-detail__row-value">{transaction.costItem.name}</span>
                </div>
              )}
              {transaction.paymentReference && (
                <div className="transaction-detail__row">
                  <span className="material-symbols-outlined transaction-detail__row-icon">tag</span>
                  <span className="transaction-detail__row-label">Referencia</span>
                  <span className="transaction-detail__row-value transaction-detail__row-value--mono">{transaction.paymentReference}</span>
                </div>
              )}
              <div className="transaction-detail__row">
                <span className="material-symbols-outlined transaction-detail__row-icon">show_chart</span>
                <span className="transaction-detail__row-label">Tasa del día</span>
                <span className="transaction-detail__row-value">Bs {Number(transaction.dollarRate ?? 0).toFixed(2)}</span>
              </div>
              {transaction.stockEffect && transaction.stockEffect !== 'NONE' && (
                <div className="transaction-detail__row">
                  <span className="material-symbols-outlined transaction-detail__row-icon">inventory</span>
                  <span className="transaction-detail__row-label">Efecto inventario</span>
                  <span className="transaction-detail__row-value">{STOCK_EFFECT_LABELS[transaction.stockEffect] ?? transaction.stockEffect}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          {transaction.description && (
            <div className="transaction-detail__section">
              <h4 className="transaction-detail__section-title">Notas</h4>
              <div className="transaction-detail__notes">
                {transaction.description}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="transaction-detail__timestamp">
            Creado el {formatDate(transaction.createdAt)} a las {formatTime(transaction.createdAt)}
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

      <ConfirmDialog
        open={confirming}
        title="Eliminar Transacción"
        message={
          <>
            ¿Estás seguro de eliminar esta transacción?
            Esta acción no se puede deshacer.
          </>
        }
        loading={deleting}
        error={deleteError}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
}
