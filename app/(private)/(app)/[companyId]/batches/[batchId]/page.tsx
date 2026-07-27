'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import BatchDetail from '@/src/components/batch/BatchDetail';
import TransactionForm from '@/src/components/transaction/TransactionForm';
import TransactionDrawer from '@/src/components/transaction/TransactionDrawer';
import Button from '@/src/components/shared/Button';

export default function BatchDetailPage() {
  const params = useParams<{ companyId: string; batchId: string }>();
  const { companyId, batchId } = params;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleNewTransaction = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleTransactionSaved = useCallback(() => {
    setDrawerOpen(false);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleCancel = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  return (
    <>
      <BatchDetail
        key={refreshKey}
        companyId={companyId}
        batchId={batchId}
        onNewTransaction={handleNewTransaction}
      />

      <TransactionDrawer
        open={drawerOpen}
        onClose={handleCancel}
        disableClose={saving}
        title="Nueva Transacción"
        subtitle="Registra una transacción asociada a este lote."
        footer={
          <>
            <Button variant="outline" size="lg" onClick={handleCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="lg"
              type="submit"
              form="batch-transaction-form"
              loading={saving}
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
        <TransactionForm
          companyId={companyId}
          defaultBatchId={batchId}
          onSave={handleTransactionSaved}
          onCancel={handleCancel}
          id="batch-transaction-form"
          hideFooter
          onLoadingChange={setSaving}
        />
      </TransactionDrawer>
    </>
  );
}
