const KEY_PREFIX = 'finanza_dollar_rate_';

export interface StoredRate {
  rate: number;
  date: string;
}

function getKey(companyId: string): string {
  return `${KEY_PREFIX}${companyId}`;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function getStoredRate(companyId: string): StoredRate | null {
  try {
    const raw = localStorage.getItem(getKey(companyId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredRate;
    if (typeof parsed.rate !== 'number' || typeof parsed.date !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredRate(companyId: string, rate: number): void {
  localStorage.setItem(getKey(companyId), JSON.stringify({ rate, date: today() }));
}

export function clearStoredRate(companyId: string): void {
  localStorage.removeItem(getKey(companyId));
}

export function isFromToday(date: string): boolean {
  return date === today();
}
