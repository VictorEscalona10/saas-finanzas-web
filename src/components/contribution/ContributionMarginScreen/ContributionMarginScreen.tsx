'use client';

import { useState, useCallback, useMemo } from 'react';
import { subMonths, format } from 'date-fns';
import { useContributionGlobal } from '@/src/use-cases/contribution/useContributionGlobal';
import { useContributionTrend } from '@/src/use-cases/contribution/useContributionTrend';
import ContributionCard from '@/src/components/contribution/ContributionCard';
import ContributionTable from '@/src/components/contribution/ContributionTable';
import ContributionTrendChart from '@/src/components/contribution/ContributionTrendChart';
import type { ContributionTrendPoint } from '@/src/domain/repositories/IContributionMarginRepository';
import './ContributionMarginScreen.css';

interface ContributionMarginScreenProps {
  companyId: string;
}

function Skeleton() {
  return (
    <div className="contribution-margin-screen">
      <div className="contribution-margin-screen__header">
        <div className="contribution-margin-screen__skeleton" style={{ width: 200, height: 28 }} />
        <div className="contribution-margin-screen__skeleton" style={{ width: 300, height: 16, marginTop: 8 }} />
      </div>
      <div className="contribution-margin-screen__section">
        <div className="contribution-card__grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="contribution-margin-screen__skeleton-card">
              <div className="contribution-margin-screen__skeleton" style={{ width: 80, height: 11, marginBottom: 12 }} />
              <div className="contribution-margin-screen__skeleton" style={{ width: 120, height: 24, marginBottom: 4 }} />
              <div className="contribution-margin-screen__skeleton" style={{ width: 90, height: 13 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="contribution-margin-screen">
      <div className="contribution-margin-screen__error">
        <svg className="contribution-margin-screen__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="contribution-margin-screen__error-text">{message}</p>
        <button className="contribution-margin-screen__error-btn" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    </div>
  );
}

type TrendPeriod = '6M' | '12M' | 'YTD';

const defaultStartDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
const defaultEndDate = new Date().toISOString().split('T')[0];

function getTrendRange(period: TrendPeriod): { start: string; end: string } {
  const end = new Date();
  const endStr = format(end, 'yyyy-MM-dd');
  let start: Date;
  if (period === 'YTD') {
    start = new Date(end.getFullYear(), 0, 1);
  } else {
    const months = period === '6M' ? 6 : 12;
    start = subMonths(end, months);
  }
  return { start: format(start, 'yyyy-MM-dd'), end: endStr };
}

export default function ContributionMarginScreen({ companyId }: ContributionMarginScreenProps) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('12M');

  const trendRange = useMemo(() => getTrendRange(trendPeriod), [trendPeriod]);

  const {
    data: globalData,
    isLoading: globalLoading,
    error: globalError,
    refetch: refetchGlobal,
  } = useContributionGlobal(companyId, startDate, endDate);

  const {
    data: trendData,
    isLoading: trendLoading,
    error: trendError,
    refetch: refetchTrend,
  } = useContributionTrend(companyId, trendRange.start, trendRange.end);

  const chartData: ContributionTrendPoint[] = useMemo(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');

    if (!globalData) return trendData;

    const currentPoint: ContributionTrendPoint = {
      month: currentMonth,
      totalSales: globalData.totalSales,
      totalVariableCosts: globalData.totalVariableCosts,
      totalMargin: globalData.totalMargin,
    };

    if (trendData.length === 0) return [currentPoint];

    const hasRealData = trendData.some(
      (d) => d.totalSales !== 0 || d.totalVariableCosts !== 0 || d.totalMargin !== 0,
    );
    if (!hasRealData) return [currentPoint];

    const hasCurrent = trendData.some((d) => d.month === currentMonth);
    if (!hasCurrent) {
      return [...trendData.filter((d) => d.month !== currentMonth), currentPoint];
    }

    return trendData.map((d) => (d.month === currentMonth ? { ...d, ...currentPoint } : d));
  }, [trendData, globalData]);

  const handleRetry = useCallback(() => {
    refetchGlobal();
  }, [refetchGlobal]);

  if (globalLoading) return <Skeleton />;

  if (globalError || !globalData) {
    return <ErrorState message={globalError ?? 'No se pudieron cargar los datos'} onRetry={handleRetry} />;
  }

  return (
    <div className="contribution-margin-screen">
      <div className="contribution-margin-screen__header">
        <h1 className="contribution-margin-screen__title">Margen de Contribución</h1>
        <p className="contribution-margin-screen__subtitle">
          Monitoreo en tiempo real de la eficiencia operativa y rentabilidad por moneda.
        </p>
      </div>

      <div className="contribution-margin-screen__section">
        <ContributionCard data={globalData} />
      </div>

      <div className="contribution-margin-screen__section">
        <div className="contribution-margin-screen__trend-controls">
          <div className="contribution-margin-screen__trend-periods">
            {(['6M', '12M', 'YTD'] as TrendPeriod[]).map((p) => (
              <button
                key={p}
                className={`contribution-margin-screen__period-btn${trendPeriod === p ? ' contribution-margin-screen__period-btn--active' : ''}`}
                onClick={() => setTrendPeriod(p)}
              >
                {p === 'YTD' ? 'YTD' : `Últ. ${p}`}
              </button>
            ))}
          </div>
          {trendError && (
            <span className="contribution-margin-screen__trend-error">
              Error al cargar tendencia
              <button className="contribution-margin-screen__trend-retry" onClick={refetchTrend}>
                Reintentar
              </button>
            </span>
          )}
        </div>
        <ContributionTrendChart data={chartData} isLoading={trendLoading} />
      </div>
    </div>
  );
}
