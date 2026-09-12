'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import type { Cell, Column } from '@/src/domain/spreadsheet/types';
import { columnLetter } from '@/src/domain/spreadsheet/sheetModel';
import ExcelCell from '@/src/components/excel/ExcelCell/ExcelCell';
import './ExcelGrid.css';

const ROW_HEADER_WIDTH = 48;
const ROW_HEIGHT = 32;
const HEADER_HEIGHT = 36;

type Position = { row: number; col: number };

export type SelectionRange = { from: Position; to: Position };

interface PendingPick {
  anchor: Position;
  prefix: string;
  token: string;
}

export interface ActiveCell {
  row: number;
  col: number;
  address: string;
  value: string;
}

interface ExcelGridProps {
  columns: Column[];
  rows: Cell[][];
  onSetCell: (row: number, col: number, raw: string) => void;
  onActiveChange?: (active: ActiveCell) => void;
  onSelectionChange?: (selection: SelectionRange | null) => void;
  onRenameColumn?: (col: number, label: string) => void;
  className?: string;
}

export default function ExcelGrid({
  columns,
  rows,
  onSetCell,
  onActiveChange,
  onSelectionChange,
  onRenameColumn,
  className = '',
}: ExcelGridProps) {
  const [selected, setSelected] = useState<Position>({ row: 0, col: 0 });
  const [selection, setSelection] = useState<SelectionRange | null>(null);
  const [editing, setEditing] = useState<Position | null>(null);
  const [draft, setDraft] = useState('');
  const [editingHeader, setEditingHeader] = useState<number | null>(null);
  const [headerDraft, setHeaderDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const draggingRef = useRef(false);
  const justDraggedRef = useRef(false);
  const anchorRef = useRef<Position>({ row: 0, col: 0 });
  const pendingPickRef = useRef<PendingPick | null>(null);
  const pickDraggingRef = useRef(false);

  const maxRow = Math.max(rows.length - 1, 0);
  const maxCol = Math.max(columns.length - 1, 0);
  const totalWidth =
    ROW_HEADER_WIDTH + columns.reduce((sum, column) => sum + column.width, 0);

  const notifyActive = (row: number, col: number, value: string) => {
    onActiveChange?.({
      row,
      col,
      address: `${columnLetter(col)}${row + 1}`,
      value,
    });
  };

  const clamp = (row: number, col: number): Position => ({
    row: Math.min(Math.max(row, 0), maxRow),
    col: Math.min(Math.max(col, 0), maxCol),
  });

  const isFormulaEdit =
    editing !== null && draft.trim().startsWith('=');

  const isPicking = isFormulaEdit && selection !== null;

  const cellAddress = (row: number, col: number): string =>
    `${columnLetter(col)}${row + 1}`;

  const rangeToken = (from: Position, to: Position): string => {
    const a = cellAddress(from.row, from.col);
    const b = cellAddress(to.row, to.col);
    return a === b ? a : `${a}:${b}`;
  };

  const scrollToCell = (row: number, col: number) => {
    const container = scrollRef.current;
    if (!container) return;

    let colOffset = ROW_HEADER_WIDTH;
    for (let c = 0; c < col && c < columns.length; c++) {
      colOffset += columns[c].width;
    }
    const colWidth = columns[col]?.width ?? 0;

    if (colOffset < container.scrollLeft) {
      container.scrollLeft = colOffset;
    } else if (colOffset + colWidth > container.scrollLeft + container.clientWidth) {
      container.scrollLeft = colOffset + colWidth - container.clientWidth;
    }

    const rowTop = HEADER_HEIGHT + row * ROW_HEIGHT;
    if (rowTop < container.scrollTop) {
      container.scrollTop = rowTop;
    } else if (rowTop + ROW_HEIGHT > container.scrollTop + container.clientHeight) {
      container.scrollTop = rowTop + ROW_HEIGHT - container.clientHeight;
    }
  };

  const selectCell = (row: number, col: number) => {
    const next = clamp(row, col);
    setSelected(next);
    setSelection(null);
    onSelectionChange?.(null);
    setEditing(null);
    scrollToCell(next.row, next.col);
    notifyActive(next.row, next.col, rows[next.row]?.[next.col]?.raw ?? '');
    scrollRef.current?.focus();
  };

  const normalizeRange = (a: Position, b: Position): SelectionRange => ({
    from: { row: Math.min(a.row, b.row), col: Math.min(a.col, b.col) },
    to: { row: Math.max(a.row, b.row), col: Math.max(a.col, b.col) },
  });

  /** Grow the range from the anchor toward `row, col` (active cell moves to the edge). */
  const extendSelection = (row: number, col: number) => {
    const next = clamp(row, col);
    const range = normalizeRange(anchorRef.current, next);
    setSelected(next);
    setSelection(range);
    onSelectionChange?.(range);
    setEditing(null);
    scrollToCell(next.row, next.col);
    notifyActive(next.row, next.col, rows[next.row]?.[next.col]?.raw ?? '');
  };

  const endDrag = () => {
    draggingRef.current = false;
    pickDraggingRef.current = false;
  };

  const handleCellMouseDown = (row: number, col: number, e: ReactMouseEvent<HTMLDivElement>) => {
    if (isFormulaEdit) {
      if (editing && editing.row === row && editing.col === col) return;
      e.preventDefault();
      const cell = clamp(row, col);
      pickDraggingRef.current = true;
      if (pendingPickRef.current) {
        pendingPickRef.current = {
          anchor: cell,
          prefix: pendingPickRef.current.prefix,
          token: cellAddress(cell.row, cell.col),
        };
      } else {
        pendingPickRef.current = {
          anchor: cell,
          prefix: draft,
          token: cellAddress(cell.row, cell.col),
        };
      }
      const token = pendingPickRef.current.token;
      setDraft(pendingPickRef.current.prefix + token);
      setSelection(normalizeRange(cell, cell));
      onSelectionChange?.(normalizeRange(cell, cell));
      return;
    }
    e.preventDefault();
    if (e.shiftKey) {
      anchorRef.current = selection?.from ?? selected;
      extendSelection(row, col);
      return;
    }
    anchorRef.current = clamp(row, col);
    justDraggedRef.current = false;
    draggingRef.current = true;
    selectCell(row, col);
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (isFormulaEdit && pendingPickRef.current && pickDraggingRef.current) {
      const cell = clamp(row, col);
      const anchor = pendingPickRef.current.anchor;
      pendingPickRef.current.token = rangeToken(anchor, cell);
      setDraft(pendingPickRef.current.prefix + pendingPickRef.current.token);
      setSelection(normalizeRange(anchor, cell));
      onSelectionChange?.(normalizeRange(anchor, cell));
      return;
    }
    if (!draggingRef.current) return;
    justDraggedRef.current = true;
    extendSelection(row, col);
  };

  const handleCellClick = (row: number, col: number) => {
    if (isFormulaEdit) return;
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    selectCell(row, col);
  };

  const handleDraftChange = (value: string) => {
    if (pendingPickRef.current) {
      const expected = pendingPickRef.current.prefix + pendingPickRef.current.token;
      if (value !== expected) {
        pendingPickRef.current = null;
        setSelection(null);
        onSelectionChange?.(null);
      }
    }
    setDraft(value);
  };

  const selectColumn = (col: number) => {
    const from = { row: 0, col };
    const to = { row: maxRow, col };
    anchorRef.current = from;
    setSelected(from);
    setSelection(normalizeRange(from, to));
    onSelectionChange?.(normalizeRange(from, to));
    setEditing(null);
    scrollToCell(0, col);
    notifyActive(0, col, rows[0]?.[col]?.raw ?? '');
  };

  const selectRow = (row: number) => {
    const from = { row, col: 0 };
    const to = { row, col: maxCol };
    anchorRef.current = from;
    setSelected(from);
    setSelection(normalizeRange(from, to));
    onSelectionChange?.(normalizeRange(from, to));
    setEditing(null);
    scrollToCell(row, 0);
    notifyActive(row, 0, rows[row]?.[0]?.raw ?? '');
  };

  const insertPickToken = (from: Position, to: Position) => {
    const range = normalizeRange(from, to);
    const token = rangeToken(range.from, range.to);
    if (pendingPickRef.current) {
      pendingPickRef.current = {
        anchor: range.from,
        prefix: pendingPickRef.current.prefix,
        token,
      };
    } else {
      pendingPickRef.current = { anchor: range.from, prefix: draft, token };
    }
    setDraft(pendingPickRef.current.prefix + token);
    setSelection(range);
    onSelectionChange?.(range);
  };

  const pickColumn = (col: number) => {
    insertPickToken({ row: 0, col }, { row: maxRow, col });
  };

  const pickRow = (row: number) => {
    insertPickToken({ row, col: 0 }, { row, col: maxCol });
  };

  const beginEdit = (row: number, col: number) => {
    if (editing?.row === row && editing?.col === col) return;
    pendingPickRef.current = null;
    const cell = rows[row]?.[col];
    setSelected({ row, col });
    setSelection(null);
    onSelectionChange?.(null);
    setDraft(cell?.raw ?? '');
    setEditing({ row, col });
    scrollToCell(row, col);
    notifyActive(row, col, cell?.raw ?? '');
  };

  const commitEdit = (moveRow: number, moveCol: number) => {
    if (!editing) return;
    pendingPickRef.current = null;
    setSelection(null);
    onSelectionChange?.(null);
    onSetCell(editing.row, editing.col, draft);
    const next = clamp(editing.row + moveRow, editing.col + moveCol);
    setEditing(null);
    setSelected(next);
    scrollToCell(next.row, next.col);
    notifyActive(next.row, next.col, draft);
    scrollRef.current?.focus();
  };

  const cancelEdit = () => {
    pendingPickRef.current = null;
    setSelection(null);
    onSelectionChange?.(null);
    setEditing(null);
    if (selected) notifyActive(selected.row, selected.col, rows[selected.row]?.[selected.col]?.raw ?? '');
    scrollRef.current?.focus();
  };

  const beginHeaderEdit = (col: number) => {
    setHeaderDraft(columns[col]?.label ?? columnLetter(col));
    setEditingHeader(col);
  };

  const commitHeaderRename = (col: number) => {
    const trimmed = headerDraft.trim();
    const next = trimmed === '' ? columnLetter(col) : trimmed;
    const current = columns[col]?.label;
    if (next !== current) onRenameColumn?.(col, next);
    setEditingHeader(null);
  };

  const handleGridKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (editing) return;

    const current = selected ?? { row: 0, col: 0 };
    const key = e.key;
    const shift = e.shiftKey;

    const move = (row: number, col: number) => {
      e.preventDefault();
      const next = clamp(row, col);
      if (shift) {
        if (!selection) anchorRef.current = current;
        extendSelection(next.row, next.col);
      } else {
        selectCell(next.row, next.col);
        anchorRef.current = next;
      }
    };

    if (key === 'ArrowUp') return move(current.row - 1, current.col);
    if (key === 'ArrowDown') return move(current.row + 1, current.col);
    if (key === 'ArrowLeft') return move(current.row, current.col - 1);
    if (key === 'ArrowRight') return move(current.row, current.col + 1);
    if (key === 'Home') return move(current.row, 0);
    if (key === 'End') return move(current.row, maxCol);

    if (key === 'Tab') {
      e.preventDefault();
      selectCell(current.row, Math.min(current.col + 1, maxCol));
      return;
    }
    if (key === 'Enter' || key === 'F2') {
      e.preventDefault();
      beginEdit(current.row, current.col);
      return;
    }
    if (key === 'Backspace' || key === 'Delete') {
      e.preventDefault();
      onSetCell(current.row, current.col, '');
      return;
    }
    if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      beginEdit(current.row, current.col);
      setDraft(key);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => endDrag();
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  useEffect(() => {
    if (isPicking && editInputRef.current) {
      const input = editInputRef.current;
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }, [isPicking, draft]);

  const inRange = (row: number, col: number): boolean =>
    !!selection &&
    row >= selection.from.row &&
    row <= selection.to.row &&
    col >= selection.from.col &&
    col <= selection.to.col;

  const rowInRange = (row: number): boolean =>
    !!selection && row >= selection.from.row && row <= selection.to.row;

  const colInRange = (col: number): boolean =>
    !!selection && col >= selection.from.col && col <= selection.to.col;

  const bodyRows = columns.length > 0 && rows.length > 0 ? (
      rows.map((rowCells, row) => (
        <div className="excel-grid__row" key={row} role="row">
          <div
            className={`excel-grid__row-header${
              rowInRange(row) ? ' excel-grid__row-header--range' : ''
            }`}
            style={{ width: ROW_HEADER_WIDTH }}
            role="rowheader"
            onMouseDown={(e) => {
              e.preventDefault();
              if (isFormulaEdit) pickRow(row);
              else selectRow(row);
            }}
            title="Seleccionar fila"
          >
            {row + 1}
          </div>
          {rowCells.map((cell, col) => {
            const column = columns[col];
            const isSelected = selected?.row === row && selected.col === col;
            const isEditing = editing?.row === row && editing.col === col;

            return (
              <ExcelCell
                key={column.id}
                cell={cell}
                dataType={column.dataType}
                width={column.width}
                align={column.align}
                selected={isSelected}
                inRange={!isSelected && inRange(row, col)}
                editing={isEditing}
                draft={isEditing ? draft : ''}
                inputRef={isEditing ? editInputRef : undefined}
                onSelect={() => handleCellClick(row, col)}
                onMouseDown={(e) => handleCellMouseDown(row, col, e)}
                onMouseEnter={() => handleCellMouseEnter(row, col)}
                onBeginEdit={() => beginEdit(row, col)}
                onDraftChange={handleDraftChange}
                onCommit={() => commitEdit(1, 0)}
                onCancel={cancelEdit}
              />
            );
          })}
        </div>
      ))
    ) : (
      <div className="excel-grid__empty">No hay columnas para mostrar</div>
    );

  return (
    <div className={`excel-grid ${className}${isPicking ? ' excel-grid--picking' : ''}`}>
      <div
        className="excel-grid__scroll"
        ref={scrollRef}
        tabIndex={0}
        role="grid"
        aria-label="Hoja de cálculo"
        onKeyDown={handleGridKeyDown}
      >
        <div className="excel-grid__header" style={{ width: totalWidth }}>
          <div className="excel-grid__corner" style={{ width: ROW_HEADER_WIDTH }} />
          {columns.map((column, col) => (
            <div
              key={column.id}
              className={`excel-grid__column-header${
                colInRange(col) ? ' excel-grid__column-header--range' : ''
              }`}
              style={{ width: column.width }}
              onMouseDown={(e) => {
                e.preventDefault();
                if (isFormulaEdit) pickColumn(col);
                else selectColumn(col);
              }}
              onDoubleClick={() => {
                if (!isFormulaEdit) beginHeaderEdit(col);
              }}
              title="Clic para seleccionar columna · Doble clic para renombrar"
            >
              {editingHeader === col ? (
                <input
                  className="excel-grid__header-input"
                  value={headerDraft}
                  autoFocus
                  onChange={(e) => setHeaderDraft(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitHeaderRename(col);
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setEditingHeader(null);
                    }
                  }}
                  onBlur={() => commitHeaderRename(col)}
                />
              ) : (
                <div className="excel-grid__column-header-text">
                  <span className="excel-grid__column-header-letter">{columnLetter(col)}</span>
                  {column.label !== columnLetter(col) && (
                    <span className="excel-grid__column-header-label">{column.label}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        {bodyRows}
      </div>
    </div>
  );
}