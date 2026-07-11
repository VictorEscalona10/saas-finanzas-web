import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type { IItemRepository, CreateItemDto, UpdateItemDto } from '@/src/domain/repositories/IItemRepository';
import type { Item } from '@/src/domain/entities/Item';
import type { PaginatedResult } from '@/src/domain/entities/Pagination';
import type { FuzzySearchResult } from '@/src/domain/entities/FuzzySearch';

export class ItemRepositoryImpl implements IItemRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async list(companyId: string, page = 1, limit = 50): Promise<PaginatedResult<Item>> {
    const { data } = await this.api.get<PaginatedResult<Item>>(`/item/get-all/${companyId}`, {
      params: { page, limit },
    });
    return data;
  }

  async batchCreate(companyId: string, items: CreateItemDto[]): Promise<{ count: number }> {
    const { data } = await this.api.post<{ count: number }>(`/item/create/${companyId}`, items);
    return data;
  }

  async update(itemId: string, companyId: string, data: UpdateItemDto): Promise<Item> {
    const { data: item } = await this.api.patch<Item>(`/item/update/${itemId}/${companyId}`, data);
    return item;
  }

  async delete(itemId: string, companyId: string): Promise<void> {
    await this.api.delete(`/item/delete/${itemId}/${companyId}`);
  }

  async getByName(name: string, companyId: string): Promise<FuzzySearchResult<Item>> {
    const { data } = await this.api.get<{
      success: boolean;
      dataSource: 'fuzzy' | 'prisma';
      searchTerm: string;
      count: number;
      items: Item[];
    }>(`/item/get-by-name/${encodeURIComponent(name)}/${companyId}`);

    return {
      success: data.success,
      dataSource: data.dataSource,
      searchTerm: data.searchTerm,
      count: data.count,
      items: data.items,
    };
  }

  async listProducts(companyId: string, page = 1, limit = 50): Promise<PaginatedResult<Item>> {
    const { data } = await this.api.get<PaginatedResult<Item>>(`/item/get-all-products/${companyId}`, {
      params: { page, limit },
    });
    return data;
  }

  async listServices(companyId: string, page = 1, limit = 50): Promise<PaginatedResult<Item>> {
    const { data } = await this.api.get<PaginatedResult<Item>>(`/item/get-all-services/${companyId}`, {
      params: { page, limit },
    });
    return data;
  }
}
