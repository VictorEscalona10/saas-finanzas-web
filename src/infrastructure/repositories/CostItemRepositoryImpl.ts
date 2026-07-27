import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type { ICostItemRepository } from '@/src/domain/repositories/ICostItemRepository';
import type { CostItem } from '@/src/domain/entities/CostItem';
import type { PaginatedResult } from '@/src/domain/entities/Pagination';
import type { FuzzySearchResult } from '@/src/domain/entities/FuzzySearch';

export class CostItemRepositoryImpl implements ICostItemRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async list(companyId: string, page = 1, limit = 50): Promise<PaginatedResult<CostItem>> {
    const { data } = await this.api.get<PaginatedResult<CostItem>>(`/cost-item/get-all/${companyId}`, {
      params: { page, limit },
    });
    return data;
  }

  async getByName(name: string, companyId: string): Promise<FuzzySearchResult<CostItem>> {
    const { data } = await this.api.get<FuzzySearchResult<CostItem>>(`/cost-item/search/${encodeURIComponent(name)}/${companyId}`);
    return data;
  }
}
