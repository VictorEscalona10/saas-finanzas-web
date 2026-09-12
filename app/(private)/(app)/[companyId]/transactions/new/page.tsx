'use client';

import { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TransactionForm from '@/src/components/transaction/TransactionForm';

export default function NewTransactionPage() {
  const params = useParams<{ companyId: string }>();
  const router = useRouter();
  const companyId = params.companyId;
  const [success, setSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleSave = useCallback(() => {
    setSuccess(true);
  }, []);

  const handleDismiss = useCallback(() => {
    setSuccess(false);
    setFormKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      handleDismiss();
    }, 2500);
    return () => clearTimeout(timer);
  }, [success, handleDismiss]);

  const handleCancel = useCallback(() => {
    router.push(`/${companyId}/transactions`);
  }, [companyId, router]);

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
          <h1 className="transaction-form__page-title">Nueva Transacción</h1>
          <p className="transaction-form__page-subtitle">
            Registra una nueva operación financiera.
          </p>
        </div>
      </div>

      <TransactionForm
        key={formKey}
        companyId={companyId}
        onSave={handleSave}
        onCancel={handleCancel}
        id="new-transaction-form"
      />

      {success && (
        <div className="transaction-form__success-backdrop" onClick={handleDismiss}>
          <div className="transaction-form__success-card">
            <div className="transaction-form__success-check">
              <svg className="transaction-form__success-checkmark" viewBox="0 0 52 52">
                <circle className="transaction-form__success-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                <path className="transaction-form__success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <span className="transaction-form__success-text">Transacción creada correctamente</span>
          </div>
        </div>
      )}
    </div>
  );
}
