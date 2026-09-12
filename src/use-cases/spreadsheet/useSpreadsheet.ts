'use client';

import { useCallback, useReducer } from 'react';
import type { Cell, Column, ImportMode, SheetState } from '@/src/domain/spreadsheet/types';
import type { CellRef } from '@/src/domain/spreadsheet/sheetModel';
import {
  setCell as modelSetCell,
  setRange as modelSetRange,
  insertRow as modelInsertRow,
  deleteRow as modelDeleteRow,
  insertColumn as modelInsertColumn,
  deleteColumn as modelDeleteColumn,
  renameSheet as modelRenameSheet,
  renameColumn as modelRenameColumn,
  clearSheet as modelClearSheet,
  createCell,
  createDataColumn,
  createRow,
  columnLetter,
  importColumnDataType,
  insertColumns,
  replaceSheet,
  uniqueColumnLabel,
  recompute,
  EMPTY,
} from '@/src/domain/spreadsheet/sheetModel';
import { BLANK, TRANSACTION_TEMPLATE } from '@/src/domain/spreadsheet/templates';

const MAX_HISTORY = 100;

export interface SpreadsheetState {
  sheets: SheetState[];
  activeSheetId: string;
}

interface SpreadsheetHistory {
  past: SpreadsheetState[];
  present: SpreadsheetState;
  future: SpreadsheetState[];
}

export type SpreadsheetAction =
  | { type: 'setCell'; row: number; col: number; raw: string }
  | { type: 'fillRange'; from: CellRef; to: CellRef; raw: string }
  | { type: 'insertRow'; atRow?: number }
  | { type: 'deleteRow'; atRow: number }
  | { type: 'insertColumn'; atCol?: number; column?: Partial<Column> }
  | { type: 'deleteColumn'; atCol: number }
  | { type: 'renameSheet'; name: string }
  | { type: 'renameColumn'; atCol: number; label: string }
  | { type: 'clearSheet' }
  | { type: 'addSheet'; sheet?: SheetState }
  | { type: 'activateSheet'; sheetId: string }
  | { type: 'importRows'; rows: string[][]; dataColumns: number; labels?: string[]; mode: ImportMode }
  | { type: 'reset'; template?: () => SheetState }
  | { type: 'undo' }
  | { type: 'redo' };

function toSpreadsheet(sheet: SheetState): SpreadsheetState {
  return { sheets: [sheet], activeSheetId: sheet.id };
}

function pushHistory(state: SpreadsheetHistory, next: SpreadsheetState): SpreadsheetHistory {
  return {
    past: [...state.past, state.present].slice(-MAX_HISTORY),
    present: next,
    future: [],
  };
}

function applyActiveSheet(
  state: SpreadsheetHistory,
  apply: (sheet: SheetState) => SheetState
): SpreadsheetHistory {
  const present = state.present;
  const sheetIndex = present.sheets.findIndex((s) => s.id === present.activeSheetId);
  if (sheetIndex < 0) return state;

  const nextSheet = apply(present.sheets[sheetIndex]);
  if (nextSheet === present.sheets[sheetIndex]) return state;

  const next: SpreadsheetState = {
    ...present,
    sheets: present.sheets.map((sheet, i) => (i === sheetIndex ? nextSheet : sheet)),
  };
  return pushHistory(state, next);
}

function buildImportColumns(labels: string[], existingLabels: string[]): Column[] {
  const taken = [...existingLabels];
  const dataColumns = labels.map((label) => {
    const unique = uniqueColumnLabel(label, taken);
    taken.push(unique);
    return createDataColumn(unique, importColumnDataType(label));
  });

  const letterOf = (name: string): string | null => {
    const idx = labels.findIndex((l) => l.trim().toLowerCase() === name);
    return idx < 0 ? null : columnLetter(idx);
  };

  const formulaColumns: Column[] = [];

  const tasa = letterOf('tasa');
  const usd = letterOf('usd');
  if (usd && tasa) {
    formulaColumns.push(createDataColumn('Bs', 'currency', 180, `=${usd}{r} * ${tasa}{r}`));
  } else {
    const precio = letterOf('precio');
    if (precio && tasa) {
      formulaColumns.push(createDataColumn('Bs', 'currency', 180, `=${precio}{r} * ${tasa}{r}`));
    }
  }

  const cantidad = letterOf('cantidad');
  const precio = letterOf('precio');
  if (cantidad && precio) {
    formulaColumns.push(
      createDataColumn('Total', 'currency', 180, `=${cantidad}{r} * ${precio}{r}`)
    );
  }

  return [...dataColumns, ...formulaColumns];
}

function buildAppendColumns(labels: string[], existingLabels: string[]): Column[] {
  const taken = [...existingLabels];
  return labels.map((label) => {
    const unique = uniqueColumnLabel(label, taken);
    taken.push(unique);
    return createDataColumn(unique, importColumnDataType(label));
  });
}

