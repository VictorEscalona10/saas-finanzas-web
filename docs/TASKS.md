# TASKS.md — Plan de Implementación SDD

> **Leyenda:** `[x] Hecho` = implementado funcionalmente y alineado con la arquitectura.
> `[ ] Pendiente` = no implementado o requiere refactorización.
>
> **Estado actual del proyecto:** Capa de dominio completa (entities, repos, rules). Infraestructura base lista (Supabase clients, API client, middleware, route handlers de auth). **Fase 0 y Fase 1 completadas (~13% del SPEC.md).**

---

## Fase 0: Fundación de Arquitectura

> Creación de la estructura limpia de directorios y configuración inicial.

- [x] **0.1** Crear `src/domain/entities/` con interfaces: `User`, `Company`, `Category`, `Item`, `Transaction`, `ProductionBatch`, `PaginationMeta`, `FuzzySearchResult`, `GrossProfitStatement`, `GrossProfitSummary`, `NetProfitStatement`, `ProfitLossReport`, `UnitCostResult`, `PriceMarginResult`
- [x] **0.2** Crear `src/domain/repositories/` con interfaces: `ICompanyRepository`, `ICategoryRepository`, `IItemRepository`, `ITransactionRepository`, `IProductionBatchRepository`, `ICashFlowRepository`, `IContributionMarginRepository`, `IGrossProfitRepository`, `INetProfitRepository`, `IUnitCostRepository`, `IPriceMarginRepository`, `IBalancePointRepository`, `IFinanceChatRepository`
- [x] **0.3** Crear `src/domain/rules/currency.ts` — `calculateComplementaryAmount()` (regla multi-moneda)
- [x] **0.4** Crear `src/domain/rules/stock.ts` — lógica de validación de stock
- [x] **0.5** Crear `src/shared/constants/index.ts` — `API_BASE_URL`, mapeo de `PAYMENT_METHODS`, `RATE_LIMITS`
- [x] **0.6** Crear `src/shared/utils/dateUtils.ts` — helpers ISO 8601 (formatear, parsear, validar)
- [x] **0.7** Crear `src/shared/utils/numberUtils.ts` — helpers para `decimal.js` (parsear Decimal de Prisma, formatear moneda)
- [x] **0.8** Crear `src/shared/utils/errorParser.ts` — tipar `AxiosError` → objeto `{ statusCode, message, error }`
- [x] **0.9** Migrar configuración Tailwind v4: `app/globals.css` ya tiene `@theme inline` con tokens financieros → **OK, preservar**

---

## Fase 1: Infraestructura y Auth

> Conexión con backend NestJS, clientes Supabase, y flujo completo de autenticación.

### Supabase Clients

- [x] **1.1** Crear `src/infrastructure/supabase/browser.ts` — `createBrowserClient()` con `@supabase/ssr`
- [x] **1.2** Crear `src/infrastructure/supabase/server.ts` — `createServerClient(cookies)` para Server Components
- [x] **1.3** Crear `src/infrastructure/supabase/middleware.ts` — `createMiddlewareClient(req, res)` para middleware.ts

### API Client

- [x] **1.4** Crear `src/infrastructure/api/apiClient.ts` — Axios instance con `baseURL: 'http://localhost:3001'` e interceptor que inyecta `Authorization: Bearer <token>` desde Supabase server session

### Auth — Registro y Login

- [x] **1.5** Crear ruta de API `app/api/auth/login/route.ts` — `POST` que llama a `supabase.auth.signInWithPassword()`, retorna éxito o error
- [x] **1.6** Crear ruta de API `app/api/auth/logout/route.ts` — `POST` que llama a `supabase.auth.signOut()`
- [x] **1.7** Crear `app/api/auth/register/route.ts` — llama a `POST /auth/register` del backend, luego hace login con Supabase
- [x] **1.8** Crear `src/middleware.ts` — refresh automático de sesión, redirección `/login` si no autenticado, redirección a `/dashboard` si ya autenticado en ruta pública

