import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type { IContributionMarginRepository, ContributionGlobal, ContributionProduct, ContributionTrendPoint } from '@/src/domain/repositories/IContributionMarginRepository';
import { startOfMonth, endOfMonth, format, addMonths } from 'date-fns';

function generateMonthRange(startDate: string, endDate: string): string[] {
  const months: string[] = [];
  let current = startOfMonth(new Date(startDate));
  const end = endOfMonth(new Date(endDate));
  while (current <= end) {
    months.push(format(current, 'yyyy-MM'));
    current = addMonths(current, 1);
  }
  return months;
}

export class ContributionMarginRepositoryImpl implements IContributionMarginRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async getGlobal(companyId: string, startDate: string, endDate: string): Promise<ContributionGlobal> {
    const { data } = await this.api.get<ContributionGlobal>(`/contribution-margin/global/${companyId}/${startDate}/${endDate}`);
    return data;
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

  async getTrend(companyId: string, startDate: string, endDate: string): Promise<ContributionTrendPoint[]> {
    const months = generateMonthRange(startDate, endDate);
    const results = await Promise.all(
      months.map(async (month) => {
        const monthStart = `${month}-01`;
        const lastDay = format(endOfMonth(new Date(monthStart)), 'yyyy-MM-dd');
        try {
          const global = await this.getGlobal(companyId, monthStart, lastDay);
          return {
            month,
            totalSales: global.totalSales,
            totalVariableCosts: global.totalVariableCosts,
            totalMargin: global.totalMargin,
          };
        } catch {
          return {
            month,
            totalSales: 0,
            totalVariableCosts: 0,
            totalMargin: 0,
          };
        }
      }),
    );
    return results;
  }
}
