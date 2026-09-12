export interface GrossProfitGlobal {
  netSales: number;
  netSalesBs: number;
  cogs: number;
  cogsBs: number;
  grossProfit: number;
  grossProfitBs: number;
  grossMarginRatio: number;
}

export interface GrossProfitProduct {
  itemId: string;
  itemName: string;
  netSales: number;
  netSalesBs: number;
  cogs: number;
  cogsBs: number;
  grossProfit: number;
  grossProfitBs: number;
  grossMarginRatio: number;
}

export interface GrossProfitBatch {
  batchId: string;
  itemName: string;
  batchQuantity: number;
  batchStatus: string;
  netSales: number;
  netSalesBs: number;
  cogs: number;
  cogsBs: number;
  grossProfit: number;
  grossProfitBs: number;
  grossMarginRatio: number;
  unitAnalysis: {
    avgUnitPrice: number;
    avgUnitCogs: number;
    unitGrossProfit: number;
  };
}

export interface IGrossProfitRepository {
  getGlobal(companyId: string, startDate: string, endDate: string): Promise<GrossProfitGlobal>;
  getProduct(itemId: string, companyId: string, startDate: string, endDate: string): Promise<GrossProfitProduct>;
  getService(itemId: string, companyId: string, startDate: string, endDate: string): Promise<GrossProfitProduct>;
  getBatch(batchId: string, companyId: string): Promise<GrossProfitBatch>;
}
