'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useItemList } from '@/src/use-cases/item/useItemList';
import { useBatchList } from '@/src/use-cases/batch/useBatchList';
import './BalancePointSelector.css';

export type BalancePointView = 'global' | 'product' | 'service' | 'batch';

interface BalancePointSelectorProps {
  view: BalancePointView;
  onViewChange: (view: BalancePointView) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  companyId: string;
}

interface TabOption {
  key: BalancePointView;
  label: string;
}

const TABS: TabOption[] = [
  { key: 'global', label: 'Global' },
  { key: 'product', label: 'Productos' },
  { key: 'service', label: 'Servicios' },
  { key: 'batch', label: 'Lotes' },
];

function SearchableSelect({
  label,
  value,
  options,
  placeholder,
  loading,
  error,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
  loading: boolean;
  error: string | null;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? '',
    [options, value],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const term = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(term));
  }, [options, query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((id: string) => {
    onChange(id);
    setIsOpen(false);
    setQuery('');
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange('');
    setQuery('');
    inputRef.current?.focus();
  }, [onChange]);

  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

  return (
    <div className="balance-point-selector__field">
      <label className="balance-point-selector__label">{label}</label>
      {loading ? (
        <div className="balance-point-selector__loading">Cargando opciones…</div>
      ) : error ? (
        <div className="balance-point-selector__error">{error}</div>
      ) : (
        <div className="balance-point-selector__search" ref={containerRef}>
          <div className="balance-point-selector__input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="balance-point-selector__input"
              placeholder={value ? selectedLabel : placeholder}
              value={query}
              onFocus={handleInputFocus}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
            />
            {value && (
              <button
                type="button"
                className="balance-point-selector__clear"
                onClick={handleClear}
                aria-label="Limpiar selección"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {isOpen && (
            <div className="balance-point-selector__dropdown">
              {filtered.length > 0 ? (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`balance-point-selector__option${opt.value === value ? ' balance-point-selector__option--selected' : ''}`}
                    onClick={() => handleSelect(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))
              ) : (
                <div className="balance-point-selector__dropdown-empty">
                  No se encontraron resultados
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatBatchDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy', { locale: es });
  } catch {
    return dateStr;
  }
}

export default function BalancePointSelector({
  view,
  onViewChange,
  selectedId,
  onSelect,
  companyId,
}: BalancePointSelectorProps) {
  const { items: products, isLoading: productsLoading, error: productsError } = useItemList(companyId, 'PRODUCT');
  const { items: services, isLoading: servicesLoading, error: servicesError } = useItemList(companyId, 'SERVICE');
  const { batches, isLoading: batchesLoading, error: batchesError } = useBatchList(companyId);

  const productOptions = useMemo(
    () => products.map((p) => ({ value: p.id, label: p.name })),
    [products],
  );
  const serviceOptions = useMemo(
    () => services.map((s) => ({ value: s.id, label: s.name })),
    [services],
  );
  const batchOptions = useMemo(
    () => batches.map((b) => ({
      value: b.id,
      label: b.item?.name
        ? `${b.item.name} — ${b.quantity} uds — ${formatBatchDate(b.batchDate)}`
        : `Lote ${b.id.slice(0, 8)}`,
    })),
    [batches],
  );

  return (
    <div className="balance-point-selector">
      <div className="balance-point-selector__tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={view === tab.key}
            className={`balance-point-selector__tab${view === tab.key ? ' balance-point-selector__tab--active' : ''}`}
            onClick={() => onViewChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="balance-point-selector__body">
        {view === 'product' && (
          <SearchableSelect
            label="Producto"
            value={selectedId}
            options={productOptions}
            placeholder="Buscar producto…"
            loading={productsLoading}
            error={productsError}
            onChange={onSelect}
          />
        )}
        {view === 'service' && (
          <SearchableSelect
            label="Servicio"
            value={selectedId}
            options={serviceOptions}
            placeholder="Buscar servicio…"
            loading={servicesLoading}
            error={servicesError}
            onChange={onSelect}
          />
        )}
        {view === 'batch' && (
          <SearchableSelect
            label="Lote"
            value={selectedId}
            options={batchOptions}
            placeholder="Buscar lote…"
            loading={batchesLoading}
            error={batchesError}
            onChange={onSelect}
          />
        )}
      </div>
    </div>
  );
}
