'use client';

import { useState, useMemo } from 'react';
import { formatUSD } from '@/src/shared/utils/numberUtils';
import type { ContributionTrendPoint } from '@/src/domain/repositories/IContributionMarginRepository';
import './ContributionTrendChart.css';

interface ContributionTrendChartProps {
  data: ContributionTrendPoint[];
  isLoading?: boolean;
}

type MetricKey = 'totalSales' | 'totalVariableCosts' | 'totalMargin';

interface MetricConfig {
  key: MetricKey;
  label: string;
  color: string;
  gradientId: string;
}

const METRICS: MetricConfig[] = [
  { key: 'totalSales', label: 'Ventas', color: '#00e479', gradientId: 'salesGrad' },
  { key: 'totalVariableCosts', label: 'Costos Variables', color: '#ffb4ab', gradientId: 'costsGrad' },
  { key: 'totalMargin', label: 'Margen de Contribución', color: '#d2bbff', gradientId: 'marginGrad' },
];

function getPointX(i: number, n: number, width: number, padding: number): number {
  if (n <= 1) return width / 2;
  return padding + (i * (width - padding * 2)) / (n - 1);
}

function getPointY(value: number, maxVal: number, height: number, padding: number): number {
  return padding + (1 - Math.max(value, 0) / maxVal) * (height - padding * 2);
}

function buildLinePath(
  data: ContributionTrendPoint[],
  key: MetricKey,
  width: number,
  height: number,
  padding: number,
  maxVal: number,
): string {
  const n = data.length;
  if (n === 0 || maxVal <= 0) return '';
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = getPointX(i, n, width, padding);
    const y = getPointY(data[i][key], maxVal, height, padding);
    d += `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }
  return d;
}

function buildAreaPath(
  data: ContributionTrendPoint[],
  key: MetricKey,
  width: number,
  height: number,
  padding: number,
  maxVal: number,
): string {
  const n = data.length;
  if (n === 0 || maxVal <= 0) return '';
  const baseY = height;
  let d = `M${getPointX(0, n, width, padding)},${baseY}`;
  for (let i = 0; i < n; i++) {
    const x = getPointX(i, n, width, padding);
    const y = getPointY(data[i][key], maxVal, height, padding);
    d += `L${x},${y}`;
  }
  const lastX = getPointX(n - 1, n, width, padding);
  return d + `L${lastX},${baseY}Z`;
}

function Skeleton() {
  return (
    <div className="contribution-trend">
      <div className="contribution-trend__header">
        <div className="contribution-trend__skeleton" style={{ width: 180, height: 20 }} />
        <div className="contribution-trend__skeleton" style={{ width: 240, height: 14 }} />
      </div>
      <div className="contribution-trend__filters">
        {[1, 2, 3].map((i) => (
          <div key={i} className="contribution-trend__skeleton" style={{ width: 100, height: 28, borderRadius: 9999 }} />
        ))}
      </div>
      <div className="contribution-trend__chart">
        <div className="contribution-trend__skeleton" style={{ width: '100%', height: 200 }} />
      </div>
    </div>
  );
}

export default function ContributionTrendChart({ data, isLoading }: ContributionTrendChartProps) {
  const [visibleMetrics, setVisibleMetrics] = useState<Set<MetricKey>>(
    new Set(['totalSales', 'totalVariableCosts', 'totalMargin']),
  );

  const toggleMetric = (key: MetricKey) => {
    setVisibleMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const chartWidth = 1000;
  const chartHeight = 250;
  const chartPadding = 40;

  const maxVal = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map((d) => Math.max(d.totalSales, d.totalVariableCosts, d.totalMargin, 0)), 1);
  }, [data]);

  if (isLoading) return <Skeleton />;

  const yTicks = [0, 1, 2, 3].map((i) => {
    const val = (maxVal / 4) * (3 - i);
    return formatUSD(val);
  });

  const latest = data.length > 0 ? data[data.length - 1] : null;

  const hasData = data.length > 0 && data.some((d) => d.totalSales > 0 || d.totalVariableCosts > 0 || d.totalMargin > 0);

  return (
    <div className="contribution-trend">
      <div className="contribution-trend__header">
        <div>
          <h3 className="contribution-trend__title">Vista Comparativa Histórica</h3>
          <p className="contribution-trend__subtitle">
            Ventas, costos variables y margen de contribución por período.
          </p>
        </div>
      </div>

      <div className="contribution-trend__filters">
        {METRICS.map((m) => (
          <button
            key={m.key}
            className={`contribution-trend__filter${visibleMetrics.has(m.key) ? ' contribution-trend__filter--active' : ''}`}
            style={{
              borderColor: visibleMetrics.has(m.key) ? m.color : undefined,
              color: visibleMetrics.has(m.key) ? m.color : undefined,
            }}
            onClick={() => toggleMetric(m.key)}
          >
            <span
              className="contribution-trend__filter-dot"
              style={{ background: m.color }}
            />
            {m.label}
          </button>
        ))}
      </div>

      {!hasData ? (
        <div className="contribution-trend__empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>No hay datos históricos disponibles para el período seleccionado.</p>
        </div>
      ) : (
        <>
          <div className="contribution-trend__chart">
            <svg
              className="contribution-trend__svg"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
            >
              {[0, 1, 2, 3].map((i) => (
                <line
                  key={i}
                  className="contribution-trend__grid"
                  x1="0"
                  x2={chartWidth}
                  y1={(chartHeight / 4) * i}
                  y2={(chartHeight / 4) * i}
                />
              ))}
              <defs>
                {METRICS.map((m) => (
                  <linearGradient key={m.gradientId} id={m.gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={m.color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={m.color} stopOpacity="0" />
                  </linearGradient>
                ))}
              </defs>
              {METRICS.map((m) =>
                visibleMetrics.has(m.key) ? (
                  <g key={m.key}>
                    <path
                      d={buildAreaPath(data, m.key, chartWidth, chartHeight, chartPadding, maxVal)}
                      fill={`url(#${m.gradientId})`}
                    />
                    <path
                      d={buildLinePath(data, m.key, chartWidth, chartHeight, chartPadding, maxVal)}
                      fill="none"
                      stroke={m.color}
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                    />
                    {data.map((point, i) => {
                      const x = getPointX(i, data.length, chartWidth, chartPadding);
                      const y = getPointY(point[m.key], maxVal, chartHeight, chartPadding);
                      return (
                        <circle
                          key={`${m.key}-${i}`}
                          cx={x}
                          cy={y}
                          r={data.length === 1 ? 5 : 3}
                          fill={m.color}
                        />
                      );
                    })}
                  </g>
                ) : null,
              )}
            </svg>
            <div className="contribution-trend__labels">
              <div className="contribution-trend__y-labels">
                {yTicks.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="contribution-trend__x-labels">
                {data.map((d) => (
                  <span key={d.month}>{d.month}</span>
                ))}
              </div>
            </div>
          </div>
          {latest && (
            <div className="contribution-trend__summary">
              <span className="contribution-trend__summary-label">Período actual: {latest.month}</span>
              <div className="contribution-trend__summary-values">
                {METRICS.filter((m) => visibleMetrics.has(m.key)).map((m) => (
                  <span key={m.key} className="contribution-trend__summary-item" style={{ color: m.color }}>
                    {m.label}: {formatUSD(latest[m.key])}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
