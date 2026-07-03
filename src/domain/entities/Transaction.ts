export type TransactionStatus = 'PENDING' | 'COMPLETED';
export type Currency = 'BOLIVARES' | 'DOLARES';

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
  quantity: number | null;
  unitPrice: number | null;
  dollarRate: number;
  amountUSD: number;
  amountBs: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  currency: Currency;
  paymentReference: string | null;
  description: string | null;
  paymentDate: string | null;
  isRemoved: boolean;
  createdAt: string;
}
