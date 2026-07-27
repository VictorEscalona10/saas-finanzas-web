# DESIGN.md — Arquitectura Técnica

> **Proyecto:** saas-finanzas-web
> **Metodología:** Spec-Driven Development (SDD) + Clean Architecture
> **Framework:** Next.js 16 (App Router) + React 19
> **Estilo:** Tailwind CSS v4 — configuración en `app/globals.css` vía `@theme inline`
> **Path alias:** `@/*` → raíz del proyecto

---

## 1. Arquitectura en Capas (Clean Architecture)

```
src/
├── domain/              ← Capa más interna — 0 dependencias externas
│   ├── entities/        ← Interfaces del negocio (User, Company, Category, Item, Transaction, ProductionBatch)
│   ├── repositories/    ← Interfaces abstractas (ICategoryRepository, ITransactionRepository, IGrossProfitRepository, etc.)
│   └── rules/           ← Funciones de regla de negocio puras (cálculo multi-moneda, punto de equilibrio, etc.)
│
├── infrastructure/      ← Implementaciones concretas de las interfaces definidas en domain/
│   ├── api/             ← Cliente HTTP (Axios) configurado con interceptors para JWT
│   ├── supabase/        ← Clientes Supabase (browser, server, middleware)
│   └── repositories/    ← Implementaciones: CategoryRepositoryImpl, TransactionRepositoryImpl, etc.
│
├── use-cases/           ← React hooks que orquestan la lógica de negocio por feature
│   ├── auth/            ← useLogin, useRegister, useLogout, useSession
│   ├── company/         ← useCreateCompany, useMyCompanies, useUpdateCompany
│   ├── category/        ← useCategoryList, useCreateCategory, useDeleteCategory, useUpdateCategory
│   ├── item/            ← useItemList, useCreateItem, useUpdateItem, useDeleteItem
│   ├── transaction/     ← useTransactionList, useCreateTransaction, useUpdateTransaction
│   ├── batch/           ← useBatchList, useCreateBatch, useUpdateBatch
│   ├── cash-flow/       ← useCashFlowTotal, useCashFlowByRange
│   ├── contribution/    ← useContributionGlobal, useContributionProduct, useContributionService
│   ├── gross-profit/    ← useGrossProfitGlobal, useGrossProfitProduct, useGrossProfitService
│   ├── net-profit/       ← useNetProfit, useNetProfitStatement
│   ├── unit-cost/        ← useUnitCostByBatch, useUnitCostByProduct, useUnitCostByService
│   ├── price-margin/     ← usePriceMargin
│   ├── balance-point/   ← useBalancePoint
│   ├── dashboard/        ← useDashboard
│   └── finance-chat/    ← useFinanceChat
│
├── components/          ← UI pura (presentación), cada componente en su propio directorio
│   ├── layout/          ← AppShell, Sidebar, Header, ProtectedRoute
│   ├── auth/            ← LoginForm, RegisterForm, ProfileCard
│   ├── company/         ← CompanySelector, CompanyForm
│   ├── category/        ← CategoryList, CategoryForm, CategorySelect
│   ├── item/            ← ItemList, ItemForm, ItemTypeFilter
│   ├── transaction/     ← TransactionList, TransactionForm, TransactionFilters
│   ├── batch/           ← BatchList, BatchForm, BatchDetail
│   ├── cash-flow/       ← CashFlowSummary, CashFlowChart, CashFlowStatement
│   ├── contribution/    ← ContributionCard, ContributionTable
│   ├── gross-profit/    ← GrossProfitCard, GrossProfitTable
│   ├── net-profit/       ← NetProfitCard, ProfitLossStatement
│   ├── unit-cost/        ← UnitCostCard, UnitCostTable
│   ├── price-margin/     ← PriceMarginForm, PriceMarginResult
│   ├── balance-point/   ← BalancePointCard, BreakEvenChart
│   ├── dashboard/        ← DashboardScreen (KPI cards, chart, transactions)
│   ├── finance-chat/    ← ChatWidget, ChatMessage
│   └── shared/          ← Button, Input, Modal, Pagination, Skeleton, Badge, DataTable
│
├── shared/              ← Utilidades transversales
│   ├── types/           ← Tipos compartidos (enum aliados de SPEC.md Appendix A)
│   ├── constants/       ← API_BASE_URL, RATE_LIMITS, PAYMENT_METHODS
│   └── utils/           ← dateUtils, numberUtils (decimal.js helpers), errorParser
│
├── middleware.ts         ← Next.js middleware — refresh automático de sesión Supabase
│
└── app/                 ← Next.js App Router — solo enrutamiento ("dumb pages")
    ├── (public)/        ← /login, /register, /forgot-password
    ├── (private)/       ← /dashboard, /companies/:id/categories, /companies/:id/transactions, etc.
    ├── layout.tsx       ← Root layout (Geist font, globals.css)
    └── page.tsx         ← Landing / redirect
```

