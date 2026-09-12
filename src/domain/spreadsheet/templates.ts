import type { Column, SheetState, TemplateId } from './types';
import { createSheet, createRows, columnLetter } from './sheetModel';

function dataColumn(label: string, dataType: Column['dataType'], width = 180): Column {
  return {
    id: `col-${label.toLowerCase()}`,
    label,
    width,
    dataType,
    formula: null,
    align: dataType === 'number' || dataType === 'currency' ? 'right' : 'left',
  };
}

function formulaColumn(label: string, template: string): Column {
  return {
    id: `col-${label.toLowerCase()}`,
    label,
    width: 180,
    dataType: 'currency',
    formula: `=${template}`,
    align: 'right',
  };
}

export function BLANK(): SheetState {
  const columns: Column[] = Array.from({ length: 6 }, (_, i) =>
    dataColumn(columnLetter(i), 'text')
  );

  return {
    ...createSheet(),
    id: 'blank',
    name: 'Hoja sin título',
    columns,
    rows: createRows(columns, 25),
  };
}

export function TRANSACTION_TEMPLATE(): SheetState {
  const columns: Column[] = [
    dataColumn('Fecha', 'text'),
    dataColumn('Categoría', 'text'),
    dataColumn('Descripción', 'text'),
    dataColumn('Cantidad', 'number'),
    dataColumn('Precio', 'number'),
    dataColumn('USD', 'number'),
    dataColumn('Tasa', 'number'),
    formulaColumn('Bs', 'F{r} * G{r}'),
    formulaColumn('Total', 'D{r} * E{r}'),
  ];

  return {
    ...createSheet(),
    id: 'transactions',
    name: 'Transacciones',
    columns,
    rows: createRows(columns, 25),
  };
}

export function ITEM_TEMPLATE(): SheetState {
  const columns: Column[] = [
    dataColumn('Nombre', 'text', 180),
    dataColumn('Tipo', 'text', 120),
    dataColumn('Precio', 'number'),
    dataColumn('Cantidad', 'number'),
    dataColumn('Tasa', 'number'),
    formulaColumn('Bs', 'C{r} * E{r}'),
  ];

  return {
    ...createSheet(),
    id: 'items',
    name: 'Items',
    columns,
    rows: createRows(columns, 25),
  };
}

export const TEMPLATES: Record<TemplateId, () => SheetState> = {
  blank: BLANK,
  transactions: TRANSACTION_TEMPLATE,
  items: ITEM_TEMPLATE,
};

export const TEMPLATE_LABELS: Record<TemplateId, string> = {
  blank: 'En blanco',
  transactions: 'Transacciones',
  items: 'Items',
};