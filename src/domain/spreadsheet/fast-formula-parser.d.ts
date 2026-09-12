declare module 'fast-formula-parser' {
  export type FormulaValue = number | string | boolean | FormulaError | FormulaRef | FormulaValue[][];

  export interface FormulaRef {
    sheet?: string;
    row: number;
    col: number;
    from?: { row: number; col: number };
    to?: { row: number; col: number };
  }

  export interface FormulaPosition {
    row: number;
    col: number;
    sheet?: string;
  }

  export class FormulaError extends Error {
    error: string;
    details?: unknown;
    static DIV0: FormulaError;
    static NA: FormulaError;
    static NAME: FormulaError;
    static NULL: FormulaError;
    static NUM: FormulaError;
    static REF: FormulaError;
    static VALUE: FormulaError;
    static NOT_IMPLEMENTED(fn: string): FormulaError;
    static TOO_MANY_ARGS(fn: string): FormulaError;
    static ARG_MISSING(args: unknown[]): FormulaError;
    static ERROR(msg: string, details?: unknown): FormulaError;
  }

  export interface FormulaParserConfig {
    functions?: Record<string, (...args: unknown[]) => unknown | FormulaError>;
    functionsNeedContext?: Record<string, (context: unknown, ...args: unknown[]) => unknown>;
    onVariable?: (name: string, sheetName?: string, position?: FormulaPosition) => FormulaRef | Error | null;
    onCell?: (ref: { sheet?: string; row: number; col: number }) => unknown;
    onRange?: (ref: { sheet?: string; from: { row: number; col: number }; to: { row: number; col: number } }) => unknown[][];
  }

  export default class FormulaParser {
    constructor(config?: FormulaParserConfig, isTest?: boolean);
    parse(inputText: string, position: FormulaPosition, allowReturnArray?: boolean): FormulaValue;
    parseAsync(inputText: string, position: FormulaPosition, allowReturnArray?: boolean): Promise<FormulaValue>;
  }

  export const FormulaHelpers: {
    accept(var1: unknown, type: string, opt?: unknown): unknown;
    acceptNumber(var1: unknown, isArray?: boolean, allowBoolean?: boolean): number | FormulaError;
    flattenDeep(arr: unknown[]): unknown[];
  };

  export const Types: {
    NUMBER: number;
    ARRAY: number;
    BOOLEAN: number;
    STRING: number;
    RANGE_REF: number;
    CELL_REF: number;
    COLLECTIONS: number;
    NUMBER_NO_BOOLEAN: number;
  };

  export class DepParser {
    constructor(config?: { onVariable?: (name: string, sheetName?: string) => FormulaValue | Error | null });
    parse(inputText: string, position: FormulaPosition, ignoreError?: boolean): FormulaRef[];
  }

  export const MAX_ROW: number;
  export const MAX_COLUMN: number;
  export const SSF: unknown;
}