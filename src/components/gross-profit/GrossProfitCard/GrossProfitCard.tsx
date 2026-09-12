'use client';

import { formatUSD, formatBs, formatPercentage } from '@/src/shared/utils/numberUtils';
import type { GrossProfitGlobal } from '@/src/domain/repositories/IGrossProfitRepository';
import './GrossProfitCard.css';

interface GrossProfitCardProps {
  data: GrossProfitGlobal;
}

export default function GrossProfitCard({ data }: GrossProfitCardProps) {
  const isProfitPositive = data.grossProfit >= 0;
  const marginPct = data.grossMarginRatio * 100;
  const marginWidth = Math.max(0, Math.min(marginPct, 100));

  return (
    <div className="gross-profit-card__grid">
      {/* Ventas Netas */}
      <div className="gross-profit-card">
        <div className="gross-profit-card__header">
          <div className="gross-profit-card__icon gross-profit-card__icon--sales">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="gross-profit-card__label-tag">Ingresos</span>
        </div>
        <span className="gross-profit-card__title">Ventas Netas</span>
        <div className="gross-profit-card__dual">
          <div className="gross-profit-card__dual-row">
            <span className="gross-profit-card__currency-badge">$</span>
            <span className="gross-profit-card__value">{formatUSD(data.netSales)}</span>
          </div>
          <div className="gross-profit-card__dual-row">
            <span className="gross-profit-card__currency-badge gross-profit-card__currency-badge--bs">Bs</span>
            <span className="gross-profit-card__value gross-profit-card__value--bs">{formatBs(data.netSalesBs)}</span>
          </div>
        </div>
      </div>

      {/* COGS */}
      <div className="gross-profit-card">
        <div className="gross-profit-card__header">
          <div className="gross-profit-card__icon gross-profit-card__icon--costs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M3 3l18 18M21 3l-18 18" />
            </svg>
          </div>
          <span className="gross-profit-card__label-tag">Costos</span>
        </div>
        <span className="gross-profit-card__title">COGS</span>
        <div className="gross-profit-card__dual">
          <div className="gross-profit-card__dual-row">
            <span className="gross-profit-card__currency-badge">$</span>
            <span className="gross-profit-card__value">{formatUSD(data.cogs)}</span>
          </div>
          <div className="gross-profit-card__dual-row">
            <span className="gross-profit-card__currency-badge gross-profit-card__currency-badge--bs">Bs</span>
            <span className="gross-profit-card__value gross-profit-card__value--bs">{formatBs(data.cogsBs)}</span>
          </div>
        </div>
      </div>

      {/* Utilidad Bruta */}
      <div className={`gross-profit-card gross-profit-card--highlight${isProfitPositive ? ' gross-profit-card--positive' : ' gross-profit-card--negative'}`}>
        <div className="gross-profit-card__glow" />
        <div className="gross-profit-card__header">
          <div className="gross-profit-card__icon gross-profit-card__icon--profit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className={`gross-profit-card__pill${isProfitPositive ? ' gross-profit-card__pill--positive' : ' gross-profit-card__pill--negative'}`}>
            {isProfitPositive ? '+' : '-'}{formatPercentage(marginPct)}
          </span>
        </div>
        <span className="gross-profit-card__title">Utilidad Bruta</span>
        <div className="gross-profit-card__dual">
          <div className="gross-profit-card__dual-row">
            <span className="gross-profit-card__currency-badge">$</span>
            <span className="gross-profit-card__value gross-profit-card__value--accent">{formatUSD(data.grossProfit)}</span>
          </div>
          <div className="gross-profit-card__dual-row">
            <span className="gross-profit-card__currency-badge gross-profit-card__currency-badge--bs">Bs</span>
            <span className="gross-profit-card__value gross-profit-card__value--accent-bs">{formatBs(data.grossProfitBs)}</span>
          </div>
        </div>
        <div className="gross-profit-card__margin">
          <div className="gross-profit-card__progress">
            <div
              className={`gross-profit-card__progress-bar${!isProfitPositive ? ' gross-profit-card__progress-bar--negative' : ''}`}
              style={{ width: `${marginWidth}%` }}
            />
          </div>
          <div className="gross-profit-card__progress-labels">
            <span>Rendimiento</span>
            <span className="gross-profit-card__progress-target">Objetivo: 40%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
