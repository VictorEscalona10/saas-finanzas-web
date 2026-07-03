export type ItemType = 'PRODUCT' | 'SERVICE';

export interface Item {
  id: string;
  companyId: string;
  name: string;
  type: ItemType;
  basePrice: number;
  stockCurrent: number;
  isRemoved: boolean;
}
