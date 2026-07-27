import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type { ICashFlowRepository, TotalCashFlow, DetailedCashFlow } from '@/src/domain/repositories/ICashFlowRepository';

export class CashFlowRepositoryImpl implements ICashFlowRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async getTotal(companyId: string): Promise<TotalCashFlow> {
    const { data } = await this.api.get<TotalCashFlow>(`/cash-flow/total-cashflow/${companyId}`);
    return data;
  }

  async getByRange(companyId: string, startDate: string, endDate: string): Promise<DetailedCashFlow> {
    const { data } = await this.api.get<DetailedCashFlow>(`/cash-flow/cashflow/${companyId}/${startDate}/${endDate}`);
    return data;
  }
}