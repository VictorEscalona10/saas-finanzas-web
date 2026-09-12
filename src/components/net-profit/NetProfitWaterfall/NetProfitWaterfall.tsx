'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatUSD, formatBs } from '@/src/shared/utils/numberUtils';
import type { NetProfitSummary } from '@/src/domain/repositories/INetProfitRepository';
import './NetProfitWaterfall.css';

interface NetProfitWaterfallProps {
  data: NetProfitSummary;
}

const DONUT_COLORS = {
  sales: 'rgba(0, 228, 121, 0.8)',
  cogs: 'rgba(210, 187, 255, 0.8)',
  expenses: 'rgba(255, 180, 171, 0.8)',
};

type Currency = 'USD' | 'BS';

function DonutTooltip({ active, payload, isBs }: { active?: boolean; payload?: Array<{ name: string; value: number }>; isBs: boolean }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="net-profit-waterfall__tooltip">
      <span className="net-profit-waterfall__tooltip-label">{payload[0].name}</span>
      <div className="net-profit-waterfall__tooltip-row">
        <span>{isBs ? formatBs(payload[0].value) : formatUSD(payload[0].value)}</span>
      </div>
    </div>
  );
}

function WaterfallTooltip({ active, payload, isBs }: { active?: boolean; payload?: Array<{ payload: { label: string; usd: number; bs: number } }>; isBs: boolean }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="net-profit-waterfall__tooltip">
      <span className="net-profit-waterfall__tooltip-label">{item.label}</span>
      <div className="net-profit-waterfall__tooltip-row">
        <span className={`net-profit-waterfall__tooltip-badge${isBs ? ' net-profit-waterfall__tooltip-badge--bs' : ''}`}>
          {isBs ? 'Bs' : '$'}
        </span>
        <span>{isBs ? formatBs(item.bs) : formatUSD(item.usd)}</span>
      </div>
    </div>
  );
}

