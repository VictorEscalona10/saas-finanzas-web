import type { FlowDirection } from './Category';

export type TransactionStatus = 'PENDING' | 'COMPLETED';
export type Currency = 'BOLIVARES' | 'DOLARES';
export type StockEffect = 'INCREMENT' | 'DECREMENT' | 'NONE';

export type PaymentMethod =
  | 'PAGO_MOVIL'
  | 'TARJETA_DEBITO_CREDITO_PUNTO_VENTA'
  | 'TRANSFERENCIA_BANCARIA_NACIONAL'
  | 'EFECTIVO_BOLIVARES'
  | 'EFECTIVO_DIVISAS'
  | 'TRANSFERENCIAS_INTERNACIONALES_DIRECTAS'
  | 'BILLETERAS_ELECTRONICAS_PROCESADORES'
  | 'CRIPTOMONEDAS';

export interface Transaction {
  id: string;
  companyId: string;
  categoryId: string;
  itemId: string | null;
  batchId: string | null;
  costItemId: string | null;
  quantity: number | null;
  unitPrice: number | null;
  dollarRate: number;
  amountUSD: number;
  category: {
    name: string;
    flowDirection?: FlowDirection;
  };
  item?:{
    name: string;
  };
  costItem?:{
    name: string;
  };
  amountBs: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  currency: Currency;
  paymentReference: string | null;
  description: string | null;
  paymentDate: string | null;
  stockEffect: StockEffect | null;
  isRemoved: boolean;
  createdAt: string;
}
