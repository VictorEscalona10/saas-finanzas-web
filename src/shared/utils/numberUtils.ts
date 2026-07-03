import Decimal from 'decimal.js';

export function parseDecimal(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return new Decimal(value).toNumber();
}

export function parseDecimalSafe(value: number | string | null | undefined): Decimal {
  if (value === null || value === undefined) return new Decimal(0);
  return new Decimal(value);
}

export function formatUSD(value: number | string): string {
  const num = typeof value === 'string' ? parseDecimal(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export function formatBs(value: number | string): string {
  const num = typeof value === 'string' ? parseDecimal(value) : value;
  return `Bs. ${new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)}`;
}

export function formatNumber(value: number | string, decimals: number = 2): string {
  const num = typeof value === 'string' ? parseDecimal(value) : value;
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatPercentage(value: number): string {
  return `${new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}%`;
}

export function multiply(a: number | string, b: number | string): number {
  return new Decimal(a).times(new Decimal(b)).toNumber();
}

export function divide(a: number | string, b: number | string): number {
  return new Decimal(a).div(new Decimal(b)).toNumber();
}

export function add(a: number | string, b: number | string): number {
  return new Decimal(a).plus(new Decimal(b)).toNumber();
}

export function subtract(a: number | string, b: number | string): number {
  return new Decimal(a).minus(new Decimal(b)).toNumber();
}
