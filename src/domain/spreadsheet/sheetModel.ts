import type { Cell, CellValue, Column, ColumnDataType, SheetState } from './types';
import { formulaEngine } from './formulaEngine';
import type { CellRef } from './formulaEngine';

export type { CellRef };

export const EMPTY: Cell = { type: 'empty', raw: '', value: null, error: null };

let columnSeq = 0;

/** Build a data/formula column for imported fields. */
export function createDataColumn(
  label: string,
  dataType: ColumnDataType = 'text',
  width = 180,
  formula: string | null = null
): Column {
  columnSeq += 1;
  return {
    id: `col-import-${columnSeq.toString(36)}-${Date.now().toString(36)}`,
    label,
    width,
    dataType: formula ? 'currency' : dataType,
    formula,
    align: formula || dataType === 'number' || dataType === 'currency' ? 'right' : 'left',
  };
}

const NUMBER_IMPORT_LABELS = new Set(['cantidad', 'precio', 'usd', 'tasa', 'stock', 'monto']);

export function importColumnDataType(label: string): ColumnDataType {
  if (NUMBER_IMPORT_LABELS.has(label.trim().toLowerCase())) return 'number';
  return 'text';
}

/** Return a label that does not collide with the given ones (Fecha -> Fecha (2)). */
export function uniqueColumnLabel(label: string, existing: string[]): string {
  const lower = (l: string) => l.trim().toLowerCase();
  if (!existing.some((l) => lower(l) === lower(label))) return label;
  let n = 2;
  let candidate = `${label} (${n})`;
  while (existing.some((l) => lower(l) === lower(candidate))) {
    n += 1;
    candidate = `${label} (${n})`;
  }
  return candidate;
}

export function columnIndex(letters: string): number {
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - COL_A + 1);
  return n - 1;
}

/**
 * Rewrite A1-style column references in a formula when `shiftCount` columns
 * are inserted at `atCol`. Handles both concrete refs (F1) and template
 * placeholders (F{r}). Function names (SUM, LOG10(...)) are left untouched.
 */
