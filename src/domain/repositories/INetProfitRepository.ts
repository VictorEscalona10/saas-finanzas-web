export interface NetProfitSummaryGrossProfit {
  netSales: number;
  netSalesBs: number;
  cogs: number;
  cogsBs: number;
  grossProfit: number;
  grossProfitBs: number;
}

export interface NetProfitSummaryExpenses {
  totalUSD: number;
  totalBs: number;
}

export interface NetProfitSummary {
  grossProfit: NetProfitSummaryGrossProfit;
  expenses: NetProfitSummaryExpenses;
  netProfitUSD: number;
  netProfitBs: number;
  netMarginRatio: number;
}

export interface ProfitLossLineItem {
  categoryId: string;
  categoryName: string;
  categoryType: string;
  totalUSD: number;
  totalBs: number;
}

export interface ProfitLossReport {
  revenue?: ProfitLossLineItem[];
  cogs?: ProfitLossLineItem[];
  operatingExpenses?: ProfitLossLineItem[];
  grossProfit?: number;
  grossProfitBs?: number;
  totalOperatingExpenses?: number;
  totalOperatingExpensesBs?: number;
  netProfit?: number;
  netProfitBs?: number;
  netMargin?: number;
}

export interface INetProfitRepository {
  get(companyId: string, startDate: string, endDate: string): Promise<NetProfitSummary>;
  getStatement(companyId: string, startDate: string, endDate: string): Promise<ProfitLossReport>;
}
