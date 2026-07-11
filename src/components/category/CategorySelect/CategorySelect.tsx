'use client';

import { useState, useRef, useMemo, useEffect, useCallback, type KeyboardEvent } from 'react';
import { useCategorySearch } from '@/src/use-cases/category/useCategorySearch';
import type { Category } from '@/src/domain/entities/Category';
import './CategorySelect.css';

interface CategorySelectProps {
  companyId: string;
  value?: Category | null;
  onChange: (category: Category | null) => void;
  placeholder?: string;
}

const DEBOUNCE_MS = 300;

export default function CategorySelect({
  companyId,
  value,
  onChange,
  placeholder = 'Seleccionar categoría...',
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { searchCategory, listCategories, result, loading } = useCategorySearch();
  const items = useMemo(() => result?.items ?? [], [result?.items]);

  const displayItems = query.trim() ? items : allCategories;
  const isListLoading = allLoading && !query.trim();
  const isSearchLoading = query.trim() && loading;

  const handleSearch = useCallback((term: string) => {
    setQuery(term);
    setHighlightedIndex(-1);

    if (debounceRef.current !== null) clearTimeout(debounceRef.current);

    if (!term.trim()) return;

    debounceRef.current = setTimeout(() => {
      searchCategory(term, companyId);
    }, DEBOUNCE_MS) as ReturnType<typeof setTimeout>;
  }, [companyId, searchCategory]);

  const loadAllCategories = useCallback(async () => {
    if (allCategories.length > 0) return;
    setAllLoading(true);
    const result = await listCategories(companyId);
    if (result) setAllCategories(result.items);
    setAllLoading(false);
  }, [companyId, listCategories, allCategories.length]);

  const selectItem = useCallback((cat: Category) => {
    onChange(cat);
    setOpen(false);
    setQuery('');
  }, [onChange]);

  const clearSelection = useCallback(() => {
    onChange(null);
    setQuery('');
    setHighlightedIndex(-1);
  }, [onChange]);

  const openDropdown = useCallback(() => {
    setOpen(true);
    loadAllCategories();
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [loadAllCategories]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        openDropdown();
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setOpen(false);
        e.preventDefault();
        break;
      case 'ArrowDown':
        setHighlightedIndex((prev) => Math.min(prev + 1, displayItems.length - 1));
        e.preventDefault();
        break;
      case 'ArrowUp':
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        e.preventDefault();
        break;
      case 'Enter':
        if (highlightedIndex >= 0 && highlightedIndex < displayItems.length) {
          selectItem(displayItems[highlightedIndex]);
        }
        e.preventDefault();
        break;
    }
  }, [open, displayItems, highlightedIndex, selectItem, openDropdown]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
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

  const showDropdown = open && !value;

  return (
    <div className="category-select" ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className={`category-select__trigger${open ? ' category-select__trigger--open' : ''}`}
        onClick={() => (value ? null : open ? setOpen(false) : openDropdown())}
      >
        {value ? (
          <span className="category-select__trigger-text">{value.name}</span>
        ) : (
          <span className="category-select__trigger-text category-select__trigger-text--placeholder">
            {placeholder}
          </span>
        )}

        {value && (
          <span
            role="button"
            tabIndex={0}
            className="category-select__clear-btn"
            onClick={(e) => { e.stopPropagation(); clearSelection(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); clearSelection(); } }}
            aria-label="Limpiar selección"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>close</span>
          </span>
        )}

        <span className={`material-symbols-outlined category-select__trigger-icon${open ? ' category-select__trigger-icon--open' : ''}`}>
          expand_more
        </span>
      </button>

      {showDropdown && (
        <div className="category-select__dropdown">
          <div className="category-select__search-wrapper">
            <div className="category-select__search">
              <span className="material-symbols-outlined category-select__search-icon">search</span>
              <input
                ref={inputRef}
                className="category-select__search-input"
                type="text"
                placeholder="Buscar categoría..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {isListLoading || isSearchLoading ? (
            <div className="category-select__loading">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="category-select__loading-item">
                  <div className="category-select__skeleton-line category-select__skeleton-line--medium" />
                  <div className="category-select__skeleton-badge-row">
                    <div className="category-select__skeleton-badge" />
                    <div className="category-select__skeleton-badge" />
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim() && items.length === 0 && !loading ? (
            <div className="category-select__empty">
              <span className="material-symbols-outlined category-select__empty-icon">search_off</span>
              <p className="category-select__empty-text">No se encontraron categorías para...</p>
              <p className="category-select__empty-term">&quot;{query}&quot;</p>
            </div>
          ) : displayItems.length === 0 && !loading ? (
            <div className="category-select__idle">
              <span className="material-symbols-outlined category-select__idle-icon">search</span>
              <p className="category-select__idle-text">Escribe para buscar categorías...</p>
            </div>
          ) : (
            <div className="category-select__results">
              {displayItems.map((cat, index) => (
                <div
                  key={cat.id}
                  className={`category-select__option${index === highlightedIndex ? ' category-select__option--highlighted' : ''}`}
                  onClick={() => selectItem(cat)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="category-select__option-top">
                    <span className="category-select__option-name">{cat.name}</span>
                    <span className="material-symbols-outlined category-select__option-arrow">north_east</span>
                  </div>
                  <div className="category-select__option-badges">
                    <span className={`category-select__badge category-select__badge--${cat.type.toLowerCase()}`}>
                      {cat.type}
                    </span>
                    <span className={`category-select__badge category-select__badge--${cat.flowDirection.toLowerCase()}`}>
                      {cat.flowDirection}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