### Middleware — Rutas

- [x] **1.9** Configurar `PUBLIC_ROUTES = ['/login', '/register', '/forgot-password']` y `PRIVATE_ROUTES` en middleware

### Shared Components Base

- [x] **1.10** Crear `Button`, `Input`, `Modal`, `Pagination`, `Skeleton`, `Badge`, `DataTable` en `src/components/shared/` (cada uno con su carpeta y CSS)

---

## Fase 2: Módulo Auth — Login y Registro

> Pantallas de autenticación.

- [x] **2.1** Crear `src/use-cases/auth/useLogin.ts` — hook que POST a `/api/auth/login`, maneja sesión
- [x] **2.2** Crear `src/use-cases/auth/useRegister.ts` — hook que POST a `/api/auth/register`, maneja registro + login automático
- [x] **2.3** Crear `src/use-cases/auth/useLogout.ts` — hook que POST a `/api/auth/logout`
- [x] **2.4** Crear `src/use-cases/auth/useSession.ts` — hook que expone `session`, `user`, `isLoading`, `isAuthenticated`
- [x] **2.5** Crear `src/components/auth/LoginForm/` — formulario de login (email + password)
- [x] **2.6** Crear `src/components/auth/RegisterForm/` — formulario de registro (name, email, password, repeat_password)
- [x] **2.7** Crear `app/(public)/login/page.tsx` — página de login
- [x] **2.8** Crear `app/(public)/register/page.tsx` — página de registro
- [x] **2.9** Crear `src/components/auth/ProtectedRoute/` — wrapper que redirige a `/login` si no hay sesión
- [x] **2.10** Crear `src/components/layout/AppShell/` — layout base con sidebar, header, main area (post-login)
- [x] **2.11** Crear `src/components/layout/Header/` — header con datos del usuario y botón de logout
- [x] **2.12** Manejar error "Cuenta suspendida" (401) → mostrar pantalla de bloqueo en `src/components/auth/SuspendedAccount/`

---

## Fase 3: Módulo Company

> Gestión de compañías del usuario.
>
> **Nota:** `Company` entity e `ICompanyRepository` ya creados en Fase 0.

- [x] **3.1** Crear `src/infrastructure/repositories/CompanyRepositoryImpl.ts`
- [x] **3.2** Crear `src/use-cases/company/useMyCompanies.ts`
- [x] **3.3** Crear `src/use-cases/company/useCreateCompany.ts`
- [x] **3.4** Crear `src/use-cases/company/useUpdateCompany.ts`
- [x] **3.6** Crear `src/components/company/CompanyForm/` — formulario crear/editar compañía
- [x] **3.7** Crear `app/(private)/dashboard/page.tsx` — dashboard con CompanySelector
- [x] **3.8** Ruta `GET /company/:id` — página de detalle de compañía
- [x] **3.9** Reestructurar rutas: `/[companyId]` como segmento dinámico para todas las páginas post-selección
  - `app/(private)/layout.tsx` — solo `ProtectedRoute` (sin `AppShell`)
  - `app/(private)/(app)/layout.tsx` — `ProtectedRoute` + `AppShell`
  - `app/(private)/(app)/[companyId]/dashboard/page.tsx` — dashboard scoped a compañía
  - `AppShell` lee `companyId` de `useParams()`, prefija todos los links del sidebar
  - `Header` muestra selector de compañía con dropdown de cambio
  - `middleware.ts` redirige `/` autenticado a `/companies`
  - `useLogin.ts` redirige a `/companies` tras login
- [x] **3.10** Crear `src/use-cases/company/useCompany.ts` — hook `GET /company/:id`

---

## Fase 4: Módulo Category

> CRUD de categorías con búsqueda fuzzy.
>
> **Nota:** `Category` entity e `ICategoryRepository` ya creados en Fase 0.

