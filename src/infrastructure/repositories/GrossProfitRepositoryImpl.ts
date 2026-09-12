import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type { IGrossProfitRepository, GrossProfitGlobal, GrossProfitProduct, GrossProfitBatch } from '@/src/domain/repositories/IGrossProfitRepository';

export class GrossProfitRepositoryImpl implements IGrossProfitRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async getGlobal(companyId: string, startDate: string, endDate: string): Promise<GrossProfitGlobal> {
    const { data } = await this.api.get<GrossProfitGlobal>(
      `/gross-profit/global/${companyId}/${startDate}/${endDate}`
    );
    return data;
  }

  async getProduct(itemId: string, companyId: string, startDate: string, endDate: string): Promise<GrossProfitProduct> {
    const { data } = await this.api.get<GrossProfitProduct>(
      `/gross-profit/product/${itemId}/${companyId}/${startDate}/${endDate}`
    );
    return data;
  }

  async getService(itemId: string, companyId: string, startDate: string, endDate: string): Promise<GrossProfitProduct> {
    const { data } = await this.api.get<GrossProfitProduct>(
      `/gross-profit/service/${itemId}/${companyId}/${startDate}/${endDate}`
    );
    return data;
  }

  async getBatch(batchId: string, companyId: string): Promise<GrossProfitBatch> {
    const { data } = await this.api.get<GrossProfitBatch>(
      `/gross-profit/batch/${batchId}/${companyId}`
    );
    return data;
  }
}
