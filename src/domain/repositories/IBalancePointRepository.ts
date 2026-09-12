export interface BalanceFinancialsDollars {
  totalSales: number;
  totalVariableCosts: number;
  totalFixedCosts: number;
  globalMarginRatio: number;
}

export interface BalanceFinancialsBs {
  totalSalesBs: number;
  totalVariableCostsBs: number;
  totalFixedCostsBs: number;
  globalMarginRatioBs: number;
}

export interface BalanceFinancialsActual {
  dollars: BalanceFinancialsDollars;
  bs: BalanceFinancialsBs;
}

export type BalanceMarginStatus = 'negative' | 'safe' | 'at_risk';

export type BreakEvenStatus = 'no_sales' | 'negative_margin' | 'safe' | 'at_risk';

export type DataConfidence = 'insufficient' | 'estimated' | 'low' | 'medium' | 'high';

export interface BreakEven {
  salesVolumeRequired: number | null;
  salesVolumeRequiredBs: number | null;
  isEstimated: boolean;
  isSafe: boolean | null;
  isSafeUsd: boolean;
  isSafeBs: boolean;
  distanceToBreakEven: number | null;
  distanceToBreakEvenBs: number | null;
  marginStatus: BalanceMarginStatus;
  marginStatusUsd: BalanceMarginStatus;
  marginStatusBs: BalanceMarginStatus;
}

export interface BalancePeriod {
  startDate: string;
  endDate: string;
}

export interface BalancePoint {
  companyId: string;
  breakEvenStatus: BreakEvenStatus;
  dataConfidence: DataConfidence;
  transactionCount: number;
  period: BalancePeriod;
  financialsActual: BalanceFinancialsActual;
  breakEven: BreakEven;
}

export interface BreakEvenItemFinancialsDollars {
  totalSales: number;
  totalVariableCosts: number;
  totalFixedCosts: number;
  contributionMarginRatio: number;
  unitPrice: number;
  unitVariableCost: number;
  unitContributionMargin: number;
}

export interface BreakEvenItemFinancialsBs {
  totalSalesBs: number;
  totalVariableCostsBs: number;
  totalFixedCostsBs: number;
  contributionMarginRatioBs: number;
  unitPriceBs: number;
  unitVariableCostBs: number;
  unitContributionMarginBs: number;
}

export interface BreakEvenItemFinancialsActual {
  dollars: BreakEvenItemFinancialsDollars;
  bs: BreakEvenItemFinancialsBs;
}

export interface BreakEvenItem {
  salesVolumeRequired: number | null;
  salesVolumeRequiredBs: number | null;
  unitsRequired: number | null;
  unitsRequiredBs: number | null;
  isEstimated: boolean;
  isSafe: boolean | null;
  isSafeUsd: boolean;
  isSafeBs: boolean;
  distanceToBreakEven: number | null;
  distanceToBreakEvenBs: number | null;
  distanceToBreakEvenUnits: number | null;
  marginStatus: BalanceMarginStatus;
  marginStatusUsd: BalanceMarginStatus;
  marginStatusBs: BalanceMarginStatus;
}

export interface BreakEvenProduct {
  itemId: string;
  itemName: string;
  itemType: string;
  companyId: string;
  breakEvenStatus: BreakEvenStatus;
  dataConfidence: DataConfidence;
  transactionCount: number;
  period: BalancePeriod;
  financialsActual: BreakEvenItemFinancialsActual;
  breakEven: BreakEvenItem;
}

export interface BreakEvenBatch {
  batchId: string;
  itemName: string;
  batchQuantity: number;
  batchStatus: string;
  companyId: string;
  breakEvenStatus: BreakEvenStatus;
  dataConfidence: DataConfidence;
  transactionCount: number;
  period: BalancePeriod;
  financialsActual: BreakEvenItemFinancialsActual;
  breakEven: BreakEvenItem;
}

export interface BreakEvenService {
  itemId: string;
  itemName: string;
  itemType: string;
  companyId: string;
  breakEvenStatus: BreakEvenStatus;
  dataConfidence: DataConfidence;
  transactionCount: number;
  period: BalancePeriod;
  financialsActual: BreakEvenItemFinancialsActual;
  breakEven: BreakEvenItem;
}

export interface IBalancePointRepository {
  get(companyId: string, startDate: string, endDate: string): Promise<BalancePoint>;
  getProduct(itemId: string, companyId: string, startDate: string, endDate: string): Promise<BreakEvenProduct>;
  getBatch(batchId: string, companyId: string): Promise<BreakEvenBatch>;
  getService(itemId: string, companyId: string, startDate: string, endDate: string): Promise<BreakEvenService>;
}