### 1.1 Regla de Dependencias

> Las dependencias SOLO apuntan hacia adentro:
> `components → use-cases → infrastructure → domain`

Prohibiciones:
- ❌ `components/` → importa directamente de `infrastructure/`
- ❌ `use-cases/` → importa de `components/`
- ❌ `domain/` → importa de cualquier otra capa

### 1.2 Capa de Dominio (`src/domain/`)

Contrato puro TypeScript. Sin librerías externas, sin React, sin side effects.

**Entities** — interfaces que modelan los datos del negocio:

```typescript
// src/domain/entities/User.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  tokenBalance: number;
  isSuspended: boolean;
  createdAt: string;
}

// src/domain/entities/Transaction.ts
export interface Transaction {
  id: string;
  companyId: string;
  categoryId: string;
  itemId?: string | null;
  batchId?: string | null;
  costItemId?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  dollarRate: number;
  amountUSD: number;
  amountBs: number;
  stockEffect?: 'INCREMENT' | 'DECREMENT' | 'NONE' | null;
  status: 'PENDING' | 'COMPLETED';
  paymentMethod: PaymentMethod;
  currency: 'BOLIVARES' | 'DOLARES';
  paymentReference?: string | null;
  description?: string | null;
  paymentDate?: string | null;
  isRemoved: boolean;
  createdAt: string;
}
```

**Repositories** — interfaces que definen las operaciones de datos:

```typescript
// src/domain/repositories/ICategoryRepository.ts
export interface ICategoryRepository {
  list(companyId: string, page?: number, limit?: number): Promise<PaginatedResult<Category>>;
  create(companyId: string, data: CreateCategoryDto): Promise<Category>;
  update(companyId: string, categoryId: string, data: UpdateCategoryDto): Promise<Category>;
  delete(companyId: string, categoryId: string): Promise<void>;
  getByName(name: string, companyId: string): Promise<FuzzySearchResult<Category>>;
}
```

**Business Rules** — funciones puras sin side effects:

```typescript
// src/domain/rules/currency.ts
export function calculateComplementaryAmount(
  amount: number,
  dollarRate: number,
  currency: 'BOLIVARES' | 'DOLARES'
): { amountUSD: number; amountBs: number } {
  if (currency === 'DOLARES') {
    return { amountUSD: amount, amountBs: amount * dollarRate };
  }
  return { amountUSD: amount / dollarRate, amountBs: amount };
}
```

### 1.3 Capa de Infraestructura (`src/infrastructure/`)

**API Client** — Axios con interceptors que inyectan el JWT de Supabase:

```typescript
// src/infrastructure/api/apiClient.ts
import axios from 'axios';
import { createServerClient } from '@/infrastructure/supabase/server';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  // Server-side: inyecta token desde cookies httpOnly
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});
```

**Supabase Clients** — tres variantes según el contexto:

| Contexto | Cliente | Archivo |
|----------|---------|---------|
| Server Components / Route Handlers | `createServerClient(cookies)` | `infrastructure/supabase/server.ts` |
| Client Components | `createBrowserClient()` | `infrastructure/supabase/browser.ts` |
| Middleware | `createMiddlewareClient(req, res)` | `infrastructure/supabase/middleware.ts` |

**Implementaciones de Repositorios** — cada una inyecta `apiClient` y tipa requests/responses:

```
infrastructure/repositories/
├── CategoryRepositoryImpl.ts
├── ItemRepositoryImpl.ts
├── TransactionRepositoryImpl.ts
├── ProductionBatchRepositoryImpl.ts
├── CompanyRepositoryImpl.ts
├── CashFlowRepositoryImpl.ts
├── ContributionMarginRepositoryImpl.ts
├── GrossProfitRepositoryImpl.ts
├── NetProfitRepositoryImpl.ts
├── UnitCostRepositoryImpl.ts
├── PriceMarginRepositoryImpl.ts
├── BalancePointRepositoryImpl.ts
├── DashboardRepositoryImpl.ts
└── FinanceChatRepositoryImpl.ts
```

