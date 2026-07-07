import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type { ICategoryRepository, CreateCategoryDto, UpdateCategoryDto } from '@/src/domain/repositories/ICategoryRepository';
import type { Category } from '@/src/domain/entities/Category';
import type { PaginatedResult } from '@/src/domain/entities/Pagination';
import type { FuzzySearchResult } from '@/src/domain/entities/FuzzySearch';

export class CategoryRepositoryImpl implements ICategoryRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async getById(companyId: string, categoryId: string): Promise<Category> {
    const result = await this.list(companyId, 1, 1000);
    const category = result.data.find((c) => c.id === categoryId);
    if (!category) throw new Error('Categoría no encontrada');
    return category;
  }

  async list(companyId: string, page = 1, limit = 50): Promise<PaginatedResult<Category>> {
    const { data } = await this.api.get<PaginatedResult<Category>>(`/category/list/${companyId}`, {
      params: { page, limit },
    });
    return data;
  }

  async create(companyId: string, data: CreateCategoryDto): Promise<Category> {
    const { data: category } = await this.api.post<Category>(`/category/create/${companyId}`, data);
    return category;
  }

  async update(companyId: string, categoryId: string, data: UpdateCategoryDto): Promise<Category> {
    const { data: category } = await this.api.post<Category>(`/category/update/${companyId}/${categoryId}`, data);
    return category;
  }

  async delete(companyId: string, categoryId: string): Promise<void> {
    await this.api.post(`/category/delete/${companyId}/${categoryId}`);
  }

  async getByName(name: string, companyId: string): Promise<FuzzySearchResult<Category>> {
    const { data } = await this.api.get<{
      success: boolean;
      dataSource: 'fuzzy' | 'prisma';
      searchTerm: string;
      count: number;
      categories: Category[];
    }>(`/category/get-by-name/${encodeURIComponent(name)}/${companyId}`);

    return {
      success: data.success,
      dataSource: data.dataSource,
      searchTerm: data.searchTerm,
      count: data.count,
      items: data.categories,
    };
  }
}
