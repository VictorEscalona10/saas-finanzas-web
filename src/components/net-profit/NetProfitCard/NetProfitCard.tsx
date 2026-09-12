'use client';

import { formatUSD, formatBs, formatPercentage } from '@/src/shared/utils/numberUtils';
import type { NetProfitSummary } from '@/src/domain/repositories/INetProfitRepository';
import './NetProfitCard.css';

interface NetProfitCardProps {
  data: NetProfitSummary;
}

export default function NetProfitCard({ data }: NetProfitCardProps) {
  const isNetPositive = data.netProfitUSD >= 0;
  const marginPct = data.netMarginRatio * 100;
  const marginWidth = Math.max(0, Math.min(marginPct, 100));

  return (
    <div className="net-profit-card__grid">
      {/* Ingresos */}
      <div className="net-profit-card">
        <div className="net-profit-card__header">
          <div className="net-profit-card__icon net-profit-card__icon--sales">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="net-profit-card__label-tag">Ingresos</span>
        </div>
        <span className="net-profit-card__title">Ventas Netas</span>
        <div className="net-profit-card__dual">
          <div className="net-profit-card__dual-row">
            <span className="net-profit-card__currency-badge">$</span>
            <span className="net-profit-card__value">{formatUSD(data.grossProfit.netSales)}</span>
          </div>
          <div className="net-profit-card__dual-row">
            <span className="net-profit-card__currency-badge net-profit-card__currency-badge--bs">Bs</span>
            <span className="net-profit-card__value net-profit-card__value--bs">{formatBs(data.grossProfit.netSalesBs)}</span>
          </div>
        </div>
      </div>

      {/* Costos (COGS) */}
      <div className="net-profit-card">
        <div className="net-profit-card__header">
          <div className="net-profit-card__icon net-profit-card__icon--costs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M3 3l18 18M21 3l-18 18" />
            </svg>
          </div>
          <span className="net-profit-card__label-tag">Costos</span>
        </div>
        <span className="net-profit-card__title">COGS</span>
        <div className="net-profit-card__dual">
          <div className="net-profit-card__dual-row">
            <span className="net-profit-card__currency-badge">$</span>
            <span className="net-profit-card__value">{formatUSD(data.grossProfit.cogs)}</span>
          </div>
          <div className="net-profit-card__dual-row">
            <span className="net-profit-card__currency-badge net-profit-card__currency-badge--bs">Bs</span>
            <span className="net-profit-card__value net-profit-card__value--bs">{formatBs(data.grossProfit.cogsBs)}</span>
          </div>
        </div>
      </div>

      {/* Gastos Operativos */}
      <div className="net-profit-card">
        <div className="net-profit-card__header">
          <div className="net-profit-card__icon net-profit-card__icon--expenses">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M3 3l18 18M21 3l-18 18" />
            </svg>
          </div>
          <span className="net-profit-card__label-tag">Gastos</span>
        </div>
        <span className="net-profit-card__title">Gastos Operativos</span>
        <div className="net-profit-card__dual">
          <div className="net-profit-card__dual-row">
            <span className="net-profit-card__currency-badge">$</span>
            <span className="net-profit-card__value">{formatUSD(data.expenses.totalUSD)}</span>
          </div>
          <div className="net-profit-card__dual-row">
            <span className="net-profit-card__currency-badge net-profit-card__currency-badge--bs">Bs</span>
            <span className="net-profit-card__value net-profit-card__value--bs">{formatBs(data.expenses.totalBs)}</span>
          </div>
        </div>
      </div>

      {/* Utilidad Bruta (intermedio) */}
      <div className="net-profit-card">
        <div className="net-profit-card__header">
          <div className="net-profit-card__icon net-profit-card__icon--gross">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="net-profit-card__label-tag">Intermedio</span>
        </div>
        <span className="net-profit-card__title">Utilidad Bruta</span>
        <div className="net-profit-card__dual">
          <div className="net-profit-card__dual-row">
            <span className="net-profit-card__currency-badge">$</span>
            <span className="net-profit-card__value">{formatUSD(data.grossProfit.grossProfit)}</span>
          </div>
          <div className="net-profit-card__dual-row">
            <span className="net-profit-card__currency-badge net-profit-card__currency-badge--bs">Bs</span>
            <span className="net-profit-card__value net-profit-card__value--bs">{formatBs(data.grossProfit.grossProfitBs)}</span>
          </div>
        </div>
      </div>

      {/* Utilidad Neta (destacada) */}
      <div className={`net-profit-card net-profit-card--highlight${isNetPositive ? ' net-profit-card--positive' : ' net-profit-card--negative'}`}>
        <div className="net-profit-card__glow" />
        <div className="net-profit-card__header">
          <div className="net-profit-card__icon net-profit-card__icon--profit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className={`net-profit-card__pill${isNetPositive ? ' net-profit-card__pill--positive' : ' net-profit-card__pill--negative'}`}>
            {isNetPositive ? '+' : '-'}{formatPercentage(marginPct)}
          </span>
        </div>
        <span className="net-profit-card__title">Utilidad Neta</span>
        <div className="net-profit-card__dual">
          <div className="net-profit-card__dual-row">
            <span className="net-profit-card__currency-badge">$</span>
            <span className="net-profit-card__value net-profit-card__value--accent">{formatUSD(data.netProfitUSD)}</span>
          </div>
          <div className="net-profit-card__dual-row">
            <span className="net-profit-card__currency-badge net-profit-card__currency-badge--bs">Bs</span>
            <span className="net-profit-card__value net-profit-card__value--accent-bs">{formatBs(data.netProfitBs)}</span>
          </div>
        </div>
        <div className="net-profit-card__margin">
          <div className="net-profit-card__progress">
            <div
              className={`net-profit-card__progress-bar${!isNetPositive ? ' net-profit-card__progress-bar--negative' : ''}`}
              style={{ width: `${marginWidth}%` }}
            />
          </div>
          <div className="net-profit-card__progress-labels">
            <span>Rendimiento</span>
            <span className="net-profit-card__progress-target">Objetivo: 20%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
