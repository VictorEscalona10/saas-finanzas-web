import { ItemType } from '@/src/domain/entities/Item';
import { FlowDirection } from '@/src/domain/entities/Category';

export interface StockValidationParams {
  itemType: ItemType;
  flowDirection: FlowDirection;
  currentStock: number;
  requestedQuantity: number;
}

export interface StockValidationResult {
  valid: boolean;
  affectsStock: boolean;
  newStock: number;
  error?: string;
}

export function validateStock({
  itemType,
  flowDirection,
  currentStock,
  requestedQuantity,
}: StockValidationParams): StockValidationResult {
  if (itemType === 'SERVICE') {
    return {
      valid: true,
      affectsStock: false,
      newStock: currentStock,
    };
  }

  if (flowDirection === 'INFLOW') {
    if (currentStock < requestedQuantity) {
      return {
        valid: false,
        affectsStock: true,
        newStock: currentStock,
        error: `Stock insuficiente: disponible ${currentStock}, requerido ${requestedQuantity}`,
      };
    }

    return {
      valid: true,
      affectsStock: true,
      newStock: currentStock - requestedQuantity,
    };
  }

  return {
    valid: true,
    affectsStock: false,
    newStock: currentStock,
  };
}
