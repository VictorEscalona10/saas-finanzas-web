'use client';

import { formatUSD, formatBs, formatNumber, formatPercentage } from '@/src/shared/utils/numberUtils';
import { formatPeriodLabel } from '@/src/shared/utils/dateUtils';
import type { ContributionProduct } from '@/src/domain/repositories/IContributionMarginRepository';
import './ContributionDetail.css';

interface ContributionDetailProps {
  data: ContributionProduct | null | undefined;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

function Skeleton() {
  return (
    <div className="contribution-detail">
      <div className="contribution-detail__skeleton-block" style={{ height: 56 }} />
      <div className="contribution-detail__grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="contribution-detail__skeleton-card">
            <div className="contribution-detail__skeleton" style={{ width: 80, height: 11, marginBottom: 12 }} />
            <div className="contribution-detail__skeleton" style={{ width: 120, height: 24, marginBottom: 4 }} />
            <div className="contribution-detail__skeleton" style={{ width: 90, height: 13 }} />
          </div>
        ))}
      </div>
      <div className="contribution-detail__skeleton-block" style={{ height: 220 }} />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="contribution-detail__error">
      <svg className="contribution-detail__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="contribution-detail__error-text">{message}</p>
      {onRetry && (
        <button className="contribution-detail__error-btn" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}

function ArrowSeparator() {
  return (
    <div className="contribution-detail__arrow">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </div>
  );
}

function EqualSeparator() {
  return (
    <div className="contribution-detail__equal">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
        <path d="M5 9h14M5 15h14" />
      </svg>
    </div>
  );
}

export default function ContributionDetail({ data, loading = false, error = null, onRetry }: ContributionDetailProps) {
  if (loading) return <Skeleton />;

  if (error || !data) {
    return <ErrorState message={error ?? 'No se pudieron cargar los datos del análisis'} onRetry={onRetry} />;
  }

  const { financials, unitAnalysis } = data;
  const isMarginNegative = financials.contributionMargin < 0;
  const ratioPct = financials.contributionMarginRatio * 100;
  const ratioWidth = Math.max(0, Math.min(ratioPct, 100));
  const isService = data.itemType === 'SERVICE';
  const isBatch = data.batchQuantity != null;
  const soldLabel = isService ? 'Servicios Vendidos' : isBatch ? 'Lotes Producidos' : 'Unidades Vendidas';

  const unitPriceRatio = unitAnalysis.unitInflow > 0 ? 100 : 0;
  const unitCostRatio = unitAnalysis.unitInflow > 0
    ? Math.min((unitAnalysis.unitVariableCost / unitAnalysis.unitInflow) * 100, 100)
    : 0;
  const unitMarginRatio = unitAnalysis.unitInflow > 0
    ? Math.min((Math.abs(unitAnalysis.unitContributionMargin) / unitAnalysis.unitInflow) * 100, 100)
    : 0;

  return (
    <div className="contribution-detail">
      <div className="contribution-detail__header">
        <div className="contribution-detail__header-info">
          <h2 className="contribution-detail__title">{data.itemName}</h2>
          <span className="contribution-detail__badge">{isService ? 'Servicio' : 'Producto'}</span>
        </div>
        {data.period && (
          <div className="contribution-detail__period">
            {formatPeriodLabel(data.period.startDate, data.period.endDate)}
          </div>
        )}
      </div>

      <div className="contribution-detail__grid">
        <div className="contribution-detail__card">
          <div className="contribution-detail__card-header">
            <div className="contribution-detail__icon contribution-detail__icon--units">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <span className="contribution-detail__card-badge">{isService ? 'Servicios' : data.batchQuantity != null ? 'Lotes' : 'Unidades'}</span>
          </div>
          <span className="contribution-detail__card-label">{soldLabel}</span>
          <span className="contribution-detail__card-value">{formatNumber(isService ? data.totalServicesSold : data.batchQuantity ?? data.totalUnitsSold, 0)}</span>
        </div>

        <div className="contribution-detail__card">
          <div className="contribution-detail__card-header">
            <div className="contribution-detail__icon contribution-detail__icon--inflow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="contribution-detail__card-badge">Inflow</span>
          </div>
          <span className="contribution-detail__card-label">Ingreso Total</span>
          <span className="contribution-detail__card-value">{formatUSD(financials.totalInflow)}</span>
          <span className="contribution-detail__card-secondary">{formatBs(financials.totalInflowBs)}</span>
        </div>

        <div className="contribution-detail__card">
          <div className="contribution-detail__card-header">
            <div className="contribution-detail__icon contribution-detail__icon--costs">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8l-4 4-4-4" />
                <path d="M16 16l-4-4-4 4" />
              </svg>
            </div>
            <span className="contribution-detail__card-badge">Gastos</span>
          </div>
          <span className="contribution-detail__card-label">Costo Variable Total</span>
          <span className="contribution-detail__card-value">{formatUSD(financials.totalVariableCost)}</span>
          <span className="contribution-detail__card-secondary">{formatBs(financials.totalVariableCostBs)}</span>
        </div>

        <div className={`contribution-detail__card contribution-detail__card--highlight${isMarginNegative ? ' contribution-detail__card--negative' : ''}`}>
          <div className="contribution-detail__glow" />
          <div className="contribution-detail__card-header">
            <div className="contribution-detail__icon contribution-detail__icon--margin">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <span className={`contribution-detail__pill${isMarginNegative ? ' contribution-detail__pill--negative' : ''}`}>
              {isMarginNegative ? 'En riesgo' : 'Saludable'}
            </span>
          </div>
          <span className="contribution-detail__card-label">Margen de Contribución</span>
          <div className="contribution-detail__margin-cards">
            <div className={`contribution-detail__margin-card${isMarginNegative ? ' contribution-detail__margin-card--negative' : ''}`}>
              <span className="contribution-detail__margin-card-label">USD</span>
              <span className={`contribution-detail__margin-card-value${isMarginNegative ? '' : ' contribution-detail__margin-card-value--positive'}`}>
                {isMarginNegative ? '-' : '+'}{formatUSD(Math.abs(financials.contributionMargin))}
              </span>
            </div>
            <div className={`contribution-detail__margin-card contribution-detail__margin-card--bs${isMarginNegative ? ' contribution-detail__margin-card--negative' : ''}`}>
              <span className="contribution-detail__margin-card-label">Bs.</span>
              <span className={`contribution-detail__margin-card-value${isMarginNegative ? '' : ' contribution-detail__margin-card-value--positive-bs'}`}>
                {formatBs(financials.contributionMarginBs)}
              </span>
            </div>
          </div>
          <div className="contribution-detail__ratio">
            <div className="contribution-detail__progress">
              <div
                className={`contribution-detail__progress-bar${isMarginNegative ? ' contribution-detail__progress-bar--negative' : ''}`}
                style={{ width: `${ratioWidth}%` }}
              />
            </div>
            <span className="contribution-detail__ratio-value">{formatPercentage(ratioPct)}</span>
          </div>
        </div>
      </div>

      <div className="contribution-detail__unit-section">
        <div className="contribution-detail__unit-header">
          <div className="contribution-detail__unit-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <h3 className="contribution-detail__unit-title">Análisis Unitario</h3>
        </div>

        <div className="contribution-detail__unit-flow">
          <div className="contribution-detail__unit-block">
            <div className="contribution-detail__unit-block-header">
              <div className="contribution-detail__unit-block-icon contribution-detail__unit-block-icon--price">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="contribution-detail__unit-block-label">Precio Unitario</span>
            </div>
            <div className="contribution-detail__unit-values">
              <span className="contribution-detail__unit-usd">{formatUSD(unitAnalysis.unitInflow)}</span>
              <span className="contribution-detail__unit-bs">{formatBs(unitAnalysis.unitInflowBs)}</span>
            </div>
            <div className="contribution-detail__unit-bar-track">
              <div
                className="contribution-detail__unit-bar contribution-detail__unit-bar--price"
                style={{ width: `${unitPriceRatio}%` }}
              />
            </div>
          </div>

          <ArrowSeparator />

          <div className="contribution-detail__unit-block">
            <div className="contribution-detail__unit-block-header">
              <div className="contribution-detail__unit-block-icon contribution-detail__unit-block-icon--cost">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8l-4 4-4-4" />
                  <path d="M16 16l-4-4-4 4" />
                </svg>
              </div>
              <span className="contribution-detail__unit-block-label">Costo Variable Unitario</span>
            </div>
            <div className="contribution-detail__unit-values">
              <span className="contribution-detail__unit-usd">{formatUSD(unitAnalysis.unitVariableCost)}</span>
              <span className="contribution-detail__unit-bs">{formatBs(unitAnalysis.unitVariableCostBs)}</span>
            </div>
            <div className="contribution-detail__unit-bar-track">
              <div
                className="contribution-detail__unit-bar contribution-detail__unit-bar--cost"
                style={{ width: `${unitCostRatio}%` }}
              />
            </div>
          </div>

          <EqualSeparator />

          <div className="contribution-detail__unit-block contribution-detail__unit-block--margin">
            <div className="contribution-detail__unit-block-header">
              <div className={`contribution-detail__unit-block-icon${isMarginNegative ? ' contribution-detail__unit-block-icon--negative' : ' contribution-detail__unit-block-icon--margin'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <span className="contribution-detail__unit-block-label">Margen Unitario</span>
            </div>

            <div className="contribution-detail__margin-cards">
              <div className={`contribution-detail__margin-card${isMarginNegative ? ' contribution-detail__margin-card--negative' : ''}`}>
                <span className="contribution-detail__margin-card-label">USD</span>
                <span className={`contribution-detail__margin-card-value${isMarginNegative ? '' : ' contribution-detail__margin-card-value--positive'}`}>
                  {isMarginNegative ? '-' : '+'}{formatUSD(Math.abs(unitAnalysis.unitContributionMargin))}
                </span>
              </div>
              <div className={`contribution-detail__margin-card contribution-detail__margin-card--bs${isMarginNegative ? ' contribution-detail__margin-card--negative' : ''}`}>
                <span className="contribution-detail__margin-card-label">Bs.</span>
                <span className={`contribution-detail__margin-card-value${isMarginNegative ? '' : ' contribution-detail__margin-card-value--positive-bs'}`}>
                  {formatBs(unitAnalysis.unitContributionMarginBs)}
                </span>
              </div>
            </div>

            <div className="contribution-detail__unit-bar-track">
              <div
                className={`contribution-detail__unit-bar${isMarginNegative ? ' contribution-detail__unit-bar--negative' : ' contribution-detail__unit-bar--margin'}`}
                style={{ width: `${unitMarginRatio}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
