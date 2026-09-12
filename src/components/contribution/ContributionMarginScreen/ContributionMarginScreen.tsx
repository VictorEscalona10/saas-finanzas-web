'use client';

import { useState, useCallback, useMemo } from 'react';
import { startOfMonth, format } from 'date-fns';
import { useContributionGlobal } from '@/src/use-cases/contribution/useContributionGlobal';
import { useContributionProduct } from '@/src/use-cases/contribution/useContributionProduct';
import { useContributionService } from '@/src/use-cases/contribution/useContributionService';
import { useContributionByBatch } from '@/src/use-cases/contribution/useContributionByBatch';
import ContributionCard from '@/src/components/contribution/ContributionCard';
import ContributionTrendChart from '@/src/components/contribution/ContributionTrendChart';
import ContributionFilters from '@/src/components/contribution/ContributionFilters';
import ContributionDetail from '@/src/components/contribution/ContributionDetail';
import ContributionSelector, { type ContributionView } from '@/src/components/contribution/ContributionSelector';
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

const today = new Date();
const defaultStartDate = format(startOfMonth(today), 'yyyy-MM-dd');
const defaultEndDate = format(today, 'yyyy-MM-dd');

export default function ContributionMarginScreen({ companyId }: ContributionMarginScreenProps) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [view, setView] = useState<ContributionView>('global');
  const [selectedId, setSelectedId] = useState('');

  const {
    data: globalData,
    isLoading: globalLoading,
    error: globalError,
    refetch: refetchGlobal,
  } = useContributionGlobal(companyId, startDate, endDate);

  const {
    data: productData,
    isLoading: productLoading,
    error: productError,
    refetch: refetchProduct,
  } = useContributionProduct(selectedId || undefined, companyId, startDate, endDate);

  const {
    data: serviceData,
    isLoading: serviceLoading,
    error: serviceError,
    refetch: refetchService,
  } = useContributionService(selectedId || undefined, companyId, startDate, endDate);

  const {
    data: batchData,
    isLoading: batchLoading,
    error: batchError,
    refetch: refetchBatch,
  } = useContributionByBatch(selectedId || undefined, companyId);

  const chartData: ContributionTrendPoint[] = useMemo(() => {
    return (globalData?.grouped ?? []).filter(
      (d) => d.totalSales !== 0 || d.totalVariableCosts !== 0 || d.totalMargin !== 0,
    );
  }, [globalData]);

  const handleRetry = useCallback(() => {
    refetchGlobal();
  }, [refetchGlobal]);

  const handleRangeChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const handleViewChange = useCallback((nextView: ContributionView) => {
    setView(nextView);
    setSelectedId('');
  }, []);

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

      <ContributionFilters startDate={startDate} endDate={endDate} onChange={handleRangeChange} />

      <ContributionSelector
        view={view}
        onViewChange={handleViewChange}
        selectedId={selectedId}
        onSelect={setSelectedId}
        companyId={companyId}
      />

      {view === 'global' && (
        <>
          <div className="contribution-margin-screen__section">
            <ContributionCard data={globalData} />
          </div>

          <div className="contribution-margin-screen__section">
            <ContributionTrendChart data={chartData} isLoading={globalLoading} startDate={startDate} endDate={endDate} />
          </div>
        </>
      )}

      {view === 'product' && (
        <div className="contribution-margin-screen__section">
          {selectedId ? (
            <ContributionDetail
              data={productData}
              loading={productLoading}
              error={productError}
              onRetry={refetchProduct}
            />
          ) : (
            <div className="contribution-margin-screen__empty">
              <div className="contribution-margin-screen__empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <p className="contribution-margin-screen__empty-title">Selecciona un producto</p>
              <p className="contribution-margin-screen__empty-desc">
                Usa el buscador de arriba para encontrar un producto y visualizar su análisis de margen de contribución.
              </p>
            </div>
          )}
        </div>
      )}

      {view === 'service' && (
        <div className="contribution-margin-screen__section">
          {selectedId ? (
            <ContributionDetail
              data={serviceData}
              loading={serviceLoading}
              error={serviceError}
              onRetry={refetchService}
            />
          ) : (
            <div className="contribution-margin-screen__empty">
              <div className="contribution-margin-screen__empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <p className="contribution-margin-screen__empty-title">Selecciona un servicio</p>
              <p className="contribution-margin-screen__empty-desc">
                Usa el buscador de arriba para encontrar un servicio y visualizar su análisis de margen de contribución.
              </p>
            </div>
          )}
        </div>
      )}

      {view === 'batch' && (
        <div className="contribution-margin-screen__section">
          {selectedId ? (
            <ContributionDetail
              data={batchData}
              loading={batchLoading}
              error={batchError}
              onRetry={refetchBatch}
            />
          ) : (
            <div className="contribution-margin-screen__empty">
              <div className="contribution-margin-screen__empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <p className="contribution-margin-screen__empty-title">Selecciona un lote</p>
              <p className="contribution-margin-screen__empty-desc">
                Usa el buscador de arriba para encontrar un lote de producción y visualizar su análisis de margen de contribución.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