### 1.4 Capa de Casos de Uso (`src/use-cases/`)

Custom hooks de React que:
1. Reciben parámetros del componente
2. Llaman al repositorio correspondiente
3. Transforman datos si es necesario
4. Retornan `{ data, isLoading, error, refetch, mutate }`

Cada hook cumple el formato:

```typescript
// src/use-cases/category/useCategoryList.ts
export function useCategoryList(companyId: string, page?: number) {
  const [data, setData] = useState<PaginatedResult<Category> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const repo = new CategoryRepositoryImpl();
    repo.list(companyId, page)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [companyId, page]);

  return { data, isLoading, error };
}
```

### 1.5 Capa de Presentación (`src/components/`)

**Component Folder Rule** — cada componente en su propio directorio:

> **Inline CRUD:** Para los módulos **Item**, **Category** y **Transaction**, la creación, edición y detalle se hace **inline** en la misma página (`page.tsx`) mediante un drawer/modal, NO en rutas separadas `new/`, `[id]/edit/` ni `[id]/`. Esto aplica a:
- `ItemForm` + `ItemDrawer` (items)
- `CategoryDrawer` (categorías)
- `TransactionForm` + `TransactionDrawer` + `TransactionDetailDrawer` (transacciones)

```
components/transaction/
├── TransactionList/
│   ├── TransactionList.tsx
│   ├── TransactionList.css
│   └── index.ts
├── TransactionForm/
│   ├── TransactionForm.tsx
│   ├── TransactionForm.css
│   └── index.ts
└── TransactionFilters/
    ├── TransactionFilters.tsx
    ├── TransactionFilters.css
    └── index.ts
```

Reglas:
- ❌ Prohibido `style={{}}` inline (excepto valores dinámicos simples)
- ❌ Prohibido importar CSS de otro componente
- ✅ Usar BEM en los nombres de clase CSS
- ✅ Cada componente exporta por defecto desde `index.ts`

### 1.6 Input Conventions — Reverse Currency Mask

> **Todos los inputs donde se ingrese un monto en bolívares (Bs) o dólares (USD/USD$) DEBEN usar el patrón Reverse Currency Mask.**

Este patrón permite al usuario escribir solo dígitos (se ignoran caracteres no numéricos) y automáticamente se formatea el valor con 2 decimales, donde los últimos 2 dígitos ingresados representan los céntimos.

**Implementación:**

```typescript
// Estado interno: string de dígitos que representa centésimas
const [rawValue, setRawValue] = useState('');

// Handler: filtra solo dígitos
const handleChange = (value: string) => {
  setRawValue(value.replace(/\D/g, ''));
};

// Display: divide entre 100 y formatea con 2 decimales
const displayValue = rawValue
  ? new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseInt(rawValue, 10) / 100)
  : '';

// Valor real (numérico) para enviar al backend
const numericValue = rawValue ? parseInt(rawValue, 10) / 100 : 0;
```

**Reglas:**

- ✅ El `<input>` debe tener `type="text"` e `inputMode="numeric"`
- ✅ El display formateado se renderiza como `value` del input; el raw state y la conversión numérica se derivan por separado
- ✅ Debe mostrarse un prefijo visual (`Bs` o `$`) pegado al input cuando el contexto lo requiera
- ❌ No usar `type="number"` para montos con este patrón (el teclado móvil lo soporta via `inputMode`)
- ❌ No usar `step`, `min`, `max` en inputs de monto

**Referencia de implementación existente:**
- `src/components/item/ItemForm/ItemForm.tsx` — `rawPrice` / `displayPrice` / `handlePriceChange`
- `src/components/dollar/DollarRateScreen/DollarRateScreen.tsx` — `rawRate` / `displayRate` / `handleRateChange`

**Ejemplo de UI:**

```
┌──────────────────────┐
│ $            1.250,00 │
│ Bs           2.500,00 │
└──────────────────────┘
```

### 1.7 Middleware (`src/middleware.ts`)

El middleware de Next.js se encarga del refresh automático de la sesión de Supabase en cada request:

