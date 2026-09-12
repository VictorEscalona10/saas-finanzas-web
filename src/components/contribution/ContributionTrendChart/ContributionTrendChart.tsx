'use client';

import { useState, useMemo } from 'react';
import { parse, differenceInCalendarDays } from 'date-fns';
import { formatUSD } from '@/src/shared/utils/numberUtils';
import type { ContributionTrendPoint } from '@/src/domain/repositories/IContributionMarginRepository';
import './ContributionTrendChart.css';

interface ContributionTrendChartProps {
  data: ContributionTrendPoint[];
  isLoading?: boolean;
  startDate?: string;
  endDate?: string;
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

const MAX_TREND_DAYS = 365;

function detectGranularity(data: ContributionTrendPoint[]): 'daily' | 'monthly' {
  if (data.length < 2) return 'monthly';
  const d0 = parse(data[0].month, 'yyyy-MM-dd', new Date());
  const d1 = parse(data[1].month, 'yyyy-MM-dd', new Date());
  return differenceInCalendarDays(d1, d0) <= 1 ? 'daily' : 'monthly';
}

function formatLabel(month: string, granularity: 'daily' | 'monthly', forceFull?: boolean): string {
  const d = parse(month, 'yyyy-MM-dd', new Date());
  const names = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  if (granularity === 'daily' || forceFull) {
    return `${d.getDate()} ${names[d.getMonth()]} ${d.getFullYear()}`;
  }
  return `${names[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

/* ─────────── Shared helpers ─────────── */

function getPointY(value: number, maxVal: number, height: number, padding: number): number {
  return padding + (1 - Math.max(value, 0) / maxVal) * (height - padding * 2);
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

/* ─────────── Line chart (monthly) ─────────── */

function LineChart({
  data,
  visibleMetrics,
  maxVal,
  forceFullDate,
}: {
  data: ContributionTrendPoint[];
  visibleMetrics: Set<MetricKey>;
  maxVal: number;
  forceFullDate?: boolean;
}) {
  const chartWidth = 1000;
  const chartHeight = 250;
  const chartPadding = 40;
  const n = data.length;

  function getPointX(i: number): number {
    if (n <= 1) return chartWidth / 2;
    return chartPadding + (i * (chartWidth - chartPadding * 2)) / (n - 1);
  }

  function buildLinePath(key: MetricKey): string {
    if (n === 0 || maxVal <= 0) return '';
    let d = '';
    for (let i = 0; i < n; i++) {
      const x = getPointX(i);
      const y = getPointY(data[i][key], maxVal, chartHeight, chartPadding);
      d += `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }
    return d;
  }

  function buildAreaPath(key: MetricKey): string {
    if (n === 0 || maxVal <= 0) return '';
    let d = `M${getPointX(0)},${chartHeight}`;
    for (let i = 0; i < n; i++) {
      const x = getPointX(i);
      const y = getPointY(data[i][key], maxVal, chartHeight, chartPadding);
      d += `L${x},${y}`;
    }
    return d + `L${getPointX(n - 1)},${chartHeight}Z`;
  }

  const yTicks = [0, 1, 2, 3].map((i) => formatUSD((maxVal / 4) * (3 - i)));

  return (
    <>
      <div className="contribution-trend__chart">
        <svg
          className="contribution-trend__svg"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          style={{ shapeRendering: 'geometricPrecision' }}
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
                <path d={buildAreaPath(m.key)} fill={`url(#${m.gradientId})`} />
                <path
                  d={buildLinePath(m.key)}
                  fill="none"
                  stroke={m.color}
                  strokeLinejoin="round"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
                {data.map((point, i) => (
                  <circle
                    key={`${m.key}-${i}`}
                    cx={getPointX(i)}
                    cy={getPointY(point[m.key], maxVal, chartHeight, chartPadding)}
                    r={n === 1 ? 5 : 3}
                    fill={m.color}
                  />
                ))}
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
              <span key={d.month}>{formatLabel(d.month, 'monthly', forceFullDate)}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────── Bar chart (daily) ─────────── */

function BarChart({
  data,
  visibleMetrics,
  maxVal,
  forceFullDate,
}: {
  data: ContributionTrendPoint[];
  visibleMetrics: Set<MetricKey>;
  maxVal: number;
  forceFullDate?: boolean;
}) {
  const chartWidth = 1000;
  const chartHeight = 250;
  const chartPadding = 50;
  const n = data.length;
  const barGroupWidth = (chartWidth - chartPadding * 2) / n;
  const barWidth = Math.min(barGroupWidth * 0.7 / 3, 12);
  const barGap = Math.min(barGroupWidth * 0.05, 2);
  const activeMetrics = METRICS.filter((m) => visibleMetrics.has(m.key));
  const totalBarsWidth = activeMetrics.length * barWidth + (activeMetrics.length - 1) * barGap;

  const yTicks = [0, 1, 2, 3].map((i) => formatUSD((maxVal / 4) * (3 - i)));

  return (
    <div className="contribution-trend__chart">
      <svg
        className="contribution-trend__svg"
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        preserveAspectRatio="none"
        style={{ shapeRendering: 'geometricPrecision' }}
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
        {data.map((point, i) => {
          const groupX = chartPadding + i * barGroupWidth + (barGroupWidth - totalBarsWidth) / 2;
          return (
            <g key={point.month}>
              {activeMetrics.map((m, mi) => {
                const val = point[m.key];
                const barH = maxVal > 0 ? (val / maxVal) * (chartHeight - chartPadding * 2) : 0;
                const x = groupX + mi * (barWidth + barGap);
                const y = chartHeight - chartPadding - barH;
                return (
                  <rect
                    key={m.key}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    fill={m.color}
                    rx={2}
                    opacity={0.85}
                  >
                    <title>{`${m.label}: ${formatUSD(val)}`}</title>
                  </rect>
                );
              })}
            </g>
          );
        })}
      </svg>
      <div className="contribution-trend__labels">
        <div className="contribution-trend__y-labels">
          {yTicks.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="contribution-trend__x-labels">
          {data.map((d) => (
            <span key={d.month}>{formatLabel(d.month, 'daily', forceFullDate)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────── Main ─────────── */

export default function ContributionTrendChart({ data, isLoading, startDate, endDate }: ContributionTrendChartProps) {
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

  const maxVal = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.max(...data.map((d) => Math.max(d.totalSales, d.totalVariableCosts, d.totalMargin, 0)), 1);
  }, [data]);

  const granularity = useMemo(() => detectGranularity(data), [data]);
  const forceFullDate = useMemo(() => {
    if (!startDate || !endDate) return false;
    const s = parse(startDate, 'yyyy-MM-dd', new Date());
    const e = parse(endDate, 'yyyy-MM-dd', new Date());
    return differenceInCalendarDays(e, s) <= 30;
  }, [startDate, endDate]);
  const latest = data.length > 0 ? data[data.length - 1] : null;
  const hasData = data.length > 0 && data.some((d) => d.totalSales > 0 || d.totalVariableCosts > 0 || d.totalMargin > 0);

  if (isLoading) return <Skeleton />;

  return (
    <div className="contribution-trend">
      <div className="contribution-trend__header">
        <div>
          <h3 className="contribution-trend__title">Vista Comparativa Histórica</h3>
          <p className="contribution-trend__subtitle">
            {granularity === 'daily'
              ? 'Ventas, costos variables y margen de contribución por día.'
              : 'Ventas, costos variables y margen de contribución por período.'}
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
      ) : data.length > MAX_TREND_DAYS ? (
        <div className="contribution-trend__empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>El rango seleccionado excede 1 año. Seleccione un período menor para ver la tendencia.</p>
        </div>
      ) : (
        <>
          {granularity === 'daily' ? (
            <BarChart data={data} visibleMetrics={visibleMetrics} maxVal={maxVal} forceFullDate={forceFullDate} />
          ) : (
            <LineChart data={data} visibleMetrics={visibleMetrics} maxVal={maxVal} forceFullDate={forceFullDate} />
          )}

          {latest && (
            <div className="contribution-trend__summary">
              <span className="contribution-trend__summary-label">
                Período actual: {formatLabel(latest.month, granularity, forceFullDate)}
              </span>
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
