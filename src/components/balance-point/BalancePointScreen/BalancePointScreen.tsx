'use client';

import { useState, useCallback } from 'react';
import { subDays, subMonths, startOfMonth, format } from 'date-fns';
import { useBalancePoint } from '@/src/use-cases/balance-point/useBalancePoint';
import { useBalancePointProduct } from '@/src/use-cases/balance-point/useBalancePointProduct';
import { useBalancePointService } from '@/src/use-cases/balance-point/useBalancePointService';
import { useBalancePointByBatch } from '@/src/use-cases/balance-point/useBalancePointByBatch';
import BalancePointCard from '@/src/components/balance-point/BalancePointCard';
import BalancePointSelector, { type BalancePointView } from '@/src/components/balance-point/BalancePointSelector';
import BalancePointDetail from '@/src/components/balance-point/BalancePointDetail';
import { formatPeriodLabel } from '@/src/shared/utils/dateUtils';
import './BalancePointScreen.css';

interface BalancePointScreenProps {
  companyId: string;
}

function buildQuickRange(key: string, label: string, start: Date, end: Date) {
  return { key, label, start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') };
}

function getQuickRanges() {
  const end = new Date();
  return [
    buildQuickRange('month', 'Este mes', startOfMonth(end), end),
    buildQuickRange('7d', 'Últimos 7 días', subDays(end, 6), end),
    buildQuickRange('15d', 'Últimos 15 días', subDays(end, 14), end),
    buildQuickRange('30d', 'Últimos 30 días', subDays(end, 29), end),
    buildQuickRange('3m', 'Últimos 3 meses', subMonths(end, 3), end),
    buildQuickRange('6m', 'Últimos 6 meses', subMonths(end, 6), end),
  ];
}

const today = new Date();
const defaultStartDate = format(startOfMonth(today), 'yyyy-MM-dd');
const defaultEndDate = format(today, 'yyyy-MM-dd');

function Skeleton() {
  return (
    <div className="balance-point-screen">
      <div className="balance-point-screen__header">
        <div className="balance-point-screen__skeleton" style={{ width: 220, height: 28 }} />
        <div className="balance-point-screen__skeleton" style={{ width: 320, height: 16, marginTop: 8 }} />
      </div>
      <div className="balance-point-screen__section">
        <div className="balance-point-screen__skeleton" style={{ width: '100%', height: 180, borderRadius: 12 }} />
      </div>
      <div className="balance-point-screen__section">
        <div className="balance-point-screen__skeleton" style={{ width: '100%', height: 260, borderRadius: 12 }} />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="balance-point-screen">
      <div className="balance-point-screen__error">
        <svg className="balance-point-screen__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="balance-point-screen__error-text">{message}</p>
        <button className="balance-point-screen__error-btn" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    </div>
  );
}

export default function BalancePointScreen({ companyId }: BalancePointScreenProps) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [localStart, setLocalStart] = useState(defaultStartDate);
  const [localEnd, setLocalEnd] = useState(defaultEndDate);
  const [view, setView] = useState<BalancePointView>('global');
  const [selectedId, setSelectedId] = useState('');

  const ranges = getQuickRanges();
  const activeKey = ranges.find((r) => r.start === startDate && r.end === endDate)?.key;

  const {
    data: globalData,
    isLoading: globalLoading,
    error: globalError,
    refetch: refetchGlobal,
  } = useBalancePoint(companyId, startDate, endDate);

  const {
    data: productData,
    isLoading: productLoading,
    error: productError,
    refetch: refetchProduct,
  } = useBalancePointProduct(selectedId || undefined, companyId, startDate, endDate);

  const {
    data: serviceData,
    isLoading: serviceLoading,
    error: serviceError,
    refetch: refetchService,
  } = useBalancePointService(selectedId || undefined, companyId, startDate, endDate);

  const {
    data: batchData,
    isLoading: batchLoading,
    error: batchError,
    refetch: refetchBatch,
  } = useBalancePointByBatch(selectedId || undefined, companyId);

  const handleQuick = (range: { start: string; end: string }) => {
    setLocalStart(range.start);
    setLocalEnd(range.end);
    setStartDate(range.start);
    setEndDate(range.end);
  };

  const handleApply = useCallback(() => {
    if (localStart && localEnd && localStart <= localEnd) {
      setStartDate(localStart);
      setEndDate(localEnd);
    }
  }, [localStart, localEnd]);

  const handleViewChange = useCallback((nextView: BalancePointView) => {
    setView(nextView);
    setSelectedId('');
  }, []);

  if (globalLoading) return <Skeleton />;

  if (globalError || !globalData) {
    return <ErrorState message={globalError ?? 'No se pudieron cargar los datos'} onRetry={refetchGlobal} />;
  }

  return (
    <div className="balance-point-screen">
      <div className="balance-point-screen__header">
        <h1 className="balance-point-screen__title">Punto de Equilibrio</h1>
        <p className="balance-point-screen__subtitle">
          Análisis de ventas necesarias para cubrir los costos y margen de seguridad por moneda.
        </p>
      </div>

      <div className="balance-point-screen__filters">
        <div className="balance-point-screen__quick">
          {ranges.map((r) => (
            <button
              key={r.key}
              className={`balance-point-screen__quick-btn${activeKey === r.key ? ' balance-point-screen__quick-btn--active' : ''}`}
              onClick={() => handleQuick(r)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="balance-point-screen__custom">
          <div className="balance-point-screen__field">
            <label className="balance-point-screen__label">Desde</label>
            <input
              type="date"
              className="balance-point-screen__input"
              value={localStart}
              max={localEnd}
              onChange={(e) => setLocalStart(e.target.value)}
            />
          </div>

          <div className="balance-point-screen__field">
            <label className="balance-point-screen__label">Hasta</label>
            <input
              type="date"
              className="balance-point-screen__input"
              value={localEnd}
              min={localStart}
              onChange={(e) => setLocalEnd(e.target.value)}
            />
          </div>

          <button className="balance-point-screen__apply" onClick={handleApply}>
            Aplicar
          </button>
        </div>

        <p className="balance-point-screen__period" aria-live="polite">
          {formatPeriodLabel(startDate, endDate)}
        </p>
      </div>

      <BalancePointSelector
        view={view}
        onViewChange={handleViewChange}
        selectedId={selectedId}
        onSelect={setSelectedId}
        companyId={companyId}
      />

      {view === 'global' && (
        <div className="balance-point-screen__section">
          {globalData.dataConfidence === 'insufficient' ? (
            <div className="balance-point-screen__empty-state">
              <div className="balance-point-screen__empty-state-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                  <path d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="balance-point-screen__empty-state-title">Sin datos suficientes</h3>
              <p className="balance-point-screen__empty-state-desc">
                Registra ventas para ver tu punto de equilibrio. Necesitamos al menos una transacción en el período seleccionado.
              </p>
            </div>
          ) : globalData.breakEvenStatus === 'no_sales' ? (
            <div className="balance-point-screen__empty-state">
              <div className="balance-point-screen__empty-state-icon balance-point-screen__empty-state-icon--muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="balance-point-screen__empty-state-title">No hay ventas en este período</h3>
              <p className="balance-point-screen__empty-state-desc">
                No se registraron ventas entre {globalData.period.startDate} y {globalData.period.endDate}. Prueba con otro rango de fechas.
              </p>
            </div>
          ) : (
            <>
              {globalData.breakEvenStatus === 'negative_margin' && (
                <div className="balance-point-screen__alert balance-point-screen__alert--critical">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <div className="balance-point-screen__alert-content">
                    <strong>Margen negativo</strong>
                    <span>Tus costos variables superan tus ingresos. Revisa tu estructura de costos o ajusta tus precios.</span>
                  </div>
                </div>
              )}
              <BalancePointCard data={globalData} />
            </>
          )}
        </div>
      )}

      {view === 'product' && (
        <div className="balance-point-screen__section">
          {selectedId ? (
            <BalancePointDetail
              data={productData}
              loading={productLoading}
              error={productError}
              onRetry={refetchProduct}
            />
          ) : (
            <div className="balance-point-screen__empty">
              <div className="balance-point-screen__empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <p className="balance-point-screen__empty-title">Selecciona un producto</p>
              <p className="balance-point-screen__empty-desc">
                Usa el buscador de arriba para encontrar un producto y visualizar su punto de equilibrio.
              </p>
            </div>
          )}
        </div>
      )}

      {view === 'service' && (
        <div className="balance-point-screen__section">
          {selectedId ? (
            <BalancePointDetail
              data={serviceData}
              loading={serviceLoading}
              error={serviceError}
              onRetry={refetchService}
            />
          ) : (
            <div className="balance-point-screen__empty">
              <div className="balance-point-screen__empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <p className="balance-point-screen__empty-title">Selecciona un servicio</p>
              <p className="balance-point-screen__empty-desc">
                Usa el buscador de arriba para encontrar un servicio y visualizar su punto de equilibrio.
              </p>
            </div>
          )}
        </div>
      )}

      {view === 'batch' && (
        <div className="balance-point-screen__section">
          {selectedId ? (
            <BalancePointDetail
              data={batchData}
              loading={batchLoading}
              error={batchError}
              onRetry={refetchBatch}
            />
          ) : (
            <div className="balance-point-screen__empty">
              <div className="balance-point-screen__empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <p className="balance-point-screen__empty-title">Selecciona un lote</p>
              <p className="balance-point-screen__empty-desc">
                Usa el buscador de arriba para encontrar un lote de producción y visualizar su punto de equilibrio.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
