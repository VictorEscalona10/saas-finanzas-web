'use client';

import { useMemo } from 'react';
import { useTransactionList } from '@/src/use-cases/transaction/useTransactionList';
import type { Transaction } from '@/src/domain/entities/Transaction';
import type { TransactionListFilters } from '@/src/domain/repositories/ITransactionRepository';
import type { TransactionFiltersState } from '@/src/components/transaction/TransactionFilters/TransactionFilters';
import { PAYMENT_METHODS } from '@/src/shared/constants';
import Button from '@/src/components/shared/Button';
import Badge from '@/src/components/shared/Badge';
import Pagination from '@/src/components/shared/Pagination';
import Skeleton from '@/src/components/shared/Skeleton';
import './TransactionList.css';

interface TransactionListProps {
  companyId: string;
  filters?: TransactionFiltersState;
  onNew?: () => void;
  onView?: (transaction: Transaction) => void;
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

function TransactionCard({ transaction, onView }: { transaction: Transaction; onView?: (t: Transaction) => void }) {
  const isInflow = transaction.category.flowDirection !== 'OUTFLOW';
  return (
    <div className="transaction-list__card" onClick={() => onView?.(transaction)}>
      <div className="transaction-list__card-header">
        <Badge variant={isInflow ? 'success' : 'danger'} size="sm" dot>
          {isInflow ? '↑ Ingreso' : '↓ Egreso'}
        </Badge>
        <span className="transaction-list__card-date">
          {formatDate(transaction.paymentDate ?? transaction.createdAt)}
        </span>
      </div>

      <div className="transaction-list__card-body">
        <span className="transaction-list__card-category">{transaction.category.name}</span>
        <span className="transaction-list__card-item">
          {transaction.costItem?.name ?? transaction.item?.name ?? '—'}
        </span>
      </div>

      <div className="transaction-list__card-amounts">
        <div className="transaction-list__card-amount transaction-list__card-amount--usd">
          <span className="transaction-list__card-amount-label">USD</span>
          {transaction.amountUSD != null ? (
            <span className="transaction-list__card-amount-value">{formatUSD(transaction.amountUSD)}</span>
          ) : (
            <span className="transaction-list__card-empty-amount">—</span>
          )}
        </div>
        <div className="transaction-list__card-amount transaction-list__card-amount--bs">
          <span className="transaction-list__card-amount-label">Bs</span>
          {transaction.amountBs != null ? (
            <span className="transaction-list__card-amount-value">{formatBs(transaction.amountBs)}</span>
          ) : (
            <span className="transaction-list__card-empty-amount">—</span>
          )}
        </div>
      </div>

      <div className="transaction-list__card-footer">
        <span className="transaction-list__card-method">
          {getPaymentMethodLabel(transaction.paymentMethod)}
        </span>
        <Badge
          variant={transaction.status === 'COMPLETED' ? 'success' : 'warning'}
          size="sm"
        >
          {transaction.status === 'COMPLETED' ? 'Completado' : 'Pendiente'}
        </Badge>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="transaction-list__skeleton-card">
      <div className="transaction-list__skeleton-header">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </div>
      <div>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </div>
      <div className="transaction-list__skeleton-amounts">
        <Skeleton variant="card" />
        <Skeleton variant="card" />
      </div>
      <div className="transaction-list__skeleton-footer">
        <Skeleton variant="text" />
        <Skeleton variant="text" />
      </div>
    </div>
  );
}

export default function TransactionList({ companyId, filters, onNew, onView }: TransactionListProps) {
  const listFilters = useMemo<TransactionListFilters | undefined>(
    () =>
      filters
        ? {
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
            categoryId: filters.categoryId ?? undefined,
            status: filters.status === 'all' ? undefined : filters.status,
          }
        : undefined,
    [filters]
  );
  const { transactions, meta, isLoading, error, page, refetch, goToPage } = useTransactionList(companyId, listFilters);

  return (
    <div className="transaction-list">
      <div className="transaction-list__header">
        <div>
          <h1 className="transaction-list__title">Transacciones</h1>
          <p className="transaction-list__subtitle">
            Historial detallado de operaciones financieras multi-moneda.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={onNew}>
          <span className="material-symbols-outlined">add_circle</span>
          Nueva Transacción
        </Button>
      </div>

      {error && (
        <div className="transaction-list__error">
          <span className="material-symbols-outlined">error_outline</span>
          <span>{error}</span>
          <button onClick={refetch} className="transaction-list__retry">Reintentar</button>
        </div>
      )}

      {isLoading ? (
        <div className="transaction-list__skeleton-grid">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="transaction-list__empty">
          <div className="transaction-list__empty-icon">
            <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>receipt_long</span>
          </div>
          <h2 className="transaction-list__empty-title">No hay transacciones aún</h2>
          <p className="transaction-list__empty-text">
            Comienza registrando tu primera transacción financiera.
          </p>
          <Button variant="primary" size="lg" onClick={onNew}>
            Crear primera transacción
          </Button>
        </div>
      ) : (
        <>
          <div className="transaction-list__grid">
            {transactions.map((t) => (
              <TransactionCard key={t.id} transaction={t} onView={onView} />
            ))}
          </div>

          {meta && meta.totalPages > 0 && (
            <div className="transaction-list__pagination-wrapper">
              <Pagination
                page={page}
                totalPages={meta.totalPages}
                total={meta.total}
                limit={meta.limit}
                onPageChange={goToPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
