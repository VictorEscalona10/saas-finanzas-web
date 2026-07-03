export interface BalanceFinancialsCurrency {
  totalSales: number;
  totalVariableCosts: number;
  totalFixedCosts: number;
  globalMarginRatio: number;
}

export interface BalanceFinancialsActual {
  dollars: BalanceFinancialsCurrency;
  bs: BalanceFinancialsCurrency;
}

export interface BreakEven {
  salesVolumeRequired: number;
  salesVolumeRequiredBs: number;
  isSafe: boolean;
  distanceToBreakEven: number;
  distanceToBreakEvenBs: number;
}

export interface BalancePeriod {
  startDate: string;
  endDate: string;
}

export interface BalancePoint {
  companyId: string;
  period: BalancePeriod;
  financialsActual: BalanceFinancialsActual;
  breakEven: BreakEven;
}

export interface IBalancePointRepository {
  get(companyId: string, startDate: string, endDate: string): Promise<BalancePoint>;
}
