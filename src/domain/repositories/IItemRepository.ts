import { Item, ItemType } from '@/src/domain/entities/Item';
import { PaginatedResult } from '@/src/domain/entities/Pagination';
import { FuzzySearchResult } from '@/src/domain/entities/FuzzySearch';

export interface CreateItemDto {
  name: string;
  type: ItemType;
  basePrice: number;
  stockCurrent?: number;
}

export interface UpdateItemDto {
  name?: string;
  type?: ItemType;
  basePrice?: number;
  stockCurrent?: number;
}

export interface IItemRepository {
  list(companyId: string, page?: number, limit?: number): Promise<PaginatedResult<Item>>;
  batchCreate(companyId: string, items: CreateItemDto[]): Promise<{ count: number }>;
  update(itemId: string, companyId: string, data: UpdateItemDto): Promise<Item>;
  delete(itemId: string, companyId: string): Promise<void>;
  getByName(name: string, companyId: string): Promise<FuzzySearchResult<Item>>;
  listProducts(companyId: string, page?: number, limit?: number): Promise<PaginatedResult<Item>>;
  listServices(companyId: string, page?: number, limit?: number): Promise<PaginatedResult<Item>>;
}
