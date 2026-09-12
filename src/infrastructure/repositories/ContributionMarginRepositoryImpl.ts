import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type { IContributionMarginRepository, ContributionGlobal, ContributionProduct } from '@/src/domain/repositories/IContributionMarginRepository';

interface GroupedRaw {
  date: string;
  totalSales: number;
  totalSalesBs: number;
  totalVariableCosts: number;
  totalVariableCostsBs: number;
  totalMargin: number;
  totalMarginBs: number;
  globalMarginRatio: number;
  globalMarginRatioBs: number;
}

interface GlobalResponse extends Omit<ContributionGlobal, 'grouped'> {
  grouped: GroupedRaw[];
}

export class ContributionMarginRepositoryImpl implements IContributionMarginRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async getGlobal(companyId: string, startDate: string, endDate: string): Promise<ContributionGlobal> {
    const { data } = await this.api.get<GlobalResponse>(`/contribution-margin/global/${companyId}/${startDate}/${endDate}`);
    return {
      ...data,
      grouped: (data.grouped ?? []).map((d) => ({
        month: d.date.slice(0, 10),
        totalSales: d.totalSales,
        totalVariableCosts: d.totalVariableCosts,
        totalMargin: d.totalMargin,
      })),
    };
  }

  async getProductGlobal(itemId: string, companyId: string, startDate: string, endDate: string): Promise<ContributionProduct> {
    const { data } = await this.api.get<ContributionProduct>(`/contribution-margin/product-global/${itemId}/${companyId}/${startDate}/${endDate}`);
    return data;
  }

  async getProductByBatch(batchId: string, companyId: string): Promise<ContributionProduct> {
    const { data } = await this.api.get<ContributionProduct>(`/contribution-margin/product/${batchId}/${companyId}`);
    return data;
  }

  async getService(itemId: string, companyId: string, startDate: string, endDate: string): Promise<ContributionProduct> {
    const { data } = await this.api.get<ContributionProduct>(`/contribution-margin/service/${itemId}/${companyId}/${startDate}/${endDate}`);
    return data;
  }
}
