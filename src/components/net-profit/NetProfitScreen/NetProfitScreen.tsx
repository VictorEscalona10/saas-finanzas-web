'use client';

import { useState, useCallback } from 'react';
import { startOfMonth, format } from 'date-fns';
import { useNetProfit } from '@/src/use-cases/net-profit/useNetProfit';
import NetProfitCard from '@/src/components/net-profit/NetProfitCard';
import NetProfitWaterfall from '@/src/components/net-profit/NetProfitWaterfall';
import GrossProfitFilters from '@/src/components/gross-profit/GrossProfitFilters';
import './NetProfitScreen.css';

interface NetProfitScreenProps {
  companyId: string;
}

function Skeleton() {
  return (
    <div className="net-profit-screen">
      <div className="net-profit-screen__header">
        <div className="net-profit-screen__skeleton" style={{ width: 200, height: 28 }} />
        <div className="net-profit-screen__skeleton" style={{ width: 300, height: 16, marginTop: 8 }} />
      </div>
      <div className="net-profit-screen__section">
        <div className="net-profit-card__grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="net-profit-screen__skeleton-card">
              <div className="net-profit-screen__skeleton" style={{ width: 80, height: 11, marginBottom: 12 }} />
              <div className="net-profit-screen__skeleton" style={{ width: 60, height: 13, marginBottom: 8 }} />
              <div className="net-profit-screen__skeleton" style={{ width: 120, height: 24, marginBottom: 4 }} />
              <div className="net-profit-screen__skeleton" style={{ width: 90, height: 18 }} />
            </div>
          ))}
        </div>
      </div>
      <div className="net-profit-screen__section">
        <div className="net-profit-screen__skeleton-card" style={{ height: 200 }}>
          <div className="net-profit-screen__skeleton" style={{ width: 150, height: 13, marginBottom: 16 }} />
          <div className="net-profit-screen__skeleton" style={{ width: '100%', height: 140 }} />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="net-profit-screen">
      <div className="net-profit-screen__error">
        <svg className="net-profit-screen__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="net-profit-screen__error-text">{message}</p>
        <button className="net-profit-screen__error-btn" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    </div>
  );
}

const today = new Date();
const defaultStartDate = format(startOfMonth(today), 'yyyy-MM-dd');
const defaultEndDate = format(today, 'yyyy-MM-dd');

export default function NetProfitScreen({ companyId }: NetProfitScreenProps) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useNetProfit(companyId, startDate, endDate);

  const handleRetry = useCallback(() => {
    refetchSummary();
  }, [refetchSummary]);

  const handleRangeChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  if (summaryLoading) return <Skeleton />;

  if (summaryError || !summaryData) {
    return <ErrorState message={summaryError ?? 'No se pudieron cargar los datos'} onRetry={handleRetry} />;
  }

  return (
    <div className="net-profit-screen">
      <div className="net-profit-screen__header">
        <h1 className="net-profit-screen__title">Utilidad Neta / P&amp;L</h1>
        <p className="net-profit-screen__subtitle">
          Estado de resultados completo: ingresos, gastos y utilidad neta por moneda.
        </p>
      </div>

      <div className="net-profit-screen__section">
        <GrossProfitFilters startDate={startDate} endDate={endDate} onChange={handleRangeChange} />
      </div>

      <div className="net-profit-screen__section">
        <NetProfitCard data={summaryData} />
      </div>

      <div className="net-profit-screen__section">
        <NetProfitWaterfall data={summaryData} />
      </div>
    </div>
  );
}
