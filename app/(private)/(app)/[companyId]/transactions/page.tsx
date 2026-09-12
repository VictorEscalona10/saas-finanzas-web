'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TransactionList from '@/src/components/transaction/TransactionList';
import TransactionFilters from '@/src/components/transaction/TransactionFilters';
import TransactionDetailModal from '@/src/components/transaction/TransactionDetailModal';
import { useDeleteTransaction } from '@/src/use-cases/transaction/useDeleteTransaction';
import type { Transaction } from '@/src/domain/entities/Transaction';
import type { TransactionFiltersState } from '@/src/components/transaction/TransactionFilters/TransactionFilters';

const EMPTY_FILTERS: TransactionFiltersState = {
  startDate: '',
  endDate: '',
  categoryId: null,
  status: 'all',
  itemId: null,
};

export default function TransactionsPage() {
  const params = useParams<{ companyId: string }>();
  const router = useRouter();
  const companyId = params.companyId;
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<TransactionFiltersState>(EMPTY_FILTERS);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const { deleteTransaction, error: deleteError } = useDeleteTransaction();

  const handleNew = useCallback(() => {
    router.push(`/${companyId}/transactions/new`);
  }, [companyId, router]);

  const handleView = useCallback((transaction: Transaction) => {
    setViewingTransaction(transaction);
    setDetailOpen(true);
  }, []);

  const handleDetailEdit = useCallback(() => {
    const tx = viewingTransaction;
    setDetailOpen(false);
    setViewingTransaction(null);
    if (tx) {
      router.push(`/${companyId}/transactions/${tx.id}/edit`);
    }
  }, [viewingTransaction, companyId, router]);

  const handleDelete = useCallback(async (): Promise<boolean> => {
    if (!viewingTransaction) return false;
    setDeleting(true);
    const success = await deleteTransaction(companyId, viewingTransaction.id);
    if (success) {
      setDetailOpen(false);
      setViewingTransaction(null);
      setRefreshKey((k) => k + 1);
    }
    setDeleting(false);
    return success;
  }, [companyId, deleteTransaction, viewingTransaction]);

  const handleFilter = useCallback((nextFilters: TransactionFiltersState) => {
    setFilters(nextFilters);
  }, []);

  return (
    <>
      <TransactionFilters companyId={companyId} onFilter={handleFilter} />

      <TransactionList
        key={`${filters.startDate}|${filters.endDate}|${filters.categoryId ?? ''}|${filters.status}|${refreshKey}`}
        companyId={companyId}
        filters={filters}
        onNew={handleNew}
        onView={handleView}
      />

      <TransactionDetailModal
        open={detailOpen}
        transaction={viewingTransaction}
        onClose={() => { setDetailOpen(false); setViewingTransaction(null); }}
        onEdit={handleDetailEdit}
        onDelete={handleDelete}
        deleting={deleting}
        deleteError={deleteError}
      />
    </>
  );
}
