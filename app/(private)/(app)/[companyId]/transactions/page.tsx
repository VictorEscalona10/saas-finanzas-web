'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import TransactionList from '@/src/components/transaction/TransactionList';
import TransactionForm from '@/src/components/transaction/TransactionForm';
import TransactionDrawer from '@/src/components/transaction/TransactionDrawer';
import TransactionFilters from '@/src/components/transaction/TransactionFilters';
import TransactionDetailModal from '@/src/components/transaction/TransactionDetailModal';
import { useDeleteTransaction } from '@/src/use-cases/transaction/useDeleteTransaction';
import Button from '@/src/components/shared/Button';
import type { Transaction } from '@/src/domain/entities/Transaction';
import type { TransactionFiltersState } from '@/src/components/transaction/TransactionFilters/TransactionFilters';

export default function TransactionsPage() {
  const params = useParams<{ companyId: string }>();
  const companyId = params.companyId;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { deleteTransaction } = useDeleteTransaction();

  const handleNew = useCallback(() => {
    setEditingTransaction(undefined);
    setDrawerOpen(true);
  }, []);

  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setDrawerOpen(true);
  }, []);

  const handleView = useCallback((transaction: Transaction) => {
    setViewingTransaction(transaction);
    setDetailOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    setDrawerOpen(false);
    setEditingTransaction(undefined);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleCancel = useCallback(() => {
    setDrawerOpen(false);
    setEditingTransaction(undefined);
  }, []);

  const handleDetailEdit = useCallback(() => {
    const tx = viewingTransaction;
    setDetailOpen(false);
    setViewingTransaction(null);
    if (tx) {
      setEditingTransaction(tx);
      setDrawerOpen(true);
    }
  }, [viewingTransaction]);

  const handleDelete = useCallback(async () => {
    if (!viewingTransaction) return;
    setDeleting(true);
    const success = await deleteTransaction(companyId, viewingTransaction.id);
    if (success) {
      setDetailOpen(false);
      setViewingTransaction(null);
      setRefreshKey((k) => k + 1);
    }
    setDeleting(false);
  }, [companyId, deleteTransaction, viewingTransaction]);

  const handleFilter = useCallback((_filters: TransactionFiltersState) => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <>
      <TransactionFilters companyId={companyId} onFilter={handleFilter} />

      <TransactionList
        key={refreshKey}
        companyId={companyId}
        onNew={handleNew}
        onView={handleView}
      />

      <TransactionDrawer
        open={drawerOpen}
        onClose={handleCancel}
        disableClose={saving}
        title={editingTransaction ? 'Editar Transacción' : 'Nueva Transacción'}
        subtitle={editingTransaction ? 'Modifica los datos de la transacción seleccionada.' : 'Ingrese los detalles de la operación.'}
        footer={
          <>
            <Button variant="outline" size="lg" onClick={handleCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              form="transaction-form"
              loading={saving}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
        <TransactionForm
          companyId={companyId}
          transaction={editingTransaction}
          onSave={handleSave}
          onCancel={handleCancel}
          id="transaction-form"
          hideFooter
          onLoadingChange={setSaving}
        />
      </TransactionDrawer>

      <TransactionDetailModal
        open={detailOpen}
        transaction={viewingTransaction}
        onClose={() => { setDetailOpen(false); setViewingTransaction(null); }}
        onEdit={handleDetailEdit}
        onDelete={handleDelete}
        deleting={deleting}
      />
    </>
  );
}
