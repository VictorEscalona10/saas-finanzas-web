import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type { IDashboardRepository, DashboardResponse } from '@/src/domain/repositories/IDashboardRepository';

export class DashboardRepositoryImpl implements IDashboardRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async getDashboard(companyId: string, month?: string): Promise<DashboardResponse> {
    const params: Record<string, string> = {};
    if (month) params.month = month;
    const { data } = await this.api.get<DashboardResponse>(`/dashboard/${companyId}`, { params });
    return data;
  }
}
