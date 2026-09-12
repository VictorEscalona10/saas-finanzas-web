import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type { ITransactionRepository, CreateTransactionDto, UpdateTransactionDto, TransactionListFilters } from '@/src/domain/repositories/ITransactionRepository';
import type { Transaction } from '@/src/domain/entities/Transaction';
import type { PaginatedResult } from '@/src/domain/entities/Pagination';

export class TransactionRepositoryImpl implements ITransactionRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async list(companyId: string, page = 1, limit = 50, filters?: TransactionListFilters): Promise<PaginatedResult<Transaction>> {
    const params: Record<string, string | number> = { page, limit };
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.categoryId) params.categoryId = filters.categoryId;
    if (filters?.status) params.status = filters.status;
    if (filters?.itemId) params.itemId = filters.itemId;
    const { data } = await this.api.get<PaginatedResult<Transaction>>(`/transaction/get-all/${companyId}`, {
      params,
    });
    return data;
  }

  async batchCreate(companyId: string, transactions: CreateTransactionDto[]): Promise<Transaction[]> {
    const { data } = await this.api.post<Transaction[]>(`/transaction/create/${companyId}`, transactions);
    return data;
  }

  async getById(companyId: string, transactionId: string): Promise<Transaction> {
    const { data } = await this.api.get<Transaction>(`/transaction/get-by-id/${companyId}/${transactionId}`);
    return data;
  }

  async update(companyId: string, transactionId: string, data: UpdateTransactionDto): Promise<Transaction> {
    const { data: transaction } = await this.api.patch<Transaction>(`/transaction/update/${companyId}/${transactionId}`, data);
    return transaction;
  }

  async delete(companyId: string, transactionId: string): Promise<void> {
    await this.api.delete(`/transaction/delete/${companyId}/${transactionId}`);
  }

  async getByDateRange(companyId: string, startDate: string, endDate: string): Promise<Transaction[]> {
    const { data } = await this.api.get<Transaction[]>(`/transaction/get-by-date-range/${companyId}/${startDate}/${endDate}`);
    return data;
  }

  async getByDateCategory(companyId: string, categoryId: string): Promise<Transaction[]> {
    const { data } = await this.api.get<Transaction[]>(`/transaction/get-by-date-category/${companyId}/${categoryId}`);
    return data;
  }
}
