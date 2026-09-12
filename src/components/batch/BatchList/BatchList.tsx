'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBatchList } from '@/src/use-cases/batch/useBatchList';
import { useBatchByProduct } from '@/src/use-cases/batch/useBatchByProduct';
import { useItemSearch } from '@/src/use-cases/item/useItemSearch';
import type { ProductionBatch } from '@/src/domain/entities/ProductionBatch';
import type { Item } from '@/src/domain/entities/Item';
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
  const { searchItem, listItems, result: itemResult, loading: searchingItem } = useItemSearch();

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemQuery, setItemQuery] = useState('');
  const [itemOpen, setItemOpen] = useState(false);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [allItemsLoading, setAllItemsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemContainerRef = useRef<HTMLDivElement>(null);

  const {
    batches: filteredBatches,
    meta: filteredMeta,
    isLoading: filteredLoading,
    error: filteredError,
    page: filteredPage,
    refetch: refetchFiltered,
    goToPage: goToFilteredPage,
  } = useBatchByProduct(companyId, selectedItem?.id);

  const isFiltered = !!selectedItem;
  const activeBatches = isFiltered ? filteredBatches : batches;
  const activeMeta = isFiltered ? filteredMeta : meta;
  const activeLoading = isFiltered ? filteredLoading : isLoading;
  const activeError = isFiltered ? filteredError : error;
  const activePage = isFiltered ? filteredPage : page;
  const activeRefetch = isFiltered ? refetchFiltered : refetch;
  const activeGoToPage = isFiltered ? goToFilteredPage : goToPage;

  const totalPages = activeMeta?.totalPages ?? 0;

  const loadAllItems = useCallback(async () => {
    if (allItems.length > 0) return;
    setAllItemsLoading(true);
    const result = await listItems(companyId);
    if (result) {
      const products = result.items.filter((i) => i.type === 'PRODUCT');
      setAllItems(products);
    }
    setAllItemsLoading(false);
  }, [companyId, listItems, allItems.length]);

  const handleItemSearch = useCallback((term: string) => {
    setItemQuery(term);
    setItemOpen(true);

    if (debounceRef.current !== null) clearTimeout(debounceRef.current);

    if (!term.trim()) return;

    debounceRef.current = setTimeout(() => {
      searchItem(term, companyId);
    }, 300) as ReturnType<typeof setTimeout>;
  }, [companyId, searchItem]);

  const openItemDropdown = useCallback(() => {
    setItemOpen(true);
    loadAllItems();
  }, [loadAllItems]);

  const selectItem = useCallback((item: Item) => {
    setSelectedItem(item);
    setItemQuery(item.name);
    setItemOpen(false);
    goToFilteredPage(1);
  }, [goToFilteredPage]);

  const clearItem = useCallback(() => {
    setSelectedItem(null);
    setItemQuery('');
    setItemOpen(false);
    if (page !== 1) {
      goToPage(1);
    } else {
      refetch();
    }
  }, [page, goToPage, refetch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (itemContainerRef.current && !itemContainerRef.current.contains(e.target as Node)) {
        setItemOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    };
  }, []);

  const itemResults = itemResult?.items?.filter((i) => i.type === 'PRODUCT') ?? [];
  const displayItems = itemQuery.trim() ? itemResults : allItems;
  const isListLoading = allItemsLoading && !itemQuery.trim();
  const isSearchLoading = itemQuery.trim() && searchingItem;

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

      <div className="batch-list__toolbar">
        <div className="batch-list__filter" ref={itemContainerRef}>
          <div className="batch-list__filter-input-wrapper">
            <span className="material-symbols-outlined batch-list__filter-icon">search</span>
            <input
              className="batch-list__filter-input"
              type="text"
              placeholder="Buscar producto..."
              value={itemQuery}
              onChange={(e) => handleItemSearch(e.target.value)}
              onFocus={openItemDropdown}
            />
            {selectedItem && (
              <button
                type="button"
                className="batch-list__filter-clear"
                onClick={clearItem}
                aria-label="Quitar filtro de producto"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
          {itemOpen && (
            <div className="batch-list__filter-dropdown">
              {isListLoading || isSearchLoading ? (
                <div className="batch-list__filter-loading">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="batch-list__filter-skeleton" />
                  ))}
                </div>
              ) : itemQuery.trim() && itemResults.length === 0 && !searchingItem ? (
                <div className="batch-list__filter-empty">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>search_off</span>
                  <span>No se encontraron productos</span>
                </div>
              ) : displayItems.length > 0 ? (
                displayItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="batch-list__filter-option"
                    onClick={() => selectItem(item)}
                  >
                    <span className="batch-list__filter-option-name">{item.name}</span>
                    <span className="batch-list__filter-option-type">{item.type}</span>
                  </button>
                ))
              ) : !itemQuery.trim() && !allItemsLoading ? (
                <div className="batch-list__filter-empty">
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>search</span>
                  <span>Sin resultados</span>
                </div>
              ) : null}
            </div>
          )}
        </div>
        {selectedItem && (
          <span className="batch-list__filter-badge">
            <span className="material-symbols-outlined">filter_alt</span>
            Filtrando por: <strong>{selectedItem.name}</strong>
          </span>
        )}
      </div>

      {activeError && (
        <div className="batch-list__error">
          <span className="material-symbols-outlined">error_outline</span>
          <span>{activeError}</span>
          <button onClick={activeRefetch} className="batch-list__retry">Reintentar</button>
        </div>
      )}

      <div className="batch-list__table-container">
        {activeLoading ? (
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
        ) : activeBatches.length === 0 ? (
          <div className="batch-list__empty">
            <div className="batch-list__empty-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '4rem' }}>precision_manufacturing</span>
            </div>
            <h2 className="batch-list__empty-title">
              {isFiltered ? 'No hay lotes para este producto' : 'No hay lotes aún'}
            </h2>
            <p className="batch-list__empty-text">
              {isFiltered
                ? 'Este producto no tiene lotes de producción asociados.'
                : 'Comienza creando tu primer lote de producción.'}
            </p>
            {!isFiltered && (
              <Button variant="primary" size="lg" onClick={onNew}>
                Crear primer lote
              </Button>
            )}
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
                  {activeBatches.map((b) => (
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

            {activeMeta && totalPages > 0 && (
              <div className="batch-list__pagination">
                <span className="batch-list__pagination-info">
                  Mostrando <strong>{(activePage - 1) * activeMeta.limit + 1}-{Math.min(activePage * activeMeta.limit, activeMeta.total)}</strong> de{' '}
                  <strong>{activeMeta.total}</strong> lotes
                </span>
                <div className="batch-list__pagination-controls">
                  <button
                    className="batch-list__page-btn"
                    disabled={activePage <= 1}
                    onClick={() => activeGoToPage(activePage - 1)}
                    aria-label="Anterior"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {getPageNumbers(activePage, totalPages).map((p, i) =>
                    p === 'ellipsis' ? (
                      <span key={`ellipsis-${i}`} className="batch-list__page-ellipsis">...</span>
                    ) : (
                      <button
                        key={p}
                        className={`batch-list__page-btn${p === activePage ? ' batch-list__page-btn--active' : ''}`}
                        onClick={() => activeGoToPage(p)}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    className="batch-list__page-btn"
                    disabled={activePage >= totalPages}
                    onClick={() => activeGoToPage(activePage + 1)}
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