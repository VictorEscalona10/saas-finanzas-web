'use client';

import { useCallback, useMemo, useState } from 'react';
import { useItemList, type ItemTypeFilter as ItemTypeFilterType } from '@/src/use-cases/item/useItemList';
import { useDeleteItem } from '@/src/use-cases/item/useDeleteItem';
import type { Item } from '@/src/domain/entities/Item';
import Button from '@/src/components/shared/Button';
import Skeleton from '@/src/components/shared/Skeleton';
import ItemTypeFilter from '@/src/components/item/ItemTypeFilter';
import './ItemList.css';

interface ItemListProps {
  companyId: string | undefined;
  onNew?: () => void;
  onEdit?: (item: Item) => void;
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

export default function ItemList({ companyId, onNew, onEdit }: ItemListProps) {
  const [typeFilter, setTypeFilter] = useState<ItemTypeFilterType>('all');
  const { items, meta, isLoading, error, page, refetch, goToPage } = useItemList(companyId, typeFilter);
  const { deleteItem, loading: deleting } = useDeleteItem();

  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 0;

  const stats = useMemo(() => {
    const products = items.filter((i) => i.type === 'PRODUCT').length;
    const services = items.filter((i) => i.type === 'SERVICE').length;
    const totalStock = items.reduce((sum, i) => sum + (i.type === 'PRODUCT' ? i.stockCurrent : 0), 0);
    return { products, services, totalStock };
  }, [items]);

  const handleDelete = useCallback(async (item: Item) => {
    if (!companyId) return;
    const confirmed = window.confirm(`¿Eliminar item "${item.name}"?`);
    if (confirmed) {
      const success = await deleteItem(item.id, companyId);
      if (success) refetch();
    }
  }, [companyId, deleteItem, refetch]);

  const formatPrice = (price: number) => {
    return `$ ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!companyId) {
    return (
      <div className="item-list">
        <div className="item-list__empty">
          <div className="item-list__empty-icon">
            <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>business</span>
          </div>
          <h2 className="item-list__empty-title">Selecciona una compañía</h2>
          <p className="item-list__empty-text">
            Selecciona una compañía para ver sus productos y servicios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="item-list">
      <div className="item-list__header">
        <div>
          <h1 className="item-list__title">Productos y Servicios</h1>
          <p className="item-list__subtitle">
            Gestiona tu catálogo de productos y servicios de manera centralizada.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={onNew}>
          <span className="material-symbols-outlined">add_circle</span>
          Nuevo Item
        </Button>
      </div>

      <div className="item-list__stats">
        <div className="item-list__stat-card item-list__stat-card--primary">
          <div className="item-list__stat-icon-box">
            <span className="material-symbols-outlined item-list__stat-icon">inventory_2</span>
          </div>
          <div>
            <div className="item-list__stat-label">Total Items</div>
            <div className="item-list__stat-value">{total}</div>
          </div>
        </div>
        <div className="item-list__stat-card item-list__stat-card--products">
          <div className="item-list__stat-icon-box">
            <span className="material-symbols-outlined item-list__stat-icon">package_2</span>
          </div>
          <div>
            <div className="item-list__stat-label">Productos</div>
            <div className="item-list__stat-value">{stats.products}</div>
          </div>
        </div>
        <div className="item-list__stat-card item-list__stat-card--services">
          <div className="item-list__stat-icon-box">
            <span className="material-symbols-outlined item-list__stat-icon">build</span>
          </div>
          <div>
            <div className="item-list__stat-label">Servicios</div>
            <div className="item-list__stat-value">{stats.services}</div>
          </div>
        </div>
        <div className="item-list__stat-card item-list__stat-card--stock">
          <div className="item-list__stat-icon-box">
            <span className="material-symbols-outlined item-list__stat-icon">inventory</span>
          </div>
          <div>
            <div className="item-list__stat-label">Stock Total</div>
            <div className="item-list__stat-value">
              {stats.totalStock.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="item-list__error">
          <span className="material-symbols-outlined">error_outline</span>
          <span>{error}</span>
          <button onClick={refetch} className="item-list__retry">Reintentar</button>
        </div>
      )}

      <div className="item-list__table-container">
        <div className="item-list__filter-bar">
          <ItemTypeFilter value={typeFilter} onChange={setTypeFilter} />
          <div className="item-list__search-wrapper">
            <span className="material-symbols-outlined item-list__search-icon">search</span>
            <input
              className="item-list__search-input"
              type="text"
              placeholder="Buscar item..."
              readOnly
            />
          </div>
        </div>

        {isLoading ? (
          <table className="item-list__table">
            <thead>
              <tr>
                <th className="item-list__th">Nombre</th>
                <th className="item-list__th">Tipo</th>
                <th className="item-list__th item-list__th--right">Precio Base (USD)</th>
                <th className="item-list__th item-list__th--center">Stock</th>
                <th className="item-list__th item-list__th--right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="item-list__loading-row">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="item-list__td">
                      <Skeleton variant="text" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : items.length === 0 ? (
          <div className="item-list__empty">
            <div className="item-list__empty-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>inventory_2</span>
            </div>
            <h2 className="item-list__empty-title">No hay items aún</h2>
            <p className="item-list__empty-text">
              Comienza agregando productos o servicios a tu catálogo.
            </p>
            <Button variant="primary" size="lg" onClick={onNew}>
              Crear primer item
            </Button>
          </div>
        ) : (
          <>
            <div className="item-list__table-scroll">
              <table className="item-list__table">
<thead>
                    <tr>
                      <th className="item-list__th">Nombre</th>
                      <th className="item-list__th">Tipo</th>
                      <th className="item-list__th item-list__th--right">Precio Base (USD)</th>
                      <th className="item-list__th item-list__th--center">Stock</th>
                      <th className="item-list__th item-list__th--right">Acciones</th>
                    </tr>
                  </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="item-list__row">
                      <td className="item-list__td item-list__td--name">
                        <div className="item-list__item-cell">
                          <div className="item-list__item-avatar">
                            {item.type === 'PRODUCT' ? (
                              <span className="material-symbols-outlined">package_2</span>
                            ) : (
                              <span className="material-symbols-outlined">build</span>
                            )}
                          </div>
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="item-list__td">
                        <span className={`item-list__badge item-list__badge--${item.type.toLowerCase()}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="item-list__td item-list__td--right item-list__td--price">
                        {formatPrice(item.basePrice)}
                      </td>
                      <td className="item-list__td item-list__td--center">
                        {item.type === 'PRODUCT' ? (
                          <span className={item.stockCurrent === 0 ? 'item-list__stock--empty' : ''}>
                            {item.stockCurrent}
                          </span>
                        ) : (
                          <span className="item-list__stock--na">N/A</span>
                        )}
                      </td>
                      <td className="item-list__td item-list__td--actions">
                        <button
                          className="item-list__action item-list__action--edit"
                          onClick={() => onEdit?.(item)}
                          aria-label="Editar"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          className="item-list__action item-list__action--delete"
                          onClick={() => handleDelete(item)}
                          aria-label="Eliminar"
                          disabled={deleting}
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && totalPages > 0 && (
              <div className="item-list__pagination">
                <span className="item-list__pagination-info">
                  Mostrando <strong>{(page - 1) * meta.limit + 1}-{Math.min(page * meta.limit, meta.total)}</strong> de{' '}
                  <strong>{meta.total}</strong> items
                </span>
                <div className="item-list__pagination-controls">
                  <button
                    className="item-list__page-btn"
                    disabled={page <= 1}
                    onClick={() => goToPage(page - 1)}
                    aria-label="Anterior"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {getPageNumbers(page, totalPages).map((p, i) =>
                    p === 'ellipsis' ? (
                      <span key={`ellipsis-${i}`} className="item-list__page-ellipsis">...</span>
                    ) : (
                      <button
                        key={p}
                        className={`item-list__page-btn${p === page ? ' item-list__page-btn--active' : ''}`}
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    className="item-list__page-btn"
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
