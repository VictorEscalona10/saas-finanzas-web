import { Transaction, Currency, TransactionStatus, PaymentMethod, StockEffect } from '@/src/domain/entities/Transaction';
import { PaginatedResult } from '@/src/domain/entities/Pagination';

export interface CreateTransactionDto {
  categoryId: string;
  itemId?: string;
  batchId?: string;
  costItemId?: string;
  quantity?: number;
  unitPrice?: number;
  amountUSD: number;
  amountBs: number;
  dollarRate: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  currency: Currency;
  paymentReference?: string;
  description?: string;
  paymentDate?: string;
  stockEffect?: StockEffect;
}

export interface UpdateTransactionDto {
  categoryId?: string;
  itemId?: string;
  batchId?: string;
  costItemId?: string;
  quantity?: number;
  unitPrice?: number;
  amountUSD?: number;
  amountBs?: number;
  dollarRate?: number;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  currency?: Currency;
  paymentReference?: string;
  description?: string;
  paymentDate?: string;
  stockEffect?: StockEffect;
}

export interface ITransactionRepository {
  list(companyId: string, page?: number, limit?: number): Promise<PaginatedResult<Transaction>>;
  batchCreate(companyId: string, transactions: CreateTransactionDto[]): Promise<Transaction[]>;
  getById(companyId: string, transactionId: string): Promise<Transaction>;
  update(companyId: string, transactionId: string, data: UpdateTransactionDto): Promise<Transaction>;
  delete(companyId: string, transactionId: string): Promise<void>;
  getByDateRange(companyId: string, startDate: string, endDate: string): Promise<Transaction[]>;
  getByDateCategory(companyId: string, categoryId: string): Promise<Transaction[]>;
}
