'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Skeleton from '@/src/components/shared/Skeleton';
import './DataTable.css';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  striped?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No hay datos',
  striped = false,
  onSort,
  className = '',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (!onSort) return;
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort(key, newDirection);
  };

  return (
    <div className={`datatable-wrapper ${className}`}>
      <table className="datatable">
        <thead className="datatable__header">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`datatable__header-cell${col.sortable ? ' datatable__header-cell--sortable' : ''}`}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                {col.label}
                {col.sortable && (
                  <span
                    className={`datatable__sort-icon${sortKey === col.key ? ' datatable__sort-icon--active' : ''}`}
                  >
                    {sortKey === col.key && sortDirection === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>

        {loading ? (
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="datatable__loading-row">
                {columns.map((col) => (
                  <td key={col.key} className="datatable__loading-cell">
                    <Skeleton variant="text" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        ) : data.length === 0 ? (
          <tbody>
            <tr>
              <td colSpan={columns.length}>
                <div className="datatable__empty">
                  <svg className="datatable__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                  <span className="datatable__empty-text">{emptyMessage}</span>
                </div>
              </td>
            </tr>
          </tbody>
        ) : (
          <tbody>
            {data.map((item, index) => (
              <tr
                key={(item.id as string) || index}
                className={`datatable__row${striped ? ' datatable__row--striped' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="datatable__cell">
                    {col.render ? col.render(item) : (item[col.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        )}
      </table>
    </div>
  );
}
