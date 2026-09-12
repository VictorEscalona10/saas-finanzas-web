import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type { IUnitCostRepository, UnitCostResult } from '@/src/domain/repositories/IUnitCostRepository';

export class UnitCostRepositoryImpl implements IUnitCostRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async getByBatch(batchId: string, companyId: string): Promise<UnitCostResult> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await this.api.get<any>(
      `/unit-cost/batch/${batchId}/${companyId}`
    );
    return {
      itemId: data.itemId,
      itemName: data.itemName,
      totalCostUSD: data.totalCostUSD,
      totalCostBs: data.totalCostBs,
      totalQuantity: data.quantity,
      totalBatches: 1,
      weightedAvgUnitCostUSD: data.unitCostUSD,
      weightedAvgUnitCostBs: data.unitCostBs,
    };
  }

  async getByProduct(itemId: string, companyId: string): Promise<UnitCostResult> {
    const { data } = await this.api.get<UnitCostResult>(
      `/unit-cost/product/${itemId}/${companyId}`
    );
    return data;
  }

  async getByService(itemId: string, companyId: string): Promise<UnitCostResult> {
    const { data } = await this.api.get<UnitCostResult>(
      `/unit-cost/service/${itemId}/${companyId}`
    );
    return data;
  }
}
