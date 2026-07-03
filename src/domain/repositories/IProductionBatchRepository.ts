import { ProductionBatch, BatchStatus } from '@/src/domain/entities/ProductionBatch';
import { Currency, PaymentMethod, TransactionStatus } from '@/src/domain/entities/Transaction';
import { PaginatedResult } from '@/src/domain/entities/Pagination';

export interface BatchTransactionDto {
  categoryId: string;
  amount: number;
  dollarRate: number;
  quantity: number;
  paymentMethod: PaymentMethod;
  currency: Currency;
  paymentReference?: string;
  description?: string;
  status: TransactionStatus;
  paymentDate?: string;
}

export interface CreateBatchDto {
  quantity: number;
  status: BatchStatus;
  batchDate: string;
  transactions: BatchTransactionDto[];
}

export interface UpdateBatchDto {
  quantity?: number;
  status?: BatchStatus;
  batchDate?: string;
}

export interface IProductionBatchRepository {
  list(companyId: string, page?: number, limit?: number): Promise<PaginatedResult<ProductionBatch>>;
  create(companyId: string, itemId: string, data: CreateBatchDto): Promise<ProductionBatch>;
  listByProduct(companyId: string, itemId: string, page?: number, limit?: number): Promise<PaginatedResult<ProductionBatch>>;
  getById(companyId: string, batchId: string): Promise<ProductionBatch>;
  update(companyId: string, batchId: string, data: UpdateBatchDto): Promise<ProductionBatch>;
  delete(companyId: string, batchId: string): Promise<void>;
}
