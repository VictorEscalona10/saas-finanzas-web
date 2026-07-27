'use client';

import { useState, useCallback, useEffect, useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateBatch } from '@/src/use-cases/batch/useCreateBatch';
import { useItemSearch } from '@/src/use-cases/item/useItemSearch';
import type { BatchStatus } from '@/src/domain/entities/ProductionBatch';
import type { Item } from '@/src/domain/entities/Item';
import Button from '@/src/components/shared/Button';
import './BatchForm.css';

interface BatchFormProps {
  companyId: string;
  onCancel: () => void;
  id?: string;
  hideFooter?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

export default function BatchForm({ companyId, onCancel, id, hideFooter, onLoadingChange }: BatchFormProps) {
  const router = useRouter();
  const { createBatch, loading } = useCreateBatch();
  const { searchItem, listItems, result: itemResult, loading: searchingItem } = useItemSearch();

  const [itemQuery, setItemQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemOpen, setItemOpen] = useState(false);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [allItemsLoading, setAllItemsLoading] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState<BatchStatus>('OPEN');
  const [batchDate, setBatchDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

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
    setSelectedItem(null);
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
  }, []);

  const clearItem = useCallback(() => {
    setSelectedItem(null);
    setItemQuery('');
    setItemOpen(false);
  }, []);

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

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedItem) {
      setError('Debes seleccionar un producto');
      return;
    }

    const batch = await createBatch(companyId, selectedItem.id, {
      quantity: quantity ? parseInt(quantity, 10) : undefined,
      status,
      batchDate: batchDate || undefined,
    });

    if (batch) {
      router.push(`/${companyId}/batches/${batch.id}`);
    } else {
      setError('Error al crear el lote');
    }
  }, [companyId, selectedItem, quantity, status, batchDate, createBatch, router]);

  return (
    <div className="batch-form-wrapper">
      <div className="batch-form">
        <form className="batch-form__body" id={id} onSubmit={handleSubmit}>
          <div className="batch-form__field">
            <label className="batch-form__label">Producto</label>
            <div className="batch-form__item-search" ref={itemContainerRef}>
              <div className="batch-form__item-input-wrapper">
                <input
                  className="batch-form__item-input"
                  type="text"
                  placeholder="Buscar producto..."
                  value={itemQuery}
                  onChange={(e) => handleItemSearch(e.target.value)}
                  onFocus={openItemDropdown}
                />
                {selectedItem && (
                  <button
                    type="button"
                    className="batch-form__item-clear"
                    onClick={clearItem}
                    aria-label="Limpiar producto"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>close</span>
                  </button>
                )}
              </div>
              {itemOpen && (
                <div className="batch-form__item-dropdown">
                  {isListLoading || isSearchLoading ? (
                    <div className="batch-form__item-dropdown-loading">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="batch-form__item-skeleton" />
                      ))}
                    </div>
                  ) : itemQuery.trim() && itemResults.length === 0 && !searchingItem ? (
                    <div className="batch-form__item-dropdown-empty">
                      <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>search_off</span>
                      <span>No se encontraron productos</span>
                    </div>
                  ) : displayItems.length > 0 ? (
                    displayItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="batch-form__item-option"
                        onClick={() => selectItem(item)}
                      >
                        <span className="batch-form__item-option-name">{item.name}</span>
                        <span className="batch-form__item-option-type">{item.type}</span>
                      </button>
                    ))
                  ) : !itemQuery.trim() && !allItemsLoading ? (
                    <div className="batch-form__item-dropdown-empty">
                      <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>search</span>
                      <span>Sin resultados</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div className="batch-form__field">
            <label className="batch-form__label">Cantidad Producida</label>
            <input
              className="batch-form__input"
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="batch-form__field">
            <label className="batch-form__label">Estado</label>
            <div className="batch-form__status-toggle">
              <button
                type="button"
                className={`batch-form__status-btn${status === 'OPEN' ? ' batch-form__status-btn--active batch-form__status-btn--open' : ''}`}
                onClick={() => setStatus('OPEN')}
              >
                Abierto
              </button>
              <button
                type="button"
                className={`batch-form__status-btn${status === 'CLOSED' ? ' batch-form__status-btn--active batch-form__status-btn--closed' : ''}`}
                onClick={() => setStatus('CLOSED')}
              >
                Cerrado
              </button>
            </div>
          </div>

          <div className="batch-form__field">
            <label className="batch-form__label" htmlFor="batch-date">Fecha del Lote</label>
            <input
              id="batch-date"
              className="batch-form__input"
              type="date"
              value={batchDate}
              onChange={(e) => setBatchDate(e.target.value)}
            />
          </div>

          {error && (
            <div className="batch-form__error">{error}</div>
          )}

          {!hideFooter && (
            <div className="batch-form__footer">
              <Button variant="outline" size="lg" fullWidth onClick={onCancel} type="button" disabled={loading}>
                Cancelar
              </Button>
              <Button variant="primary" size="lg" fullWidth loading={loading} type="submit">
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
