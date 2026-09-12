'use client';

import { useState, useCallback, useMemo } from 'react';
import { useUnitCostByBatch } from '@/src/use-cases/unit-cost/useUnitCostByBatch';
import { useUnitCostByProduct } from '@/src/use-cases/unit-cost/useUnitCostByProduct';
import { useUnitCostByService } from '@/src/use-cases/unit-cost/useUnitCostByService';
import { useBatchList } from '@/src/use-cases/batch/useBatchList';
import { useItemList } from '@/src/use-cases/item/useItemList';
import UnitCostCard from '@/src/components/unit-cost/UnitCostCard';
import type { ItemType } from '@/src/domain/entities/Item';
import './UnitCostScreen.css';

interface UnitCostScreenProps {
  companyId: string;
}

function Skeleton() {
  return (
    <div className="unit-cost-screen">
      <div className="unit-cost-screen__header">
        <div className="unit-cost-screen__skeleton" style={{ width: 200, height: 28 }} />
        <div className="unit-cost-screen__skeleton" style={{ width: 300, height: 16, marginTop: 8 }} />
      </div>
      <div className="unit-cost-screen__section">
        <div className="unit-cost-card__grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="unit-cost-screen__skeleton-card">
              <div className="unit-cost-screen__skeleton" style={{ width: 80, height: 11, marginBottom: 12 }} />
              <div className="unit-cost-screen__skeleton" style={{ width: 120, height: 24, marginBottom: 4 }} />
              <div className="unit-cost-screen__skeleton" style={{ width: 90, height: 13 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="unit-cost-screen">
      <div className="unit-cost-screen__error">
        <svg className="unit-cost-screen__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="unit-cost-screen__error-text">{message}</p>
        <button className="unit-cost-screen__error-btn" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    </div>
  );
}

type UnitCostView = 'batch' | 'item';

export default function UnitCostScreen({ companyId }: UnitCostScreenProps) {
  const [view, setView] = useState<UnitCostView>('batch');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(null);
  const [itemSearch, setItemSearch] = useState('');

  const {
    batches,
    isLoading: batchesLoading,
    error: batchesError,
  } = useBatchList(companyId);

  const {
    items,
    isLoading: itemsLoading,
  } = useItemList(companyId, 'all', itemSearch);

  const {
    data: batchData,
    isLoading: batchCostLoading,
    error: batchCostError,
    refetch: refetchBatch,
  } = useUnitCostByBatch(selectedBatchId || undefined, companyId);

  const {
    data: productData,
    isLoading: productCostLoading,
    error: productCostError,
    refetch: refetchProduct,
  } = useUnitCostByProduct(
    selectedItemType === 'PRODUCT' ? selectedItemId || undefined : undefined,
    companyId,
  );

  const {
    data: serviceData,
    isLoading: serviceCostLoading,
    error: serviceCostError,
    refetch: refetchService,
  } = useUnitCostByService(
    selectedItemType === 'SERVICE' ? selectedItemId || undefined : undefined,
    companyId,
  );

  const handleRetry = useCallback(() => {
    if (view === 'batch') refetchBatch();
    else if (selectedItemType === 'PRODUCT') refetchProduct();
    else refetchService();
  }, [view, selectedItemType, refetchBatch, refetchProduct, refetchService]);

  const handleViewChange = useCallback((nextView: UnitCostView) => {
    setView(nextView);
    setSelectedBatchId('');
    setSelectedItemId('');
    setSelectedItemType(null);
    setItemSearch('');
  }, []);

  const handleBatchSelect = useCallback((batchId: string) => {
    setSelectedBatchId(batchId);
    setSelectedItemId('');
    setSelectedItemType(null);
  }, []);

  const handleItemSelect = useCallback((itemId: string, type: ItemType) => {
    setSelectedItemId(itemId);
    setSelectedItemType(type);
    setSelectedBatchId('');
  }, []);

  const filteredItems = useMemo(() => {
    if (!itemSearch.trim()) return items;
    return items;
  }, [items, itemSearch]);

  const currentData = view === 'batch' ? batchData : selectedItemType === 'PRODUCT' ? productData : serviceData;
  const currentLoading = view === 'batch' ? batchCostLoading : selectedItemType === 'PRODUCT' ? productCostLoading : serviceCostLoading;
  const currentError = view === 'batch' ? batchCostError : selectedItemType === 'PRODUCT' ? productCostError : serviceCostError;

  const hasSelection = view === 'batch' ? !!selectedBatchId : !!selectedItemId;

  if (batchesLoading && itemsLoading) return <Skeleton />;

  if (currentError && !currentData && hasSelection) {
    return (
      <ErrorState
        message={currentError ?? 'No se pudieron cargar los datos'}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="unit-cost-screen">
      <div className="unit-cost-screen__header">
        <h1 className="unit-cost-screen__title">Costo Unitario</h1>
        <p className="unit-cost-screen__subtitle">
          Análisis de costo por unidad por lote, producto o servicio.
        </p>
      </div>

      <div className="unit-cost-screen__tabs">
        <button
          className={`unit-cost-screen__tab${view === 'batch' ? ' unit-cost-screen__tab--active' : ''}`}
          onClick={() => handleViewChange('batch')}
        >
          Por Lote
        </button>
        <button
          className={`unit-cost-screen__tab${view === 'item' ? ' unit-cost-screen__tab--active' : ''}`}
          onClick={() => handleViewChange('item')}
        >
          Por Producto / Servicio
        </button>
      </div>

      {view === 'batch' && (
        <div className="unit-cost-screen__selector">
          <label className="unit-cost-screen__selector-label">Seleccionar lote</label>
          <select
            className="unit-cost-screen__select"
            value={selectedBatchId}
            onChange={(e) => handleBatchSelect(e.target.value)}
          >
            <option value="">-- Seleccionar lote --</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.item?.name ?? 'Producto'} — {batch.quantity} unds ({batch.status})
              </option>
            ))}
          </select>
          {batchesError && (
            <span className="unit-cost-screen__selector-error">{batchesError}</span>
          )}
        </div>
      )}

      {view === 'item' && (
        <div className="unit-cost-screen__selector">
          <label className="unit-cost-screen__selector-label">Buscar producto o servicio</label>
          <input
            type="text"
            className="unit-cost-screen__search-input"
            placeholder="Escribe para buscar..."
            value={itemSearch}
            onChange={(e) => setItemSearch(e.target.value)}
          />
          <select
            className="unit-cost-screen__select"
            value={selectedItemId}
            onChange={(e) => {
              const item = filteredItems.find((i) => i.id === e.target.value);
              if (item) handleItemSelect(item.id, item.type);
            }}
          >
            <option value="">-- Seleccionar producto o servicio --</option>
            {filteredItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.type === 'PRODUCT' ? 'Producto' : 'Servicio'})
              </option>
            ))}
          </select>
          {itemsLoading && (
            <span className="unit-cost-screen__selector-loading">Buscando...</span>
          )}
        </div>
      )}

      <div className="unit-cost-screen__section">
        {currentLoading && hasSelection ? (
          <div className="unit-cost-card__grid">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="unit-cost-screen__skeleton-card">
                <div className="unit-cost-screen__skeleton" style={{ width: 80, height: 11, marginBottom: 12 }} />
                <div className="unit-cost-screen__skeleton" style={{ width: 120, height: 24, marginBottom: 4 }} />
                <div className="unit-cost-screen__skeleton" style={{ width: 90, height: 13 }} />
              </div>
            ))}
          </div>
        ) : currentData ? (
          <>
            <div className="unit-cost-screen__item-header">
              <span className="unit-cost-screen__item-label">
                {view === 'batch' ? 'Lote de producci\u00f3n' : selectedItemType === 'PRODUCT' ? 'Producto' : 'Servicio'}
              </span>
              <span className="unit-cost-screen__item-name">{currentData.itemName}</span>
            </div>
            <UnitCostCard data={currentData} />
          </>
        ) : (
          <div className="unit-cost-screen__placeholder">
            {view === 'batch'
              ? 'Selecciona un lote para ver su costo unitario.'
              : 'Selecciona un producto o servicio para ver su costo unitario.'}
          </div>
        )}
      </div>
    </div>
  );
}
