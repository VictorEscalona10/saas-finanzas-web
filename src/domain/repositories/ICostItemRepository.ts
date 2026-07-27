import type { CostItem } from '@/src/domain/entities/CostItem';
import type { PaginatedResult } from '@/src/domain/entities/Pagination';
import type { FuzzySearchResult } from '@/src/domain/entities/FuzzySearch';

export interface ICostItemRepository {
  list(companyId: string, page?: number, limit?: number): Promise<PaginatedResult<CostItem>>;
  getByName(name: string, companyId: string): Promise<FuzzySearchResult<CostItem>>;
}
