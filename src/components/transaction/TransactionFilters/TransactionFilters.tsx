'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { startOfDay, subDays, startOfMonth, format } from 'date-fns';
import CategorySelect from '@/src/components/category/CategorySelect';
import { useItemSearch } from '@/src/use-cases/item/useItemSearch';
import type { Category } from '@/src/domain/entities/Category';
import type { Item } from '@/src/domain/entities/Item';
import type { TransactionStatus } from '@/src/domain/entities/Transaction';
import './TransactionFilters.css';

export interface TransactionFiltersState {
  startDate: string;
  endDate: string;
  categoryId: string | null;
  status: TransactionStatus | 'all';
  itemId: string | null;
}

interface TransactionFiltersProps {
  companyId: string;
  onFilter: (filters: TransactionFiltersState) => void;
}

interface QuickRange {
  key: string;
  label: string;
  start: string;
  end: string;
}

const EMPTY_FILTERS: TransactionFiltersState = {
  startDate: '',
  endDate: '',
  categoryId: null,
  status: 'all',
  itemId: null,
};

const ITEM_DEBOUNCE_MS = 300;

function countActiveFilters(filters: TransactionFiltersState): number {
  let count = 0;
  if (filters.startDate) count += 1;
  if (filters.endDate) count += 1;
  if (filters.categoryId) count += 1;
  if (filters.status !== 'all') count += 1;
  if (filters.itemId) count += 1;
  return count;
}

function buildQuickRanges(): QuickRange[] {
  const end = new Date();
  const today = format(startOfDay(end), 'yyyy-MM-dd');
  return [
    { key: 'today', label: 'Hoy', start: today, end: today },
    { key: '7d', label: 'Últimos 7 días', start: format(subDays(end, 6), 'yyyy-MM-dd'), end: today },
    { key: '15d', label: 'Últimos 15 días', start: format(subDays(end, 14), 'yyyy-MM-dd'), end: today },
    { key: 'month', label: 'Este mes', start: format(startOfMonth(end), 'yyyy-MM-dd'), end: today },
  ];
}

