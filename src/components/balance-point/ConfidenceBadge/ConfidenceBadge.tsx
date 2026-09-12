'use client';

import { useState, useRef, useEffect } from 'react';
import type { DataConfidence } from '@/src/domain/repositories/IBalancePointRepository';
import './ConfidenceBadge.css';

interface ConfidenceBadgeProps {
  confidence: DataConfidence;
  transactionCount: number;
}

const CONFIDENCE_CONFIG: Record<DataConfidence, { label: string; variant: string; description: string }> = {
  insufficient: {
    label: 'Sin datos suficientes',
    variant: 'insufficient',
    description: 'No hay transacciones registradas en este período. Los datos mostrados pueden no ser representativos.',
  },
  estimated: {
    label: 'Estimado',
    variant: 'estimated',
    description: 'Los datos se basan en precios estimados, no en ventas reales.',
  },
  low: {
    label: 'Datos limitados',
    variant: 'low',
    description: 'Pocas transacciones en el período. Los resultados pueden variar significativamente con más datos.',
  },
  medium: {
    label: 'Datos moderados',
    variant: 'medium',
    description: 'Cantidad moderada de transacciones. Los datos son razonablemente confiables.',
  },
  high: {
    label: 'Datos confiables',
    variant: 'high',
    description: 'Suficientes transacciones para un análisis confiable del punto de equilibrio.',
  },
};

export default function ConfidenceBadge({ confidence, transactionCount }: ConfidenceBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const config = CONFIDENCE_CONFIG[confidence];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="confidence-badge" ref={containerRef}>
      <button
        type="button"
        className={`confidence-badge__trigger confidence-badge__trigger--${config.variant}`}
        onClick={() => setShowTooltip(!showTooltip)}
        aria-expanded={showTooltip}
      >
        <span className="confidence-badge__dot" />
        <span className="confidence-badge__label">{config.label}</span>
        <span className="confidence-badge__count">({transactionCount} txns)</span>
        <svg className="confidence-badge__info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>
      </button>

      {showTooltip && (
        <div className="confidence-badge__tooltip">
          <div className="confidence-badge__tooltip-header">{config.label}</div>
          <p className="confidence-badge__tooltip-desc">{config.description}</p>
          <div className="confidence-badge__tooltip-meta">
            Basado en {transactionCount} transacción{transactionCount !== 1 ? 'es' : ''} en el período
          </div>
        </div>
      )}
    </div>
  );
}
