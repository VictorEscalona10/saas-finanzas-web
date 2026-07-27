'use client';

import { useState, useCallback } from 'react';
import { useCashFlowTotal } from '@/src/use-cases/cash-flow/useCashFlowTotal';
import { useCashFlowByRange } from '@/src/use-cases/cash-flow/useCashFlowByRange';
import CashFlowFilters from '@/src/components/cash-flow/CashFlowFilters';
import CashFlowSummary from '@/src/components/cash-flow/CashFlowSummary';
import CashFlowStatement from '@/src/components/cash-flow/CashFlowStatement';
import CashFlowChart from '@/src/components/cash-flow/CashFlowChart';
import type { CashFlowCurrencyData, DetailedCashFlowCurrencyData, CashFlowPeriod } from '@/src/domain/repositories/ICashFlowRepository';
import './CashFlowScreen.css';

interface CashFlowScreenProps {
  companyId: string;
}

function Skeleton() {
  return (
    <div className="cash-flow-screen">
      <div className="cash-flow-screen__header">
        <div className="cash-flow-screen__skeleton-label" style={{ width: 160 }} />
        <div className="cash-flow-screen__skeleton-sub" style={{ width: 200, marginTop: 8 }} />
      </div>
      <div className="cash-flow-screen__section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="cash-flow-screen__skeleton-card">
              <div className="cash-flow-screen__skeleton-label" />
              <div className="cash-flow-screen__skeleton-value" />
              <div className="cash-flow-screen__skeleton-sub" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="cash-flow-screen">
      <div className="cash-flow-screen__error">
        <span className="material-symbols-outlined cash-flow-screen__error-icon">error_outline</span>
        <p className="cash-flow-screen__error-text">{message}</p>
        <button className="cash-flow-screen__error-btn" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    </div>
  );
}

export default function CashFlowScreen({ companyId }: CashFlowScreenProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isRangeActive = !!startDate && !!endDate;

  const {
    data: totalData,
    isLoading: totalLoading,
    error: totalError,
    refetch: refetchTotal,
  } = useCashFlowTotal(companyId);

  const {
    data: rangeData,
    isLoading: rangeLoading,
    error: rangeError,
    refetch: refetchRange,
  } = useCashFlowByRange(companyId, startDate, endDate);

  const loading = isRangeActive ? rangeLoading : totalLoading;
  const error = isRangeActive ? rangeError : totalError;
  const data = isRangeActive ? rangeData : totalData;

  const refetch = useCallback(() => {
    if (isRangeActive) refetchRange(); else refetchTotal();
  }, [isRangeActive, refetchRange, refetchTotal]);

  const handleRangeChange = useCallback((s: string, e: string) => {
    setStartDate(s);
    setEndDate(e);
  }, []);

  const handleClearRange = useCallback(() => {
    setStartDate('');
    setEndDate('');
  }, []);

  if (loading) return <Skeleton />;

  if (error || !data) {
    return <ErrorState message={error ?? 'No se pudieron cargar los datos'} onRetry={refetch} />;
  }

  const periodLabel = isRangeActive
    ? `${(data.period as CashFlowPeriod).startDate} – ${(data.period as CashFlowPeriod).endDate}`
    : `${(data as NonNullable<typeof totalData>).period.start_date ?? 'Inicio'} – ${(data as NonNullable<typeof totalData>).period.end_date}`;

  const isDetailed = 'inflow' in data.usd.summary;

  const usd: CashFlowCurrencyData = {
    summary: isDetailed
      ? {
          current_balance: (data.usd as DetailedCashFlowCurrencyData).summary.current_balance,
          pending_inflow: (data.usd as DetailedCashFlowCurrencyData).summary.pending_inflow,
          pending_outflow: (data.usd as DetailedCashFlowCurrencyData).summary.pending_outflow,
          net_cash_flow: (data.usd as DetailedCashFlowCurrencyData).summary.net_cash_flow,
        }
      : (data.usd as CashFlowCurrencyData).summary,
    cash_flow_statement: data.usd.cash_flow_statement,
  };
  const bs: CashFlowCurrencyData = {
    summary: isDetailed
      ? {
          current_balance: (data.bs as DetailedCashFlowCurrencyData).summary.current_balance,
          pending_inflow: (data.bs as DetailedCashFlowCurrencyData).summary.pending_inflow,
          pending_outflow: (data.bs as DetailedCashFlowCurrencyData).summary.pending_outflow,
          net_cash_flow: (data.bs as DetailedCashFlowCurrencyData).summary.net_cash_flow,
        }
      : (data.bs as CashFlowCurrencyData).summary,
    cash_flow_statement: data.bs.cash_flow_statement,
  };

  console.log('CashFlowScreen data', { usd, bs, periodLabel, isDetailed });

  return (
    <div className="cash-flow-screen">
      <div className="cash-flow-screen__header">
        <h1 className="cash-flow-screen__title">Flujo de Caja</h1>
        <p className="cash-flow-screen__subtitle">
          {periodLabel}
        </p>
      </div>

      <CashFlowFilters
        startDate={startDate}
        endDate={endDate}
        onChange={handleRangeChange}
        onClear={handleClearRange}
      />

      <div className="cash-flow-screen__section">
        <CashFlowSummary usd={usd} bs={bs} />
      </div>

      <div className="cash-flow-screen__section">
        <h2 className="cash-flow-screen__section-title">Estado de Flujo de Caja</h2>
        <CashFlowStatement usd={usd} bs={bs} />
      </div>

      <div className="cash-flow-screen__section">
        <h2 className="cash-flow-screen__section-title">Distribución por Categoría</h2>
        <CashFlowChart usd={usd} />
      </div>
    </div>
  );
}