'use client';

import { useState, useCallback } from 'react';
import { useBatchById } from '@/src/use-cases/batch/useBatchById';
import { useDeleteTransaction } from '@/src/use-cases/transaction/useDeleteTransaction';
import { PAYMENT_METHODS } from '@/src/shared/constants';
import type { Transaction } from '@/src/domain/entities/Transaction';
import TransactionDetailModal from '@/src/components/transaction/TransactionDetailModal';
import TransactionDrawer from '@/src/components/transaction/TransactionDrawer';
import TransactionForm from '@/src/components/transaction/TransactionForm';
import Button from '@/src/components/shared/Button';
import Skeleton from '@/src/components/shared/Skeleton';
import './BatchDetail.css';

interface BatchDetailProps {
  companyId: string;
  batchId: string;
  onNewTransaction?: () => void;
}

function formatDate(dateStr: string): string {
  const datePart = dateStr.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatUSD(amount: number): string {
  return `$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatBs(amount: number): string {
  return `Bs ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function getPaymentMethodLabel(method: string): string {
  return (PAYMENT_METHODS as Record<string, string>)[method] ?? method;
}

export default function BatchDetail({ companyId, batchId, onNewTransaction }: BatchDetailProps) {
  const { batch, isLoading, error, refetch } = useBatchById(companyId, batchId);
  const { deleteTransaction } = useDeleteTransaction();

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleView = useCallback((tx: Transaction) => {
    setSelectedTransaction(tx);
    setDetailOpen(true);
  }, []);

  const handleDetailEdit = useCallback(() => {
    const tx = selectedTransaction;
    setDetailOpen(false);
    if (tx) {
      setEditDrawerOpen(true);
    }
  }, [selectedTransaction]);

  const handleDelete = useCallback(async () => {
    if (!selectedTransaction) return;
    setDeleting(true);
    const success = await deleteTransaction(companyId, selectedTransaction.id);
    if (success) {
      setDetailOpen(false);
      setSelectedTransaction(null);
      refetch();
    }
    setDeleting(false);
  }, [companyId, deleteTransaction, selectedTransaction, refetch]);

  const handleEditSaved = useCallback(() => {
    setEditDrawerOpen(false);
    setSelectedTransaction(null);
    refetch();
  }, [refetch]);

  const handleCancelEdit = useCallback(() => {
    setEditDrawerOpen(false);
    setSelectedTransaction(null);
  }, []);

  if (isLoading) {
    return (
      <div className="batch-detail">
        <div className="batch-detail__info-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="batch-detail__info-card">
              <Skeleton variant="text" />
              <Skeleton variant="title" />
            </div>
          ))}
        </div>
        <div className="batch-detail__table-container">
          <div style={{ padding: '1.5rem' }}>
            <Skeleton variant="card" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="batch-detail">
        <div className="batch-detail__error">
          <span className="material-symbols-outlined">error_outline</span>
          <span>{error}</span>
          <button onClick={refetch} className="batch-detail__retry">Reintentar</button>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="batch-detail">
        <div className="batch-detail__error">
          <span className="material-symbols-outlined">error_outline</span>
          <span>Lote no encontrado</span>
        </div>
      </div>
    );
  }

  const transactions = batch.transactions ?? [];

  return (
    <div className="batch-detail">
      <div className="batch-detail__header">
        <div>
          <h1 className="batch-detail__title">Detalle del Lote</h1>
          <p className="batch-detail__subtitle">
            Información del lote y transacciones asociadas.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={onNewTransaction}>
          <span className="material-symbols-outlined">add_circle</span>
          Crear Transacción
        </Button>
      </div>

      <div className="batch-detail__info-grid">
        <div className="batch-detail__info-card">
          <span className="batch-detail__info-label">Producto</span>
          <span className="batch-detail__info-value batch-detail__info-value--product">
            {batch.item?.name ?? batch.itemId}
          </span>
        </div>
        <div className="batch-detail__info-card">
          <span className="batch-detail__info-label">Cantidad</span>
          <span className="batch-detail__info-value">{batch.quantity}</span>
        </div>
        <div className="batch-detail__info-card">
          <span className="batch-detail__info-label">Estado</span>
          <span className={`batch-detail__badge batch-detail__badge--${batch.status.toLowerCase()}`}>
            {batch.status}
          </span>
        </div>
        <div className="batch-detail__info-card">
          <span className="batch-detail__info-label">Fecha del Lote</span>
          <span className="batch-detail__info-value" style={{ fontSize: '1.125rem' }}>
            {formatDate(batch.batchDate)}
          </span>
        </div>
      </div>

      <h2 className="batch-detail__section-title">Transacciones del Lote</h2>

      <div className="batch-detail__table-container">
        {transactions.length === 0 ? (
          <div className="batch-detail__empty">
            <div className="batch-detail__empty-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '3rem' }}>receipt_long</span>
            </div>
            <h3 className="batch-detail__empty-title">No hay transacciones</h3>
            <p className="batch-detail__empty-text">
              Este lote no tiene transacciones asociadas. Crea una para comenzar.
            </p>
          </div>
        ) : (
          <div className="batch-detail__table-scroll">
            <table className="batch-detail__table">
              <thead>
                <tr>
                  <th className="batch-detail__th">Fecha</th>
                  <th className="batch-detail__th">Categoría</th>
                  <th className="batch-detail__th">Tipo</th>
                  <th className="batch-detail__th batch-detail__th--right">Monto USD</th>
                  <th className="batch-detail__th batch-detail__th--right">Monto Bs</th>
                  <th className="batch-detail__th">Método</th>
                  <th className="batch-detail__th">Estado</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="batch-detail__row" onClick={() => handleView(t)}>
                    <td className="batch-detail__td batch-detail__td--date">
                      {formatDate(t.paymentDate ?? t.createdAt)}
                    </td>
                    <td className="batch-detail__td batch-detail__td--category">
                      <span className="batch-detail__category-name">{t.category?.name ?? t.categoryId}</span>
                    </td>
                    <td className="batch-detail__td">
                      <span className={`batch-detail__badge batch-detail__badge--flow batch-detail__badge--${t.category?.flowDirection?.toLowerCase() ?? 'inflow'}`}>
                        {t.category?.flowDirection === 'OUTFLOW' ? '↓ Egreso' : '↑ Ingreso'}
                      </span>
                    </td>
                    <td className="batch-detail__td batch-detail__td--right batch-detail__td--amount">
                      {formatUSD(t.amountUSD)}
                    </td>
                    <td className="batch-detail__td batch-detail__td--right batch-detail__td--amount">
                      {formatBs(t.amountBs)}
                    </td>
                    <td className="batch-detail__td batch-detail__td--method">
                      {getPaymentMethodLabel(t.paymentMethod)}
                    </td>
                    <td className="batch-detail__td">
                      <span className={`batch-detail__badge batch-detail__badge--${t.status.toLowerCase()}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <TransactionDetailModal
        open={detailOpen}
        transaction={selectedTransaction}
        onClose={() => { setDetailOpen(false); setSelectedTransaction(null); }}
        onEdit={handleDetailEdit}
        onDelete={handleDelete}
        deleting={deleting}
      />

      <TransactionDrawer
        open={editDrawerOpen}
        onClose={handleCancelEdit}
        disableClose={saving}
        title="Editar Transacción"
        subtitle="Modifica los datos de la transacción seleccionada."
        footer={
          <>
            <Button variant="outline" size="lg" onClick={handleCancelEdit} disabled={saving}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              form="batch-edit-transaction-form"
              loading={saving}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
        <TransactionForm
          companyId={companyId}
          transaction={selectedTransaction ?? undefined}
          defaultBatchId={batchId}
          onSave={handleEditSaved}
          onCancel={handleCancelEdit}
          id="batch-edit-transaction-form"
          hideFooter
          onLoadingChange={setSaving}
        />
      </TransactionDrawer>
    </div>
  );
}
