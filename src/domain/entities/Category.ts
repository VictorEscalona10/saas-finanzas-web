export type CategoryType = 'OPERATING' | 'INVESTING' | 'FINANCING';
export type FlowDirection = 'INFLOW' | 'OUTFLOW';

export interface Category {
  id: string;
  companyId: string | null;
  name: string;
  type: CategoryType;
  flowDirection: FlowDirection;
  isCogs: boolean;
  isVariable: boolean;
  isDirectCost: boolean;
  isDefault: boolean;
  isRemoved: boolean;
}
