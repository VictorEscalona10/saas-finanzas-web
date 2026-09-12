# SaaS Finanzas API — Frontend Specification

> **Metodología:** SDD (Specification-Driven Development)
> **Propósito:** Contrato técnico para construir el frontend Next.js
> **Backend:** NestJS v11 + Prisma v7.8 + PostgreSQL (Supabase)
> **Base URL:** `http://localhost:3001`

---

## Tabla de Contenido

1. [Autenticación](#1-autenticación)
2. [Endpoints por Módulo](#2-endpoints-por-módulo)
   - [2.1 Health](#21-health)
   - [2.2 Auth](#22-auth)
   - [2.3 Company](#23-company)
   - [2.4 Category](#24-category)
   - [2.5 Item](#25-item)
   - [2.6 Transaction](#26-transaction)
   - [2.7 Production Batch](#27-production-batch)
   - [2.8 Cash Flow](#28-cash-flow)
    - [2.8 Cost Item](#28-cost-item)
    - [2.9 Contribution Margin](#29-contribution-margin)
    - [2.10 Balance Point](#210-balance-point)
    - [2.11 Finance Chat](#211-finance-chat)
    - [2.12 MCP (AI Tools)](#212-mcp-ai-tools)
3. [Modelos de Datos](#3-modelos-de-datos)
4. [Reglas de Negocio](#4-reglas-de-negocio)
5. [Manejo de Errores](#5-manejo-de-errores)
6. [Headers Globales](#6-headers-globales)
7. [Estado de Implementación](#7-estado-de-implementación)
8. [Normas de Frontend — Prevención de Deuda Técnica](#8-normas-de-frontend--prevención-de-deuda-técnica)

---

## 1. Autenticación

La autenticación se maneja **100% desde el frontend** usando `@supabase/ssr` + `@supabase/supabase-js`. El backend nunca recibe credenciales del usuario — solo valida el JWT que el frontend le envía.

### Arquitectura

```
Browser
  ↓  never sees tokens (httpOnly cookies)
Next.js Middleware (@supabase/ssr)
  ↓  refresca automáticamente si expiró
Next.js Route Handler / Server Component
  ↓  inyecta Authorization: Bearer <token>
Backend (Passport JWT Strategy) — valida token, 0 cambios
```

### Roles de cada parte

| Capa | Responsabilidad |
|------|----------------|
| **`@supabase/ssr` (middleware + server)** | Login con `signInWithPassword()`, almacena tokens en httpOnly cookies, refresh automático en cada request |
| **Backend `POST /auth/register`** | Crea usuario en Supabase Auth + replica en DB local (necesario para `JwtAuthGuard`) |
| **Backend (demás endpoints)** | Validan JWT con su propia estrategia Passport (ES256 via jwk-to-pem). No les importa cómo se obtuvo el token |

### Cómo funciona el Login

1. Usuario ingresa email + password en el formulario de login.
2. El formulario llama a `supabase.auth.signInWithPassword({ email, password })` **desde un Server Component o Route Handler de Next.js**.
3. `@supabase/ssr` recibe la session (`access_token` + `refresh_token`) y la almacena en **httpOnly cookies**.
4. El JavaScript del navegador **nunca ve los tokens**.

### Cómo funciona el Refresh Automático

En el `middleware.ts` de Next.js, en cada request:

```typescript
const supabase = createMiddlewareClient(req, res)
const { data: { session } } = await supabase.auth.getSession()
// Si el access_token expiró, @supabase/ssr usa el refresh_token
// para obtener uno nuevo — todo server-side, el navegador no se entera
```

### Cómo se envía el Token al Backend

Cada llamada a un endpoint del backend pasa por un Server Component o Route Handler que inyecta el header:

```typescript
const supabase = createServerClient(cookies)
const { data: { session } } = await supabase.auth.getSession()

fetch('http://localhost:3000/company/my-companies', {
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
})
```

### Endpoints Públicos del Backend (sin token)

| Endpoint | Motivo |
|----------|--------|
| `GET /` | Health check |
| `POST /auth/register` | Registro (necesita sincronizar DB local) |

**Nota:** El login (`POST /auth/login`) existe en el backend como endpoint público, pero el frontend **no lo usa**. El login se hace directamente con `@supabase/ssr`.

### Token Storage

**httpOnly cookies** manejadas por `@supabase/ssr`:
- `sb-<project>-auth-token`: access_token
- `sb-<project>-auth-token-code-verifier`: PKCE code verifier

Ambas son **httpOnly, Secure, SameSite=Lax**. Inaccesibles desde JavaScript.

### Suspensión de Cuenta

El backend chequea `User.isSuspended` en cada request (vía `JwtAuthGuard` global). Si el usuario está suspendido, todas las respuestas devuelven:

```json
{
  "statusCode": 401,
  "message": "Cuenta suspendida. No puedes realizar esta acción."
}
```

### Comparativa con el enfoque anterior

| Aspecto | Antes (viejo spec) | Ahora |
|---------|-------------------|-------|
| Login | `POST /auth/login` del backend | `supabase.auth.signInWithPassword()` vía `@supabase/ssr` |
| Dónde vive el token | localStorage/memory | httpOnly cookie (inaccesible para JS) |
| Refresh | No existía | Automático en middleware (server-side) |
| Cambios en backend | — | **0 cambios** |
| Seguridad XSS | Vulnerable si hay XSS | ✅ Inmune |

---

## 2. Endpoints por Módulo

### Convenciones

- **Auth global**: `JwtAuthGuard` protege **todos los endpoints por defecto** (vía `APP_GUARD`).
- **`@Public()`**: Endpoints que NO requieren autenticación.
- **`ValidateCompanyGuard`**: Endpoints que requieren ownership de compañía + verificación de que no esté suspendida.
- **Rate limiting global**: 120 requests / 60 segundos.
- **Paginación**: Endpoints de listado aceptan `?page=1&limit=50` (max 500).
- **Formato de fechas**: ISO 8601 (`YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss.sssZ`).
- **Soft deletes**: Todos los recursos usan `isRemoved` — no se eliminan físicamente.

---

### 2.1 Health

#### `GET /`

Público. Health check del servidor.

**Response:**
```
Hello World!
```

---

### 2.2 Auth

> El login NO se hace contra el backend. Se hace directamente con `@supabase/ssr` en el frontend (ver sección 1).

#### `POST /auth/register`

**Auth:** `@Public()` | **Throttle:** 5 req/60s

Este endpoint se usa **solo para registro**. Crea el usuario en Supabase Auth y replica el registro en la DB local (necesario para `JwtAuthGuard`, ownership de compañías, etc.).

**Request body:**
```typescript
{
  name: string;            // min 3, max 50
  email: string;           // email válido
  password: string;        // min 8, must: mayúscula + minúscula + número/special
  repeat_password: string; // debe coincidir con password
}
```

**Response (success — usuario creado con sesión):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response (success — requiere confirmación de email):**
```json
{
  "message": "CONFIRM_EMAIL_REQUIRED",
  "description": "Se ha enviado un enlace de confirmación a tu correo electrónico."
}
```

**Response (error — validación):**
```json
{
  "statusCode": 400,
  "message": ["name must be longer than or equal to 3 characters", "password must match regex ..."],
  "error": "Bad Request"
}
```

**Response (error — email duplicado):**
```json
{
  "statusCode": 409,
  "message": "El correo ya está registrado",
  "error": "Conflict"
}
```

---

#### `GET /auth/profile`

**Auth:** Requiere JWT

**Headers:** `Authorization: Bearer <token>` (inyectado por el middleware de Next.js)

Devuelve los datos del usuario autenticado desde el payload del JWT. El frontend ya tiene esta información desde `session.user` de Supabase — este endpoint es útil para verificar que el token es válido contra el backend.

**Response (success):**
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "name": "John Doe"
}
```

---

### 2.3 Company

#### `POST /company/create`

**Auth:** Requiere JWT | **Throttle:** 10 req/60s

**Request body:**
```typescript
{
  name: string; // min 3, max 100
}
```

**Response (success):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "name": "Mi Empresa",
  "isSuspended": false,
  "isRemoved": false,
  "createdAt": "2026-06-05T12:00:00.000Z"
}
```

---

#### `PATCH /company/update/:id`

**Auth:** JWT + ValidateCompanyGuard

**Route params:** `id` = company UUID

**Request body:** `{ "name": "Nuevo Nombre" }` (same shape as create)

**Response:** Company object actualizado.

---

#### `GET /company/my-companies`

**Auth:** Requiere JWT

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "Mi Empresa",
    "isSuspended": false,
    "isRemoved": false,
    "createdAt": "2026-06-05T12:00:00.000Z"
  }
]
```

---

#### `GET /company/:id`

**Auth:** JWT + ValidateCompanyGuard

**Route params:** `id` = company UUID

**Response:** Company object individual.

---

### 2.4 Category

Base: `/category`
Auth: **Todos** requieren JWT + ValidateCompanyGuard

#### `POST /category/create/:companyId`

**Throttle:** 30 req/60s

**Request body:**
```typescript
{
  name: string;              // min 3, max 100
  type: 'OPERATING' | 'INVESTING' | 'FINANCING';
  flowDirection: 'INFLOW' | 'OUTFLOW';
  isVariable?: boolean;      // default false
  isCogs: boolean;           // ¿Es costo de venta?
  isDirectCost?: boolean;    // default false. Solo aplica si flowDirection=OUTFLOW e isCogs=true
}
```

**Response:** Category object creado.

---

#### `GET /category/list/:companyId`

**Query params:** `?page=1&limit=50`

**Response (paginated):**
```json
{
  "data": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "name": "Ventas",
      "type": "OPERATING",
      "flowDirection": "INFLOW",
      "isCogs": false,
      "isVariable": false,
      "isDirectCost": false,
      "isDefault": false,
      "isRemoved": false,
      "createdAt": "2026-06-05T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  }
}
```

**Nota:** Incluye categorías globales (`isDefault: true`, `companyId: null`) además de las propias de la compañía.

---

#### `POST /category/delete/:companyId/:categoryId`

Soft delete (marca `isRemoved: true`).

---

#### `POST /category/update/:companyId/:categoryId`

**Request body:** same as create.

---

#### `GET /category/get-by-name/:name/:companyId`

**Route params:** `name` (string, min 1) y `companyId` (UUID)

**Response (búsqueda fuzzy):**
```json
{
  "success": true,
  "dataSource": "fuzzy",
  "searchTerm": "vent",
  "count": 1,
  "categories": [
    {
      "id": "uuid",
      "name": "Ventas",
      "type": "OPERATING",
      "flowDirection": "INFLOW",
      "isCogs": false,
      "isDirectCost": false,
      "isDefault": false
    }
  ]
}
```

---

### 2.5 Item

Base: `/item`
Auth: **Todos** requieren JWT + ValidateCompanyGuard

#### `POST /item/create/:companyId`

**Throttle:** 30 req/60s

**Request body:** Array de items (batch create)
```typescript
[
  {
    name: string;        // min 3, max 100
    type: 'PRODUCT' | 'SERVICE';
    basePrice: number;   // >= 0
    stockCurrent?: number; // >= 0, default 0
  }
]
```

**Response:**
```json
{
  "count": 3
}
```

---

#### `PATCH /item/update/:itemId/:companyId`

**Request body** (all optional):
```typescript
{
  name?: string;
  type?: 'PRODUCT' | 'SERVICE';
  basePrice?: number;
  stockCurrent?: number;
}
```

---

#### `GET /item/get-all/:companyId`

**Query:** `?page=1&limit=50`

**Response (paginated):**
```json
{
  "data": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "name": "Harina PAN",
      "type": "PRODUCT",
      "basePrice": 4.50,
      "stockCurrent": 100,
      "isRemoved": false,
      "createdAt": "2026-06-05T12:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 1, "totalPages": 1 }
}
```

---

#### `DELETE /item/delete/:itemId/:companyId`

Soft delete.

---

#### `GET /item/get-by-name/:name/:companyId`

**Route params:** `name` (min 1), `companyId` (UUID)

**Response (fuzzy):**
```json
{
  "success": true,
  "dataSource": "prisma",
  "searchTerm": "hari",
  "count": 1,
  "items": [
    {
      "id": "uuid",
      "name": "Harina PAN",
      "type": "PRODUCT",
      "basePrice": 4.50,
      "stockCurrent": 100
    }
  ]
}
```

---

#### `GET /item/get-all-products/:companyId`

Filtrado a `type: 'PRODUCT'`. Paginado.

#### `GET /item/get-all-services/:companyId`

Filtrado a `type: 'SERVICE'`. Paginado.

---

### 2.6 Transaction

Base: `/transaction`
Auth: **Todos** requieren JWT + ValidateCompanyGuard

#### `POST /transaction/create/:companyId`

**Throttle:** 20 req/60s

**Request body:** Array de transacciones (batch create)
```typescript
[
  {
    categoryId: string;              // UUID, obligatorio
    itemId?: string;                 // UUID, opcional — item/servicio asociado
    batchId?: string;                // UUID, opcional — lote de producción
    costItemId?: string;             // UUID, opcional — costo directo asociado (cuando category.isDirectCost=true)
    quantity?: number;               // opcional — para items tipo PRODUCT
    unitPrice?: number;              // opcional — precio unitario USD
    amountUSD: number;               // obligatorio — monto en dólares
    amountBs: number;                // obligatorio — monto en bolívares (backend calcula si se envía currency)
    dollarRate: number;              // obligatorio — tasa del día
    status: 'PENDING' | 'COMPLETED';
    paymentMethod: PaymentMethod;    // ver enum abajo
    currency: 'BOLIVARES' | 'DOLARES';
    paymentReference?: string;       // min 4, solo dígitos
    description?: string;            // min 3, max 100
    paymentDate?: string;            // ISO date string
    stockEffect?: 'INCREMENT' | 'DECREMENT' | 'NONE';  // opcional — efecto en inventario
  }
]
```

**`PaymentMethod` enum:**
| Valor | Significado |
|-------|-------------|
| `PAGO_MOVIL` | Pago Móvil |
| `TARJETA_DEBITO_CREDITO_PUNTO_VENTA` | Tarjeta Débito/Crédito / Punto de Venta |
| `TRANSFERENCIA_BANCARIA_NACIONAL` | Transferencia Bancaria Nacional |
| `EFECTIVO_BOLIVARES` | Efectivo en Bolívares |
| `EFECTIVO_DIVISAS` | Efectivo en Divisas |
| `TRANSFERENCIAS_INTERNACIONALES_DIRECTAS` | Transferencias Internacionales |
| `BILLETERAS_ELECTRONICAS_PROCESADORES` | Billeteras Electrónicas / Procesadores |
| `CRIPTOMONEDAS` | Criptomonedas |

**Response:** Array de transacciones creadas (con `category`, `item`, `batch` incluidos).

---

#### `GET /transaction/get-all/:companyId`

**Query:** `?page=1&limit=50`

**Response (paginated):**
```json
{
  "data": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "categoryId": "uuid",
      "itemId": "uuid",
      "batchId": null,
      "costItemId": null,
      "quantity": 10,
      "unitPrice": 4.50,
      "dollarRate": 80.50,
      "amountUSD": 45.00,
      "amountBs": 3622.50,
      "stockEffect": "DECREMENT",
      "status": "COMPLETED",
      "paymentMethod": "EFECTIVO_DIVISAS",
      "currency": "DOLARES",
      "paymentReference": null,
      "description": "Compra de harina",
      "paymentDate": "2026-06-05T00:00:00.000Z",
      "isRemoved": false,
      "createdAt": "2026-06-05T12:00:00.000Z",
      "category": { ... },
      "item": { ... },
      "costItem": null,
      "batch": null
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 1, "totalPages": 1 }
}
```

**Nota importante sobre Prisma Decimal:** Los campos `amountUSD`, `amountBs`, `dollarRate`, `unitPrice` son `Decimal` en Prisma. En la respuesta JSON se serializan como strings numéricos o números, dependiendo de la configuración. El frontend debe manejarlos como `number` (parsear si es necesario).

---

#### `GET /transaction/get-by-id/:companyId/:transactionId`

**Response:** Transacción individual con relaciones incluidas (`category`, `item`, `batch`).

---

#### `PATCH /transaction/update/:companyId/:transactionId`

**Request body:** `UpdateTransactionDto` (todos los campos opcionales, misma estructura que create)

---

#### `DELETE /transaction/delete/:companyId/:transactionId`

Soft delete.

---

#### `GET /transaction/get-by-date-range/:companyId/:startDate/:endDate`

**Route params:**
- `startDate`: ISO date string (ej. `2026-01-01`)
- `endDate`: ISO date string (ej. `2026-12-31`)

**Response:** `Transaction[]`

---

#### `GET /transaction/get-by-date-category/:companyId/:categoryId`

**Response:** `Transaction[]` filtradas por categoría (con relaciones incluidas).

---

### 2.7 Production Batch

Base: `/production-batch`
Auth: **Todos** requieren JWT + ValidateCompanyGuard

#### `POST /production-batch/create/:companyId/:itemId`

**Throttle:** 20 req/60s

**Request body (all optional):**
```typescript
{
  quantity?: number;
  status?: 'OPEN' | 'CLOSED';
  batchDate?: string; // ISO date
}
```

**Response:** ProductionBatch creado. Las transacciones se vinculan al lote por separado mediante `batchId` en `POST /transaction/create/:companyId`.

---

#### `GET /production-batch/get-all/:companyId`

**Query:** `?page=1&limit=50`

**Response (paginated):** Incluye `item` en cada batch.

---

#### `GET /production-batch/get-all-by-product/:companyId/:itemId`

**Query:** `?page=1&limit=50`

Filtrado por producto.

---

#### `GET /production-batch/get-all-by-batch-id/:companyId/:batchId`

**Response:** Batch individual con `item` y `transactions`.

---

#### `PATCH /production-batch/update/:companyId/:batchId`

**Request body:**
```typescript
{
  quantity?: number;
  status?: 'OPEN' | 'CLOSED';
  batchDate?: string; // ISO date
}
```

---

#### `PATCH /production-batch/delete/:companyId/:batchId`

Soft delete (usando `PATCH`, no `DELETE`).

---

### 2.8 Cost Item

Base: `/cost-item`
Auth: **Todos** requieren JWT + ValidateCompanyGuard

#### `GET /cost-item/get-all/:companyId`

**Query params:** `?page=1&limit=50`

**Response (paginated):**
```json
{
  "data": [
    {
      "id": "uuid",
      "companyId": "uuid",
      "name": "iPhone 15",
      "basePrice": 1200.00,
      "isRemoved": false,
      "createdAt": "2026-06-05T12:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 50, "total": 1, "totalPages": 1 }
}
```

---

#### `GET /cost-item/search/:name/:companyId`

**Route params:** `name` (string, min 1) y `companyId` (UUID)

**Response (búsqueda fuzzy):**
```json
{
  "success": true,
  "dataSource": "fuzzy",
  "searchTerm": "iphone",
  "count": 1,
  "items": [
    {
      "id": "uuid",
      "name": "iPhone 15",
      "basePrice": 1200.00
    }
  ]
}
```

---

### 2.9 Cash Flow

Base: `/cash-flow`
Auth: **Todos** requieren JWT + ValidateCompanyGuard

#### `GET /cash-flow/total-cashflow/:companyId`

**Response (estructura completa):**
```json
{
  "companyId": "uuid",
  "usd": {
    "summary": {
      "current_balance": 15000.00,
      "pending_inflow": 2000.00,
      "pending_outflow": 1000.00,
      "net_cash_flow": 16000.00
    },
    "cash_flow_statement": {
      "operating": {
        "total": 12000.00,
        "categories": [
          { "name": "Ventas", "amount": 12000.00, "color": "#10B981" }
        ]
      },
      "investing": {
        "total": -3000.00,
        "categories": [
          { "name": "Equipos", "amount": -3000.00, "color": "#F59E0B" }
        ]
      },
      "financing": {
        "total": 0,
        "categories": []
      }
    }
  },
  "bs": { /* misma estructura para bolívares */ },
  "period": {
    "start_date": null,
    "end_date": "2026-06-05T12:00:00.000Z"
  }
}
```

**Nota:** `color` en las categorías es un string hex. El frontend puede usarlo para gráficos.

---

#### `GET /cash-flow/cashflow/:companyId/:startDate/:endDate`

**Route params:** `startDate`, `endDate` (ISO date strings)

**Response (estructura detallada):**
```json
{
  "period": {
    "startDate": "2026-01-01",
    "endDate": "2026-06-05"
  },
  "usd": {
    "summary": {
      "current_balance": 15000.00,
      "inflow": 25000.00,
      "outflow": 10000.00,
      "net_cash_flow": 15000.00
    },
    "cash_flow_statement": {
      "operating": { "total": 12000.00, "categories": [...] },
      "investing": { "total": -3000.00, "categories": [...] },
      "financing": { "total": 0, "categories": [] }
    }
  },
  "bs": { /* misma estructura */ },
  "transactionCount": 50,
  "records": [ /* Transaction[] con category incluida */ ]
}
```

---

### 2.10 Contribution Margin

Base: `/contribution-margin`
Auth: **Todos** requieren JWT + ValidateCompanyGuard

#### `GET /contribution-margin/global/:companyId/:startDate/:endDate`

**Query param opcional:** `groupBy=auto`

Sin `groupBy` (default): retorna un objeto ContributionGlobal con los totales agregados del rango completo.

Con `?groupBy=auto`: retorna un array con un objeto por período (día o mes),decidiendo automáticamente según la cantidad de días del rango:
- ≤ 30 días → granularidad diaria (un objeto por día)
- > 30 días → granularidad mensual (un objeto por mes)

Los días/meses sin datos incluyen valores en 0. El campo `date` usa formato ISO (`2026-08-01` para diario, `2026-08-01` para mensual — primer día del mes).

**Response sin `groupBy`:**
```json
{
  "totalSales": 25000.00,
  "totalSalesBs": 2012500.00,
  "totalVariableCosts": 10000.00,
  "totalVariableCostsBs": 805000.00,
  "totalMargin": 15000.00,
  "totalMarginBs": 1207500.00,
  "globalMarginRatio": 0.60,
  "globalMarginRatioBs": 0.60
}
```

**Response con `?groupBy=auto`:**
```json
[
  {
    "date": "2026-08-01",
    "totalSales": 850.00,
    "totalSalesBs": 68425.00,
    "totalVariableCosts": 340.00,
    "totalVariableCostsBs": 27370.00,
    "totalMargin": 510.00,
    "totalMarginBs": 41055.00,
    "globalMarginRatio": 0.60,
    "globalMarginRatioBs": 0.60
  }
]
```

---

#### `GET /contribution-margin/product-global/:itemId/:companyId/:startDate/:endDate`

**Response:**
```json
{
  "itemId": "uuid",
  "itemName": "Harina PAN",
  "itemType": "PRODUCT",
  "totalUnitsSold": 500,
  "period": { "startDate": "2026-01-01", "endDate": "2026-06-05" },
  "financials": {
    "totalInflow": 12500.00,
    "totalInflowBs": 1006250.00,
    "totalVariableCost": 5000.00,
    "totalVariableCostBs": 402500.00,
    "contributionMargin": 7500.00,
    "contributionMarginBs": 603750.00,
    "contributionMarginRatio": 0.60
  },
  "unitAnalysis": {
    "unitInflow": 25.00,
    "unitInflowBs": 2012.50,
    "unitVariableCost": 10.00,
    "unitVariableCostBs": 805.00,
    "unitContributionMargin": 15.00,
    "unitContributionMarginBs": 1207.50
  }
}
```

---

#### `GET /contribution-margin/product/:batchId/:companyId`

**Response:** Misma estructura, pero basada en un lote específico.

---

#### `GET /contribution-margin/service/:itemId/:companyId/:startDate/:endDate`

**Response:** Misma estructura que product pero con `totalServicesSold`.

---

### 2.11 Balance Point

#### `GET /balance-point/:companyId/:startDate/:endDate`

**Auth:** JWT + ValidateCompanyGuard

**Response:**
```json
{
  "companyId": "uuid",
  "period": {
    "startDate": "2026-01-01",
    "endDate": "2026-06-05"
  },
  "financialsActual": {
    "dollars": {
      "totalSales": 25000.00,
      "totalVariableCosts": 10000.00,
      "totalFixedCosts": 8000.00,
      "globalMarginRatio": 60.0
    },
    "bs": {
      "totalSalesBs": 2012500.00,
      "totalVariableCostsBs": 805000.00,
      "totalFixedCostsBs": 644000.00,
      "globalMarginRatioBs": 60.0
    }
  },
  "breakEven": {
    "salesVolumeRequired": 13333.33,
    "salesVolumeRequiredBs": 1073333.33,
    "isSafe": true,
    "isSafeUsd": true,
    "isSafeBs": true,
    "distanceToBreakEven": 4666.67,
    "distanceToBreakEvenBs": 375666.67,
    "marginStatus": "safe",
    "marginStatusUsd": "safe",
    "marginStatusBs": "safe"
  }
}
```

**Notas:**
- Campos por moneda: `isSafeUsd`/`isSafeBs` (una moneda está "segura" si sus ventas ≥ su propio equilibrio y su margen de contribución > 0; pueden divergir porque `dollarRate` varía entre transacciones) y `marginStatusUsd`/`marginStatusBs` (`negative` | `safe` | `at_risk`).
- `isSafe` = `isSafeUsd && isSafeBs` (solo `true` si AMBAS monedas están seguras).
- `marginStatus` (global): `negative` si USD **o** Bs tiene margen ≤ 0; `safe` solo si ambas son `safe`; en otro caso `at_risk`.
- `distanceToBreakEven` positivo = por encima del equilibrio, negativo = por debajo.
- Cuando el `marginStatus` de una moneda es `negative`, sus `salesVolumeRequired` y `distanceToBreakEven` vienen como `null` (NO alcanzable, nunca mostrarlo como `0`).
- `globalMarginRatio` viene ya en porcentaje (p.ej. `60.0` = 60%, `-26.92` = margen negativo).

---

### 2.12 Finance Chat

#### `POST /finance-chat/ask/:companyId`

**Auth:** JWT + ValidateCompanyGuard | **Throttle:** 30 req/60s

**Request body:**
```typescript
{
  "preguntaUsuario": "¿Cuál fue el margen de contribución del mes pasado?" // min 1, max 1000
}
```

**Response:**
```json
{
  "response": "Texto estructurado con análisis financiero generado por IA..."
}
```

**Notas de integración:**
- La respuesta es texto plano estructurado (puede contener bloques JSON para datos tabulares).
- El frontend debe renderizarlo como markdown o texto formateado.
- Usa un pipeline de 4 etapas: detección de cadena → regex → palabras clave → Groq LLM.
- Preguntas sobre datos financieros concretos devuelven información en tiempo real.

---

### 2.13 MCP (AI Tools)

Solo disponibles si `MCP_HTTP_ENABLED=true`.

#### `GET /mcp/sse/:companyId`

**Auth:** JWT + ValidateCompanyGuard

Establece una conexión SSE (Server-Sent Events). Usado para integraciones con clientes MCP.

#### `POST /mcp/messages`

**Auth:** Requiere JWT | **Query:** `?sessionId=...`

Envía mensajes MCP JSON-RPC a través de la sesión SSE. Usado internamente por el protocolo MCP.

---

## 3. Modelos de Datos

### User

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID | PK |
| `name` | string | |
| `email` | string | Único |
| `role` | `USER` \| `ADMIN` | Default: `USER` |
| `tokenBalance` | number | Default: 0 |
| `isSuspended` | boolean | Default: `false` |
| `createdAt` | ISO datetime | |

### Company

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID | PK |
| `userId` | UUID | FK → User (dueño) |
| `name` | string | |
| `isSuspended` | boolean | Default: `false` |
| `isRemoved` | boolean | Soft delete |
| `createdAt` | ISO datetime | |

### Category

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID | PK |
| `companyId` | UUID \| null | Null para categorías globales (`isDefault: true`) |
| `name` | string | |
| `type` | `OPERATING` \| `INVESTING` \| `FINANCING` | |
| `flowDirection` | `INFLOW` \| `OUTFLOW` | |
| `isCogs` | boolean | ¿Es costo de venta? |
| `isVariable` | boolean | ¿Es costo variable? |
| `isDirectCost` | boolean | ¿Es costo directo? (compra para reventa). Solo aplica si `flowDirection=OUTFLOW` e `isCogs=true` |
| `isDefault` | boolean | Categoría global del sistema |
| `isRemoved` | boolean | |

### Item

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID | PK |
| `companyId` | UUID | FK → Company |
| `name` | string | |
| `type` | `PRODUCT` \| `SERVICE` | |
| `basePrice` | number (Decimal) | |
| `stockCurrent` | number | Default: 0. Solo aplica a `PRODUCT` |
| `isRemoved` | boolean | |

### Transaction

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID | PK |
| `companyId` | UUID | FK → Company |
| `categoryId` | UUID | FK → Category |
| `itemId` | UUID \| null | FK → Item (nullable: gastos generales) |
| `batchId` | UUID \| null | FK → ProductionBatch |
| `costItemId` | UUID \| null | FK → CostItem (nullable: costo directo asociado) |
| `quantity` | number \| null | |
| `unitPrice` | number (Decimal) \| null | |
| `dollarRate` | number (Decimal) | Tasa del día |
| `amountUSD` | number (Decimal) | |
| `amountBs` | number (Decimal) | |
| `stockEffect` | `INCREMENT` \| `DECREMENT` \| `NONE` \| null | Efecto en inventario |
| `status` | `PENDING` \| `COMPLETED` | |
| `paymentMethod` | PaymentMethod | Ver enum en sección 2.6 |
| `currency` | `BOLIVARES` \| `DOLARES` | |
| `paymentReference` | string \| null | |
| `description` | string \| null | |
| `paymentDate` | ISO datetime \| null | |
| `isRemoved` | boolean | |

### ProductionBatch

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID | PK |
| `companyId` | UUID | FK → Company |
| `itemId` | UUID | FK → Item (producto) |
| `quantity` | number | Cantidad producida |
| `status` | `OPEN` \| `CLOSED` | |
| `batchDate` | ISO datetime | |
| `isRemoved` | boolean | |
| `createdAt` | ISO datetime | |

### CostItem

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | UUID | PK |
| `companyId` | UUID | FK → Company |
| `name` | string | Nombre del costo directo (ej: "iPhone 15", "Lote A") |
| `basePrice` | number (Decimal) \| null | Precio base referencial |
| `isRemoved` | boolean | |
| `createdAt` | ISO datetime | |

---

## 4. Reglas de Negocio

### 4.1 Multi-Moneda

Toda transacción almacena **ambos montos** simultáneamente:

| Moneda ingresada | amountUSD | amountBs |
|-----------------|-----------|----------|
| `currency: 'DOLARES'` | = `amount` | = `amount * dollarRate` |
| `currency: 'BOLIVARES'` | = `amount / dollarRate` | = `amount` |

El frontend debe enviar `currency` + `amount` + `dollarRate`. El backend calcula el monto complementario.

### 4.2 Control de Stock

- Items de tipo `PRODUCT` con categoría `flowDirection: 'INFLOW'` → **decrementan** `stockCurrent` al crear transacciones o lotes de producción.
- Items de tipo `SERVICE` **nunca** afectan stock.
- La validación de stock suficiente ocurre antes de la escritura en base (dentro de una transacción Prisma).
- Si una transacción tiene un `itemId` que es `PRODUCT` y su categoría es `INFLOW`, el backend chequea `stockCurrent >= quantity`.

### 4.3 Categorías por Defecto

El endpoint `GET /category/list/:companyId` retorna:
- Categorías propias de la compañía (`companyId` = id de la compañía)
- + Categorías globales (`isDefault: true`, `companyId: null`)

El frontend debe mostrar ambas como seleccionables.

### 4.4 Soft Deletes

Todos los endpoints de eliminación usan soft delete (marcan `isRemoved: true`). Los datos no se eliminan físicamente de la base de datos.

### 4.5 Roles de Usuario

| Rol | Puede crear compañías | Opera datos financieros | Gestión global |
|-----|----------------------|----------------------|----------------|
| `USER` | ✅ | ✅ (solo propias) | ❌ |
| `ADMIN` | ❌ | ❌ | ✅ |

**Nota:** El módulo Admin (`/admin/*`) no está implementado actualmente. Todos los usuarios actuales son `USER`.

### 4.6 Búsqueda Fuzzy

Los endpoints `get-by-name` usan dos niveles:
1. Función PostgreSQL `pg_trgm` + `similarity()` (fuzzy search nativa).
2. Fallback a Prisma `{ name: { contains, mode: 'insensitive' } }` con `take: 20`.

El `dataSource` en la respuesta indica qué nivel se usó (`"fuzzy"` o `"prisma"`).

### 4.7 Suspensión

- Usuario suspendido → No puede hacer ninguna request (401 en todos los endpoints).
- Compañía suspendida → No se puede acceder a ningún endpoint de esa compañía (401 con `"Esta compañía se encuentra suspendida"`).

---

## 5. Manejo de Errores

### Formato General de Error

```json
{
  "statusCode": 400,
  "message": "Mensaje de error",
  "error": "Bad Request"
}
```

| statusCode | Significado | Causas comunes |
|------------|-------------|----------------|
| 400 | Bad Request | Validación de DTO fallida, datos inválidos |
| 401 | Unauthorized | Token inválido/expirado, cuenta suspendida, compañía suspendida |
| 403 | Forbidden | No tienes acceso a este recurso |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Email duplicado, violación de unicidad |
| 429 | Too Many Requests | Rate limit superado |
| 500 | Internal Server Error | Error inesperado del servidor |

### Errores de Validación (400)

```json
{
  "statusCode": 400,
  "message": [
    "name must be longer than or equal to 3 characters",
    "password must match regex..."
  ],
  "error": "Bad Request"
}
```

### Error de Autenticación (401)

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Error de Suspensión (401)

```json
{
  "statusCode": 401,
  "message": "Cuenta suspendida. No puedes realizar esta acción."
}
```

---

## 6. Headers Globales

### Request

| Header | Valor | Obligatorio |
|--------|-------|-------------|
| `Authorization` | `Bearer <token>` | Sí (excepto endpoints `@Public()`) |
| `Content-Type` | `application/json` | Sí (para POST/PATCH) |
| `Accept` | `application/json` | Recomendado |

### Response

| Header | Descripción |
|--------|-------------|
| `X-Correlation-Id` | UUID único por request (para tracing) |

### CORS

El backend acepta los orígenes definidos en `FRONTEND_URL` (variable de entorno, múltiples orígenes separados por coma). Credentials habilitados.

---

## 7. Estado de Implementación

### Implementado ✅

| Módulo | Endpoints | Status |
|--------|-----------|--------|
| Health | `GET /` | ✅ |
| Auth | Registro, perfil | ✅ (login se hace vía Supabase SDK directo) |
| Company | CRUD básico | ✅ |
| Category | CRUD + listado + fuzzy search | ✅ |
| Item | CRUD + filtros por tipo + fuzzy search | ✅ |
| Transaction | CRUD + filtros por fecha/categoría | ✅ |
| Production Batch | CRUD + filtros por producto | ✅ |
| Cost Item | Listado + búsqueda fuzzy | ✅ |
| Cash Flow | Total y por rango de fechas | ✅ |
| Contribution Margin | Global, por producto, por lote, por servicio | ✅ |
| Balance Point | Punto de equilibrio | ✅ |
| Finance Chat | Preguntas en lenguaje natural | ✅ |
| MCP (SSE) | Conexiones SSE para herramientas IA | ✅ (con feature flag) |

### Pendiente (en SPEC.md, no implementado) ❌

| Funcionalidad | Referencia en SPEC.md |
|--------------|----------------------|
| Admin module (`/admin/auth/*`, `/admin/users/*`, `/admin/companies/*`, etc.) | Sección 2.3, 2.4 |
| Utilidad Bruta (Gross Profit) | Sección 5.9.1 |
| Utilidad Neta / P&L | Sección 5.9.2 |
| Costo Total Unitario | Sección 5.9.3 |
| Precio con Margen Real | Sección 5.9.4 |
| Escaneo de Facturas OCR | Sección 5.10 |
| Notificaciones | Sección 5.11 |
| Sistema de Pagos (Stripe/PayPal) | Sección 5.12 |
| Reportes PDF/Excel/Chart | Sección 5.13 |
| Suscripciones y Planes | Sección 3 (Plan, Subscription models exist but no endpoints) |

---

## 8. Normas de Frontend — Prevención de Deuda Técnica

> **Propósito:** documentar las normas obligatorias de frontend para que **no vuelva a ocurrir** la deuda técnica de "estado actualizado síncronamente en effects" (`react-hooks/set-state-in-effect`), que dejó 29 errores de lint en 28 archivos.

### 8.1 Contexto histórico

La regla `react-hooks/set-state-in-effect` (introducida por `eslint-plugin-react-hooks@7.1.1`, bundled con `eslint-config-next@16.2.4`) prohíbe llamar `setState` de forma **síncrona** dentro del cuerpo de un `useEffect`. El código anterior a la actualización a Next 16 / React 19 usaba este anti-patrón ampliamente, generando errores de lint que bloquean CI/build.

> Los errores NO se resolvieron silenciando la regla: se corrigieron de raíz reestructurando los componentes y hooks afectados (ver `tasks.md` para el plan de refactor).

### 8.2 Reglas obligatorias

#### R1 — No actualizar estado síncronamente en un effect

**Prohibido** llamar `setState` de forma síncrona en el cuerpo de un `useEffect`:

```typescript
// ❌ Prohibido
const [fullName, setFullName] = useState('');
useEffect(() => { setFullName(`${first} ${last}`); }, [first, last]);

// ✅ Permitido: derivar durante el render
const fullName = `${first} ${last}`;
```

**Excepciones permitidas:**
- `setState` **asíncrono** (dentro de `await`, `.then()`, `setTimeout`, callbacks de eventos externos) — no dispara la regla.
- Sincronizar con un sistema externo (red, DOM, librerías de terceros).

#### R2 — Resetear/adjustar estado al cambiar un prop sin effect

Usar el **patrón `prevOpen`** (ajustar durante render) o la prop `key` de React:

```typescript
// ✅ Permitido: ajustar estado durante el render
const [prevOpen, setPrevOpen] = useState(open);
if (open !== prevOpen) {
  setPrevOpen(open);
  // ajustar otros estados aquí
}
```

#### R3 — Overlays animados (Modal / Drawers) usan `usePresence`

**Prohibido** sincronizar `mounted`/`closing` con `open` mediante `setState` síncrono en un effect. Usar el hook `usePresence` (montaje + animación de salida):

- ✅ Derivar estado durante render con `prevOpen`
- ✅ `setTimeout` de desmontaje en callbacks (asíncronos)
- ✅ El `Modal` se desmonta cuando `open` pasa a `false` (no solo por su botón interno de cierre)
- ❌ Prohibido `setMounted(true)` / `setMounted(false)` síncrono en el `useEffect`

#### R4 — Lógica de eventos va en event handlers, no en effects

Un effect no sabe qué acción del usuario lo disparó. Enviar requests o actualizar estado por una interacción concreta debe ir en el `onClick`/`onSubmit`, no en un `useEffect`.

#### R5 — El `error` de los hooks de borrado debe mostrarse en la UI

Los hooks `useDeleteItem`, `useDeleteCategory`, `useDeleteTransaction` exponen `error` en su estado. **Toda pantalla que elimine datos DEBE:**
- Pasar `error` al `ConfirmDialog` (prop `error`).
- **No cerrar** el diálogo si la operación falla (solo cerrar en éxito).
- Así el usuario ve el motivo del fallo en lugar de que la acción falle en silencio.

### 8.3 Verificación obligatoria antes de merge

| Comando | Resultado esperado |
|---------|--------------------|
| `npx tsc --noEmit` | Sin errores de tipos |
| `npx eslint <archivos>` | Sin errores de `react-hooks/set-state-in-effect` |
| `npm run lint` | Sin errores |
| `npm run build` | Build de producción exitoso |

### 8.4 Referencias

- Guía oficial React: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- Detalle del patrón y plan de refactor: `tasks.md` → "Deuda técnica: react-hooks/set-state-in-effect"
- Patrón de overlays y estado: `docs/DESIGN.md` → §1.8

---

## Appendices

### A. Tipos Compartidos (TypeScript)

```typescript
// Enums
type CategoryType = 'OPERATING' | 'INVESTING' | 'FINANCING';
type FlowDirection = 'INFLOW' | 'OUTFLOW';
type ItemType = 'PRODUCT' | 'SERVICE';
type BatchStatus = 'OPEN' | 'CLOSED';
type TransactionStatus = 'PENDING' | 'COMPLETED';
type Currency = 'BOLIVARES' | 'DOLARES';
type UserRole = 'USER' | 'ADMIN';

type PaymentMethod =
  | 'PAGO_MOVIL'
  | 'TARJETA_DEBITO_CREDITO_PUNTO_VENTA'
  | 'TRANSFERENCIA_BANCARIA_NACIONAL'
  | 'EFECTIVO_BOLIVARES'
  | 'EFECTIVO_DIVISAS'
  | 'TRANSFERENCIAS_INTERNACIONALES_DIRECTAS'
  | 'BILLETERAS_ELECTRONICAS_PROCESADORES'
  | 'CRIPTOMONEDAS';

// Pagination
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// Auth
interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  user: SupabaseUser;
}

interface SupabaseUser {
  id: string;
  email: string;
  user_metadata: { name: string };
}

interface UserProfile {
  userId: string;
  email: string;
  name: string;
}
```

### B. Checklist de Integración Frontend

- [ ] Instalar `@supabase/ssr` y configurar Supabase client (`createBrowserClient`, `createServerClient`, `createMiddlewareClient`)
- [ ] Crear `middleware.ts` de Next.js con `createMiddlewareClient` para refresh automático de sesión
- [ ] Login: llamar `supabase.auth.signInWithPassword()` desde Route Handler / Server Component (nunca desde el cliente)
- [ ] Registro: llamar `POST /auth/register` para crear usuario en Supabase + DB local
- [ ] Luego del registro exitoso, hacer login con `supabase.auth.signInWithPassword()` para iniciar sesión
- [ ] Envolver cada llamada al backend con un helper que lee `session.access_token` de Supabase y lo inyecta como `Authorization: Bearer <token>`
- [ ] Manejar error 401 → verificar si la sesión de Supabase expiró (refresh automático debería manejarlo)
- [ ] Manejar mensaje "Cuenta suspendida" → mostrar pantalla de bloqueo
- [ ] Implementar paginación en tablas/listas (page, limit, total, totalPages)
- [ ] Parsear números Decimal a number JavaScript (usar `Number()` o librería como `decimal.js`)
- [ ] Manejar fechas ISO 8601 en todos los formularios
- [ ] Implementar loading states y error states para cada endpoint
- [ ] Implementar búsqueda fuzzy en selects de categorías e items
- [ ] Manejar rate limiting (429) con retry

### C. Rate Limits por Endpoint

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| Global (default) | 120 req | 60s |
| `POST /auth/register` | 5 req | 60s |
| `POST /auth/login` | No usado por frontend | — |
| `POST /company/create` | 10 req | 60s |
| `POST /category/create/:companyId` | 30 req | 60s |
| `POST /item/create/:companyId` | 30 req | 60s |
| `POST /transaction/create/:companyId` | 20 req | 60s |
| `POST /production-batch/create/:companyId/:itemId` | 20 req | 60s |
| `POST /finance-chat/ask/:companyId` | 30 req | 60s |
