'use client';

import { formatUSD, formatBs, formatPercentage } from '@/src/shared/utils/numberUtils';
import type { ContributionGlobal } from '@/src/domain/repositories/IContributionMarginRepository';
import './ContributionCard.css';

interface ContributionCardProps {
  data: ContributionGlobal;
}

export default function ContributionCard({ data }: ContributionCardProps) {
  const isMarginPositive = data.totalMargin >= 0;

  return (
    <div className="contribution-card__grid">
      <div className="contribution-card">
        <div className="contribution-card__header">
          <div className="contribution-card__icon contribution-card__icon--sales">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="contribution-card__badge">MTD</span>
        </div>
        <span className="contribution-card__label">Ventas Totales</span>
        <span className="contribution-card__primary">{formatUSD(data.totalSales)}</span>
        <span className="contribution-card__secondary">{formatBs(data.totalSalesBs)}</span>
      </div>

      <div className="contribution-card">
        <div className="contribution-card__header">
          <div className="contribution-card__icon contribution-card__icon--costs">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M3 3l18 18M21 3l-18 18" />
            </svg>
          </div>
          <span className="contribution-card__badge">Gastos</span>
        </div>
        <span className="contribution-card__label">Costos Variables Totales</span>
        <span className="contribution-card__primary">{formatUSD(data.totalVariableCosts)}</span>
        <span className="contribution-card__secondary">{formatBs(data.totalVariableCostsBs)}</span>
      </div>

      <div className={`contribution-card contribution-card--highlight${isMarginPositive ? ' contribution-card--positive' : ' contribution-card--negative'}`}>
        <div className="contribution-card__glow" />
        <div className="contribution-card__header">
          <div className="contribution-card__icon contribution-card__icon--margin">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className={`contribution-card__pill${isMarginPositive ? ' contribution-card__pill--positive' : ' contribution-card__pill--negative'}`}>
            {isMarginPositive ? 'Saludable' : 'En riesgo'}
          </span>
        </div>
        <span className="contribution-card__label">Margen de Contribución</span>
        <span className="contribution-card__primary contribution-card__primary--accent">
          {isMarginPositive ? '+' : ''}{formatUSD(data.totalMargin)}
        </span>
        <span className="contribution-card__secondary">{formatBs(data.totalMarginBs)}</span>
      </div>

      <div className="contribution-card">
        <div className="contribution-card__header">
          <div className="contribution-card__icon contribution-card__icon--ratio">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M21 12a9 9 0 1 1-9-9" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <span className="contribution-card__ratio-value">{formatPercentage(data.globalMarginRatio * 100)}</span>
        </div>
        <span className="contribution-card__label">Ratio de Margen</span>
        <div className="contribution-card__progress">
          <div className="contribution-card__progress-bar" style={{ width: `${Math.min(data.globalMarginRatio * 100, 100)}%` }} />
        </div>
        <div className="contribution-card__progress-labels">
          <span>Rendimiento</span>
          <span className="contribution-card__progress-target">Objetivo: 60%</span>
        </div>
      </div>
    </div>
  );
}
