export type CellType = 'empty' | 'text' | 'number' | 'boolean' | 'formula';

export type CellValue = string | number | boolean | null;

export interface Cell {
  type: CellType;
  raw: string;
  value: CellValue;
  error: string | null;
}

export type ColumnDataType = 'text' | 'number' | 'currency';

export interface Column {
  id: string;
  label: string;
  width: number;
  dataType: ColumnDataType;
  formula: string | null;
  align: 'left' | 'center' | 'right';
}

export interface SheetState {
  id: string;
  name: string;
  columns: Column[];
  rows: Cell[][];
  revision: number;
}

export type TemplateId = 'blank' | 'transactions' | 'items';

export type ImportMode = 'append-right' | 'append-left' | 'replace';

export interface SpreadsheetProject {
  id: string;
  name: string;
  template: TemplateId;
  createdAt: string;
  updatedAt: string;
}