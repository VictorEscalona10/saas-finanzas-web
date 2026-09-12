'use client';

import { useEffect, useState } from 'react';
import { subDays, subMonths, startOfMonth, format } from 'date-fns';
import { useSpreadsheet } from '@/src/use-cases/spreadsheet/useSpreadsheet';
import {
  useSpreadsheetProjects,
} from '@/src/use-cases/spreadsheet/useSpreadsheetProjects';
import { TEMPLATES } from '@/src/domain/spreadsheet/templates';
import {
  useImportTransactions,
  TRANSACTION_IMPORT_COLUMN_COUNT,
  TRANSACTION_IMPORT_COLUMN_LABELS,
} from '@/src/use-cases/spreadsheet/useImportTransactions';
import {
  useImportItems,
  ITEM_IMPORT_COLUMN_COUNT,
  ITEM_IMPORT_COLUMN_LABELS,
} from '@/src/use-cases/spreadsheet/useImportItems';
import {
  useImportTransactionsByDateRange,
  TRANSACTION_DATE_RANGE_COLUMN_COUNT,
  TRANSACTION_DATE_RANGE_COLUMN_LABELS,
} from '@/src/use-cases/spreadsheet/useImportTransactionsByDateRange';
import {
  useImportCategories,
  CATEGORY_IMPORT_COLUMN_COUNT,
  CATEGORY_IMPORT_COLUMN_LABELS,
} from '@/src/use-cases/spreadsheet/useImportCategories';
import {
  useImportBatches,
  BATCH_IMPORT_COLUMN_COUNT,
  BATCH_IMPORT_COLUMN_LABELS,
} from '@/src/use-cases/spreadsheet/useImportBatches';
import {
  useImportCashFlow,
  CASHFLOW_IMPORT_COLUMN_COUNT,
  CASHFLOW_IMPORT_COLUMN_LABELS,
} from '@/src/use-cases/spreadsheet/useImportCashFlow';
import {
  useImportContribution,
  CONTRIBUTION_IMPORT_COLUMN_COUNT,
  CONTRIBUTION_IMPORT_COLUMN_LABELS,
} from '@/src/use-cases/spreadsheet/useImportContribution';
import {
  useImportContributionByItem,
  CONTRIBUTION_ITEM_IMPORT_COLUMN_COUNT,
  CONTRIBUTION_ITEM_IMPORT_COLUMN_LABELS,
} from '@/src/use-cases/spreadsheet/useImportContributionByItem';
import {
  useImportBalancePoint,
  BALANCE_POINT_IMPORT_COLUMN_COUNT,
  BALANCE_POINT_IMPORT_COLUMN_LABELS,
} from '@/src/use-cases/spreadsheet/useImportBalancePoint';
import { useItemList } from '@/src/use-cases/item/useItemList';
import ExcelToolbar from '@/src/components/excel/ExcelToolbar/ExcelToolbar';
import FormulaBar from '@/src/components/excel/FormulaBar/FormulaBar';
import ExcelGrid from '@/src/components/excel/ExcelGrid/ExcelGrid';
import ImportOptionsModal from '@/src/components/excel/ImportOptionsModal/ImportOptionsModal';
import type { ActiveCell, SelectionRange } from '@/src/components/excel/ExcelGrid/ExcelGrid';
import { buildRangeRef } from '@/src/domain/spreadsheet/sheetModel';
import type { ImportMode } from '@/src/domain/spreadsheet/types';
import './ExcelScreen.css';

interface ExcelScreenProps {
  companyId: string;
  projectId?: string;
}

type ImportKind =
  | 'transactions'
  | 'transactionsByDateRange'
  | 'items'
  | 'categories'
  | 'batches'
  | 'cashFlow'
  | 'contribution'
  | 'contributionProduct'
  | 'contributionService'
  | 'balancePoint';

interface QuickRange {
  key: string;
  label: string;
  start: string;
  end: string;
}

