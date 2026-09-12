import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type { INetProfitRepository, NetProfitSummary, ProfitLossReport } from '@/src/domain/repositories/INetProfitRepository';

export class NetProfitRepositoryImpl implements INetProfitRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async get(companyId: string, startDate: string, endDate: string): Promise<NetProfitSummary> {
    const { data } = await this.api.get<NetProfitSummary>(
      `/net-profit/${companyId}/${startDate}/${endDate}`
    );
    return data;
  }

  async getStatement(companyId: string, startDate: string, endDate: string): Promise<ProfitLossReport> {
    const { data } = await this.api.get<ProfitLossReport>(
      `/net-profit/statement/${companyId}/${startDate}/${endDate}`
    );
    return data;
  }
}
