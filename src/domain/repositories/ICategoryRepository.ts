import { Category, CategoryType, FlowDirection } from '@/src/domain/entities/Category';
import { PaginatedResult } from '@/src/domain/entities/Pagination';
import { FuzzySearchResult } from '@/src/domain/entities/FuzzySearch';

export interface CreateCategoryDto {
  name: string;
  type: CategoryType;
  flowDirection: FlowDirection;
  isVariable?: boolean;
  isCogs: boolean;
}

export interface UpdateCategoryDto {
  name: string;
  type: CategoryType;
  flowDirection: FlowDirection;
  isVariable?: boolean;
  isCogs: boolean;
}

export interface ICategoryRepository {
  list(companyId: string, page?: number, limit?: number): Promise<PaginatedResult<Category>>;
  create(companyId: string, data: CreateCategoryDto): Promise<Category>;
  update(companyId: string, categoryId: string, data: UpdateCategoryDto): Promise<Category>;
  delete(companyId: string, categoryId: string): Promise<void>;
  getByName(name: string, companyId: string): Promise<FuzzySearchResult<Category>>;
}
