'use client';

import { formatUSD, formatBs } from '@/src/shared/utils/numberUtils';
import type { CashFlowCurrencyData } from '@/src/domain/repositories/ICashFlowRepository';
import './CashFlowSummary.css';

interface CashFlowSummaryProps {
  usd: CashFlowCurrencyData;
  bs: CashFlowCurrencyData;
}

const CARDS = [
  { key: 'current_balance' as const, label: 'Balance Actual' },
  { key: 'pending_inflow' as const, label: 'Ingresos Pendientes' },
  { key: 'pending_outflow' as const, label: 'Egresos Pendientes' },
  { key: 'net_cash_flow' as const, label: 'Flujo Neto' },
];

export default function CashFlowSummary({ usd, bs }: CashFlowSummaryProps) {
  console.log('CashFlowSummary component loaded', { usd, bs });

  return (
    <div className="cash-flow-summary__kpi-grid">
      {CARDS.map(({ key, label }) => {
        const usdValue = usd.summary[key];
        const bsValue = bs.summary[key];
        const isPositive = usdValue >= 0;

        return (
          <div
            key={key}
            className={`cash-flow-summary__kpi-card ${
              key === 'net_cash_flow'
                ? isPositive
                  ? 'cash-flow-summary__kpi-card--positive'
                  : 'cash-flow-summary__kpi-card--negative'
                : ''
            }`}
          >
            <div className="cash-flow-summary__kpi-label">{label}</div>
            <div className="cash-flow-summary__kpi-values">
              <span
                className={`cash-flow-summary__kpi-primary ${
                  key === 'net_cash_flow'
                    ? isPositive
                      ? 'cash-flow-summary__kpi-primary--positive'
                      : 'cash-flow-summary__kpi-primary--negative'
                    : ''
                }`}
              >
                {formatUSD(usdValue)}
              </span>
              <span
                className={`cash-flow-summary__kpi-secondary ${
                  key === 'net_cash_flow'
                    ? isPositive
                      ? 'cash-flow-summary__kpi-secondary--positive'
                      : 'cash-flow-summary__kpi-secondary--negative'
                    : ''
                }`}
              >
                {formatBs(bsValue)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}