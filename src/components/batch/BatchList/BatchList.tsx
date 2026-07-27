'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useBatchList } from '@/src/use-cases/batch/useBatchList';
import type { ProductionBatch } from '@/src/domain/entities/ProductionBatch';
import Button from '@/src/components/shared/Button';
import Skeleton from '@/src/components/shared/Skeleton';
import './BatchList.css';

interface BatchListProps {
  companyId: string;
  onNew?: () => void;
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
  const datePart = dateStr.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function BatchList({ companyId, onNew }: BatchListProps) {
  const router = useRouter();
  const { batches, meta, isLoading, error, page, refetch, goToPage } = useBatchList(companyId);

  const totalPages = meta?.totalPages ?? 0;

  const handleRowClick = useCallback((batch: ProductionBatch) => {
    router.push(`/${companyId}/batches/${batch.id}`);
  }, [router, companyId]);

  return (
    <div className="batch-list">
      <div className="batch-list__header">
        <div>
          <h1 className="batch-list__title">Lotes de Producción</h1>
          <p className="batch-list__subtitle">
            Gestión de lotes de producción y sus transacciones asociadas.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={onNew}>
          <span className="material-symbols-outlined">add_circle</span>
          Crear Nuevo Lote
        </Button>
      </div>

      {error && (
        <div className="batch-list__error">
          <span className="material-symbols-outlined">error_outline</span>
          <span>{error}</span>
          <button onClick={refetch} className="batch-list__retry">Reintentar</button>
        </div>
      )}

      <div className="batch-list__table-container">
        {isLoading ? (
          <table className="batch-list__table">
            <thead>
              <tr>
                <th className="batch-list__th">Producto</th>
                <th className="batch-list__th batch-list__th--right">Cantidad</th>
                <th className="batch-list__th">Estado</th>
                <th className="batch-list__th">Fecha del Lote</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="batch-list__loading-row">
                  {Array.from({ length: 4 }).map((__, j) => (
                    <td key={j} className="batch-list__td">
                      <Skeleton variant="text" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : batches.length === 0 ? (
          <div className="batch-list__empty">
            <div className="batch-list__empty-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>precision_manufacturing</span>
            </div>
            <h2 className="batch-list__empty-title">No hay lotes aún</h2>
            <p className="batch-list__empty-text">
              Comienza creando tu primer lote de producción.
            </p>
            <Button variant="primary" size="lg" onClick={onNew}>
              Crear primer lote
            </Button>
          </div>
        ) : (
          <>
            <div className="batch-list__table-scroll">
              <table className="batch-list__table">
                <thead>
                  <tr>
                    <th className="batch-list__th">Producto</th>
                    <th className="batch-list__th batch-list__th--right">Cantidad</th>
                    <th className="batch-list__th">Estado</th>
                    <th className="batch-list__th">Fecha del Lote</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((b) => (
                    <tr key={b.id} className="batch-list__row" onClick={() => handleRowClick(b)}>
                      <td className="batch-list__td batch-list__td--name">
                        {b.item?.name ?? b.itemId}
                      </td>
                      <td className="batch-list__td batch-list__td--right">{b.quantity}</td>
                      <td className="batch-list__td">
                        <span className={`batch-list__badge batch-list__badge--${b.status.toLowerCase()}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="batch-list__td">{formatDate(b.batchDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && totalPages > 0 && (
              <div className="batch-list__pagination">
                <span className="batch-list__pagination-info">
                  Mostrando <strong>{(page - 1) * meta.limit + 1}-{Math.min(page * meta.limit, meta.total)}</strong> de{' '}
                  <strong>{meta.total}</strong> lotes
                </span>
                <div className="batch-list__pagination-controls">
                  <button
                    className="batch-list__page-btn"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                    aria-label="Anterior"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {getPageNumbers(page, totalPages).map((p, i) =>
                    p === 'ellipsis' ? (
                      <span key={`ellipsis-${i}`} className="batch-list__page-ellipsis">...</span>
                    ) : (
                      <button
                        key={p}
                        className={`batch-list__page-btn${p === page ? ' batch-list__page-btn--active' : ''}`}
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    className="batch-list__page-btn"
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
