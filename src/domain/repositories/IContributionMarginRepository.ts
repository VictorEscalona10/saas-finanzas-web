export interface ContributionGlobal {
  totalSales: number;
  totalSalesBs: number;
  totalVariableCosts: number;
  totalVariableCostsBs: number;
  totalMargin: number;
  totalMarginBs: number;
  globalMarginRatio: number;
  globalMarginRatioBs: number;
}

export interface UnitAnalysis {
  unitInflow: number;
  unitInflowBs: number;
  unitVariableCost: number;
  unitVariableCostBs: number;
  unitContributionMargin: number;
  unitContributionMarginBs: number;
}

export interface ProductFinancials {
  totalInflow: number;
  totalInflowBs: number;
  totalVariableCost: number;
  totalVariableCostBs: number;
  contributionMargin: number;
  contributionMarginBs: number;
  contributionMarginRatio: number;
}

export interface ContributionPeriod {
  startDate: string;
  endDate: string;
}

export interface ContributionProduct {
  itemId: string;
  itemName: string;
  itemType: string;
  totalUnitsSold: number;
  period: ContributionPeriod;
  financials: ProductFinancials;
  unitAnalysis: UnitAnalysis;
}

export interface IContributionMarginRepository {
  getGlobal(companyId: string, startDate: string, endDate: string): Promise<ContributionGlobal>;
  getProductGlobal(itemId: string, companyId: string, startDate: string, endDate: string): Promise<ContributionProduct>;
  getProductByBatch(batchId: string, companyId: string): Promise<ContributionProduct>;
  getService(itemId: string, companyId: string, startDate: string, endDate: string): Promise<ContributionProduct>;
}