- [x] **4.1** Crear `src/infrastructure/repositories/CategoryRepositoryImpl.ts`
- [x] **4.2** Crear `src/use-cases/category/useCategoryList.ts` — paginado, incluye categorías globales + propias
- [x] **4.3** Crear `src/use-cases/category/useCreateCategory.ts`
- [x] **4.4** Crear `src/use-cases/category/useUpdateCategory.ts`
- [x] **4.5** Crear `src/use-cases/category/useDeleteCategory.ts`
- [x] **4.6** Crear `src/use-cases/category/useCategorySearch.ts` — búsqueda fuzzy por nombre
- [x] **4.7** Crear `src/components/category/CategoryList/` — tabla paginada con acciones
- [x] **4.8** Crear `src/components/category/CategoryForm/` — formulario con type, flowDirection, isVariable, isCogs
- [x] **4.9** Crear `src/components/category/CategorySelect/` — dropdown con búsqueda fuzzy
- [x] **4.10** Crear `app/(private)/companies/[companyId]/categories/page.tsx`
- [x] **4.11** Crear `app/(private)/companies/[companyId]/categories/new/page.tsx`
- [x] **4.12** Crear `app/(private)/companies/[companyId]/categories/[categoryId]/edit/page.tsx`

---

## Fase 5: Módulo Item

> CRUD de productos y servicios.
>
> **Nota:** `Item` entity e `IItemRepository` ya creados en Fase 0.

- [x] **5.1** Crear `src/infrastructure/repositories/ItemRepositoryImpl.ts`
- [x] **5.2** Crear `src/use-cases/item/useItemList.ts` — con filtro por tipo (PRODUCT/SERVICE/all)
- [x] **5.3** Crear `src/use-cases/item/useCreateItem.ts` — batch create
- [x] **5.4** Crear `src/use-cases/item/useUpdateItem.ts`
- [x] **5.5** Crear `src/use-cases/item/useDeleteItem.ts`
- [x] **5.6** Crear `src/use-cases/item/useItemSearch.ts` — búsqueda fuzzy por nombre
- [x] **5.7** Crear `src/components/item/ItemList/` — tabla paginada con filtro por tipo
- [x] **5.8** Crear `src/components/item/ItemForm/` — formulario con name, type, basePrice, stockCurrent
- [x] **5.9** Crear `src/components/item/ItemTypeFilter/` — tabs o dropdown para filtrar PRODUCT/SERVICE
- [x] **5.10** Crear `app/(private)/companies/[companyId]/items/page.tsx`
- [x] **5.11** Crear `app/(private)/companies/[companyId]/items/new/page.tsx`
- [x] **5.12** Crear `app/(private)/companies/[companyId]/items/[itemId]/edit/page.tsx`

---

## Fase 6: Módulo Transaction

> CRUD de transacciones con soporte multi-moneda.
>
> **Nota:** `Transaction` entity e `ITransactionRepository` ya creados en Fase 0.

- [x] **6.1** Crear `src/infrastructure/repositories/TransactionRepositoryImpl.ts`
- [x] **6.2** Crear `src/use-cases/transaction/useTransactionList.ts` — paginado
- [x] **6.3** Crear `src/use-cases/transaction/useCreateTransaction.ts` — batch create
- [x] **6.4** Crear `src/use-cases/transaction/useUpdateTransaction.ts`
- [x] **6.5** Crear `src/use-cases/transaction/useDeleteTransaction.ts`
- [x] **6.6** Crear `src/use-cases/transaction/useTransactionByDateRange.ts`
- [x] **6.7** Crear `src/use-cases/transaction/useTransactionByDateCategory.ts`
- [x] **6.8** Crear `src/use-cases/transaction/useTransactionById.ts`
- [x] **6.9** Crear `src/components/transaction/TransactionList/` — tabla paginada con categoría, item, montos USD/Bs
- [x] **6.10** Crear `src/components/transaction/TransactionForm/` — formulario con selector de categoría (fuzzy), item, currency toggle, amount, dollarRate, paymentMethod
- [x] **6.11** Crear `src/components/transaction/TransactionFilters/` — filtros por fecha, categoría, estado
- [x] **6.12** Crear `app/(private)/(app)/[companyId]/transactions/page.tsx` — listado con CRUD inline (TransactionList + TransactionForm en drawer/modal, detalle en modal)
- [ ] **6.13** ~~Crear `app/(private)/companies/[companyId]/transactions/new/page.tsx`~~ → se hace inline en 6.12
- [ ] **6.14** ~~Crear `app/(private)/companies/[companyId]/transactions/[transactionId]/edit/page.tsx`~~ → se hace inline en 6.12
- [ ] **6.15** ~~Crear `app/(private)/companies/[companyId]/transactions/[transactionId]/page.tsx`~~ → se hace inline en 6.12

