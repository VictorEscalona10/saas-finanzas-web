'use client';

import { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTransactionById } from '@/src/use-cases/transaction/useTransactionById';
import TransactionForm from '@/src/components/transaction/TransactionForm';
import Skeleton from '@/src/components/shared/Skeleton';

export default function EditTransactionPage() {
  const params = useParams<{ companyId: string; transactionId: string }>();
  const router = useRouter();
  const { companyId, transactionId } = params;
  const { transaction, isLoading, error } = useTransactionById(companyId, transactionId);

  const handleSave = useCallback(() => {
    router.push(`/${companyId}/transactions`);
  }, [companyId, router]);

  const handleCancel = useCallback(() => {
    router.push(`/${companyId}/transactions`);
  }, [companyId, router]);

  if (isLoading) {
    return (
      <div>
        <div className="transaction-form__page-header">
          <div>
            <Skeleton variant="text" />
            <Skeleton variant="title" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="transaction-form__page-header">
          <div>
            <button
              className="transaction-form__back"
              onClick={() => router.push(`/${companyId}/transactions`)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>arrow_back</span>
              Volver a Transacciones
            </button>
          </div>
        </div>
        <div className="transaction-form__error">
          <div>{error}</div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div>
        <div className="transaction-form__page-header">
          <div>
            <button
              className="transaction-form__back"
              onClick={() => router.push(`/${companyId}/transactions`)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>arrow_back</span>
              Volver a Transacciones
            </button>
          </div>
        </div>
        <div className="transaction-form__error">
          <div>Transacción no encontrada</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="transaction-form__page-header">
        <div>
          <button
            className="transaction-form__back"
            onClick={() => router.push(`/${companyId}/transactions`)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>arrow_back</span>
            Volver a Transacciones
          </button>
          <h1 className="transaction-form__page-title">Editar Transacción</h1>
          <p className="transaction-form__page-subtitle">
            Modifica los datos de la transacción.
          </p>
        </div>
      </div>

      <TransactionForm
        companyId={companyId}
        transaction={transaction}
        onSave={handleSave}
        onCancel={handleCancel}
        id="edit-transaction-form"
      />
    </div>
  );
}
