export interface UnitCostResult {
  itemId: string;
  itemName: string;
  totalCostUSD: number;
  totalCostBs: number;
  totalQuantity: number;
  totalBatches: number;
  weightedAvgUnitCostUSD: number;
  weightedAvgUnitCostBs: number;
}

export interface IUnitCostRepository {
  getByBatch(batchId: string, companyId: string): Promise<UnitCostResult>;
  getByProduct(itemId: string, companyId: string): Promise<UnitCostResult>;
  getByService(itemId: string, companyId: string): Promise<UnitCostResult>;
}
