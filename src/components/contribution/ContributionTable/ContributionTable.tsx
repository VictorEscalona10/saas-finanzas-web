'use client';

import { formatUSD, formatBs, formatNumber, formatPercentage } from '@/src/shared/utils/numberUtils';
import type { ContributionProduct } from '@/src/domain/repositories/IContributionMarginRepository';
import './ContributionTable.css';

interface ContributionTableProps {
  data: ContributionProduct[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function ContributionTable({ data, loading = false, emptyMessage = 'No hay datos de margen de contribución' }: ContributionTableProps) {
  if (loading) {
    return (
      <div className="contribution-table__wrapper">
        <div className="contribution-table__loading">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="contribution-table__loading-row">
              <div className="contribution-table__skeleton contribution-table__skeleton--text" />
              <div className="contribution-table__skeleton contribution-table__skeleton--num" />
              <div className="contribution-table__skeleton contribution-table__skeleton--price" />
              <div className="contribution-table__skeleton contribution-table__skeleton--price" />
              <div className="contribution-table__skeleton contribution-table__skeleton--price" />
              <div className="contribution-table__skeleton contribution-table__skeleton--price" />
              <div className="contribution-table__skeleton contribution-table__skeleton--ratio" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="contribution-table__wrapper">
        <div className="contribution-table__empty">
          <svg className="contribution-table__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
          <span>{emptyMessage}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="contribution-table__wrapper">
      <div className="contribution-table__scroll">
        <table className="contribution-table">
          <thead>
            <tr>
              <th className="contribution-table__header">Producto</th>
              <th className="contribution-table__header contribution-table__header--center">Unds Vendidas</th>
              <th className="contribution-table__header">Precio Und</th>
              <th className="contribution-table__header">Costo Var Und</th>
              <th className="contribution-table__header">Margen Und</th>
              <th className="contribution-table__header">Margen Total</th>
              <th className="contribution-table__header contribution-table__header--right">Ratio</th>
            </tr>
          </thead>
          <tbody className="contribution-table__body">
            {data.map((product) => {
              const isMarginNegative = product.financials.contributionMargin < 0;

              return (
                <tr key={product.itemId} className="contribution-table__row">
                  <td className="contribution-table__cell">
                    <div className="contribution-table__product-name">{product.itemName}</div>
                    <div className="contribution-table__product-id">ID: {product.itemId}</div>
                  </td>
                  <td className="contribution-table__cell contribution-table__cell--center">
                    {formatNumber(product.totalUnitsSold, 0)}
                  </td>
                  <td className="contribution-table__cell">
                    <div className="contribution-table__currency">{formatUSD(product.unitAnalysis.unitInflow)}</div>
                    <div className="contribution-table__currency--bs">{formatBs(product.unitAnalysis.unitInflowBs)}</div>
                  </td>
                  <td className="contribution-table__cell">
                    <div className="contribution-table__currency">{formatUSD(product.unitAnalysis.unitVariableCost)}</div>
                    <div className="contribution-table__currency--bs">{formatBs(product.unitAnalysis.unitVariableCostBs)}</div>
                  </td>
                  <td className="contribution-table__cell">
                    <div className={`contribution-table__margin${isMarginNegative ? ' contribution-table__margin--negative' : ''}`}>
                      {isMarginNegative ? '-' : '+'}{formatUSD(Math.abs(product.unitAnalysis.unitContributionMargin))}
                    </div>
                    <div className={`contribution-table__currency--bs${isMarginNegative ? ' contribution-table__currency--bs-negative' : ''}`}>
                      {isMarginNegative ? '-' : '+'}{formatBs(Math.abs(product.unitAnalysis.unitContributionMarginBs))}
                    </div>
                  </td>
                  <td className="contribution-table__cell">
                    <div className={`contribution-table__margin${isMarginNegative ? ' contribution-table__margin--negative' : ''}`}>
                      {isMarginNegative ? '-' : '+'}{formatUSD(Math.abs(product.financials.contributionMargin))}
                    </div>
                    <div className={`contribution-table__currency--bs${isMarginNegative ? ' contribution-table__currency--bs-negative' : ''}`}>
                      {isMarginNegative ? '-' : '+'}{formatBs(Math.abs(product.financials.contributionMarginBs))}
                    </div>
                  </td>
                  <td className="contribution-table__cell contribution-table__cell--right">
                    <span className={`contribution-table__ratio${isMarginNegative ? ' contribution-table__ratio--negative' : ''}`}>
                      {formatPercentage(product.financials.contributionMarginRatio * 100)}
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
