'use client';

import { useState, useCallback } from 'react';
import { startOfMonth, format } from 'date-fns';
import { useGrossProfitGlobal } from '@/src/use-cases/gross-profit/useGrossProfitGlobal';
import { useGrossProfitProduct } from '@/src/use-cases/gross-profit/useGrossProfitProduct';
import { useGrossProfitService } from '@/src/use-cases/gross-profit/useGrossProfitService';
import { useGrossProfitBatch } from '@/src/use-cases/gross-profit/useGrossProfitBatch';
import GrossProfitCard from '@/src/components/gross-profit/GrossProfitCard';
import GrossProfitWaterfall from '@/src/components/gross-profit/GrossProfitWaterfall';
import GrossProfitFilters from '@/src/components/gross-profit/GrossProfitFilters';
import GrossProfitSelector, { type GrossProfitView } from '@/src/components/gross-profit/GrossProfitSelector';
import './GrossProfitScreen.css';

interface GrossProfitScreenProps {
  companyId: string;
}

function Skeleton() {
  return (
    <div className="gross-profit-screen">
      <div className="gross-profit-screen__header">
        <div className="gross-profit-screen__skeleton" style={{ width: 200, height: 28 }} />
        <div className="gross-profit-screen__skeleton" style={{ width: 300, height: 16, marginTop: 8 }} />
      </div>
      <div className="gross-profit-screen__section">
        <div className="gross-profit-card__grid">
          {[1, 2, 3].map((i) => (
            <div key={i} className="gross-profit-screen__skeleton-card">
              <div className="gross-profit-screen__skeleton" style={{ width: 80, height: 11, marginBottom: 12 }} />
              <div className="gross-profit-screen__skeleton" style={{ width: 60, height: 13, marginBottom: 8 }} />
              <div className="gross-profit-screen__skeleton" style={{ width: 120, height: 24, marginBottom: 4 }} />
              <div className="gross-profit-screen__skeleton" style={{ width: 90, height: 18 }} />
            </div>
          ))}
        </div>
      </div>
      <div className="gross-profit-screen__section">
        <div className="gross-profit-screen__skeleton-card" style={{ height: 200 }}>
          <div className="gross-profit-screen__skeleton" style={{ width: 150, height: 13, marginBottom: 16 }} />
          <div className="gross-profit-screen__skeleton" style={{ width: '100%', height: 140 }} />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="gross-profit-screen">
      <div className="gross-profit-screen__error">
        <svg className="gross-profit-screen__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="40" height="40">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="gross-profit-screen__error-text">{message}</p>
        <button className="gross-profit-screen__error-btn" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    </div>
  );
}

const today = new Date();
const defaultStartDate = format(startOfMonth(today), 'yyyy-MM-dd');
const defaultEndDate = format(today, 'yyyy-MM-dd');

