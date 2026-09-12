'use client';

import { formatUSD, formatBs, formatPercentage } from '@/src/shared/utils/numberUtils';
import type { GrossProfitProduct } from '@/src/domain/repositories/IGrossProfitRepository';
import './GrossProfitTable.css';

interface GrossProfitTableProps {
  data: GrossProfitProduct[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function GrossProfitTable({ data, loading = false, emptyMessage = 'No hay datos de utilidad bruta' }: GrossProfitTableProps) {
  if (loading) {
    return (
      <div className="gross-profit-table__wrapper">
        <div className="gross-profit-table__loading">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="gross-profit-table__loading-row">
              <div className="gross-profit-table__skeleton gross-profit-table__skeleton--text" />
              <div className="gross-profit-table__skeleton gross-profit-table__skeleton--price" />
              <div className="gross-profit-table__skeleton gross-profit-table__skeleton--price" />
              <div className="gross-profit-table__skeleton gross-profit-table__skeleton--price" />
              <div className="gross-profit-table__skeleton gross-profit-table__skeleton--ratio" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="gross-profit-table__wrapper">
        <div className="gross-profit-table__empty">
          <svg className="gross-profit-table__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
          <span>{emptyMessage}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="gross-profit-table__wrapper">
      <div className="gross-profit-table__scroll">
        <table className="gross-profit-table">
          <thead>
            <tr>
              <th className="gross-profit-table__header">Producto / Servicio</th>
              <th className="gross-profit-table__header">Ventas</th>
              <th className="gross-profit-table__header">COGS</th>
              <th className="gross-profit-table__header">Utilidad Bruta</th>
              <th className="gross-profit-table__header gross-profit-table__header--right">Margen</th>
            </tr>
          </thead>
          <tbody className="gross-profit-table__body">
            {data.map((item) => {
              const isProfitNegative = item.grossProfit < 0;

              return (
                <tr key={item.itemId} className="gross-profit-table__row">
                  <td className="gross-profit-table__cell">
                    <div className="gross-profit-table__product-name">{item.itemName}</div>
                    <div className="gross-profit-table__product-id">ID: {item.itemId}</div>
                  </td>
                  <td className="gross-profit-table__cell">
                    <div className="gross-profit-table__currency">{formatUSD(item.netSales)}</div>
                    <div className="gross-profit-table__currency--bs">{formatBs(item.netSalesBs)}</div>
                  </td>
                  <td className="gross-profit-table__cell">
                    <div className="gross-profit-table__currency">{formatUSD(item.cogs)}</div>
                    <div className="gross-profit-table__currency--bs">{formatBs(item.cogsBs)}</div>
                  </td>
                  <td className="gross-profit-table__cell">
                    <div className={`gross-profit-table__margin${isProfitNegative ? ' gross-profit-table__margin--negative' : ''}`}>
                      {isProfitNegative ? '-' : '+'}{formatUSD(Math.abs(item.grossProfit))}
                    </div>
                    <div className={`gross-profit-table__currency--bs${isProfitNegative ? ' gross-profit-table__currency--bs-negative' : ''}`}>
                      {isProfitNegative ? '-' : '+'}{formatBs(Math.abs(item.grossProfitBs))}
                    </div>
                  </td>
                  <td className="gross-profit-table__cell gross-profit-table__cell--right">
                    <span className={`gross-profit-table__ratio${isProfitNegative ? ' gross-profit-table__ratio--negative' : ''}`}>
                      {formatPercentage(item.grossMarginRatio * 100)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
