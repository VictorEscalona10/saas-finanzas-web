import FormulaParser, { DepParser, FormulaError } from 'fast-formula-parser';
import Decimal from 'decimal.js';
import type { CellValue } from './types';

export interface CellRef {
  row: number;
  col: number;
}

export interface FormulaCtx {
  getCellValue(ref: CellRef): CellValue;
  getRangeValue(from: CellRef, to: CellRef): CellValue[][];
}

export interface EvalResult {
  ok: boolean;
  value: CellValue | null;
  error: string | null;
}

export interface FormulaBounds {
  rows: number;
  cols: number;
}

function roundNumber(value: number): number {
  return new Decimal(value).toDecimalPlaces(10).toNumber();
}

function normalizeResult(result: unknown): CellValue | null {
  if (typeof result === 'number') return roundNumber(result);
  if (typeof result === 'string' || typeof result === 'boolean') return result;
  return null;
}

function toErrorString(err: unknown): string {
  if (err instanceof Error && err.name) return err.name;
  return '#ERROR!';
}

function stripLeadingEquals(formula: string): string {
  const trimmed = formula.trim();
  return trimmed.startsWith('=') ? trimmed.slice(1) : trimmed;
}

export class FormulaEngine {
  private ctx: FormulaCtx | null = null;
  private readonly parser: FormulaParser;

  constructor() {
    this.parser = new FormulaParser({
      onCell: (ref: { row: number; col: number }) => {
        if (!this.ctx || ref.row < 1 || ref.col < 1) return null;
        return this.ctx.getCellValue({ row: ref.row - 1, col: ref.col - 1 });
      },
      onRange: (ref: {
        from: { row: number; col: number };
        to: { row: number; col: number };
      }) => {
        if (!this.ctx) return [];
        const from = { row: ref.from.row - 1, col: ref.from.col - 1 };
        const to = { row: ref.to.row - 1, col: ref.to.col - 1 };
        return this.ctx.getRangeValue(from, to);
      },
    });
  }

  evaluate(formula: string, position: CellRef, ctx: FormulaCtx): EvalResult {
    const input = stripLeadingEquals(formula);
    const pos = { row: position.row + 1, col: position.col + 1, sheet: 'Sheet1' };
    this.ctx = ctx;

    try {
      const result = this.parser.parse(input, pos);
      if (result instanceof FormulaError) {
        return { ok: false, value: null, error: result.error };
      }
      if (Array.isArray(result)) {
        const first = result[0]?.[0];
        return { ok: true, value: normalizeResult(first), error: null };
      }
      return { ok: true, value: normalizeResult(result), error: null };
    } catch (err) {
      return { ok: false, value: null, error: toErrorString(err) };
    }
  }

  getDependencies(formula: string, position: CellRef, bounds: FormulaBounds): CellRef[] {
    const input = stripLeadingEquals(formula);
    const pos = { row: position.row + 1, col: position.col + 1, sheet: 'Sheet1' };
    const depParser = new DepParser();
    const seen = new Set<string>();
    const deps: CellRef[] = [];

    const pushCell = (row0: number, col0: number) => {
      if (row0 < 0 || col0 < 0 || row0 >= bounds.rows || col0 >= bounds.cols) return;
      const key = `${row0}:${col0}`;
      if (seen.has(key)) return;
      seen.add(key);
      deps.push({ row: row0, col: col0 });
    };

    try {
      const refs = depParser.parse(input, pos);
      for (const ref of refs) {
        if (ref.from && ref.to) {
          const fromRow = Math.max(0, ref.from.row - 1);
          const fromCol = Math.max(0, ref.from.col - 1);
          const toRow = Math.min(bounds.rows - 1, ref.to.row - 1);
          const toCol = Math.min(bounds.cols - 1, ref.to.col - 1);
          for (let r = fromRow; r <= toRow; r++) {
            for (let c = fromCol; c <= toCol; c++) {
              pushCell(r, c);
            }
          }
        } else {
          pushCell(ref.row - 1, ref.col - 1);
        }
      }
    } catch {
      // Malformed formulas report no dependencies; evaluation surfaces the error.
    }

    return deps;
  }
}

export const formulaEngine = new FormulaEngine();