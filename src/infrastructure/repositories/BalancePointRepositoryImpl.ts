import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type {
  IBalancePointRepository,
  BalancePoint,
  BreakEvenProduct,
  BreakEvenBatch,
  BreakEvenService,
} from '@/src/domain/repositories/IBalancePointRepository';

export class BalancePointRepositoryImpl implements IBalancePointRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async get(companyId: string, startDate: string, endDate: string): Promise<BalancePoint> {
    const { data } = await this.api.get<BalancePoint>(`/balance-point/${companyId}/${startDate}/${endDate}`);
    return data;
  }

  async getProduct(itemId: string, companyId: string, startDate: string, endDate: string): Promise<BreakEvenProduct> {
    const { data } = await this.api.get<BreakEvenProduct>(
      `/balance-point/product/${itemId}/${companyId}/${startDate}/${endDate}`,
    );
    return data;
  }

  async getBatch(batchId: string, companyId: string): Promise<BreakEvenBatch> {
    const { data } = await this.api.get<BreakEvenBatch>(
      `/balance-point/batch/${batchId}/${companyId}`,
    );
    return data;
  }

  async getService(itemId: string, companyId: string, startDate: string, endDate: string): Promise<BreakEvenService> {
    const { data } = await this.api.get<BreakEvenService>(
      `/balance-point/service/${itemId}/${companyId}/${startDate}/${endDate}`,
    );
    return data;
  }
}