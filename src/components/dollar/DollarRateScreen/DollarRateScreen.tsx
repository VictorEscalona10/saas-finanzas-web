'use client';

import { useState, useCallback } from 'react';
import { useDollarRateContext } from '@/src/shared/contexts/DollarRateContext';
import Button from '@/src/components/shared/Button';
import './DollarRateScreen.css';

function formatRate(raw: string): string {
  if (!raw) return '';
  const num = parseInt(raw, 10) / 100;
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export default function DollarRateScreen() {
  const { dollarRate, isLoading, error, source, setManualRate, resetToOfficial } = useDollarRateContext();

  const [rawRate, setRawRate] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const displayRate = formatRate(rawRate);
  const rateValue = rawRate ? parseInt(rawRate, 10) / 100 : 0;

  const handleRateChange = useCallback((value: string) => {
    setRawRate(value.replace(/\D/g, ''));
    setSuccess(false);
  }, []);

  const handleSave = useCallback(() => {
    if (rateValue <= 0) return;
    setSaving(true);
    setManualRate(rateValue);
    setRawRate('');
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    }, 300);
  }, [rateValue, setManualRate]);

  const handleReset = useCallback(async () => {
    setRawRate('');
    setSuccess(false);
    await resetToOfficial();
  }, [resetToOfficial]);

  return (
    <div className="dollar-screen">
      <div className="dollar-screen__card">
        <div className="dollar-screen__header">
          <span className="material-symbols-outlined dollar-screen__header-icon">currency_exchange</span>
          <h1 className="dollar-screen__title">Tasa del Dólar</h1>
        </div>

        <div className="dollar-screen__current">
          <span className="dollar-screen__current-label">Tasa actual</span>
          <span className="dollar-screen__current-value">
            {isLoading ? (
              <span className="dollar-screen__skeleton" />
            ) : dollarRate ? (
              <>
                {dollarRate.promedio.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="dollar-screen__current-currency"> Bs/USD</span>
              </>
            ) : (
              <span className="dollar-screen__current-error">{error ?? '—'}</span>
            )}
          </span>
          <span className={`dollar-screen__source dollar-screen__source--${source}`}>
            <span className="material-symbols-outlined dollar-screen__source-icon">
              {source === 'manual' ? 'edit_note' : 'cloud_sync'}
            </span>
            {source === 'manual' ? 'Tasa manual' : 'Tasa oficial'}
          </span>
        </div>

        <div className="dollar-screen__divider" />

        <div className="dollar-screen__form">
          <label className="dollar-screen__label" htmlFor="dollar-rate-input">
            Establecer tasa manual
          </label>
          <div className="dollar-screen__input-group">
            <span className="dollar-screen__input-prefix">Bs</span>
            <input
              id="dollar-rate-input"
              className="dollar-screen__input"
              type="text"
              inputMode="numeric"
              placeholder="0.00"
              value={displayRate}
              onChange={(e) => handleRateChange(e.target.value)}
            />
          </div>
          <p className="dollar-screen__hint">
            Solo aplica para la empresa actual. Se reemplazará automáticamente con la tasa oficial al siguiente día.
          </p>

          <div className="dollar-screen__actions">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={rateValue <= 0}
              loading={saving}
              onClick={handleSave}
            >
              Guardar Tasa
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              disabled={source === 'official'}
              onClick={handleReset}
            >
              Restablecer Oficial
            </Button>
          </div>

          {success && (
            <div className="dollar-screen__success">
              <span className="material-symbols-outlined dollar-screen__success-icon">check_circle</span>
              Tasa guardada correctamente
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
