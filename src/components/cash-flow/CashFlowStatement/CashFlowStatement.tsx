'use client';

import { formatUSD, formatBs } from '@/src/shared/utils/numberUtils';
import type { CashFlowStatement as CashFlowStatementType, CashFlowCurrencyData } from '@/src/domain/repositories/ICashFlowRepository';
import './CashFlowStatement.css';

interface CashFlowStatementProps {
  usd: CashFlowCurrencyData;
  bs: CashFlowCurrencyData;
}

const SECTIONS: {
  key: keyof CashFlowStatementType;
  label: string;
  icon: string;
  iconClass: string;
}[] = [
  { key: 'operating', label: 'Operativo', icon: 'sync_alt', iconClass: 'cash-flow-statement__icon--operating' },
  { key: 'investing', label: 'Inversión', icon: 'trending_up', iconClass: 'cash-flow-statement__icon--investing' },
  { key: 'financing', label: 'Financiamiento', icon: 'account_balance', iconClass: 'cash-flow-statement__icon--financing' },
];

export default function CashFlowStatement({ usd, bs }: CashFlowStatementProps) {
  return (
    <div className="cash-flow-statement">
      {SECTIONS.map(({ key, label, icon, iconClass }) => {
        const usdSection = usd.cash_flow_statement[key];
        const bsSection = bs.cash_flow_statement[key];
        const isPositive = usdSection.total >= 0;

        return (
          <div key={key} className="cash-flow-statement__section">
            <div className="cash-flow-statement__header">
              <span className={`cash-flow-statement__icon ${iconClass}`}>
                <span className="material-symbols-outlined">{icon}</span>
              </span>
              <div className="cash-flow-statement__section-info">
                <div className="cash-flow-statement__section-label">{label}</div>
                <div className={`cash-flow-statement__section-total ${isPositive ? 'cash-flow-statement__section-total--positive' : 'cash-flow-statement__section-total--negative'}`}>
                  {formatUSD(usdSection.total)}
                </div>
                <div className="cash-flow-statement__total-bs">{formatBs(bsSection.total)}</div>
              </div>
            </div>

            <div className="cash-flow-statement__categories">
              {usdSection.categories.map((cat, i) => {
                const bsCat = bsSection.categories[i];
                return (
                  <div key={cat.name} className="cash-flow-statement__category">
                    <span
                      className="cash-flow-statement__dot"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="cash-flow-statement__category-name">{cat.name}</span>
                    <div className="cash-flow-statement__category-amounts">
                      <div className="cash-flow-statement__category-usd">{formatUSD(cat.amount)}</div>
                      {bsCat && (
                        <div className="cash-flow-statement__category-bs">{formatBs(bsCat.amount)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}