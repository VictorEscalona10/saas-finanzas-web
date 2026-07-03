import { format, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function formatToISOShort(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatToISODateTime(date: Date): string {
  return date.toISOString();
}

export function parseISODate(value: string): Date | null {
  const date = parseISO(value);
  return isValid(date) ? date : null;
}

export function isValidISODate(value: string): boolean {
  return isValid(parseISO(value));
}

export function formatForDisplay(value: string | Date): string {
  const date = typeof value === 'string' ? parseISO(value) : value;
  if (!isValid(date)) return '';
  return format(date, 'dd MMM yyyy', { locale: es });
}

export function formatForInput(value: string | Date): string {
  const date = typeof value === 'string' ? parseISO(value) : value;
  if (!isValid(date)) return '';
  return format(date, 'yyyy-MM-dd');
}

export function formatForInputDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? parseISO(value) : value;
  if (!isValid(date)) return '';
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function todayISOShort(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