```typescript
import { createMiddlewareClient } from '@/infrastructure/supabase/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient(req, res);
  const { data: { session } } = await supabase.auth.getSession();

  const isPublic = PUBLIC_ROUTES.some(route => req.nextUrl.pathname.startsWith(route));

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (session && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 2. Flujo de Autenticación

```
[Browser]
    │
    ▼
[Middleware] createMiddlewareClient()
    │  refresca token si expiró
    │  redirige /login si no hay sesión
    ▼
[Server Component / Route Handler]
    │  createServerClient(cookies)
    │  lee session.access_token
    ▼
[Axios Interceptor]
    │  inyecta Authorization: Bearer <token>
    ▼
[NestJS Backend :3001]
    │  Passport JWT Strategy valida token (ES256)
    │  JwtAuthGuard rechaza si suspendido
    ▼
[Response]
```

Login se hace desde un Route Handler de Next.js:

```
POST /api/auth/login
  → supabase.auth.signInWithPassword({ email, password })
  → @supabase/ssr almacena en httpOnly cookies
  → redirect a /dashboard
```

El frontend NUNCA llama a `POST /auth/login` del backend.

---

## 3. Módulos Financieros y sus Endpoints

| Módulo | Endpoints | Capa de dominio | Capa de uso |
|--------|-----------|-----------------|-------------|
| Auth | Supabase SSR + POST /auth/register + GET /auth/profile | `User` entity | `useAuth` |
| Company | POST, PATCH, GET (list, byId) | `Company` entity | `useCompany` |
| Category | POST, GET, DELETE, PATCH, fuzzy search | `Category` entity, `FlowDirection` | `useCategory` |
| Item | POST, PATCH, GET, DELETE, fuzzy, filtros | `Item` entity, `ItemType` | `useItem` |
| Transaction | POST (batch), PATCH, GET, DELETE, date/category filters | `Transaction` entity, `PaymentMethod` | `useTransaction` |
| Production Batch | POST, PATCH, GET (all/by-product/by-id), DELETE | `ProductionBatch` entity | `useBatch` |
| Dashboard | GET /dashboard/:companyId | `DashboardResponse` | `useDashboard` |
| Cash Flow | GET total, GET by range | `CashFlowStatement`, `CashFlowSummary` | `useCashFlow` |
| Contribution Margin | GET global, product, batch, service | `ContributionMargin`, `UnitAnalysis` | `useContribution` |
| Gross Profit | GET global, product, service | `GrossProfitStatement`, `GrossProfitSummary` | `useGrossProfit` |
| Net Profit / P&L | GET, GET statement | `NetProfitStatement`, `ProfitLossReport` | `useNetProfit` |
| Unit Cost | GET batch, product, service | `UnitCostResult` | `useUnitCost` |
| Price Margin | POST margin-target | `PriceMarginResult` | `usePriceMargin` |
| Balance Point | GET | `BreakEven`, `FinancialsActual` | `useBalancePoint` |
| Finance Chat | POST ask | `ChatRequest`, `ChatResponse` | `useFinanceChat` |
| MCP (AI Tools) | GET SSE, POST messages | — (infra pura) | — |

---

## 4. Multi-Moneda — Regla de Negocio Central

Toda transacción almacena **ambos montos**. El backend recibe:

```typescript
{
  currency: 'DOLARES' | 'BOLIVARES',
  amount: number,
  dollarRate: number
}
```

Y calcula:

| currency | amountUSD | amountBs |
|----------|-----------|----------|
| `DOLARES` | = `amount` | = `amount * dollarRate` |
| `BOLIVARES` | = `amount / dollarRate` | = `amount` |

La función `calculateComplementaryAmount` en `domain/rules/currency.ts` es la fuente de verdad de este cálculo. Se puede usar tanto en frontend (previsualización) como en tests unitarios.

---

## 5. Manejo de Errores

El frontend debe mapear códigos de estado HTTP a respuestas de UI:

| HTTP | UI Action |
|------|-----------|
| 400 | Mostrar errores de validación en el formulario |
| 401 | Si "Cuenta suspendida": pantalla de bloqueo. Si "Unauthorized": redirigir a /login |
| 403 | Mostrar "No tienes acceso" |
| 404 | Mostrar "Recurso no encontrado" |
| 429 | Mostrar "Demasiadas solicitudes, intenta en 60 segundos" + retry automático |
| 500 | Mostrar "Error inesperado" + botón de reintentar |

Implementación en `use-cases/` via un helper `handleApiError` que parsea `AxiosError` y retorna objetos tipados.
