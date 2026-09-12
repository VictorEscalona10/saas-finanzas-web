'use client';

import type { SheetState } from '@/src/domain/spreadsheet/types';
import { useExportCsv } from '@/src/use-cases/spreadsheet/useExportCsv';
import './ExcelToolbar.css';

interface ExcelToolbarProps {
  activeSheet: SheetState | null;
  canUndo: boolean;
  canRedo: boolean;
  canSum?: boolean;
  onNewSheet: () => void;
  onAddRow: () => void;
  onAddColumn: () => void;
  onSum?: () => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export default function ExcelToolbar({
  activeSheet,
  canUndo,
  canRedo,
  canSum = false,
  onNewSheet,
  onAddRow,
  onAddColumn,
  onSum,
  onClear,
  onUndo,
  onRedo,
}: ExcelToolbarProps) {
  const { exportCsv } = useExportCsv();
  const hasColumns = (activeSheet?.columns.length ?? 0) > 0;

  return (
    <div className="excel-toolbar">
      <div className="excel-toolbar__group">
        <button type="button" className="excel-toolbar__btn" onClick={onNewSheet} title="Nueva hoja">
          <span className="material-symbols-outlined excel-toolbar__icon">note_add</span>
          <span className="excel-toolbar__label">Nueva hoja</span>
        </button>
      </div>

      <div className="excel-toolbar__divider" />

      <div className="excel-toolbar__group">
        <button
          type="button"
          className="excel-toolbar__btn"
          onClick={onAddRow}
          disabled={!hasColumns}
          title="Añadir fila"
        >
          <span className="material-symbols-outlined excel-toolbar__icon">add_row_above</span>
          <span className="excel-toolbar__label">Fila</span>
        </button>
        <button
          type="button"
          className="excel-toolbar__btn"
          onClick={onAddColumn}
          disabled={!hasColumns}
          title="Añadir columna"
        >
          <span className="material-symbols-outlined excel-toolbar__icon">add_column_right</span>
          <span className="excel-toolbar__label">Columna</span>
        </button>
      </div>

      <div className="excel-toolbar__divider" />

      <div className="excel-toolbar__group">
        <button
          type="button"
          className="excel-toolbar__btn"
          onClick={onSum}
          disabled={!canSum}
          title="Sumar el rango seleccionado (inserta =SUM(...) debajo o a la derecha)"
        >
          <span className="material-symbols-outlined excel-toolbar__icon">functions</span>
          <span className="excel-toolbar__label">Autosuma</span>
        </button>
      </div>

      <div className="excel-toolbar__divider" />

      <div className="excel-toolbar__group">
        <button
          type="button"
          className="excel-toolbar__btn"
          onClick={() => {
            if (activeSheet) exportCsv(activeSheet);
          }}
          disabled={!hasColumns}
          title="Exportar como CSV"
        >
          <span className="material-symbols-outlined excel-toolbar__icon">download</span>
          <span className="excel-toolbar__label">Exportar CSV</span>
        </button>
        <button
          type="button"
          className="excel-toolbar__btn excel-toolbar__btn--danger"
          onClick={onClear}
          title="Vaciar hoja"
        >
          <span className="material-symbols-outlined excel-toolbar__icon">delete</span>
          <span className="excel-toolbar__label">Vaciar</span>
        </button>
      </div>

      <div className="excel-toolbar__divider" />

      <div className="excel-toolbar__group">
        <button
          type="button"
          className="excel-toolbar__btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Deshacer"
        >
          <span className="material-symbols-outlined excel-toolbar__icon">undo</span>
        </button>
        <button
          type="button"
          className="excel-toolbar__btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Rehacer"
        >
          <span className="material-symbols-outlined excel-toolbar__icon">redo</span>
        </button>
      </div>
    </div>
  );
}