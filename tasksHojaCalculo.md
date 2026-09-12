# Tasks — saas-finanzas-web

## Estado general

| Área | Estado |
|------|--------|
| Auth (Supabase SSR) | ✅ Completo |
| Companies (CRUD) | ✅ Completo |
| Categories (CRUD) | ✅ Completo |
| Items (CRUD) | ✅ Completo |
| Transactions (CRUD + batch) | ✅ Completo |
| Production Batches | ✅ Completo |
| Cash Flow | 🟡 Pendiente (solo interface) |
| Contribution Margin | 🟡 Pendiente (solo interface) |
| Gross Profit | 🟡 Pendiente (solo interface) |
| Net Profit / P&L | 🟡 Pendiente (solo interface) |
| Unit Cost | 🟡 Pendiente (solo interface) |
| Price Margin | 🟡 Pendiente (solo interface) |
| Balance Point | 🟡 Pendiente (solo interface) |
| Dashboard | ✅ Completo |
| Finance Chat | 🟡 Pendiente (solo interface) |
| Dollar Rate | ✅ Completo |
| Hoja de Cálculo (Excel sandbox) | ⬜ Pendiente |

## Pendientes

- [x] `ProductionBatchRepositoryImpl` ✅
- [x] `CashFlowRepositoryImpl` ✅
- [x] `CashFlowSummary` component ✅
- [x] `CashFlowStatement` component ✅
- [x] `CashFlowChart` component ✅
- [x] `CashFlowScreen` + route page ✅
- [ ] Implementar `ContributionMarginRepositoryImpl` y demás repos faltantes
- [ ] Conectar las pantallas de Cash Flow, Contribution Margin, etc. con datos reales
- [ ] Implementar Finance Chat
- [ ] Tests unitarios (ningún framework configurado aún)
- [ ] Manejo de errores consistente en todas las pantallas
- [ ] Responsive refinado en módulos nuevos

## Hoja de Cálculo (Excel sandbox)

> Módulo tipo Excel **aislado de la DB** (solo import read-only; nunca escribe). Contiene: columnas tipadas, fórmulas tipo Excel, columnas calculadas automáticas, export CSV, autosave localStorage, undo/redo. Motor: `fast-formula-parser` (MIT) detrás de un adapter propio.

### Fase 1 — Motor y modelo
- [x] Agregar dependencia `fast-formula-parser` (MIT) vía npm
- [x] `src/domain/spreadsheet/types.ts`: `CellType`, `Cell`, `Column`, `SheetState`
- [x] `src/domain/spreadsheet/formulaEngine.ts`: adapter sobre fast-formula-parser (`evaluate` + `getDependencies`) con `decimal.js`
- [x] `src/domain/spreadsheet/sheetModel.ts`: operaciones puras (`setCell`, insert/delete row/col, rename), recompute incremental topológico
- [x] `src/domain/spreadsheet/templates.ts`: plantillas `BLANK`, `TRANSACTION_TEMPLATE` (incl. columnas calculadas `Bs = USD × Tasa`, `Total = Cantidad × Precio`), `ITEM_TEMPLATE`

### Fase 2 — Grid y UI
- [x] `src/use-cases/spreadsheet/useSpreadsheet.ts`: reducer + undo/redo + autosave localStorage ✅
- [x] `src/components/excel/ExcelCell/ExcelCell.tsx` + `.css` ✅
- [x] `src/components/excel/ExcelGrid/ExcelGrid.tsx` + `.css`: header letras A..Z, headers de fila, selección/edición, navegación teclado ✅
- [x] `src/components/excel/FormulaBar/FormulaBar.tsx` + `.css` ✅
- [x] `src/components/excel/ExcelToolbar/ExcelToolbar.tsx` + `.css`: nueva hoja, añadir fila/col, export CSV, vaciar, undo/redo ✅

### Fase 3 — Integración
- [x] `src/use-cases/spreadsheet/useImportTransactions.ts`: reusar `useTransactionList`/repo → filas ✅
- [x] `src/use-cases/spreadsheet/useImportItems.ts`: reusar `ItemRepositoryImpl` → filas ✅
- [x] `src/use-cases/spreadsheet/useExportCsv.ts`: serializar a CSV (sep `;`) ✅
- [x] Página `app/(private)/(app)/[companyId]/excel/page.tsx` (patrón dashboard) ✅
- [x] NAV_ITEM en `AppShell.tsx` → `/excel` (icon `grid_on`) ✅

### Fase 4 — Pulido
- [ ] Virtualización (render filas visibles + overscan)
- [ ] Copy/paste TSV desde/hacia Excel
- [ ] Estilos de error de fórmula (`#DIV/0!`, `#REF!`, etc.)

### Verificación
- [x] `npx tsc --noEmit`
- [x] `npm run lint`
