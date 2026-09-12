'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatUSD, formatBs, formatPercentage } from '@/src/shared/utils/numberUtils';
import type { GrossProfitGlobal } from '@/src/domain/repositories/IGrossProfitRepository';
import './GrossProfitWaterfall.css';

interface GrossProfitWaterfallProps {
  data: GrossProfitGlobal;
}

const DONUT_COLORS = {
  sales: 'rgba(0, 228, 121, 0.8)',
  cogs: 'rgba(210, 187, 255, 0.8)',
};

type Currency = 'USD' | 'BS';

function DonutTooltip({ active, payload, isBs }: { active?: boolean; payload?: Array<{ name: string; value: number }>; isBs: boolean }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="gross-profit-waterfall__tooltip">
      <span className="gross-profit-waterfall__tooltip-label">{payload[0].name}</span>
      <div className="gross-profit-waterfall__tooltip-row">
        <span>{isBs ? formatBs(payload[0].value) : formatUSD(payload[0].value)}</span>
      </div>
    </div>
  );
}

function WaterfallTooltip({ active, payload, isBs }: { active?: boolean; payload?: Array<{ payload: { label: string; usd: number; bs: number } }>; isBs: boolean }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="gross-profit-waterfall__tooltip">
      <span className="gross-profit-waterfall__tooltip-label">{item.label}</span>
      <div className="gross-profit-waterfall__tooltip-row">
        <span className={`gross-profit-waterfall__tooltip-badge${isBs ? ' gross-profit-waterfall__tooltip-badge--bs' : ''}`}>
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

  const barColor = index === 1
    ? 'rgba(210, 187, 255, 0.7)'
    : isBs
      ? 'rgba(210, 187, 255, 0.5)'
      : 'rgba(0, 228, 121, 0.7)';

  return (
    <g>
      <rect x={x} y={y} width={width} height={Math.max(height, 0)} rx={4} fill={barColor} />
      {index < 2 && (
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

export default function GrossProfitWaterfall({ data }: GrossProfitWaterfallProps) {
  const [currency, setCurrency] = useState<Currency>('USD');
  const isBs = currency === 'BS';

  const donutData = [
    { name: 'Ventas Netas', value: isBs ? data.netSalesBs : data.netSales },
    { name: 'COGS', value: isBs ? data.cogsBs : data.cogs },
  ];

  const waterfallData = [
    {
      label: 'Ventas Netas',
      usd: data.netSales,
      bs: data.netSalesBs,
      base: 0,
      visible: isBs ? data.netSalesBs : data.netSales,
    },
    {
      label: 'COGS',
      usd: data.cogs,
      bs: data.cogsBs,
      base: isBs ? data.grossProfitBs : data.grossProfit,
      visible: isBs ? data.cogsBs : data.cogs,
    },
    {
      label: 'Utilidad Bruta',
      usd: data.grossProfit,
      bs: data.grossProfitBs,
      base: 0,
      visible: isBs ? data.grossProfitBs : data.grossProfit,
    },
  ];

  const formatValue = isBs ? formatBs : formatUSD;

  return (
    <div className="gross-profit-waterfall">
      <div className="gross-profit-waterfall__header">
        <h3 className="gross-profit-waterfall__title">Composición de Utilidad</h3>
        <div className="gross-profit-waterfall__currency-toggle">
          <button
            className={`gross-profit-waterfall__currency-btn${!isBs ? ' gross-profit-waterfall__currency-btn--active' : ''}`}
            onClick={() => setCurrency('USD')}
          >
            USD
          </button>
          <button
            className={`gross-profit-waterfall__currency-btn${isBs ? ' gross-profit-waterfall__currency-btn--active' : ''}`}
            onClick={() => setCurrency('BS')}
          >
            Bs
          </button>
        </div>
      </div>

      <div className="gross-profit-waterfall__layout">
        {/* Donut */}
        <div className="gross-profit-waterfall__donut-section">
          <span className="gross-profit-waterfall__section-label">Proporción {currency}</span>
          <div className="gross-profit-waterfall__donut-container">
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
                </Pie>
                <Tooltip content={<DonutTooltip isBs={isBs} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="gross-profit-waterfall__donut-center">
              <span className="gross-profit-waterfall__donut-center-value">
                {formatPercentage(data.grossMarginRatio * 100)}
              </span>
              <span className="gross-profit-waterfall__donut-center-label">Margen</span>
            </div>
          </div>
          <div className="gross-profit-waterfall__donut-legend">
            <div className="gross-profit-waterfall__donut-legend-item">
              <span className="gross-profit-waterfall__donut-legend-dot" style={{ background: DONUT_COLORS.sales }} />
              <span>Ventas Netas ({formatValue(isBs ? data.netSalesBs : data.netSales)})</span>
            </div>
            <div className="gross-profit-waterfall__donut-legend-item">
              <span className="gross-profit-waterfall__donut-legend-dot" style={{ background: DONUT_COLORS.cogs }} />
              <span>COGS ({formatValue(isBs ? data.cogsBs : data.cogs)})</span>
            </div>
          </div>
          <p className="gross-profit-waterfall__donut-description">
            Proporción de las ventas netas que se destina a cubrir el costo de bienes vendidos (COGS).
          </p>
        </div>

        {/* Waterfall */}
        <div className="gross-profit-waterfall__chart-section">
          <span className="gross-profit-waterfall__section-label">Flujo de Cálculo ({currency})</span>
          <div className="gross-profit-waterfall__chart">
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
