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
| Lint (react-hooks/set-state-in-effect) | 🟡 En refactor — ver "Deuda técnica: estado en effects" |

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

---

# Deuda técnica: `react-hooks/set-state-in-effect` (29 errores de lint)

## Contexto

La regla `react-hooks/set-state-in-effect` (introducida por `eslint-plugin-react-hooks@7.1.1`, bundled con `eslint-config-next@16.2.4`) **prohíbe llamar `setState` de forma síncrona dentro del cuerpo de un `useEffect`**. Provoca **29 errores** de lint en **28 archivos**, pre-existentes a la actualización a Next 16 / React 19.

La regla es estricta y señala un anti-patrón: sincronizar estado interno con un prop/efecto, lo que causa un re-render "en cascada" extra. En runtime la app **funciona**, pero el lint queda en rojo y puede bloquear CI/build.

Se divide en **2 categorías** de código:

| Categoría | Archivos | Patrón |
|-----------|----------|--------|
| **UI: mount-on-open** | `shared/Modal`, 4 Drawers | Sincronizan `mounted`/`closing` con el prop `open` (necesitan animación de salida) |
| **Datos: fetch en hooks** | ~20 use-cases | Llaman `fetchX()` (con `setState` síncrono inicial) dentro de un `useEffect` |

> Referencia oficial: https://react.dev/learn/you-might-not-need-an-effect

---

## Fase 1 — UI: refactorizar `Modal` y los 4 Drawers (5 archivos, 5 errores)

**Objetivo:** eliminar el `setState` síncrono en el `useEffect` de estos componentes **sin perder las animaciones de entrada/salida**.

### Archivos
- `src/components/shared/Modal/Modal.tsx`
- `src/components/batch/BatchDrawer/BatchDrawer.tsx`
- `src/components/transaction/TransactionDrawer/TransactionDrawer.tsx`
- `src/components/item/ItemDrawer/ItemDrawer.tsx`
- `src/components/category/CategoryDrawer/CategoryDrawer.tsx`

### Enfoque propuesto: hook `usePresence` (o patrón `prevOpen`)

Crear un hook reutilizable `src/components/shared/hooks/usePresence.ts` que gestione el montaje + animación de salida de un overlay/panel:

```typescript
export function usePresence(open: boolean, exitDuration: number) {
  const [isVisible, setIsVisible] = useState(open);
  const [isAnimating, setIsAnimating] = useState(false);

  // Ajustar durante render (patrón prevOpen de React) — SIN setState síncrono en effect
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setIsVisible(true);
      setIsAnimating(false);
    } else {
      setIsAnimating(true); // iniciar animación de salida
    }
  }

  // El setState del timeout va en un callback (asíncrono) → NO dispara la regla
  useEffect(() => {
    if (!isAnimating) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
      setIsAnimating(false);
    }, exitDuration);
    return () => clearTimeout(timer);
  }, [isAnimating, exitDuration]);

  return { isVisible, isAnimating };
}
```

**Criterios de aceptación de la Fase 1:**
- [ ] `npx eslint` sobre los 5 archivos → **0 errores** de `react-hooks/set-state-in-effect`
- [ ] `npx tsc --noEmit` → sin errores
- [ ] **Prueba manual:** abrir/cerrar cada modal y drawer (Items, Categories, Transactions, Batches) y verificar:
  - La animación de entrada se muestra al abrir
  - La animación de salida (fade-out/slide-out) se completa antes de desmontar
  - Cerrar por X, por overlay, por Escape, y por "Cancelar"
  - El `ConfirmDialog` cierra al cancelar y al confirmar correctamente
- [ ] No se altera el comportamiento visual respecto al estado actual

---

## Fase 2 — Datos: hooks de fetch (20 archivos, ~24 errores)

**Objetivo:** eliminar el `setState` síncrono inicial que ocurre dentro del `useEffect` que dispara el fetch.

**Nota:** el `setState` tras el `await` (respuesta del backend) es asíncrono y **no** dispara la regla. El que la dispara es el `setState` síncrono de la primera línea (p.ej. `setState({ ...isLoading: true })` en `useItemList.ts:35`).

### Opción A (recomendada): corregir el `setState` inicial
Mover el `setState` de "isLoading: true" fuera del effect, o ajustarlo en el evento de cambio de dependencia usando el patrón `prevOpen`/derivación, dejando el fetch en el effect (que es el patrón legítimo de "sincronizar con red").

```typescript
// Antes (dispara la regla)
useEffect(() => { if (!sessionLoading) fetchItems(); }, [sessionLoading, fetchItems]);
// fetchItems hace setState({ isLoading: true }) al inicio (síncrono en el effect)

// Después: derivar isLoading durante render y no hacer setState síncrono en el effect
```

### Opción B (a mediano plazo): adoptar SWR / React Query
Migrar la capa de fetching de los use-cases a SWR o `@tanstack/react-query`. Elimina de raíz el patrón manual de `useEffect` + `setState` y aporta cache/retry/dedup. Es un **refactor mayor** de toda la capa de datos.

### Archivos (lista no exhaustiva de los 28 con el error)
- `src/use-cases/item/useItemList.ts`
- `src/use-cases/category/useCategoryList.ts`
- `src/use-cases/company/useCompany.ts`, `useMyCompanies.ts`
- `src/use-cases/batch/useBatchList.ts`, `useBatchById.ts`, `useBatchByProduct.ts`
- `src/use-cases/cash-flow/useCashFlowByRange.ts`, `useCashFlowTotal.ts`
- `src/use-cases/contribution/useContribution*.ts`
- `src/use-cases/dashboard/useDashboard.ts`
- `src/use-cases/spreadsheet/useImportItems.ts`, `useImportTransactions.ts`
- `src/use-cases/transaction/useTransactionList.ts`, `useTransactionById.ts`, `useTransactionByDate*.ts`
- `src/use-cases/category/useCategoryById.ts`
- etc.

**Criterios de aceptación de la Fase 2:**
- [ ] `npx eslint` sobre todos los use-cases afectados → **0 errores** de `react-hooks/set-state-in-effect`
- [ ] `npx tsc --noEmit` → sin errores
- [ ] Prueba manual de listados, búsqueda, paginación, filtros y refetch en cada módulo
- [ ] El spinner/loading sigue mostrándose correctamente durante la carga

---

## Fase 3 — Limpieza final y verificación global

- [ ] `npm run lint` → **0 errores** (quedan solo warnings tolerables o ninguno)
- [ ] `npx tsc --noEmit` → sin errores
- [ ] `npm run build` → build de producción exitoso
- [ ] Confirmar que no se requiere silenciar la regla globalmente (se resolvió de raíz)
- [ ] Actualizar `tasks.md` estado del lint a ✅

---

## Guía para no reintroducir el problema

> Documentado en `docs/DESIGN.md` §1.8 y `SPEC.md` §8. Ver esas secciones antes de escribir código nuevo que use `useEffect` + `setState`, o que renderice modales/drawers.