---

## Fase 7: Módulo Production Batch

> Gestión de lotes de producción con transacciones integradas.
>
> **Nota:** `ProductionBatch` entity e `IProductionBatchRepository` ya creados en Fase 0.

- [ ] **7.1** Crear `src/infrastructure/repositories/ProductionBatchRepositoryImpl.ts`
- [ ] **7.2** Crear `src/use-cases/batch/useBatchList.ts` — paginado
- [ ] **7.3** Crear `src/use-cases/batch/useBatchByProduct.ts`
- [ ] **7.4** Crear `src/use-cases/batch/useBatchById.ts`
- [ ] **7.5** Crear `src/use-cases/batch/useCreateBatch.ts` — con transacciones anidadas
- [ ] **7.6** Crear `src/use-cases/batch/useUpdateBatch.ts`
- [ ] **7.7** Crear `src/use-cases/batch/useDeleteBatch.ts`
- [ ] **7.8** Crear `src/components/batch/BatchList/` — tabla paginada con item info
- [ ] **7.9** Crear `src/components/batch/BatchForm/` — formulario con selector de producto, fechas, transacciones embebidas
- [ ] **7.10** Crear `src/components/batch/BatchDetail/` — detalle con transacciones del lote
- [ ] **7.11** Crear `app/(private)/companies/[companyId]/batches/page.tsx`
- [ ] **7.12** Crear `app/(private)/companies/[companyId]/batches/new/page.tsx`
- [ ] **7.13** Crear `app/(private)/companies/[companyId]/batches/[batchId]/page.tsx`

---

## Fase 8: Módulo Cash Flow

> Dashboard de flujo de caja.
>
> **Nota:** `ICashFlowRepository` y tipos de respuesta ya creados en Fase 0.

- [ ] **8.1** Crear `src/infrastructure/repositories/CashFlowRepositoryImpl.ts`
- [ ] **8.2** Crear `src/use-cases/cash-flow/useCashFlowTotal.ts`
- [ ] **8.3** Crear `src/use-cases/cash-flow/useCashFlowByRange.ts`
- [ ] **8.4** Crear `src/components/cash-flow/CashFlowSummary/` — cards con current_balance, pending_inflow, pending_outflow, net_cash_flow
- [ ] **8.5** Crear `src/components/cash-flow/CashFlowStatement/` — desglose por operating/investing/financing con categorías
- [ ] **8.6** Crear `src/components/cash-flow/CashFlowChart/` — gráfico de barras o dona (usando el campo `color` de categorías)
- [ ] **8.7** Crear `app/(private)/companies/[companyId]/cash-flow/page.tsx`

---

## Fase 9: Módulo Contribution Margin

> Análisis de margen de contribución.
>
> **Nota:** `IContributionMarginRepository` y tipos de respuesta ya creados en Fase 0.