function ConnectorShape({ isBs, ...props }: Record<string, unknown> & { isBs: boolean }) {
  const { x, y, width, height, index } = props as {
    x: number; y: number; width: number; height: number; index: number;
  };

  const barColor = index === 1 || index === 3
    ? 'rgba(210, 187, 255, 0.7)'
    : index === 4
      ? isBs ? 'rgba(210, 187, 255, 0.5)' : 'rgba(0, 228, 121, 0.7)'
      : isBs
        ? 'rgba(210, 187, 255, 0.5)'
        : 'rgba(0, 228, 121, 0.7)';

  return (
    <g>
      <rect x={x} y={y} width={width} height={Math.max(height, 0)} rx={4} fill={barColor} />
      {index < 4 && (
        <line
          x1={x + width}
          y1={y}
          x2={x + width + 32}
          y2={y}
          stroke="rgba(186, 202, 195, 0.25)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      )}
    </g>
  );
}

export default function NetProfitWaterfall({ data }: NetProfitWaterfallProps) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const isBs = currency === 'BS';

  const donutData = [
    { name: 'Ventas Netas', value: isBs ? data.grossProfit.netSalesBs : data.grossProfit.netSales },
    { name: 'COGS', value: isBs ? data.grossProfit.cogsBs : data.grossProfit.cogs },
    { name: 'Gastos Operativos', value: isBs ? data.expenses.totalBs : data.expenses.totalUSD },
  ];

  const waterfallData = [
    {
      label: 'Ventas Netas',
      usd: data.grossProfit.netSales,
      bs: data.grossProfit.netSalesBs,
      base: 0,
      visible: isBs ? data.grossProfit.netSalesBs : data.grossProfit.netSales,
    },
    {
      label: 'COGS',
      usd: data.grossProfit.cogs,
      bs: data.grossProfit.cogsBs,
      base: isBs ? data.grossProfit.grossProfitBs : data.grossProfit.grossProfit,
      visible: isBs ? data.grossProfit.cogsBs : data.grossProfit.cogs,
    },
    {
      label: 'Utilidad Bruta',
      usd: data.grossProfit.grossProfit,
      bs: data.grossProfit.grossProfitBs,
      base: 0,
      visible: isBs ? data.grossProfit.grossProfitBs : data.grossProfit.grossProfit,
    },
    {
      label: 'Gastos Operativos',
      usd: data.expenses.totalUSD,
      bs: data.expenses.totalBs,
      base: isBs ? data.netProfitBs : data.netProfitUSD,
      visible: isBs ? data.expenses.totalBs : data.expenses.totalUSD,
    },
    {
      label: 'Utilidad Neta',
      usd: data.netProfitUSD,
      bs: data.netProfitBs,
      base: 0,
      visible: isBs ? data.netProfitBs : data.netProfitUSD,
    },
  ];

  const formatValue = isBs ? formatBs : formatUSD;

  return (
    <div className="net-profit-waterfall">
      <div className="net-profit-waterfall__header">
        <h3 className="net-profit-waterfall__title">Composici&oacute;n de Utilidad Neta</h3>
        <div className="net-profit-waterfall__currency-toggle">
          <button
            className={`net-profit-waterfall__currency-btn${!isBs ? ' net-profit-waterfall__currency-btn--active' : ''}`}
            onClick={() => setCurrency('USD')}
          >
            USD
          </button>
          <button
            className={`net-profit-waterfall__currency-btn${isBs ? ' net-profit-waterfall__currency-btn--active' : ''}`}
            onClick={() => setCurrency('BS')}
          >
            Bs
          </button>
        </div>
      </div>

      <div className="net-profit-waterfall__layout">
        {/* Donut */}
        <div className="net-profit-waterfall__donut-section">
          <span className="net-profit-waterfall__section-label">Proporci&oacute;n {currency}</span>
          <div className="net-profit-waterfall__donut-container">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={DONUT_COLORS.sales} />
                  <Cell fill={DONUT_COLORS.cogs} />
                  <Cell fill={DONUT_COLORS.expenses} />
                </Pie>
                <Tooltip content={<DonutTooltip isBs={isBs} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="net-profit-waterfall__donut-center">
              <span className="net-profit-waterfall__donut-center-value">
                {isBs ? formatBs(data.netProfitBs) : formatUSD(data.netProfitUSD)}
              </span>
              <span className="net-profit-waterfall__donut-center-label">Utilidad Neta</span>
            </div>
          </div>
          <div className="net-profit-waterfall__donut-legend">
            <div className="net-profit-waterfall__donut-legend-item">
              <span className="net-profit-waterfall__donut-legend-dot" style={{ background: DONUT_COLORS.sales }} />
              <span>Ventas Netas ({formatValue(isBs ? data.grossProfit.netSalesBs : data.grossProfit.netSales)})</span>
            </div>
            <div className="net-profit-waterfall__donut-legend-item">
              <span className="net-profit-waterfall__donut-legend-dot" style={{ background: DONUT_COLORS.cogs }} />
              <span>COGS ({formatValue(isBs ? data.grossProfit.cogsBs : data.grossProfit.cogs)})</span>
            </div>
            <div className="net-profit-waterfall__donut-legend-item">
              <span className="net-profit-waterfall__donut-legend-dot" style={{ background: DONUT_COLORS.expenses }} />
              <span>Gastos ({formatValue(isBs ? data.expenses.totalBs : data.expenses.totalUSD)})</span>
            </div>
          </div>
          <p className="net-profit-waterfall__donut-description">
            Distribuci&oacute;n de ingresos entre costos directos (COGS) y gastos operativos.
          </p>
        </div>

        {/* Waterfall */}
        <div className="net-profit-waterfall__chart-section">
          <span className="net-profit-waterfall__section-label">Flujo de C&aacute;lculo ({currency})</span>
          <div className="net-profit-waterfall__chart">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={waterfallData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(53, 71, 103, 0.3)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'rgba(186, 202, 195, 0.6)', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: 'rgba(53, 71, 103, 0.3)' }}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<WaterfallTooltip isBs={isBs} />} cursor={false} />
                <Bar dataKey="base" stackId="waterfall" fill="transparent" />
                <Bar dataKey="visible" stackId="waterfall" shape={<ConnectorShape isBs={isBs} />} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
