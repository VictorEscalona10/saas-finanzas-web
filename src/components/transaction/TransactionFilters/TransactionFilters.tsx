'use client';

import { useState, useCallback } from 'react';
import CategorySelect from '@/src/components/category/CategorySelect';
import type { Category } from '@/src/domain/entities/Category';
import type { TransactionStatus } from '@/src/domain/entities/Transaction';
import './TransactionFilters.css';

export interface TransactionFiltersState {
  startDate: string;
  endDate: string;
  categoryId: string | null;
  status: TransactionStatus | 'all';
}

interface TransactionFiltersProps {
  companyId: string;
  onFilter: (filters: TransactionFiltersState) => void;
}

export default function TransactionFilters({ companyId, onFilter }: TransactionFiltersProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [status, setStatus] = useState<TransactionStatus | 'all'>('all');

  const handleFilter = useCallback(() => {
    onFilter({ startDate, endDate, categoryId, status });
  }, [startDate, endDate, categoryId, status, onFilter]);

  const handleClear = useCallback(() => {
    setStartDate('');
    setEndDate('');
    setCategoryId(null);
    setStatus('all');
    onFilter({ startDate: '', endDate: '', categoryId: null, status: 'all' });
  }, [onFilter]);

  return (
    <div className="transaction-filters">
      <div className="transaction-filters__bar">
        <div className="transaction-filters__group">
          <label className="transaction-filters__label">Fecha Inicio</label>
          <input
            className="transaction-filters__date-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="transaction-filters__group">
          <label className="transaction-filters__label">Fecha Fin</label>
          <input
            className="transaction-filters__date-input"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="transaction-filters__group transaction-filters__group--grow">
          <label className="transaction-filters__label">Categoría</label>
          <CategorySelect
            companyId={companyId}
            value={null}
            onChange={(cat: Category | null) => setCategoryId(cat?.id ?? null)}
            placeholder="Todas las categorías"
          />
        </div>

        <div className="transaction-filters__group">
          <label className="transaction-filters__label">Estado</label>
          <div className="transaction-filters__status-tabs">
            <button
              type="button"
              className={`transaction-filters__status-tab${status === 'all' ? ' transaction-filters__status-tab--active' : ''}`}
              onClick={() => setStatus('all')}
            >
              Todos
            </button>
            <button
              type="button"
              className={`transaction-filters__status-tab${status === 'COMPLETED' ? ' transaction-filters__status-tab--active transaction-filters__status-tab--completed' : ''}`}
              onClick={() => setStatus('COMPLETED')}
            >
              Completado
            </button>
            <button
              type="button"
              className={`transaction-filters__status-tab${status === 'PENDING' ? ' transaction-filters__status-tab--active transaction-filters__status-tab--pending' : ''}`}
              onClick={() => setStatus('PENDING')}
            >
              Pendiente
            </button>
          </div>
        </div>

        <div className="transaction-filters__actions">
          <button type="button" className="transaction-filters__clear-btn" onClick={handleClear}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
            Limpiar filtros
          </button>
          <button type="button" className="transaction-filters__apply-btn" onClick={handleFilter}>
            Filtrar
          </button>
        </div>
      </div>
    </div>
  );
}