export function shiftFormulaColumnRefs(raw: string, atCol: number, shiftCount: number): string {
  if (shiftCount <= 0 || atCol < 0 || !raw) return raw;
  return raw.replace(
    /(\$?[A-Z]+)(\$?\d+|\{r\})(?!\s*\()/g,
    (match, letters: string, row: string) => {
      const index = columnIndex(letters.replace('$', ''));
      if (index < atCol) return match;
      const prefix = letters.startsWith('$') ? '$' : '';
      return `${prefix}${columnLetter(index + shiftCount)}${row}`;
    }
  );
}

export function createCell(raw: string): Cell {
  const trimmed = raw.trim();

  if (trimmed === '') return { ...EMPTY };

  if (trimmed.startsWith('=')) {
    return { type: 'formula', raw: trimmed, value: null, error: null };
  }

  const lower = trimmed.toLowerCase();
  if (lower === 'true' || lower === 'false') {
    return { type: 'boolean', raw: trimmed, value: lower === 'true', error: null };
  }

  const normalized = trimmed.replace(',', '.');
  const num = Number(normalized);
  if (normalized !== '' && Number.isFinite(num)) {
    return { type: 'number', raw: trimmed, value: num, error: null };
  }

  return { type: 'text', raw: trimmed, value: trimmed, error: null };
}

const COL_A = 'A'.charCodeAt(0);

export function columnLetter(index: number): string {
  let n = index;
  let out = '';
  while (n >= 0) {
    out = String.fromCharCode(COL_A + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  }
  return out;
}

export function expandFormulaTemplate(template: string, rowIndex: number): string {
  return template.replaceAll('{r}', String(rowIndex + 1));
}

function keyOf(ref: CellRef): string {
  return `${ref.row}:${ref.col}`;
}

function keyToRef(key: string): CellRef {
  const [row, col] = key.split(':').map(Number);
  return { row, col };
}

function valueAt(rows: Cell[][], row: number, col: number): CellValue {
  const cell = rows[row]?.[col];
  return cell?.value ?? null;
}

/** Build a row of cells aligned with the given columns. Computed columns get an expanded formula cell. */
export function createRow(columns: Column[], rowIndex: number): Cell[] {
  return columns.map((column) => {
    if (!column.formula) return { ...EMPTY };
    return {
      type: 'formula',
      raw: expandFormulaTemplate(column.formula, rowIndex),
      value: null,
      error: null,
    };
  });
}

export function createRows(columns: Column[], count: number): Cell[][] {
  return Array.from({ length: count }, (_, i) => createRow(columns, i));
}

export function createSheet(partial?: Partial<SheetState>): SheetState {
  return {
    id: `sheet-${Date.now().toString(36)}`,
    name: 'Sheet1',
    columns: [],
    rows: [],
    revision: 0,
    ...(partial ?? {}),
  };
}

function replaceCell(rows: Cell[][], row: number, col: number, cell: Cell): Cell[][] {
  return rows.map((rowCells, r) =>
    r === row ? rowCells.map((c, i) => (i === col ? cell : c)) : rowCells
  );
}

export function setCell(sheet: SheetState, row: number, col: number, raw: string): SheetState {
  if (row < 0 || col < 0 || row >= sheet.rows.length || col >= sheet.columns.length) {
    return sheet;
  }

  const cell = createCell(raw);
  const rows = replaceCell(sheet.rows, row, col, cell);
  return recompute({ ...sheet, rows, revision: sheet.revision + 1 }, [{ row, col }]);
}

/** A1-style address of a single cell. */
export function buildCellAddress(row: number, col: number): string {
  return `${columnLetter(col)}${row + 1}`;
}

/** A1:B3-style reference for a rectangle (normalizes from/to order). */
export function buildRangeRef(from: CellRef, to: CellRef): string {
  const r1 = Math.min(from.row, to.row);
  const c1 = Math.min(from.col, to.col);
  const r2 = Math.max(from.row, to.row);
  const c2 = Math.max(from.col, to.col);
  const start = buildCellAddress(r1, c1);
  if (r1 === r2 && c1 === c2) return start;
  return `${start}:${buildCellAddress(r2, c2)}`;
}

/**
 * Write `raw` into every cell of the rectangle between `from` and `to`.
 * `{r}` placeholders expand to the real row number per cell, so a single
 * formula such as `=D{r} * E{r}` can be applied to many rows at once.
 */
export function setRange(sheet: SheetState, from: CellRef, to: CellRef, raw: string): SheetState {
  const r1 = Math.max(0, Math.min(from.row, to.row));
  const c1 = Math.max(0, Math.min(from.col, to.col));
  const r2 = Math.min(sheet.rows.length - 1, Math.max(from.row, to.row));
  const c2 = Math.min(sheet.columns.length - 1, Math.max(from.col, to.col));

  if (r1 > r2 || c1 > c2) return sheet;

  const changed: CellRef[] = [];
  const rows = sheet.rows.map((rowCells, rowIndex) => {
    if (rowIndex < r1 || rowIndex > r2) return rowCells;
    return rowCells.map((cell, colIndex) => {
      if (colIndex < c1 || colIndex > c2) return cell;
      changed.push({ row: rowIndex, col: colIndex });
      return createCell(expandFormulaTemplate(raw, rowIndex));
    });
  });

  return recompute({ ...sheet, rows, revision: sheet.revision + 1 }, changed);
}

export function insertRow(sheet: SheetState, atRow?: number): SheetState {
  const at = atRow ?? sheet.rows.length;
  const rows = [...sheet.rows];
  rows.splice(at, 0, createRow(sheet.columns, at));
  return recompute({ ...sheet, rows, revision: sheet.revision + 1 }, [{ row: at, col: 0 }]);
}

export function deleteRow(sheet: SheetState, atRow: number): SheetState {
  if (atRow < 0 || atRow >= sheet.rows.length) return sheet;
  const rows = sheet.rows.filter((_, i) => i !== atRow);
  return recompute({ ...sheet, rows, revision: sheet.revision + 1 }, []);
}

const NEW_COLUMN: Omit<Column, 'id' | 'label'> = {
  width: 180,
  dataType: 'text',
  formula: null,
  align: 'left',
};

export function insertColumn(sheet: SheetState, atCol?: number, column?: Partial<Column>): SheetState {
  const at = atCol ?? sheet.columns.length;
  const full: Column = {
    id: `col-${Date.now().toString(36)}`,
    label: column?.label ?? columnLetter(at),
    ...NEW_COLUMN,
    ...(column ?? {}),
  };
  return insertColumns(sheet, at, [full]);
}

/** Insert several columns at once, shifting existing formulas to the right. */
export function insertColumns(sheet: SheetState, atCol: number, columns: Column[]): SheetState {
  if (columns.length === 0) return sheet;
  const at = Math.max(0, Math.min(atCol, sheet.columns.length));

  const shiftedColumns = sheet.columns.map((column) =>
    column.formula
      ? { ...column, formula: shiftFormulaColumnRefs(column.formula, at, columns.length) }
      : column
  );
  const allColumns = [...shiftedColumns.slice(0, at), ...columns, ...shiftedColumns.slice(at)];

  const rows = sheet.rows.map((rowCells, rowIndex) => {
    const shifted = rowCells.map((cell) =>
      cell.type === 'formula' && cell.raw
        ? { ...cell, raw: shiftFormulaColumnRefs(cell.raw, at, columns.length) }
        : cell
    );
    const cells = [...shifted];
    const placeholders: Cell[] = columns.map((column) =>
      column.formula
        ? { type: 'formula' as const, raw: expandFormulaTemplate(column.formula, rowIndex), value: null, error: null }
        : { ...EMPTY }
    );
    cells.splice(at, 0, ...placeholders);
    return cells;
  });

  return recompute({ ...sheet, columns: allColumns, rows, revision: sheet.revision + 1 }, []);
}

export function deleteColumn(sheet: SheetState, atCol: number): SheetState {
  if (atCol < 0 || atCol >= sheet.columns.length) return sheet;
  const columns = sheet.columns.filter((_, i) => i !== atCol);
  const rows = sheet.rows.map((rowCells) => rowCells.filter((_, i) => i !== atCol));
  return recompute({ ...sheet, columns, rows, revision: sheet.revision + 1 }, []);
}

export function renameSheet(sheet: SheetState, name: string): SheetState {
  return { ...sheet, name, revision: sheet.revision + 1 };
}

export function renameColumn(sheet: SheetState, atCol: number, label: string): SheetState {
  if (atCol < 0 || atCol >= sheet.columns.length) return sheet;
  const columns = sheet.columns.map((column, i) => (i === atCol ? { ...column, label } : column));
  return { ...sheet, columns, revision: sheet.revision + 1 };
}

export function clearSheet(sheet: SheetState): SheetState {
  const rows = sheet.rows.map((rowCells) => rowCells.map(() => ({ ...EMPTY })));
  const columns = sheet.columns.map((column, colIndex) => ({
    ...column,
    label: columnLetter(colIndex),
  }));
  return { ...sheet, columns, rows, revision: sheet.revision + 1 };
}

/** Replace the whole sheet (columns + rows) and recompute formulas. */
export function replaceSheet(sheet: SheetState, columns: Column[], rows: Cell[][]): SheetState {
  return recompute({ ...sheet, columns, rows, revision: sheet.revision + 1 }, []);
}

/**
 * Incremental topological recompute.
 * Starting from `changed`, recompute only the transitive closure of formula cells
 * that depend on those coordinates, in dependency order.
 */
export function recompute(sheet: SheetState, changed: CellRef[] = []): SheetState {
  const bounds = { rows: sheet.rows.length, cols: sheet.columns.length };
  const formulaCells: CellRef[] = [];
  const rawByCell = new Map<string, string>();

  for (let r = 0; r < sheet.rows.length; r++) {
    for (let c = 0; c < sheet.columns.length; c++) {
      const cell = sheet.rows[r]?.[c];
      if (cell?.type === 'formula') {
        formulaCells.push({ row: r, col: c });
        rawByCell.set(keyOf({ row: r, col: c }), cell.raw);
      }
    }
  }

  if (formulaCells.length === 0) return { ...sheet, revision: sheet.revision + 1 };

  // depKey -> formula cells that read it
  const dependents = new Map<string, CellRef[]>();

  for (const ref of formulaCells) {
    const deps = formulaEngine.getDependencies(rawByCell.get(keyOf(ref)) ?? '', ref, bounds);
    for (const dep of deps) {
      const bucket = dependents.get(keyOf(dep)) ?? [];
      bucket.push(ref);
      dependents.set(keyOf(dep), bucket);
    }
  }

  // seed = changed cells; when none specified, recompute all formula cells
  const seeds = changed.length
    ? changed.map(keyOf)
    : formulaCells.map(keyOf);

  const affected = new Set<string>();
  const stack = [...seeds];
  while (stack.length) {
    const key = stack.pop()!;
    if (affected.has(key)) continue;
    affected.add(key);
    for (const dependent of dependents.get(key) ?? []) stack.push(keyOf(dependent));
  }

  const order = topologicalOrder(formulaCells, rawByCell, bounds, affected);
  const workRows = sheet.rows.map((rowCells) => rowCells.map((cell) => ({ ...cell })));

  const formulaCtx = {
    getCellValue: (ref: CellRef) => valueAt(workRows, ref.row, ref.col),
    getRangeValue: (from: CellRef, to: CellRef) => {
      const out: CellValue[][] = [];
      for (let r = from.row; r <= to.row; r++) {
        const inner: CellValue[] = [];
        for (let c = from.col; c <= to.col; c++) {
          inner.push(valueAt(workRows, r, c));
        }
        out.push(inner);
      }
      return out;
    },
  };

  for (const ref of order) {
    const key = keyOf(ref);
    if (!affected.has(key)) continue;

    const cell = workRows[ref.row]?.[ref.col];
    if (!cell || cell.type !== 'formula') continue;

    const result = formulaEngine.evaluate(rawByCell.get(key) ?? '', ref, formulaCtx);

    if (result.ok) {
      cell.value = result.value;
      cell.error = null;
    } else {
      cell.value = null;
      cell.error = result.error;
    }
  }

  return { ...sheet, rows: workRows, revision: sheet.revision + 1 };
}

function topologicalOrder(
  formulaCells: CellRef[],
  rawByCell: Map<string, string>,
  bounds: { rows: number; cols: number },
  affected: Set<string>
): CellRef[] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const ref of formulaCells) {
    const key = keyOf(ref);
    if (affected.has(key)) inDegree.set(key, 0);
  }

  for (const ref of formulaCells) {
    const key = keyOf(ref);
    if (!affected.has(key)) continue;

    const deps = formulaEngine.getDependencies(rawByCell.get(key) ?? '', ref, bounds);
    for (const dep of deps) {
      const depKey = keyOf(dep);
      if (!affected.has(depKey)) continue;
      const bucket = adj.get(depKey) ?? [];
      bucket.push(key);
      adj.set(depKey, bucket);
      inDegree.set(key, (inDegree.get(key) ?? 0) + 1);
    }
  }

  const queue = [...inDegree.entries()].filter(([, deg]) => deg === 0).map(([k]) => k);
  const out: CellRef[] = [];

  while (queue.length) {
    const key = queue.shift()!;
    out.push(keyToRef(key));
    for (const next of adj.get(key) ?? []) {
      const deg = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, deg);
      if (deg === 0) queue.push(next);
    }
  }

  if (out.length < inDegree.size) {
    // Cycle detected — leftover cells evaluate in last-known state.
    const ordered = new Set(out.map(keyOf));
    for (const key of inDegree.keys()) {
      if (!ordered.has(key)) out.push(keyToRef(key));
    }
  }

  return out;
}