export function spreadsheetReducer(
  state: SpreadsheetHistory,
  action: SpreadsheetAction
): SpreadsheetHistory {
  switch (action.type) {
    case 'undo': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future].slice(0, MAX_HISTORY),
      };
    }
    case 'redo': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: [...state.past, state.present].slice(-MAX_HISTORY),
        present: next,
        future: state.future.slice(1),
      };
    }
    case 'activateSheet':
      if (state.present.activeSheetId === action.sheetId) return state;
      return { ...state, present: { ...state.present, activeSheetId: action.sheetId } };
    case 'addSheet': {
      const sheet = action.sheet ?? BLANK();
      const next: SpreadsheetState = {
        sheets: [...state.present.sheets, sheet],
        activeSheetId: sheet.id,
      };
      return pushHistory(state, next);
    }
    case 'reset': {
      const sheet = action.template ? action.template() : TRANSACTION_TEMPLATE();
      return { past: [], present: toSpreadsheet(sheet), future: [] };
    }
    case 'importRows': {
      return applyActiveSheet(state, (sheet) => {
        const { rows, labels, mode } = action;
        const importLabels = labels ?? [];
        if (importLabels.length === 0 || rows.length === 0) return sheet;

        if (mode === 'replace') {
          const columns = buildImportColumns(importLabels, []);
          const nextRows: Cell[][] = rows.map((imported, rowIndex) => {
            const base = createRow(columns, rowIndex);
            return base.map((cell, colIndex) => {
              if (cell.type === 'formula') return cell;
              const raw = imported[colIndex];
              return raw === undefined ? { ...EMPTY } : createCell(raw);
            });
          });
          return replaceSheet(sheet, columns, nextRows);
        }

        const at = mode === 'append-left' ? 0 : sheet.columns.length;
        const newColumns = buildAppendColumns(
          importLabels,
          sheet.columns.map((column) => column.label)
        );
        const inserted = insertColumns(sheet, at, newColumns);

        const count = Math.max(inserted.rows.length, rows.length);
        const nextRows: Cell[][] = Array.from({ length: count }, (_, rowIndex) => {
          const base = inserted.rows[rowIndex] ?? createRow(inserted.columns, rowIndex);
          const imported = rows[rowIndex] ?? [];
          return base.map((cell, colIndex) => {
            if (colIndex < at || colIndex >= at + newColumns.length) return cell;
            const raw = imported[colIndex - at];
            return raw === undefined ? { ...EMPTY } : createCell(raw);
          });
        });

        return recompute({ ...inserted, rows: nextRows }, []);
      });
    }
    case 'setCell':
      return applyActiveSheet(state, (sheet) => modelSetCell(sheet, action.row, action.col, action.raw));
    case 'fillRange':
      return applyActiveSheet(state, (sheet) => modelSetRange(sheet, action.from, action.to, action.raw));
    case 'insertRow':
      return applyActiveSheet(state, (sheet) => modelInsertRow(sheet, action.atRow));
    case 'deleteRow':
      return applyActiveSheet(state, (sheet) => modelDeleteRow(sheet, action.atRow));
    case 'insertColumn':
      return applyActiveSheet(state, (sheet) => modelInsertColumn(sheet, action.atCol, action.column));
    case 'deleteColumn':
      return applyActiveSheet(state, (sheet) => modelDeleteColumn(sheet, action.atCol));
    case 'renameSheet':
      return applyActiveSheet(state, (sheet) => modelRenameSheet(sheet, action.name));
    case 'renameColumn':
      return applyActiveSheet(state, (sheet) => modelRenameColumn(sheet, action.atCol, action.label));
    case 'clearSheet':
      return applyActiveSheet(state, (sheet) => modelClearSheet(sheet));
    default:
      return state;
  }
}

export function useSpreadsheet(template: () => SheetState = TRANSACTION_TEMPLATE) {
  const [state, dispatch] = useReducer(
    spreadsheetReducer,
    template,
    (tpl) => ({ past: [], present: toSpreadsheet(tpl()), future: [] })
  );

  const setCell = useCallback(
    (row: number, col: number, raw: string) =>
      dispatch({ type: 'setCell', row, col, raw }),
    []
  );
  const fillRange = useCallback(
    (from: CellRef, to: CellRef, raw: string) =>
      dispatch({ type: 'fillRange', from, to, raw }),
    []
  );
  const insertRow = useCallback(
    (atRow?: number) => dispatch({ type: 'insertRow', atRow }),
    []
  );
  const deleteRow = useCallback(
    (atRow: number) => dispatch({ type: 'deleteRow', atRow }),
    []
  );
  const insertColumn = useCallback(
    (atCol?: number, column?: Partial<Column>) =>
      dispatch({ type: 'insertColumn', atCol, column }),
    []
  );
  const deleteColumn = useCallback(
    (atCol: number) => dispatch({ type: 'deleteColumn', atCol }),
    []
  );
  const renameSheet = useCallback(
    (name: string) => dispatch({ type: 'renameSheet', name }),
    []
  );
  const renameColumn = useCallback(
    (atCol: number, label: string) => dispatch({ type: 'renameColumn', atCol, label }),
    []
  );
  const clearSheet = useCallback(() => dispatch({ type: 'clearSheet' }), []);
  const addSheet = useCallback(
    (sheet?: SheetState) => dispatch({ type: 'addSheet', sheet }),
    []
  );
  const activateSheet = useCallback(
    (sheetId: string) => dispatch({ type: 'activateSheet', sheetId }),
    []
  );
  const reset = useCallback(
    (nextTemplate?: () => SheetState) =>
      dispatch({ type: 'reset', template: nextTemplate }),
    []
  );
  const undo = useCallback(() => dispatch({ type: 'undo' }), []);
  const redo = useCallback(() => dispatch({ type: 'redo' }), []);
  const importRows = useCallback(
    (rows: string[][], dataColumns: number, labels?: string[], mode: ImportMode = 'append-right') =>
      dispatch({ type: 'importRows', rows, dataColumns, labels, mode }),
    []
  );

  const { sheets, activeSheetId } = state.present;

  return {
    sheets,
    activeSheetId,
    activeSheet: sheets.find((s) => s.id === activeSheetId) ?? null,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    setCell,
    fillRange,
    insertRow,
    deleteRow,
    insertColumn,
    deleteColumn,
    renameSheet,
    renameColumn,
    clearSheet,
    addSheet,
    activateSheet,
    reset,
    undo,
    redo,
    importRows,
  };
}
