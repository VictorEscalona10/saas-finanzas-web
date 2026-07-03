export interface CashFlowCategoryTotal {
  name: string;
  amount: number;
  color: string;
}

export interface CashFlowStatementItem {
  total: number;
  categories: CashFlowCategoryTotal[];
}

export interface CashFlowStatement {
  operating: CashFlowStatementItem;
  investing: CashFlowStatementItem;
  financing: CashFlowStatementItem;
}

export interface CashFlowSummary {
  current_balance: number;
  pending_inflow: number;
  pending_outflow: number;
  net_cash_flow: number;
}

export interface CashFlowCurrencyData {
  summary: CashFlowSummary;
  cash_flow_statement: CashFlowStatement;
}

export interface TotalCashFlow {
  companyId: string;
  usd: CashFlowCurrencyData;
  bs: CashFlowCurrencyData;
  period: {
    start_date: string | null;
    end_date: string;
  };
}

export interface CashFlowPeriod {
  startDate: string;
  endDate: string;
}

export interface DetailedCashFlow {
  period: CashFlowPeriod;
  usd: CashFlowCurrencyData;
  bs: CashFlowCurrencyData;
  transactionCount: number;
  records: unknown[];
}

export interface ICashFlowRepository {
  getTotal(companyId: string): Promise<TotalCashFlow>;
  getByRange(companyId: string, startDate: string, endDate: string): Promise<DetailedCashFlow>;
}