- [ ] **9.1** Crear `src/infrastructure/repositories/ContributionMarginRepositoryImpl.ts`
- [ ] **9.2** Crear `src/use-cases/contribution/useContributionGlobal.ts`
- [ ] **9.3** Crear `src/use-cases/contribution/useContributionProduct.ts`
- [ ] **9.4** Crear `src/use-cases/contribution/useContributionService.ts`
- [ ] **9.5** Crear `src/use-cases/contribution/useContributionByBatch.ts`
- [ ] **9.6** Crear `src/components/contribution/ContributionCard/` — card con totalSales, totalVariableCosts, totalMargin, marginRatio (USD + Bs)
- [ ] **9.7** Crear `src/components/contribution/ContributionTable/` — tabla unit analysis por producto
- [ ] **9.8** Crear `app/(private)/companies/[companyId]/contribution-margin/page.tsx`

---

## Fase 10: Módulo Balance Point

> Punto de equilibrio.
>
> **Nota:** `IBalancePointRepository` y tipos de respuesta ya creados en Fase 0.

- [ ] **10.1** Crear `src/infrastructure/repositories/BalancePointRepositoryImpl.ts`
- [ ] **10.2** Crear `src/use-cases/balance-point/useBalancePoint.ts`
- [ ] **10.3** Crear `src/components/balance-point/BalancePointCard/` — card con financialsActual + breakEven
- [ ] **10.4** Crear `src/components/balance-point/BreakEvenChart/` — visualización de distancia al punto de equilibrio
- [ ] **10.5** Crear `app/(private)/companies/[companyId]/balance-point/page.tsx`

---

## Fase 11: Módulo Finance Chat

> Chat con IA financiera.
>
> **Nota:** `IFinanceChatRepository` y tipos de respuesta ya creados en Fase 0.

- [ ] **11.1** Crear `src/infrastructure/repositories/FinanceChatRepositoryImpl.ts`
- [ ] **11.2** Crear `src/use-cases/finance-chat/useFinanceChat.ts` — hook con historial de mensajes
- [ ] **11.3** Crear `src/components/finance-chat/ChatWidget/` — widget flotante o página completa
- [ ] **11.4** Crear `src/components/finance-chat/ChatMessage/` — burbuja de mensaje (usuario vs IA), renderizado markdown
- [ ] **11.5** Crear `app/(private)/companies/[companyId]/finance-chat/page.tsx`

---

## Fase 12: Módulo Gross Profit (Utilidad Bruta)

> Análisis de utilidad bruta (Ventas - COGS).

- [ ] **12.1** Crear `src/infrastructure/repositories/GrossProfitRepositoryImpl.ts`
- [ ] **12.2** Crear `src/use-cases/gross-profit/useGrossProfitGlobal.ts`
- [ ] **12.3** Crear `src/use-cases/gross-profit/useGrossProfitProduct.ts`
- [ ] **12.4** Crear `src/use-cases/gross-profit/useGrossProfitService.ts`
- [ ] **12.5** Crear `src/components/gross-profit/GrossProfitCard/` — card con totalSales, totalCogs, grossProfit, grossMargin (USD + Bs)
- [ ] **12.6** Crear `src/components/gross-profit/GrossProfitTable/` — desglose por producto/servicio
- [ ] **12.7** Crear `app/(private)/companies/[companyId]/gross-profit/page.tsx`

---

## Fase 13: Módulo Net Profit / P&L

> Análisis de utilidad neta y estado de resultados.

- [ ] **13.1** Crear `src/infrastructure/repositories/NetProfitRepositoryImpl.ts`
- [ ] **13.2** Crear `src/use-cases/net-profit/useNetProfit.ts`
- [ ] **13.3** Crear `src/use-cases/net-profit/useNetProfitStatement.ts`
- [ ] **13.4** Crear `src/components/net-profit/NetProfitCard/` — card con grossProfit, operatingExpenses, netProfit, netMargin
- [ ] **13.5** Crear `src/components/net-profit/ProfitLossStatement/` — P&L estructurado por CategoryType
- [ ] **13.6** Crear `app/(private)/companies/[companyId]/net-profit/page.tsx`

