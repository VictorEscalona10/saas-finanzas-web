import { Currency } from '@/src/domain/entities/Transaction';

export interface ComplementaryAmount {
  amountUSD: number;
  amountBs: number;
}

export function calculateComplementaryAmount(
  amount: number,
  dollarRate: number,
  currency: Currency
): ComplementaryAmount {
  if (currency === 'DOLARES') {
    return {
      amountUSD: amount,
      amountBs: amount * dollarRate,
    };
  }

  return {
    amountUSD: amount / dollarRate,
    amountBs: amount,
  };
}
