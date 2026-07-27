import type { Transaction } from './Transaction';

export type BatchStatus = 'OPEN' | 'CLOSED';

export interface ProductionBatch {
  id: string;
  companyId: string;
  itemId: string;
  quantity: number;
  status: BatchStatus;
  batchDate: string;
  isRemoved: boolean;
  createdAt: string;
  item?: { id: string; name: string; type: string };
  transactions?: Transaction[];
}
