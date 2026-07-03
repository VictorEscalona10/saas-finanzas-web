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
}