function buildQuickRange(key: string, label: string, start: Date, end: Date): QuickRange {
  return { key, label, start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') };
}

function getQuickRanges(): QuickRange[] {
  const end = new Date();
  return [
    buildQuickRange('month', 'Este mes', startOfMonth(end), end),
    buildQuickRange('7d', 'Ultimos 7 dias', subDays(end, 6), end),
    buildQuickRange('15d', 'Ultimos 15 dias', subDays(end, 14), end),
    buildQuickRange('30d', 'Ultimos 30 dias', subDays(end, 29), end),
    buildQuickRange('3m', 'Ultimos 3 meses', subMonths(end, 3), end),
    buildQuickRange('6m', 'Ultimos 6 meses', subMonths(end, 6), end),
  ];
}

export default function ExcelScreen({ companyId, projectId }: ExcelScreenProps) {
  const { getProject, touchProject } = useSpreadsheetProjects();
  const project = projectId ? getProject(projectId) : null;
  const template = project ? TEMPLATES[project.template] : undefined;

  const {
    sheets, activeSheet, canUndo, canRedo,
    setCell, fillRange, insertRow, insertColumn, clearSheet,
    addSheet, activateSheet, renameColumn, undo, redo, importRows,
  } = useSpreadsheet(template);

  const [active, setActive] = useState<ActiveCell | null>(null);
  const [selection, setSelection] = useState<SelectionRange | null>(null);
  const [pendingImport, setPendingImport] = useState<ImportKind | null>(null);

  const today = new Date();
  const [startDate, setStartDate] = useState(format(startOfMonth(today), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));
  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedItemType, setSelectedItemType] = useState<'product' | 'service'>('product');

  const hasDateFilter = !!startDate && !!endDate;
  const quickRanges = getQuickRanges();
  const activeQuickKey = quickRanges.find((r) => r.start === startDate && r.end === endDate)?.key;

  const handleQuickRange = (range: QuickRange) => {
    setLocalStart(range.start);
    setLocalEnd(range.end);
    setStartDate(range.start);
    setEndDate(range.end);
  };

  const handleApplyDate = () => {
    if (localStart && localEnd && localStart <= localEnd) {
      setStartDate(localStart);
      setEndDate(localEnd);
    }
  };

  const { rows: transactionRows, isLoading: txLoading, error: txError, refetch: refetchTx } = useImportTransactions(companyId);
  const { rows: itemRows, isLoading: itemsLoading, error: itemsError, refetch: refetchItems } = useImportItems(companyId);
  const { rows: txDateRangeRows, isLoading: txDrLoading, error: txDrError, refetch: refetchTxDr } = useImportTransactionsByDateRange(companyId, startDate, endDate);
  const { rows: categoryRows, isLoading: catLoading, error: catError, refetch: refetchCat } = useImportCategories(companyId);
  const { rows: batchRows, isLoading: batchLoading, error: batchError, refetch: refetchBatch } = useImportBatches(companyId);
  const { rows: cashFlowRows, isLoading: cfLoading, error: cfError, refetch: refetchCf } = useImportCashFlow(companyId, startDate, endDate);
  const { rows: contribRows, isLoading: contribLoading, error: contribError, refetch: refetchContrib } = useImportContribution(companyId, startDate, endDate);
  const { rows: contribItemRows, isLoading: contribItemLoading, error: contribItemError, refetch: refetchContribItem } = useImportContributionByItem(selectedItemId || undefined, companyId, startDate, endDate, selectedItemType);
  const { rows: bpRows, isLoading: bpLoading, error: bpError, refetch: refetchBp } = useImportBalancePoint(companyId, startDate, endDate);
  const { items: itemList } = useItemList(companyId);

  useEffect(() => {
    if (projectId) touchProject(projectId);
  }, [projectId, sheets, touchProject]);

  const activeValue = active ? (activeSheet?.rows[active.row]?.[active.col]?.raw ?? '') : '';
  const hasMultiCellSelection = !!selection && (selection.from.row !== selection.to.row || selection.from.col !== selection.to.col);
  const selectionAddress = selection ? buildRangeRef(selection.from, selection.to) : null;
  const formulaAddress = hasMultiCellSelection ? selectionAddress : (active?.address ?? 'A1');

  const handleCommit = (value: string) => { if (active) setCell(active.row, active.col, value); };
  const handleFillRange = (value: string) => { if (selection) fillRange(selection.from, selection.to, value); };

  const sumPlacement = (): { row: number; col: number; formula: string } | null => {
    if (!selection || !activeSheet) return null;
    const r1 = Math.min(selection.from.row, selection.to.row);
    const r2 = Math.max(selection.from.row, selection.to.row);
    const c1 = Math.min(selection.from.col, selection.to.col);
    const c2 = Math.max(selection.from.col, selection.to.col);
    const ref = buildRangeRef({ row: r1, col: c1 }, { row: r2, col: c2 });
    if (r1 === r2) {
      if (c2 + 1 >= activeSheet.columns.length) return null;
      return { row: r1, col: c2 + 1, formula: `=SUM(${ref})` };
    }
    if (r2 + 1 >= activeSheet.rows.length) return null;
    return { row: r2 + 1, col: c1, formula: `=SUM(${ref})` };
  };

  const canSum = sumPlacement() !== null;
  const handleSum = () => { const p = sumPlacement(); if (p) setCell(p.row, p.col, p.formula); };
  const handleImport = (kind: ImportKind) => setPendingImport(kind);

  const handleImportConfirm = (mode: ImportMode) => {
    if (!pendingImport) return;
    const map: Record<ImportKind, { rows: string[][]; colCount: number; labels: string[] } | null> = {
      transactions: { rows: transactionRows, colCount: TRANSACTION_IMPORT_COLUMN_COUNT, labels: TRANSACTION_IMPORT_COLUMN_LABELS },
      transactionsByDateRange: { rows: txDateRangeRows, colCount: TRANSACTION_DATE_RANGE_COLUMN_COUNT, labels: TRANSACTION_DATE_RANGE_COLUMN_LABELS },
      items: { rows: itemRows, colCount: ITEM_IMPORT_COLUMN_COUNT, labels: ITEM_IMPORT_COLUMN_LABELS },
      categories: { rows: categoryRows, colCount: CATEGORY_IMPORT_COLUMN_COUNT, labels: CATEGORY_IMPORT_COLUMN_LABELS },
      batches: { rows: batchRows, colCount: BATCH_IMPORT_COLUMN_COUNT, labels: BATCH_IMPORT_COLUMN_LABELS },
      cashFlow: { rows: cashFlowRows, colCount: CASHFLOW_IMPORT_COLUMN_COUNT, labels: CASHFLOW_IMPORT_COLUMN_LABELS },
      contribution: { rows: contribRows, colCount: CONTRIBUTION_IMPORT_COLUMN_COUNT, labels: CONTRIBUTION_IMPORT_COLUMN_LABELS },
      contributionProduct: { rows: contribItemRows, colCount: CONTRIBUTION_ITEM_IMPORT_COLUMN_COUNT, labels: CONTRIBUTION_ITEM_IMPORT_COLUMN_LABELS },
      contributionService: { rows: contribItemRows, colCount: CONTRIBUTION_ITEM_IMPORT_COLUMN_COUNT, labels: CONTRIBUTION_ITEM_IMPORT_COLUMN_LABELS },
      balancePoint: { rows: bpRows, colCount: BALANCE_POINT_IMPORT_COLUMN_COUNT, labels: BALANCE_POINT_IMPORT_COLUMN_LABELS },
    };
    const config = map[pendingImport];
    if (config && config.rows.length > 0) importRows(config.rows, config.colCount, config.labels, mode);
    setPendingImport(null);
  };

  const importDialog = (() => {
    if (!pendingImport) return null;
    const titles: Record<ImportKind, string> = {
      transactions: 'Importar transacciones',
      transactionsByDateRange: 'Importar transacciones (por rango)',
      items: 'Importar items',
      categories: 'Importar categorias',
      batches: 'Importar lotes',
      cashFlow: 'Importar flujo de caja',
      contribution: 'Importar margen de contribucion',
      contributionProduct: 'Importar margen por producto',
      contributionService: 'Importar margen por servicio',
      balancePoint: 'Importar punto de equilibrio',
    };
    const counts: Record<ImportKind, number> = {
      transactions: transactionRows.length,
      transactionsByDateRange: txDateRangeRows.length,
      items: itemRows.length,
      categories: categoryRows.length,
      batches: batchRows.length,
      cashFlow: cashFlowRows.length,
      contribution: contribRows.length,
      contributionProduct: contribItemRows.length,
      contributionService: contribItemRows.length,
      balancePoint: bpRows.length,
    };
    return { title: titles[pendingImport], rowCount: counts[pendingImport] };
  })();

  const handleNewSheet = () => addSheet();

  const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (!value) { setSelectedItemId(''); return; }
    const item = itemList.find((i) => i.id === value);
    setSelectedItemId(value);
    setSelectedItemType(item?.type === 'SERVICE' ? 'service' : 'product');
  };

  return (
    <div className="excel-screen">
      <div className="excel-screen__header">
        <h1 className="excel-screen__title">{project?.name ?? 'Hoja de Calculo'}</h1>
        <p className="excel-screen__subtitle">
          Sandbox aislado de la base de datos - prueba formulas y exporta a CSV
        </p>
      </div>

      <div className="excel-screen__toolbar">
        <ExcelToolbar
          activeSheet={activeSheet}
          canUndo={canUndo}
          canRedo={canRedo}
          canSum={canSum}
          onNewSheet={handleNewSheet}
          onAddRow={() => insertRow()}
          onAddColumn={() => insertColumn()}
          onSum={handleSum}
          onClear={clearSheet}
          onUndo={undo}
          onRedo={redo}
        />
      </div>

      <div className="excel-screen__filters">
        <div className="excel-screen__quick-ranges">
          {quickRanges.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`excel-screen__quick-btn${activeQuickKey === r.key ? ' excel-screen__quick-btn--active' : ''}`}
              onClick={() => handleQuickRange(r)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="excel-screen__date-inputs">
          <label className="excel-screen__date-label">
            Desde
            <input type="date" className="excel-screen__date-input" value={localStart} max={localEnd} onChange={(e) => setLocalStart(e.target.value)} />
          </label>
          <label className="excel-screen__date-label">
            Hasta
            <input type="date" className="excel-screen__date-input" value={localEnd} min={localStart} onChange={(e) => setLocalEnd(e.target.value)} />
          </label>
          <button type="button" className="excel-screen__apply-btn" onClick={handleApplyDate}>Aplicar</button>
        </div>
      </div>

      <div className="excel-screen__sheet-tabs">
        {sheets.map((sheet) => (
          <button
            key={sheet.id}
            type="button"
            className={`excel-screen__sheet-tab${sheet.id === activeSheet?.id ? ' excel-screen__sheet-tab--active' : ''}`}
            onClick={() => activateSheet(sheet.id)}
          >
            <span className="material-symbols-outlined excel-screen__sheet-tab-icon">grid_on</span>
            <span className="excel-screen__sheet-tab-name">{sheet.name}</span>
          </button>
        ))}
      </div>

      <div className="excel-screen__imports">
        <div className="excel-screen__import-group">
          <span className="excel-screen__import-group-label">Datos</span>
          <div className="excel-screen__import-group-btns">
            <button type="button" className="excel-screen__import-btn" onClick={() => handleImport('transactions')} disabled={txLoading || transactionRows.length === 0}>
              <span className="material-symbols-outlined excel-screen__import-icon">download</span>Transacciones
            </button>
            {txError && <button type="button" className="excel-screen__import-btn excel-screen__import-btn--error" onClick={refetchTx}><span className="material-symbols-outlined excel-screen__import-icon">refresh</span>Reintentar</button>}
            <button type="button" className="excel-screen__import-btn" onClick={() => handleImport('transactionsByDateRange')} disabled={txDrLoading || txDateRangeRows.length === 0 || !hasDateFilter}>
              <span className="material-symbols-outlined excel-screen__import-icon">date_range</span>Transacciones (rango)
            </button>
            {txDrError && <button type="button" className="excel-screen__import-btn excel-screen__import-btn--error" onClick={refetchTxDr}><span className="material-symbols-outlined excel-screen__import-icon">refresh</span>Reintentar</button>}
            <button type="button" className="excel-screen__import-btn" onClick={() => handleImport('items')} disabled={itemsLoading || itemRows.length === 0}>
              <span className="material-symbols-outlined excel-screen__import-icon">download</span>Items
            </button>
            {itemsError && <button type="button" className="excel-screen__import-btn excel-screen__import-btn--error" onClick={refetchItems}><span className="material-symbols-outlined excel-screen__import-icon">refresh</span>Reintentar</button>}
            <button type="button" className="excel-screen__import-btn" onClick={() => handleImport('categories')} disabled={catLoading || categoryRows.length === 0}>
              <span className="material-symbols-outlined excel-screen__import-icon">download</span>Categorias
            </button>
            {catError && <button type="button" className="excel-screen__import-btn excel-screen__import-btn--error" onClick={refetchCat}><span className="material-symbols-outlined excel-screen__import-icon">refresh</span>Reintentar</button>}
            <button type="button" className="excel-screen__import-btn" onClick={() => handleImport('batches')} disabled={batchLoading || batchRows.length === 0}>
              <span className="material-symbols-outlined excel-screen__import-icon">download</span>Lotes
            </button>
            {batchError && <button type="button" className="excel-screen__import-btn excel-screen__import-btn--error" onClick={refetchBatch}><span className="material-symbols-outlined excel-screen__import-icon">refresh</span>Reintentar</button>}
          </div>
        </div>

        <div className="excel-screen__import-group">
          <span className="excel-screen__import-group-label">Analisis Financiero</span>
          <div className="excel-screen__import-group-btns">
            <button type="button" className="excel-screen__import-btn" onClick={() => handleImport('cashFlow')} disabled={cfLoading || cashFlowRows.length === 0 || !hasDateFilter}>
              <span className="material-symbols-outlined excel-screen__import-icon">account_balance</span>Flujo de Caja
            </button>
            {cfError && <button type="button" className="excel-screen__import-btn excel-screen__import-btn--error" onClick={refetchCf}><span className="material-symbols-outlined excel-screen__import-icon">refresh</span>Reintentar</button>}
            <button type="button" className="excel-screen__import-btn" onClick={() => handleImport('contribution')} disabled={contribLoading || contribRows.length === 0 || !hasDateFilter}>
              <span className="material-symbols-outlined excel-screen__import-icon">analytics</span>Margen Contribucion
            </button>
            {contribError && <button type="button" className="excel-screen__import-btn excel-screen__import-btn--error" onClick={refetchContrib}><span className="material-symbols-outlined excel-screen__import-icon">refresh</span>Reintentar</button>}
            <button type="button" className="excel-screen__import-btn" onClick={() => handleImport('balancePoint')} disabled={bpLoading || bpRows.length === 0 || !hasDateFilter}>
              <span className="material-symbols-outlined excel-screen__import-icon">balance</span>Pto. Equilibrio
            </button>
            {bpError && <button type="button" className="excel-screen__import-btn excel-screen__import-btn--error" onClick={refetchBp}><span className="material-symbols-outlined excel-screen__import-icon">refresh</span>Reintentar</button>}
          </div>
        </div>

        <div className="excel-screen__import-group">
          <span className="excel-screen__import-group-label">Contribucion por Item</span>
          <div className="excel-screen__import-group-btns">
            <select className="excel-screen__item-select" value={selectedItemId} onChange={handleItemSelect}>
              <option value="">Seleccionar producto/servicio...</option>
              {itemList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.type === 'PRODUCT' ? 'Prod' : 'Serv'})
                </option>
              ))}
            </select>
            <button type="button" className="excel-screen__import-btn" onClick={() => handleImport(selectedItemType === 'service' ? 'contributionService' : 'contributionProduct')} disabled={contribItemLoading || contribItemRows.length === 0 || !hasDateFilter || !selectedItemId}>
              <span className="material-symbols-outlined excel-screen__import-icon">download</span>Margen por Item
            </button>
            {contribItemError && <button type="button" className="excel-screen__import-btn excel-screen__import-btn--error" onClick={refetchContribItem}><span className="material-symbols-outlined excel-screen__import-icon">refresh</span>Reintentar</button>}
          </div>
        </div>
      </div>

      <div className="excel-screen__formula">
        <FormulaBar
          address={formulaAddress}
          value={activeValue}
          onCommit={handleCommit}
          onFillRange={handleFillRange}
        />
      </div>

      <div className="excel-screen__grid">
        {activeSheet ? (
          <ExcelGrid
            columns={activeSheet.columns}
            rows={activeSheet.rows}
            onSetCell={setCell}
            onActiveChange={setActive}
            onSelectionChange={setSelection}
            onRenameColumn={renameColumn}
          />
        ) : (
          <div className="excel-screen__empty">No hay hojas disponibles</div>
        )}
      </div>

      <ImportOptionsModal
        open={importDialog !== null}
        title={importDialog?.title ?? 'Importar'}
        rowCount={importDialog?.rowCount ?? 0}
        onCancel={() => setPendingImport(null)}
        onConfirm={handleImportConfirm}
      />
    </div>
  );
}
