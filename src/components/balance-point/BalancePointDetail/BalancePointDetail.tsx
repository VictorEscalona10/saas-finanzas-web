'use client';

import { formatUSD, formatBs, formatNumber, formatPercentage } from '@/src/shared/utils/numberUtils';
import { formatPeriodLabel } from '@/src/shared/utils/dateUtils';
import type {
  BreakEvenProduct,
  BreakEvenBatch,
  BreakEvenService,
  BreakEvenStatus,
} from '@/src/domain/repositories/IBalancePointRepository';
import ConfidenceBadge from '@/src/components/balance-point/ConfidenceBadge';
import './BalancePointDetail.css';

type BalancePointDetailData = BreakEvenProduct | BreakEvenBatch | BreakEvenService;

interface BalancePointDetailProps {
  data: BalancePointDetailData | null | undefined;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const NOT_REACHABLE = 'No alcanzable';
const NOT_APPLICABLE = 'N/A';

const STATUS_LABEL: Record<BreakEvenStatus, string> = {
  safe: 'Seguro',
  at_risk: 'En riesgo',
  negative_margin: 'Margen negativo',
  no_sales: 'Sin ventas',
};

const STATUS_LABEL_USD_BS: Record<'safe' | 'at_risk' | 'negative', string> = {
  safe: 'Seguro',
  at_risk: 'En riesgo',
  negative: 'Margen negativo',
};

function Skeleton() {
  return (
    <div className="balance-point-detail">
      <div className="balance-point-detail__skeleton-block" style={{ height: 56 }} />
      <div className="balance-point-detail__grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="balance-point-detail__skeleton-card">
            <div className="balance-point-detail__skeleton" style={{ width: 80, height: 11, marginBottom: 12 }} />
            <div className="balance-point-detail__skeleton" style={{ width: 120, height: 24, marginBottom: 4 }} />
            <div className="balance-point-detail__skeleton" style={{ width: 90, height: 13 }} />
          </div>
        ))}
      </div>
      <div className="balance-point-detail__skeleton-block" style={{ height: 220 }} />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="balance-point-detail__error">
      <svg className="balance-point-detail__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="balance-point-detail__error-text">{message}</p>
      {onRetry && (
        <button className="balance-point-detail__error-btn" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}

function ArrowSeparator() {
  return (
    <div className="balance-point-detail__arrow">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  );
}

function EqualSeparator() {
  return (
    <div className="balance-point-detail__equal">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
        <path d="M5 9h14M5 15h14" />
      </svg>
    </div>
  );
}

export default function BalancePointDetail({ data, loading = false, error = null, onRetry }: BalancePointDetailProps) {
  if (loading) return <Skeleton />;

  if (error || !data) {
    return <ErrorState message={error ?? 'No se pudieron cargar los datos del análisis'} onRetry={onRetry} />;
  }

  const { financialsActual, breakEven, period } = data;
  const { breakEvenStatus, dataConfidence, transactionCount } = data;
  const { marginStatusUsd, marginStatusBs } = breakEven;
  const isNegative = breakEvenStatus === 'negative_margin';
  const isSafe = breakEvenStatus === 'safe';
  const isNoSales = breakEvenStatus === 'no_sales';
  const isService = 'itemType' in data && data.itemType === 'SERVICE';
  const isBatch = 'batchQuantity' in data;
  const itemName = data.itemName;
  const badgeLabel = isService ? 'Servicio' : 'Producto';

  const { dollars: d, bs } = financialsActual;

  const coverageUsd = breakEven.salesVolumeRequired !== null && breakEven.salesVolumeRequired > 0
    ? (d.totalSales / breakEven.salesVolumeRequired) * 100
    : null;
  const coverageBs = breakEven.salesVolumeRequiredBs !== null && breakEven.salesVolumeRequiredBs > 0
    ? (bs.totalSalesBs / breakEven.salesVolumeRequiredBs) * 100
    : null;
  const widthUsd = coverageUsd !== null ? Math.max(0, Math.min(coverageUsd, 100)) : 0;
  const widthBs = coverageBs !== null ? Math.max(0, Math.min(coverageBs, 100)) : 0;

  const unitPriceRatio = d.unitPrice > 0 ? 100 : 0;
  const unitCostRatio = d.unitPrice > 0
    ? Math.min((d.unitVariableCost / d.unitPrice) * 100, 100)
    : 0;
  const unitMarginRatio = d.unitPrice > 0
    ? Math.min((Math.abs(d.unitContributionMargin) / d.unitPrice) * 100, 100)
    : 0;

  const pillLabel = isSafe
    ? 'Situación segura'
    : isNoSales
      ? 'Sin ventas registradas'
      : isNegative
        ? 'Margen negativo'
        : 'En riesgo';

  return (
    <div className="balance-point-detail">
      <div className="balance-point-detail__header">
        <div className="balance-point-detail__header-info">
          <h2 className="balance-point-detail__title">{itemName}</h2>
          {isBatch ? (
            <span className="balance-point-detail__badge balance-point-detail__badge--batch">Lote</span>
          ) : (
            <span className="balance-point-detail__badge">{badgeLabel}</span>
          )}
          {breakEven.isEstimated && (
            <span className="balance-point-detail__badge balance-point-detail__badge--estimated">Estimado</span>
          )}
          <span className={`balance-point-detail__pill balance-point-detail__pill--${breakEvenStatus}`}>
            {pillLabel}
          </span>
        </div>
        <div className="balance-point-detail__header-meta">
          {isBatch && 'batchQuantity' in data && (
            <span className="balance-point-detail__batch-qty">{data.batchQuantity} uds</span>
          )}
          <ConfidenceBadge confidence={dataConfidence} transactionCount={transactionCount} />
          <span className="balance-point-detail__period">
            {formatPeriodLabel(period.startDate, period.endDate)}
          </span>
        </div>
      </div>

      <div className="balance-point-detail__status-row">
        <span className={`balance-point-detail__status-chip balance-point-detail__status-chip--${breakEvenStatus}`}>
          {STATUS_LABEL[breakEvenStatus]}
        </span>
        <span className={`balance-point-detail__status-chip balance-point-detail__status-chip--${marginStatusUsd}`}>
          USD: {STATUS_LABEL_USD_BS[marginStatusUsd]}
        </span>
        <span className={`balance-point-detail__status-chip balance-point-detail__status-chip--${marginStatusBs}`}>
          Bs: {STATUS_LABEL_USD_BS[marginStatusBs]}
        </span>
      </div>

      {isNegative && (
        <div className="balance-point-detail__alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div className="balance-point-detail__alert-content">
            <strong>Margen negativo</strong>
            <span>Cada venta genera pérdida. Revisa precios o costos variables; vender más solo aumenta la pérdida.</span>
          </div>
        </div>
      )}

      <div className="balance-point-detail__grid">
        <div className="balance-point-detail__card">
          <div className="balance-point-detail__card-header">
            <div className="balance-point-detail__icon balance-point-detail__icon--units">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <span className="balance-point-detail__card-badge">Requerido</span>
          </div>
          <span className="balance-point-detail__card-label">Unidades Requeridas</span>
          <span className="balance-point-detail__card-value">
            {breakEven.unitsRequired !== null ? formatNumber(breakEven.unitsRequired, 0) : NOT_REACHABLE}
          </span>
          {breakEven.unitsRequiredBs !== null && breakEven.unitsRequiredBs !== breakEven.unitsRequired && (
            <span className="balance-point-detail__card-secondary">Bs: {formatNumber(breakEven.unitsRequiredBs, 0)}</span>
          )}
        </div>

        <div className="balance-point-detail__card">
          <div className="balance-point-detail__card-header">
            <div className="balance-point-detail__icon balance-point-detail__icon--inflow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="balance-point-detail__card-badge">Ventas</span>
          </div>
          <span className="balance-point-detail__card-label">Ventas Requeridas (USD)</span>
          <span className="balance-point-detail__card-value balance-point-detail__card-value--accent">
            {breakEven.salesVolumeRequired !== null ? formatUSD(breakEven.salesVolumeRequired) : NOT_REACHABLE}
          </span>
          <span className="balance-point-detail__card-secondary">
            Bs: {breakEven.salesVolumeRequiredBs !== null ? formatBs(breakEven.salesVolumeRequiredBs) : NOT_APPLICABLE}
          </span>
        </div>

        <div className="balance-point-detail__card">
          <div className="balance-point-detail__card-header">
            <div className="balance-point-detail__icon balance-point-detail__icon--distance">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="12" cy="12" r="1" />
              </svg>
            </div>
            <span className="balance-point-detail__card-badge">Distancia</span>
          </div>
          <span className="balance-point-detail__card-label">Distancia al Equilibrio</span>
          <span className={`balance-point-detail__card-value balance-point-detail__card-value--${marginStatusUsd}`}>
            {breakEven.distanceToBreakEven !== null
              ? `${breakEven.distanceToBreakEven >= 0 ? '+' : ''}${formatUSD(breakEven.distanceToBreakEven)}`
              : NOT_APPLICABLE}
          </span>
          <span className={`balance-point-detail__card-secondary balance-point-detail__card-secondary--${marginStatusBs}`}>
            Bs: {breakEven.distanceToBreakEvenBs !== null
              ? `${breakEven.distanceToBreakEvenBs >= 0 ? '+' : ''}${formatBs(breakEven.distanceToBreakEvenBs)}`
              : NOT_APPLICABLE}
          </span>
          {breakEven.distanceToBreakEvenUnits !== null && (
            <span className="balance-point-detail__card-tertiary">
              {breakEven.distanceToBreakEvenUnits >= 0 ? '+' : ''}{formatNumber(breakEven.distanceToBreakEvenUnits, 0)} uds
            </span>
          )}
        </div>

        <div className={`balance-point-detail__card balance-point-detail__card--highlight${isNegative ? ' balance-point-detail__card--negative' : ''}`}>
          <div className="balance-point-detail__glow" />
          <div className="balance-point-detail__card-header">
            <div className="balance-point-detail__icon balance-point-detail__icon--ratio">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M21 12a9 9 0 1 1-9-9" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <span className={`balance-point-detail__pill balance-point-detail__pill--${breakEvenStatus}`}>
              {pillLabel}
            </span>
          </div>
          <span className="balance-point-detail__card-label">Ratio de Margen</span>
          <div className="balance-point-detail__margin-cards">
            <div className={`balance-point-detail__margin-card${isNegative ? ' balance-point-detail__margin-card--negative' : ''}`}>
              <span className="balance-point-detail__margin-card-label">USD</span>
              <span className={`balance-point-detail__margin-card-value${isNegative ? '' : ' balance-point-detail__margin-card-value--positive'}`}>
                {formatPercentage(d.contributionMarginRatio)}
              </span>
            </div>
            <div className={`balance-point-detail__margin-card balance-point-detail__margin-card--bs${isNegative ? ' balance-point-detail__margin-card--negative' : ''}`}>
              <span className="balance-point-detail__margin-card-label">Bs.</span>
              <span className={`balance-point-detail__margin-card-value${isNegative ? '' : ' balance-point-detail__margin-card-value--positive-bs'}`}>
                {formatPercentage(bs.contributionMarginRatioBs)}
              </span>
            </div>
          </div>
          <div className="balance-point-detail__ratio">
            <div className="balance-point-detail__progress">
              <div
                className={`balance-point-detail__progress-bar${isNegative ? ' balance-point-detail__progress-bar--negative' : ''}`}
                style={{ width: `${Math.max(0, Math.min(d.contributionMarginRatio, 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="balance-point-detail__coverage">
        <div className="balance-point-detail__coverage-title">Cobertura del Punto de Equilibrio</div>
        <div className="balance-point-detail__coverage-row">
          <div className="balance-point-detail__coverage-header">
            <span className="balance-point-detail__coverage-label">USD</span>
            <span className={`balance-point-detail__coverage-value balance-point-detail__coverage-value--${marginStatusUsd}`}>
              {coverageUsd !== null ? `${coverageUsd.toFixed(1)}%` : NOT_APPLICABLE}
            </span>
          </div>
          <div className="balance-point-detail__coverage-bar">
            <div
              className={`balance-point-detail__coverage-bar-fill balance-point-detail__coverage-bar-fill--${marginStatusUsd}`}
              style={{ width: `${widthUsd}%` }}
            />
          </div>
        </div>
        <div className="balance-point-detail__coverage-row">
          <div className="balance-point-detail__coverage-header">
            <span className="balance-point-detail__coverage-label">Bs</span>
            <span className={`balance-point-detail__coverage-value balance-point-detail__coverage-value--${marginStatusBs}`}>
              {coverageBs !== null ? `${coverageBs.toFixed(1)}%` : NOT_APPLICABLE}
            </span>
          </div>
          <div className="balance-point-detail__coverage-bar">
            <div
              className={`balance-point-detail__coverage-bar-fill balance-point-detail__coverage-bar-fill--${marginStatusBs}`}
              style={{ width: `${widthBs}%` }}
            />
          </div>
        </div>
      </div>

      <div className="balance-point-detail__financials">
        <div className="balance-point-detail__financials-title">Resumen Financiero del Período</div>
        <div className="balance-point-detail__financials-grid">
          <div className="balance-point-detail__financials-cell">
            <span className="balance-point-detail__financials-label">Ventas Totales</span>
            <span className="balance-point-detail__financials-primary">{formatUSD(d.totalSales)}</span>
            <span className="balance-point-detail__financials-secondary">{formatBs(bs.totalSalesBs)}</span>
          </div>
          <div className="balance-point-detail__financials-cell">
            <span className="balance-point-detail__financials-label">Costos Variables</span>
            <span className="balance-point-detail__financials-primary">{formatUSD(d.totalVariableCosts)}</span>
            <span className="balance-point-detail__financials-secondary">{formatBs(bs.totalVariableCostsBs)}</span>
          </div>
          <div className="balance-point-detail__financials-cell">
            <span className="balance-point-detail__financials-label">Costos Fijos Asignados</span>
            <span className="balance-point-detail__financials-primary">{formatUSD(d.totalFixedCosts)}</span>
            <span className="balance-point-detail__financials-secondary">{formatBs(bs.totalFixedCostsBs)}</span>
          </div>
        </div>
      </div>

      <div className="balance-point-detail__unit-section">
        <div className="balance-point-detail__unit-header">
          <div className="balance-point-detail__unit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <h3 className="balance-point-detail__unit-title">Análisis Unitario</h3>
        </div>

        <div className="balance-point-detail__unit-flow">
          <div className="balance-point-detail__unit-block">
            <div className="balance-point-detail__unit-block-header">
              <div className="balance-point-detail__unit-block-icon balance-point-detail__unit-block-icon--price">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="balance-point-detail__unit-block-label">Precio Unitario</span>
            </div>
            <div className="balance-point-detail__unit-values">
              <span className="balance-point-detail__unit-usd">{formatUSD(d.unitPrice)}</span>
              <span className="balance-point-detail__unit-bs">{formatBs(bs.unitPriceBs)}</span>
            </div>
            <div className="balance-point-detail__unit-bar-track">
              <div
                className="balance-point-detail__unit-bar balance-point-detail__unit-bar--price"
                style={{ width: `${unitPriceRatio}%` }}
              />
            </div>
          </div>

          <ArrowSeparator />

          <div className="balance-point-detail__unit-block">
            <div className="balance-point-detail__unit-block-header">
              <div className="balance-point-detail__unit-block-icon balance-point-detail__unit-block-icon--cost">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8l-4 4-4-4" />
                  <path d="M16 16l-4-4-4 4" />
                </svg>
              </div>
              <span className="balance-point-detail__unit-block-label">Costo Variable Unitario</span>
            </div>
            <div className="balance-point-detail__unit-values">
              <span className="balance-point-detail__unit-usd">{formatUSD(d.unitVariableCost)}</span>
              <span className="balance-point-detail__unit-bs">{formatBs(bs.unitVariableCostBs)}</span>
            </div>
            <div className="balance-point-detail__unit-bar-track">
              <div
                className="balance-point-detail__unit-bar balance-point-detail__unit-bar--cost"
                style={{ width: `${unitCostRatio}%` }}
              />
            </div>
          </div>

          <EqualSeparator />

          <div className="balance-point-detail__unit-block balance-point-detail__unit-block--margin">
            <div className="balance-point-detail__unit-block-header">
              <div className={`balance-point-detail__unit-block-icon${isNegative ? ' balance-point-detail__unit-block-icon--negative' : ' balance-point-detail__unit-block-icon--margin'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <span className="balance-point-detail__unit-block-label">Margen Unitario</span>
            </div>

            <div className="balance-point-detail__margin-cards">
              <div className={`balance-point-detail__margin-card${isNegative ? ' balance-point-detail__margin-card--negative' : ''}`}>
                <span className="balance-point-detail__margin-card-label">USD</span>
                <span className={`balance-point-detail__margin-card-value${isNegative ? '' : ' balance-point-detail__margin-card-value--positive'}`}>
                  {isNegative ? '-' : '+'}{formatUSD(Math.abs(d.unitContributionMargin))}
                </span>
              </div>
              <div className={`balance-point-detail__margin-card balance-point-detail__margin-card--bs${isNegative ? ' balance-point-detail__margin-card--negative' : ''}`}>
                <span className="balance-point-detail__margin-card-label">Bs.</span>
                <span className={`balance-point-detail__margin-card-value${isNegative ? '' : ' balance-point-detail__margin-card-value--positive-bs'}`}>
                  {formatBs(bs.unitContributionMarginBs)}
                </span>
              </div>
            </div>

            <div className="balance-point-detail__unit-bar-track">
              <div
                className={`balance-point-detail__unit-bar${isNegative ? ' balance-point-detail__unit-bar--negative' : ' balance-point-detail__unit-bar--margin'}`}
                style={{ width: `${unitMarginRatio}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