export default function GrossProfitScreen({ companyId }: GrossProfitScreenProps) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [view, setView] = useState<GrossProfitView>('global');
  const [selectedId, setSelectedId] = useState('');

  const {
    data: globalData,
    isLoading: globalLoading,
    error: globalError,
    refetch: refetchGlobal,
  } = useGrossProfitGlobal(companyId, startDate, endDate);

  const {
    data: productData,
    isLoading: productLoading,
    refetch: refetchProduct,
  } = useGrossProfitProduct(selectedId || undefined, companyId, startDate, endDate);

  const {
    data: serviceData,
    isLoading: serviceLoading,
    refetch: refetchService,
  } = useGrossProfitService(selectedId || undefined, companyId, startDate, endDate);

  const {
    data: batchData,
    isLoading: batchLoading,
    refetch: refetchBatch,
  } = useGrossProfitBatch(view === 'batch' ? selectedId || undefined : undefined, companyId);

  const handleRetry = useCallback(() => {
    refetchGlobal();
  }, [refetchGlobal]);

  const handleRangeChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  }, []);

  const handleViewChange = useCallback((nextView: GrossProfitView) => {
    setView(nextView);
    setSelectedId('');
  }, []);

  if (globalLoading) return <Skeleton />;

  if (globalError || !globalData) {
    return <ErrorState message={globalError ?? 'No se pudieron cargar los datos'} onRetry={handleRetry} />;
  }

  const isBatchView = view === 'batch';

  return (
    <div className="gross-profit-screen">
      <div className="gross-profit-screen__header">
        <h1 className="gross-profit-screen__title">Utilidad Bruta</h1>
        <p className="gross-profit-screen__subtitle">
          Análisis de ventas menos costo de bienes vendidos (COGS) por moneda.
        </p>
      </div>

      <div className={`gross-profit-screen__filters${isBatchView ? ' gross-profit-screen__filters--disabled' : ''}`}>
        <GrossProfitFilters startDate={startDate} endDate={endDate} onChange={handleRangeChange} />
        {isBatchView && (
          <span className="gross-profit-screen__filters-hint">
            Los filtros de fecha se deshabilitan al ver lotes (cada lote tiene sus propias fechas).
          </span>
        )}
      </div>

      <GrossProfitSelector
        view={view}
        onViewChange={handleViewChange}
        selectedId={selectedId}
        onSelect={setSelectedId}
        companyId={companyId}
      />

      {view === 'global' && (
        <div className="gross-profit-screen__section">
          <GrossProfitCard data={globalData} />
          <GrossProfitWaterfall data={globalData} />
        </div>
      )}

      {view === 'product' && (
        <div className="gross-profit-screen__section">
          {selectedId ? (
            productLoading ? (
              <div className="gross-profit-screen__skeleton-card" style={{ height: 120 }}>
                <div className="gross-profit-screen__skeleton" style={{ width: 180, height: 16, marginBottom: 8 }} />
                <div className="gross-profit-screen__skeleton" style={{ width: 260, height: 13 }} />
              </div>
            ) : productData ? (
              <>
                <div className="gross-profit-screen__item-header">
                  <span className="gross-profit-screen__item-label">Producto</span>
                  <span className="gross-profit-screen__item-name">{productData.itemName}</span>
                </div>
                <GrossProfitCard data={productData} />
                <GrossProfitWaterfall data={productData} />
              </>
            ) : (
              <div className="gross-profit-screen__empty">
                <div className="gross-profit-screen__empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
                <p className="gross-profit-screen__empty-title">Sin datos</p>
                <p className="gross-profit-screen__empty-desc">
                  No se encontraron datos de utilidad bruta para este producto.
                </p>
              </div>
            )
          ) : (
            <div className="gross-profit-screen__empty">
              <div className="gross-profit-screen__empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <p className="gross-profit-screen__empty-title">Selecciona un producto</p>
              <p className="gross-profit-screen__empty-desc">
                Usa el buscador de arriba para encontrar un producto y visualizar su utilidad bruta.
              </p>
            </div>
          )}
        </div>
      )}

      {view === 'service' && (
        <div className="gross-profit-screen__section">
          {selectedId ? (
            serviceLoading ? (
              <div className="gross-profit-screen__skeleton-card" style={{ height: 120 }}>
                <div className="gross-profit-screen__skeleton" style={{ width: 180, height: 16, marginBottom: 8 }} />
                <div className="gross-profit-screen__skeleton" style={{ width: 260, height: 13 }} />
              </div>
            ) : serviceData ? (
              <>
                <div className="gross-profit-screen__item-header">
                  <span className="gross-profit-screen__item-label">Servicio</span>
                  <span className="gross-profit-screen__item-name">{serviceData.itemName}</span>
                </div>
                <GrossProfitCard data={serviceData} />
                <GrossProfitWaterfall data={serviceData} />
              </>
            ) : (
              <div className="gross-profit-screen__empty">
                <div className="gross-profit-screen__empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
                <p className="gross-profit-screen__empty-title">Sin datos</p>
                <p className="gross-profit-screen__empty-desc">
                  No se encontraron datos de utilidad bruta para este servicio.
                </p>
              </div>
            )
          ) : (
            <div className="gross-profit-screen__empty">
              <div className="gross-profit-screen__empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <p className="gross-profit-screen__empty-title">Selecciona un servicio</p>
              <p className="gross-profit-screen__empty-desc">
                Usa el buscador de arriba para encontrar un servicio y visualizar su utilidad bruta.
              </p>
            </div>
          )}
        </div>
      )}

      {view === 'batch' && (
        <div className="gross-profit-screen__section">
          {selectedId ? (
            batchLoading ? (
              <div className="gross-profit-screen__skeleton-card" style={{ height: 120 }}>
                <div className="gross-profit-screen__skeleton" style={{ width: 180, height: 16, marginBottom: 8 }} />
                <div className="gross-profit-screen__skeleton" style={{ width: 260, height: 13 }} />
              </div>
            ) : batchData ? (
              <>
                <div className="gross-profit-screen__item-header">
                  <span className="gross-profit-screen__item-label">Lote de producción</span>
                  <span className="gross-profit-screen__item-name">{batchData.itemName}</span>
                  <div className="gross-profit-screen__item-meta">
                    <span className="gross-profit-screen__item-meta-tag">{batchData.batchQuantity} unidades</span>
                    <span className={`gross-profit-screen__item-meta-tag gross-profit-screen__item-meta-tag--${batchData.batchStatus.toLowerCase()}`}>
                      {batchData.batchStatus === 'OPEN' ? 'Abierto' : 'Cerrado'}
                    </span>
                  </div>
                </div>
                <GrossProfitCard data={batchData} />
                <GrossProfitWaterfall data={batchData} />
                <div className="gross-profit-screen__unit-analysis">
                  <h3 className="gross-profit-screen__unit-analysis-title">Análisis por Unidad</h3>
                  <div className="gross-profit-screen__unit-analysis-grid">
                    <div className="gross-profit-screen__unit-analysis-item">
                      <span className="gross-profit-screen__unit-analysis-label">Precio Prom. / Ud</span>
                      <span className="gross-profit-screen__unit-analysis-value">${batchData.unitAnalysis.avgUnitPrice.toFixed(2)}</span>
                    </div>
                    <div className="gross-profit-screen__unit-analysis-item">
                      <span className="gross-profit-screen__unit-analysis-label">COGS Prom. / Ud</span>
                      <span className="gross-profit-screen__unit-analysis-value">${batchData.unitAnalysis.avgUnitCogs.toFixed(2)}</span>
                    </div>
                    <div className="gross-profit-screen__unit-analysis-item">
                      <span className="gross-profit-screen__unit-analysis-label">Utilidad / Ud</span>
                      <span className={`gross-profit-screen__unit-analysis-value${batchData.unitAnalysis.unitGrossProfit < 0 ? ' gross-profit-screen__unit-analysis-value--negative' : ''}`}>
                        ${batchData.unitAnalysis.unitGrossProfit.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="gross-profit-screen__empty">
                <div className="gross-profit-screen__empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
                <p className="gross-profit-screen__empty-title">Sin datos</p>
                <p className="gross-profit-screen__empty-desc">
                  No se encontraron datos de utilidad bruta para este lote.
                </p>
              </div>
            )
          ) : (
            <div className="gross-profit-screen__empty">
              <div className="gross-profit-screen__empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <p className="gross-profit-screen__empty-title">Selecciona un lote</p>
              <p className="gross-profit-screen__empty-desc">
                Usa el buscador de arriba para encontrar un lote de producción y visualizar su utilidad bruta.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
