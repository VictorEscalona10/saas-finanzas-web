export interface CostItem {
  id: string;
  companyId: string;
  name: string;
  basePrice: number | null;
  isRemoved: boolean;
  createdAt: string;
}