---

## Fase 14: Módulo Unit Cost (Costo Unitario)

> Cálculo de costo unitario por lote, producto y servicio.

- [ ] **14.1** Crear `src/infrastructure/repositories/UnitCostRepositoryImpl.ts`
- [ ] **14.2** Crear `src/use-cases/unit-cost/useUnitCostByBatch.ts`
- [ ] **14.3** Crear `src/use-cases/unit-cost/useUnitCostByProduct.ts`
- [ ] **14.4** Crear `src/use-cases/unit-cost/useUnitCostByService.ts`
- [ ] **14.5** Crear `src/components/unit-cost/UnitCostCard/` — card con totalCost, quantity, unitCost, currency
- [ ] **14.6** Crear `src/components/unit-cost/UnitCostTable/` — comparativa por lotes o productos
- [ ] **14.7** Crear `app/(private)/companies/[companyId]/unit-cost/page.tsx`

---

## Fase 15: Módulo Price Margin (Precio con Margen)

> Calculadora de precio de venta objetivo basado en margen.

- [ ] **15.1** Crear `src/infrastructure/repositories/PriceMarginRepositoryImpl.ts`
- [ ] **15.2** Crear `src/use-cases/price-margin/usePriceMargin.ts`
- [ ] **15.3** Crear `src/components/price-margin/PriceMarginForm/` — formulario con selector de item y targetMarginPercent
- [ ] **15.4** Crear `src/components/price-margin/PriceMarginResult/` — card con unitCost, targetMargin, suggestedPrice
- [ ] **15.5** Crear `app/(private)/companies/[companyId]/price-margin/page.tsx`

---

## Fase 16: Modulo MCP (AI Tools)

> Integración SSE para herramientas externas de IA.

- [ ] **16.1** Crear `src/infrastructure/api/mcpClient.ts` — cliente SSE para `GET /mcp/sse/:companyId`
- [ ] **16.2** Crear `src/infrastructure/api/mcpMessages.ts` — POST mensajes JSON-RPC a `/mcp/messages`
- [ ] **16.3** (Opcional) Crear componente de prueba SSE en `src/components/shared/SSETester/`

---

## Fase 17: Cross-Cutting Concerns

> Funcionalidades que aplican a todos los módulos.

- [ ] **17.1** Implementar `handleApiError` — helper que parsea errores del backend y los tipifica para la UI
- [ ] **17.2** Implementar manejo de rate limiting (429) — mostrar mensaje "Demasiadas solicitudes" con cuenta regresiva
- [ ] **17.3** Implementar manejo global de 401 (sesión expirada) — redirigir a `/login`
- [ ] **17.4** Implementar pantalla de "Cuenta suspendida" — detectar mensaje específico del backend
- [ ] **17.5** Implementar paginación reutilizable en todos los listados (usar `<Pagination>` shared component)
- [ ] **17.6** Implementar estados de carga (skeleton) en todas las pantallas
- [ ] **17.7** Implementar estados vacíos ("No hay datos") en todas las pantallas
- [ ] **17.8** Implementar selector de rango de fechas reutilizable (`src/components/shared/DateRangePicker/`)
- [ ] **17.9** Implementar actualización de `dollarRate` (tasa del día) — campo editable en formularios de transacción
- [ ] **17.10** Implementar navegación lateral con los módulos disponibles por compañía

---

## Fase 18: Feature Flags de SPEC.md Pendientes

> Funcionalidades documentadas en SPEC.md como "pendientes en el backend". Se implementan cuando el backend las exponga.

- [ ] **18.1** Admin module — esperar endpoints de backend
- [ ] **18.2** Escaneo de Facturas OCR
- [ ] **18.3** Notificaciones
- [ ] **18.4** Sistema de Pagos (Stripe/PayPal)
- [ ] **18.5** Reportes PDF/Excel/Chart
- [ ] **18.6** Suscripciones y Planes