export default function TransactionFilters({ companyId, onFilter }: TransactionFiltersProps) {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState<TransactionFiltersState>(EMPTY_FILTERS);
  const [appliedCategory, setAppliedCategory] = useState<Category | null>(null);
  const [appliedItem, setAppliedItem] = useState<Item | null>(null);
  const [draft, setDraft] = useState<TransactionFiltersState>(EMPTY_FILTERS);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [itemQuery, setItemQuery] = useState('');
  const [itemOpen, setItemOpen] = useState(false);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [allItemsLoading, setAllItemsLoading] = useState(false);
  const itemContainerRef = useRef<HTMLDivElement>(null);
  const itemDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { searchItem, listItems, result: itemResult, loading: itemSearching } = useItemSearch();

  const quickRanges = useMemo(buildQuickRanges, []);
  const itemResults = useMemo(() => itemResult?.items ?? [], [itemResult?.items]);
  const displayItems = itemQuery.trim() ? itemResults : allItems;
  const isItemListLoading = allItemsLoading && !itemQuery.trim();
  const isItemSearchLoading = itemQuery.trim() && itemSearching;

  const activeCount = countActiveFilters(applied);
  const activeRangeKey = quickRanges.find((r) => r.start === applied.startDate && r.end === applied.endDate)?.key;

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        setDraft(applied);
        setSelectedCategory(appliedCategory);
        setSelectedItem(appliedItem);
      }
      return next;
    });
  }, [applied, appliedCategory, appliedItem]);

  const applyFilters = useCallback((next: TransactionFiltersState, category: Category | null, item: Item | null) => {
    setApplied(next);
    setAppliedCategory(category);
    setAppliedItem(item);
    setOpen(false);
    onFilter(next);
  }, [onFilter]);

  const handleApply = useCallback(() => {
    if (draft.startDate && draft.endDate && draft.startDate > draft.endDate) {
      return;
    }
    const next: TransactionFiltersState = {
      startDate: draft.startDate,
      endDate: draft.endDate,
      categoryId: selectedCategory?.id ?? null,
      status: draft.status,
      itemId: selectedItem?.id ?? null,
    };
    applyFilters(next, selectedCategory, selectedItem);
  }, [draft, selectedCategory, selectedItem, applyFilters]);

  const handleClear = useCallback(() => {
    setDraft(EMPTY_FILTERS);
    setSelectedCategory(null);
    setSelectedItem(null);
    setItemQuery('');
    setItemOpen(false);
    applyFilters(EMPTY_FILTERS, null, null);
  }, [applyFilters]);

  const handleQuickRange = useCallback((range: QuickRange) => {
    const next: TransactionFiltersState = {
      ...applied,
      startDate: range.start,
      endDate: range.end,
    };
    setDraft(next);
    applyFilters(next, appliedCategory, appliedItem);
  }, [applied, appliedCategory, appliedItem, applyFilters]);

  const loadAllItems = useCallback(async () => {
    if (allItems.length > 0) return;
    setAllItemsLoading(true);
    const result = await listItems(companyId);
    if (result) setAllItems(result.items);
    setAllItemsLoading(false);
  }, [companyId, listItems, allItems.length]);

  const handleItemSearch = useCallback((term: string) => {
    setItemQuery(term);
    setSelectedItem(null);
    setItemOpen(true);

    if (itemDebounceRef.current !== null) clearTimeout(itemDebounceRef.current);

    if (!term.trim()) return;

    itemDebounceRef.current = setTimeout(() => {
      void searchItem(term, companyId);
    }, ITEM_DEBOUNCE_MS) as ReturnType<typeof setTimeout>;
  }, [companyId, searchItem]);

  const openItemDropdown = useCallback(() => {
    setItemOpen(true);
    void loadAllItems();
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
      if (itemDebounceRef.current !== null) clearTimeout(itemDebounceRef.current);
    };
  }, []);

  const hasDateRange = applied.startDate && applied.endDate;

  return (
    <div className="transaction-filters">
      <div className="transaction-filters__quick-row">
        {quickRanges.map((r) => (
          <button
            key={r.key}
            type="button"
            className={`transaction-filters__quick-btn${activeRangeKey === r.key ? ' transaction-filters__quick-btn--active' : ''}`}
            onClick={() => handleQuickRange(r)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="transaction-filters__bar">
        <button
          type="button"
          className={`transaction-filters__toggle${open ? ' transaction-filters__toggle--open' : ''}`}
          onClick={handleToggle}
          aria-expanded={open}
        >
          <span className="material-symbols-outlined transaction-filters__toggle-icon">filter_list</span>
          Filtrar
          {activeCount > 0 && (
            <span className="transaction-filters__badge">{activeCount}</span>
          )}
          <span className={`material-symbols-outlined transaction-filters__chevron${open ? ' transaction-filters__chevron--open' : ''}`}>
            expand_more
          </span>
        </button>

        {activeCount > 0 && (
          <div className="transaction-filters__chips">
            {hasDateRange && (
              <span className="transaction-filters__chip">
                {`${applied.startDate} → ${applied.endDate}`}
              </span>
            )}
            {appliedCategory && (
              <span className="transaction-filters__chip">
                {appliedCategory.name}
              </span>
            )}
            {appliedItem && (
              <span className="transaction-filters__chip">
                {appliedItem.name}
              </span>
            )}
            {applied.status !== 'all' && (
              <span className="transaction-filters__chip transaction-filters__chip--status">
                {applied.status === 'COMPLETED' ? 'Completado' : 'Pendiente'}
              </span>
            )}
            <button
              type="button"
              className="transaction-filters__clear"
              onClick={handleClear}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>close</span>
              Limpiar
            </button>
          </div>
        )}
      </div>

      {open && (
        <div className="transaction-filters__panel">
          <div className="transaction-filters__grid">
            <div className="transaction-filters__field">
              <label className="transaction-filters__label">Desde</label>
              <div className="transaction-filters__input-wrap">
                <span className="material-symbols-outlined transaction-filters__input-icon">calendar_today</span>
                <input
                  type="date"
                  className="transaction-filters__date-input"
                  value={draft.startDate}
                  max={draft.endDate || undefined}
                  onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="transaction-filters__field">
              <label className="transaction-filters__label">Hasta</label>
              <div className="transaction-filters__input-wrap">
                <span className="material-symbols-outlined transaction-filters__input-icon">calendar_today</span>
                <input
                  type="date"
                  className="transaction-filters__date-input"
                  value={draft.endDate}
                  min={draft.startDate || undefined}
                  onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="transaction-filters__field">
              <label className="transaction-filters__label">Categoría</label>
              <CategorySelect
                companyId={companyId}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="Todas las categorías"
              />
            </div>

            <div className="transaction-filters__field">
              <label className="transaction-filters__label">Item</label>
              <div className="transaction-filters__item-search" ref={itemContainerRef}>
                <div className="transaction-filters__input-wrap">
                  <span className="material-symbols-outlined transaction-filters__input-icon">inventory_2</span>
                  <input
                    className="transaction-filters__item-input"
                    type="text"
                    placeholder="Buscar item..."
                    value={itemQuery}
                    onChange={(e) => handleItemSearch(e.target.value)}
                    onFocus={openItemDropdown}
                  />
                  {selectedItem && (
                    <button
                      type="button"
                      className="transaction-filters__item-clear"
                      onClick={clearItem}
                      aria-label="Limpiar item"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>close</span>
                    </button>
                  )}
                </div>
                {itemOpen && (
                  <div className="transaction-filters__item-dropdown">
                    {isItemListLoading || isItemSearchLoading ? (
                      <div className="transaction-filters__item-loading">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="transaction-filters__item-skeleton" />
                        ))}
                      </div>
                    ) : itemQuery.trim() && itemResults.length === 0 && !itemSearching ? (
                      <div className="transaction-filters__item-empty">
                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>search_off</span>
                        <span>No se encontraron items</span>
                      </div>
                    ) : displayItems.length > 0 ? (
                      displayItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="transaction-filters__item-option"
                          onClick={() => selectItem(item)}
                        >
                          <span className="transaction-filters__item-option-name">{item.name}</span>
                          <span className={`transaction-filters__item-badge transaction-filters__item-badge--${item.type.toLowerCase()}`}>
                            {item.type}
                          </span>
                        </button>
                      ))
                    ) : !itemQuery.trim() && !allItemsLoading ? (
                      <div className="transaction-filters__item-empty">
                        <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>search</span>
                        <span>Sin resultados</span>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <div className="transaction-filters__field transaction-filters__field--status">
              <label className="transaction-filters__label">Estado</label>
              <div className="transaction-filters__status-tabs">
                <button
                  type="button"
                  className={`transaction-filters__status-tab${draft.status === 'all' ? ' transaction-filters__status-tab--active' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, status: 'all' }))}
                >
                  Todos
                </button>
                <button
                  type="button"
                  className={`transaction-filters__status-tab transaction-filters__status-tab--completed${draft.status === 'COMPLETED' ? ' transaction-filters__status-tab--active' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, status: 'COMPLETED' }))}
                >
                  Completado
                </button>
                <button
                  type="button"
                  className={`transaction-filters__status-tab transaction-filters__status-tab--pending${draft.status === 'PENDING' ? ' transaction-filters__status-tab--active' : ''}`}
                  onClick={() => setDraft((d) => ({ ...d, status: 'PENDING' }))}
                >
                  Pendiente
                </button>
              </div>
            </div>
          </div>

          {draft.startDate && draft.endDate && draft.startDate > draft.endDate && (
            <p className="transaction-filters__error">La fecha de inicio no puede ser posterior a la de fin.</p>
          )}

          <div className="transaction-filters__actions">
            <button type="button" className="transaction-filters__clear-btn" onClick={handleClear}>
              Limpiar filtros
            </button>
            <button type="button" className="transaction-filters__apply-btn" onClick={handleApply}>
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
