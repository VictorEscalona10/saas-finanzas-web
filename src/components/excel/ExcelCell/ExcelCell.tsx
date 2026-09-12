'use client';

import type { KeyboardEvent, MouseEvent as ReactMouseEvent, Ref } from 'react';
import type { Cell, ColumnDataType } from '@/src/domain/spreadsheet/types';
import { formatNumber } from '@/src/shared/utils/numberUtils';
import './ExcelCell.css';

export interface ExcelCellProps {
  cell: Cell;
  dataType: ColumnDataType;
  width: number;
  align: 'left' | 'center' | 'right';
  selected?: boolean;
  inRange?: boolean;
  editing?: boolean;
  draft?: string;
  inputRef?: Ref<HTMLInputElement>;
  onSelect?: () => void;
  onMouseDown?: (e: ReactMouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: () => void;
  onBeginEdit?: () => void;
  onDraftChange?: (value: string) => void;
  onCommit?: () => void;
  onCancel?: () => void;
}

function formatFlexibleNumber(value: number): string {
  if (Number.isInteger(value)) return value.toLocaleString('es-VE');
  return value.toLocaleString('es-VE', { maximumFractionDigits: 4 });
}

export function formatCellValue(cell: Cell, dataType: ColumnDataType = 'text'): string {
  if (cell.error) return cell.error;
  const value = cell.value;
  if (value === null || value === undefined || value === '') return '';

  if ((dataType === 'number' || dataType === 'currency') && typeof value === 'number') {
    return dataType === 'currency' ? formatNumber(value, 2) : formatFlexibleNumber(value);
  }

  if (typeof value === 'boolean') return value ? 'VERDADERO' : 'FALSO';
  return String(value);
}

export default function ExcelCell({
  cell,
  dataType,
  width,
  align,
  selected = false,
  inRange = false,
  editing = false,
  draft = '',
  inputRef,
  onSelect,
  onMouseDown,
  onMouseEnter,
  onBeginEdit,
  onDraftChange,
  onCommit,
  onCancel,
}: ExcelCellProps) {
  const classes = [
    'excel-cell',
    `excel-cell--${align}`,
    `excel-cell--${cell.type}`,
    dataType === 'number' || dataType === 'currency' ? 'excel-cell--numeric' : '',
    selected ? 'excel-cell--selected' : '',
    inRange ? 'excel-cell--range' : '',
    editing ? 'excel-cell--editing' : '',
    cell.error ? 'excel-cell--error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === 'F2') {
      e.preventDefault();
      onBeginEdit?.();
    }
  };

  return (
    <div
      className={classes}
      style={{ width }}
      role="gridcell"
      onClick={() => {
        onSelect?.();
      }}
      onMouseDown={(e) => {
        onMouseDown?.(e);
      }}
      onMouseEnter={() => {
        onMouseEnter?.();
      }}
      onDoubleClick={() => {
        onBeginEdit?.();
      }}
      onKeyDown={handleKeyDown}
    >
      {editing ? (
        <input
          className="excel-cell__input"
          ref={inputRef}
          value={draft}
          autoFocus
          onFocus={(e) => e.target.select()}
          onChange={(e) => onDraftChange?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onCommit?.();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              onCancel?.();
            }
          }}
          onBlur={() => onCommit?.()}
        />
      ) : (
        <div
          className="excel-cell__content"
          title={cell.raw === '' ? undefined : cell.raw}
          data-testid="excel-cell-content"
        >
          {formatCellValue(cell, dataType)}
        </div>
      )}
    </div>
  );
}