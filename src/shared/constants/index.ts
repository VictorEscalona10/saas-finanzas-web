export const API_BASE_URL = 'http://localhost:3001';

export const PAYMENT_METHODS = {
  PAGO_MOVIL: 'Pago Móvil',
  TARJETA_DEBITO_CREDITO_PUNTO_VENTA: 'Tarjeta Débito/Crédito / Punto de Venta',
  TRANSFERENCIA_BANCARIA_NACIONAL: 'Transferencia Bancaria Nacional',
  EFECTIVO_BOLIVARES: 'Efectivo en Bolívares',
  EFECTIVO_DIVISAS: 'Efectivo en Divisas',
  TRANSFERENCIAS_INTERNACIONALES_DIRECTAS: 'Transferencias Internacionales',
  BILLETERAS_ELECTRONICAS_PROCESADORES: 'Billeteras Electrónicas / Procesadores',
  CRIPTOMONEDAS: 'Criptomonedas',
} as const;

export type PaymentMethodLabel = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const RATE_LIMITS = {
  GLOBAL: { requests: 120, windowSeconds: 60 },
  AUTH_REGISTER: { requests: 5, windowSeconds: 60 },
  COMPANY_CREATE: { requests: 10, windowSeconds: 60 },
  CATEGORY_CREATE: { requests: 30, windowSeconds: 60 },
  ITEM_CREATE: { requests: 30, windowSeconds: 60 },
  TRANSACTION_CREATE: { requests: 20, windowSeconds: 60 },
  PRODUCTION_BATCH_CREATE: { requests: 20, windowSeconds: 60 },
  FINANCE_CHAT_ASK: { requests: 30, windowSeconds: 60 },
} as const;
