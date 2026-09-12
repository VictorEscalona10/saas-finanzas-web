'use client';

import { useCallback } from 'react';
import type { Cell, Column, SheetState } from '@/src/domain/spreadsheet/types';

function escapeCsvValue(value: string): string {
  if (/[;"\r\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function cellToCsvValue(cell: Cell, column: Column): string {
  if (cell.error) return escapeCsvValue(cell.error);
  if (cell.value === null || cell.value === undefined) return '';

  if (typeof cell.value === 'number') return String(cell.value);
  if (typeof cell.value === 'boolean') return cell.value ? 'VERDADERO' : 'FALSO';

  const raw = String(cell.value);
  if (column.dataType === 'number' || column.dataType === 'currency') {
    const numeric = Number(raw.replace(',', '.'));
    if (Number.isFinite(numeric)) return String(numeric);
  }
  return escapeCsvValue(raw);
}

export function serializeSheetToCsv(sheet: SheetState): string {
  const header = sheet.columns.map((column) => escapeCsvValue(column.label)).join(';');
  const rows = sheet.rows.map((rowCells) =>
    rowCells
      .map((cell, col) => cellToCsvValue(cell, sheet.columns[col] as Column))
      .join(';')
  );
  return [header, ...rows].join('\r\n');
}

export function sheetSafeFileName(sheet: SheetState): string {
  const base = (sheet.name || 'hoja').replace(/[\\/:*?"<>|]/g, '_').trim();
  return `${base}.csv`;
}

export function downloadSheetCsv(sheet: SheetState): void {
  if (sheet.columns.length === 0) return;

  const blob = new Blob([`\uFEFF${serializeSheetToCsv(sheet)}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = sheetSafeFileName(sheet);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function useExportCsv() {
  const exportCsv = useCallback((sheet: SheetState) => {
    downloadSheetCsv(sheet);
  }, []);

  return { exportCsv, serializeSheetToCsv, sheetSafeFileName };
}