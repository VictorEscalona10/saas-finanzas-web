'use client';

import { formatUSD, formatBs, formatPercentage } from '@/src/shared/utils/numberUtils';
import type { BalancePoint } from '@/src/domain/repositories/IBalancePointRepository';
import ConfidenceBadge from '@/src/components/balance-point/ConfidenceBadge';
import './BalancePointCard.css';

interface BalancePointCardProps {
  data: BalancePoint;
}

const NOT_REACHABLE = 'No alcanzable / imposible';
const NOT_APPLICABLE = 'No aplica';

const STATUS_LABEL_USD_BS: Record<'safe' | 'at_risk' | 'negative', string> = {
  safe: 'Seguro',
  at_risk: 'Por debajo del equilibrio',
  negative: 'Margen negativo',
};

export default function BalancePointCard({ data }: BalancePointCardProps) {
  const { financialsActual, breakEven, breakEvenStatus, dataConfidence, transactionCount } = data;
  const { marginStatusUsd, marginStatusBs } = breakEven;
  const isNegative = breakEvenStatus === 'negative_margin';
  const isSafe = breakEvenStatus === 'safe';
  const isNoSales = breakEvenStatus === 'no_sales';
  const isInconsistent =
    breakEvenStatus === 'at_risk' &&
    ((marginStatusUsd === 'safe' && marginStatusBs === 'at_risk') ||
      (marginStatusUsd === 'at_risk' && marginStatusBs === 'safe'));

  const required = breakEven.salesVolumeRequired;
  const requiredBs = breakEven.salesVolumeRequiredBs;
  const distance = breakEven.distanceToBreakEven;
  const distanceBs = breakEven.distanceToBreakEvenBs;

  const coverageUsd = required !== null && required > 0
    ? (financialsActual.dollars.totalSales / required) * 100
    : null;
  const coverageBs = requiredBs !== null && requiredBs > 0
    ? (financialsActual.bs.totalSalesBs / requiredBs) * 100
    : null;
  const widthUsd = coverageUsd !== null ? Math.max(0, Math.min(coverageUsd, 100)) : 0;
  const widthBs = coverageBs !== null ? Math.max(0, Math.min(coverageBs, 100)) : 0;

  const pillLabel = isSafe
    ? 'Situación segura'
    : isNoSales
      ? 'Sin ventas registradas'
      : isNegative
        ? 'Margen negativo'
        : 'En riesgo';

  return (
    <div className="balance-point-card__layout">
      <div
        className={`balance-point-card__hero balance-point-card__hero--${breakEvenStatus}`}
      >
        <div className="balance-point-card__glow" />
        <div className="balance-point-card__header">
          <div className="balance-point-card__hero-title">
            <div className="balance-point-card__icon balance-point-card__icon--target">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="12" cy="12" r="1" />
              </svg>
            </div>
            <div>
              <span className="balance-point-card__hero-label">Punto de Equilibrio</span>
              <span className="balance-point-card__period">
                {data.period.startDate} — {data.period.endDate}
              </span>
            </div>
          </div>
          <span className={`balance-point-card__pill balance-point-card__pill--${breakEvenStatus}`}>
            {pillLabel}
          </span>
        </div>

        <div className="balance-point-card__meta-row">
          <ConfidenceBadge confidence={dataConfidence} transactionCount={transactionCount} />
          {breakEven.isEstimated && (
            <span className="balance-point-card__meta-item balance-point-card__meta-item--estimated">
              Datos estimados
            </span>
          )}
        </div>

        <div className="balance-point-card__currencies">
          <span className={`balance-point-card__currency-chip balance-point-card__currency-chip--${marginStatusUsd}`}>
            USD: {STATUS_LABEL_USD_BS[marginStatusUsd]}
          </span>
          <span className={`balance-point-card__currency-chip balance-point-card__currency-chip--${marginStatusBs}`}>
            Bs: {STATUS_LABEL_USD_BS[marginStatusBs]}
          </span>
        </div>

        <div className="balance-point-card__hero-main">
          <div className="balance-point-card__hero-figure">
            <span className="balance-point-card__label">Ventas Requeridas (USD)</span>
            <span className="balance-point-card__primary balance-point-card__primary--accent">
              {required !== null ? formatUSD(required) : NOT_REACHABLE}
            </span>
            <span className="balance-point-card__secondary">Bs: {requiredBs !== null ? formatBs(requiredBs) : NOT_APPLICABLE}</span>
          </div>

          <div className="balance-point-card__hero-figure">
            <span className="balance-point-card__label">Distancia al Equilibrio</span>
            <span className={`balance-point-card__distance balance-point-card__distance--${marginStatusUsd}`}>
              {distance !== null ? `${distance >= 0 ? '+' : ''}${formatUSD(distance)}` : NOT_APPLICABLE}
            </span>
            <span className={`balance-point-card__distance-secondary balance-point-card__distance-secondary--${marginStatusBs}`}>
              Bs: {distanceBs !== null ? `${distanceBs >= 0 ? '+' : ''}${formatBs(distanceBs)}` : NOT_APPLICABLE}
            </span>
          </div>
        </div>

        {isNegative && (
          <div className="balance-point-card__notice balance-point-card__notice--risk">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              Margen negativo: cada venta genera pérdida. Revisa precios o costos variables; vender más solo aumenta la pérdida.
            </span>
          </div>
        )}

        {isInconsistent && (
          <div className="balance-point-card__notice balance-point-card__notice--warn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              Las tasas de cambio entre ventas y costos son inconsistentes; en Bs no se cubre el equilibrio aunque en USD sí.
            </span>
          </div>
        )}

        <div className="balance-point-card__coverage">
          <div className="balance-point-card__coverage-row">
            <div className="balance-point-card__coverage-header">
              <span className="balance-point-card__coverage-label">USD</span>
              <span className={`balance-point-card__coverage-value balance-point-card__coverage-value--${marginStatusUsd}`}>
                {coverageUsd !== null ? `${coverageUsd.toFixed(1)}%` : NOT_APPLICABLE}
              </span>
            </div>
            <div className="balance-point-card__progress">
              <div
                className={`balance-point-card__progress-bar balance-point-card__progress-bar--${marginStatusUsd}`}
                style={{ width: `${widthUsd}%` }}
              />
            </div>
          </div>
          <div className="balance-point-card__coverage-row">
            <div className="balance-point-card__coverage-header">
              <span className="balance-point-card__coverage-label">Bs</span>
              <span className={`balance-point-card__coverage-value balance-point-card__coverage-value--${marginStatusBs}`}>
                {coverageBs !== null ? `${coverageBs.toFixed(1)}%` : NOT_APPLICABLE}
              </span>
            </div>
            <div className="balance-point-card__progress">
              <div
                className={`balance-point-card__progress-bar balance-point-card__progress-bar--${marginStatusBs}`}
                style={{ width: `${widthBs}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="balance-point-card__summary">
        <div className="balance-point-card__summary-title">Resumen financiero del período</div>
        <div className="balance-point-card__summary-grid">
          <div className="balance-point-card__cell">
            <span className="balance-point-card__cell-label">Ventas Totales</span>
            <span className="balance-point-card__cell-primary">{formatUSD(financialsActual.dollars.totalSales)}</span>
            <span className="balance-point-card__cell-secondary">{formatBs(financialsActual.bs.totalSalesBs)}</span>
          </div>

          <div className="balance-point-card__cell">
            <span className="balance-point-card__cell-label">Costos Variables</span>
            <span className="balance-point-card__cell-primary">{formatUSD(financialsActual.dollars.totalVariableCosts)}</span>
            <span className="balance-point-card__cell-secondary">{formatBs(financialsActual.bs.totalVariableCostsBs)}</span>
          </div>

          <div className="balance-point-card__cell">
            <span className="balance-point-card__cell-label">Costos Fijos</span>
            <span className="balance-point-card__cell-primary">{formatUSD(financialsActual.dollars.totalFixedCosts)}</span>
            <span className="balance-point-card__cell-secondary">{formatBs(financialsActual.bs.totalFixedCostsBs)}</span>
          </div>

          <div className="balance-point-card__cell">
            <span className="balance-point-card__cell-label">Ratio de Margen Global</span>
            <span className="balance-point-card__cell-primary">{formatPercentage(financialsActual.dollars.globalMarginRatio)}</span>
            <span className="balance-point-card__cell-secondary">{formatPercentage(financialsActual.bs.globalMarginRatioBs)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}