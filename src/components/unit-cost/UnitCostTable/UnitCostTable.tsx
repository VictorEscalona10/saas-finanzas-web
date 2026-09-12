'use client';

import { formatUSD, formatBs, formatNumber } from '@/src/shared/utils/numberUtils';
import type { UnitCostResult } from '@/src/domain/repositories/IUnitCostRepository';
import './UnitCostTable.css';

interface UnitCostTableProps {
  data: UnitCostResult[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function UnitCostTable({ data, loading = false, emptyMessage = 'No hay datos de costo unitario' }: UnitCostTableProps) {
  if (loading) {
    return (
      <div className="unit-cost-table__wrapper">
        <div className="unit-cost-table__loading">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="unit-cost-table__loading-row">
              <div className="unit-cost-table__skeleton unit-cost-table__skeleton--text" />
              <div className="unit-cost-table__skeleton unit-cost-table__skeleton--num" />
              <div className="unit-cost-table__skeleton unit-cost-table__skeleton--price" />
              <div className="unit-cost-table__skeleton unit-cost-table__skeleton--price" />
              <div className="unit-cost-table__skeleton unit-cost-table__skeleton--price" />
              <div className="unit-cost-table__skeleton unit-cost-table__skeleton--price" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="unit-cost-table__wrapper">
        <div className="unit-cost-table__empty">
          <svg className="unit-cost-table__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
          <span>{emptyMessage}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="unit-cost-table__wrapper">
      <div className="unit-cost-table__scroll">
        <table className="unit-cost-table">
          <thead>
            <tr>
              <th className="unit-cost-table__header">Producto / Servicio</th>
              <th className="unit-cost-table__header unit-cost-table__header--center">Cantidad</th>
              <th className="unit-cost-table__header">Costo Total</th>
              <th className="unit-cost-table__header unit-cost-table__header--right">Costo Unitario</th>
            </tr>
          </thead>
          <tbody className="unit-cost-table__body">
            {data.map((item) => (
              <tr key={item.itemId} className="unit-cost-table__row">
                <td className="unit-cost-table__cell">
                  <div className="unit-cost-table__product-name">{item.itemName}</div>
                  <div className="unit-cost-table__product-id">ID: {item.itemId}</div>
                </td>
                <td className="unit-cost-table__cell unit-cost-table__cell--center">
                  {formatNumber(item.totalQuantity, 0)}
                </td>
                <td className="unit-cost-table__cell">
                  <div className="unit-cost-table__currency">{formatUSD(item.totalCostUSD)}</div>
                  <div className="unit-cost-table__currency--bs">{formatBs(item.totalCostBs)}</div>
                </td>
                <td className="unit-cost-table__cell unit-cost-table__cell--right">
                  <div className="unit-cost-table__unit-cost">{formatUSD(item.weightedAvgUnitCostUSD)}</div>
                  <div className="unit-cost-table__unit-cost--bs">{formatBs(item.weightedAvgUnitCostBs)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
