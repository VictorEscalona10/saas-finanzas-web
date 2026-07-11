import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type { ITransactionRepository, CreateTransactionDto, UpdateTransactionDto } from '@/src/domain/repositories/ITransactionRepository';
import type { Transaction } from '@/src/domain/entities/Transaction';
import type { PaginatedResult } from '@/src/domain/entities/Pagination';

export class TransactionRepositoryImpl implements ITransactionRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async list(companyId: string, page = 1, limit = 50): Promise<PaginatedResult<Transaction>> {
    const { data } = await this.api.get<PaginatedResult<Transaction>>(`/transaction/get-all/${companyId}`, {
      params: { page, limit },
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
