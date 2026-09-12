'use client';

import { formatUSD, formatBs } from '@/src/shared/utils/numberUtils';
import type { ProfitLossReport, ProfitLossLineItem } from '@/src/domain/repositories/INetProfitRepository';
import './ProfitLossStatement.css';

interface ProfitLossStatementProps {
  data: ProfitLossReport;
  loading?: boolean;
}

function Section({ title, items, color }: { title: string; items?: ProfitLossLineItem[]; color: string }) {
  if (!items || items.length === 0) return null;

  const totalUSD = items.reduce((sum, i) => sum + i.totalUSD, 0);
  const totalBs = items.reduce((sum, i) => sum + i.totalBs, 0);

  return (
    <div className="pl-statement__section">
      <div className="pl-statement__section-header">
        <span className="pl-statement__section-title" style={{ color }}>{title}</span>
        <div className="pl-statement__section-totals">
          <span className="pl-statement__section-total">{formatUSD(totalUSD)}</span>
          <span className="pl-statement__section-total pl-statement__section-total--bs">{formatBs(totalBs)}</span>
        </div>
      </div>
      <div className="pl-statement__items">
        {items.map((item) => (
          <div key={item.categoryId} className="pl-statement__item">
            <span className="pl-statement__item-name">{item.categoryName}</span>
            <div className="pl-statement__item-values">
              <span className="pl-statement__item-usd">{formatUSD(item.totalUSD)}</span>
              <span className="pl-statement__item-bs">{formatBs(item.totalBs)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, usd, bs, accent, bold }: { label: string; usd: number; bs: number; accent?: boolean; bold?: boolean }) {
  const isNegative = usd < 0;

  return (
    <div className={`pl-statement__summary${bold ? ' pl-statement__summary--bold' : ''}`}>
      <span className="pl-statement__summary-label">{label}</span>
      <div className="pl-statement__summary-values">
        <span className={`pl-statement__summary-usd${accent ? ` pl-statement__summary-usd--${isNegative ? 'negative' : 'positive'}` : ''}`}>
          {formatUSD(usd)}
        </span>
        <span className={`pl-statement__summary-bs${accent ? ` pl-statement__summary-bs--${isNegative ? 'negative' : 'positive'}` : ''}`}>
          {formatBs(bs)}
        </span>
      </div>
    </div>
  );
}

export default function ProfitLossStatement({ data, loading = false }: ProfitLossStatementProps) {
  if (loading) {
    return (
      <div className="pl-statement__wrapper">
        <div className="pl-statement__loading">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="pl-statement__loading-row">
              <div className="pl-statement__skeleton pl-statement__skeleton--text" />
              <div className="pl-statement__skeleton pl-statement__skeleton--price" />
              <div className="pl-statement__skeleton pl-statement__skeleton--price" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pl-statement__wrapper">
      <div className="pl-statement__scroll">
        <div className="pl-statement">
          <div className="pl-statement__header">
            <span className="pl-statement__header-label">Concepto</span>
            <div className="pl-statement__header-totals">
              <span className="pl-statement__header-currency">USD</span>
              <span className="pl-statement__header-currency">Bs</span>
            </div>
          </div>

          <Section title="Ingresos" items={data.revenue ?? []} color="#00e479" />
          <Section title="Costo de Bienes Vendidos" items={data.cogs ?? []} color="#d2bbff" />
          <SummaryRow label="Utilidad Bruta" usd={data.grossProfit ?? 0} bs={data.grossProfitBs ?? 0} bold />

          <div className="pl-statement__divider" />

          <Section title="Gastos Operativos" items={data.operatingExpenses ?? []} color="#ffb4ab" />
          <SummaryRow label="Total Gastos Operativos" usd={data.totalOperatingExpenses ?? 0} bs={data.totalOperatingExpensesBs ?? 0} />

          <div className="pl-statement__divider" />

          <SummaryRow label="Utilidad Neta" usd={data.netProfit ?? 0} bs={data.netProfitBs ?? 0} accent bold />
        </div>
      </div>
    </div>
  );
}
