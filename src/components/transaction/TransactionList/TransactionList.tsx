'use client';

import { useTransactionList } from '@/src/use-cases/transaction/useTransactionList';
import type { Transaction } from '@/src/domain/entities/Transaction';
import { PAYMENT_METHODS } from '@/src/shared/constants';
import Button from '@/src/components/shared/Button';
import Skeleton from '@/src/components/shared/Skeleton';
import './TransactionList.css';

interface TransactionListProps {
  companyId: string;
  onNew?: () => void;
  onView?: (transaction: Transaction) => void;
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
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

export default function TransactionList({ companyId, onNew, onView }: TransactionListProps) {
  const { transactions, meta, isLoading, error, page, refetch, goToPage } = useTransactionList(companyId);

  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 0;

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

      <div className="transaction-list__table-container">
        {isLoading ? (
          <table className="transaction-list__table">
            <thead>
              <tr>
                <th className="transaction-list__th">Fecha</th>
                <th className="transaction-list__th">Categoría</th>
                <th className="transaction-list__th">Item</th>
                <th className="transaction-list__th">Tipo</th>
                <th className="transaction-list__th transaction-list__th--right">Monto USD</th>
                <th className="transaction-list__th transaction-list__th--right">Monto Bs</th>
                <th className="transaction-list__th">Método</th>
                <th className="transaction-list__th">Estado</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="transaction-list__loading-row">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="transaction-list__td">
                      <Skeleton variant="text" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
            <div className="transaction-list__table-scroll">
              <table className="transaction-list__table">
                <thead>
                  <tr>
                    <th className="transaction-list__th">Fecha</th>
                    <th className="transaction-list__th">Categoría</th>
                    <th className="transaction-list__th">Item</th>
                    <th className="transaction-list__th">Tipo</th>
                    <th className="transaction-list__th transaction-list__th--right">Monto USD</th>
                    <th className="transaction-list__th transaction-list__th--right">Monto Bs</th>
                    <th className="transaction-list__th">Método</th>
                    <th className="transaction-list__th">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="transaction-list__row" onClick={() => onView?.(t)}>
                      <td className="transaction-list__td transaction-list__td--date">
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="transaction-list__td transaction-list__td--category">
                        <span className="transaction-list__category-name">{t.category.name}</span>
                      </td>
                      <td className="transaction-list__td transaction-list__td--item">
                        {t.item?.name ?? <span className="transaction-list__empty-value">&mdash;</span>}
                      </td>
                      <td className="transaction-list__td">
                        <span className={`transaction-list__badge transaction-list__badge--flow transaction-list__badge--${t.category.flowDirection?.toLowerCase() ?? 'inflow'}`}>
                          {t.category.flowDirection === 'OUTFLOW' ? '↓ Egreso' : '↑ Ingreso'}
                        </span>
                      </td>
                      <td className="transaction-list__td transaction-list__td--right transaction-list__td--amount">
                        {t.amountUSD != null ? formatUSD(t.amountUSD) : <span className="transaction-list__empty-value">&mdash;</span>}
                      </td>
                      <td className="transaction-list__td transaction-list__td--right transaction-list__td--amount">
                        {t.amountBs != null ? formatBs(t.amountBs) : <span className="transaction-list__empty-value">&mdash;</span>}
                      </td>
                      <td className="transaction-list__td transaction-list__td--method">
                        {getPaymentMethodLabel(t.paymentMethod)}
                      </td>
                      <td className="transaction-list__td">
                        <span className={`transaction-list__badge transaction-list__badge--${t.status.toLowerCase()}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && totalPages > 0 && (
              <div className="transaction-list__pagination">
                <span className="transaction-list__pagination-info">
                  Mostrando <strong>{(page - 1) * meta.limit + 1}-{Math.min(page * meta.limit, meta.total)}</strong> de{' '}
                  <strong>{meta.total}</strong> registros
                </span>
                <div className="transaction-list__pagination-controls">
                  <button
                    className="transaction-list__page-btn"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                    aria-label="Anterior"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {getPageNumbers(page, totalPages).map((p, i) =>
                    p === 'ellipsis' ? (
                      <span key={`ellipsis-${i}`} className="transaction-list__page-ellipsis">...</span>
                    ) : (
                      <button
                        key={p}
                        className={`transaction-list__page-btn${p === page ? ' transaction-list__page-btn--active' : ''}`}
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    className="transaction-list__page-btn"
                    disabled={page >= totalPages}
                    onClick={() => goToPage(page + 1)}
                    aria-label="Siguiente"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
