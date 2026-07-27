import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type { IProductionBatchRepository, CreateBatchDto, UpdateBatchDto } from '@/src/domain/repositories/IProductionBatchRepository';
import type { ProductionBatch } from '@/src/domain/entities/ProductionBatch';
import type { PaginatedResult } from '@/src/domain/entities/Pagination';

export class ProductionBatchRepositoryImpl implements IProductionBatchRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async list(companyId: string, page = 1, limit = 50): Promise<PaginatedResult<ProductionBatch>> {
    const { data } = await this.api.get<PaginatedResult<ProductionBatch>>(`/production-batch/get-all/${companyId}`, {
      params: { page, limit },
    });
    return data;
  }

  async create(companyId: string, itemId: string, dto: CreateBatchDto): Promise<ProductionBatch> {
    const { data } = await this.api.post<ProductionBatch>(`/production-batch/create/${companyId}/${itemId}`, dto);
    return data;
  }

  async listByProduct(companyId: string, itemId: string, page = 1, limit = 50): Promise<PaginatedResult<ProductionBatch>> {
    const { data } = await this.api.get<PaginatedResult<ProductionBatch>>(`/production-batch/get-all-by-product/${companyId}/${itemId}`, {
      params: { page, limit },
    });
    return data;
  }

  async getById(companyId: string, batchId: string): Promise<ProductionBatch> {
    const { data } = await this.api.get<ProductionBatch>(`/production-batch/get-all-by-batch-id/${companyId}/${batchId}`);
    return data;
  }

  async update(companyId: string, batchId: string, dto: UpdateBatchDto): Promise<ProductionBatch> {
    const { data } = await this.api.patch<ProductionBatch>(`/production-batch/update/${companyId}/${batchId}`, dto);
    return data;
  }

  async delete(companyId: string, batchId: string): Promise<void> {
    await this.api.patch(`/production-batch/delete/${companyId}/${batchId}`);
  }
}
