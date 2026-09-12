'use client';

import { formatUSD } from '@/src/shared/utils/numberUtils';
import type {
  CashFlowStatement as CashFlowStatementType,
  CashFlowCategoryTotal,
  CashFlowCurrencyData,
} from '@/src/domain/repositories/ICashFlowRepository';
import './CashFlowChart.css';

interface CashFlowChartProps {
  usd: CashFlowCurrencyData;
}

const SECTIONS: {
  key: keyof CashFlowStatementType;
  label: string;
}[] = [
  { key: 'operating', label: 'Operativo' },
  { key: 'investing', label: 'Inversión' },
  { key: 'financing', label: 'Financiamiento' },
];

const DONUT_RADIUS = 84;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
const DONUT_VIEWBOX = 200;

/* ─────────── Global Donut ─────────── */

function GlobalDonut({
  allCategories,
}: {
  allCategories: { cat: CashFlowCategoryTotal; sectionKey: string }[];
}) {
  const total = allCategories.reduce((s, c) => s + Math.abs(c.cat.amount), 0);
  if (total === 0) return <div className="cash-flow-chart__empty">Sin datos</div>;

  const segmentOffsets = allCategories.map(({ cat }) =>
    (Math.abs(cat.amount) / total) * DONUT_CIRCUMFERENCE,
  );
  const cumulativeOffsets = segmentOffsets.reduce<number[]>((acc, len) => {
    acc.push((acc.at(-1) ?? 0) + len);
    return acc;
  }, []);

  return (
    <div className="cash-flow-chart__donut-row">
      <div className="cash-flow-chart__donut-wrapper">
        <svg className="cash-flow-chart__donut" viewBox={`0 0 ${DONUT_VIEWBOX} ${DONUT_VIEWBOX}`}>
          <circle className="cash-flow-chart__donut-bg" cx={DONUT_VIEWBOX / 2} cy={DONUT_VIEWBOX / 2} r={DONUT_RADIUS} />
          {allCategories.map(({ cat }, index) => {
            const length = segmentOffsets[index];
            const offset = cumulativeOffsets[index] - length;
            const seg = (
              <circle
                key={cat.name}
                className="cash-flow-chart__donut-segment"
                cx={DONUT_VIEWBOX / 2}
                cy={DONUT_VIEWBOX / 2}
                r={DONUT_RADIUS}
                stroke={cat.color}
                strokeDasharray={`${length} ${DONUT_CIRCUMFERENCE - length}`}
                strokeDashoffset={-offset}
              />
            );
            return seg;
          })}
        </svg>
      </div>

      <div className="cash-flow-chart__legend-grid">
        {allCategories.map(({ cat, sectionKey }) => {
          const pct = total > 0 ? ((Math.abs(cat.amount) / total) * 100).toFixed(1) : '0.0';
          const sectionLabel = SECTIONS.find((s) => s.key === sectionKey)?.label ?? '';
          return (
            <div key={cat.name} className="cash-flow-chart__legend-item">
              <span className="cash-flow-chart__legend-dot" style={{ backgroundColor: cat.color }} />
              <span className="cash-flow-chart__legend-section">{sectionLabel}</span>
              <span className="cash-flow-chart__legend-name">{cat.name}</span>
              <span className="cash-flow-chart__legend-value">{formatUSD(cat.amount)}</span>
              <span className="cash-flow-chart__legend-pct">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────── Stacked Horizontal Bars ─────────── */

function StackedBars({ statement }: { statement: CashFlowStatementType }) {
  const maxTotal = Math.max(
    ...SECTIONS.map(({ key }) => Math.abs(statement[key].total || 0)),
    1,
  );

  return (
    <div className="cash-flow-chart__stacked">
      {SECTIONS.map(({ key, label }) => {
        const section = statement[key];
        const absTotal = Math.abs(section.total);
        const pctOfMax = maxTotal > 0 ? (absTotal / maxTotal) * 100 : 0;
        const isPositive = section.total >= 0;

        return (
          <div key={key} className="cash-flow-chart__stacked-row">
            <div className="cash-flow-chart__stacked-label">{label}</div>
            <div className="cash-flow-chart__stacked-bar-track" style={{ width: `${Math.max(pctOfMax, 10)}%` }}>
              {section.categories.map((cat) => {
                const segPct = absTotal > 0 ? (Math.abs(cat.amount) / absTotal) * 100 : 0;
                return (
                  <div
                    key={cat.name}
                    className="cash-flow-chart__stacked-bar-segment"
                    style={{ width: `${segPct}%`, backgroundColor: cat.color }}
                    title={`${cat.name}: ${formatUSD(cat.amount)}`}
                  />
                );
              })}
            </div>
            <div className={`cash-flow-chart__stacked-total ${isPositive ? 'cash-flow-chart__stacked-total--positive' : 'cash-flow-chart__stacked-total--negative'}`}>
              {formatUSD(section.total)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────── Main ─────────── */

export default function CashFlowChart({ usd }: CashFlowChartProps) {
  const allCategories: { cat: CashFlowCategoryTotal; sectionKey: string }[] = [];
  for (const { key } of SECTIONS) {
    for (const cat of usd.cash_flow_statement[key].categories) {
      allCategories.push({ cat, sectionKey: key });
    }
  }

  const statement = usd.cash_flow_statement;

  return (
    <div className="cash-flow-chart">
      <div>
        <h3 className="cash-flow-chart__block-title">Distribución Global</h3>
        <GlobalDonut allCategories={allCategories} />
      </div>

      <div>
        <h3 className="cash-flow-chart__block-title">Composición por Sección</h3>
        <StackedBars statement={statement} />
      </div>
    </div>
  );
}