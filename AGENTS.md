<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# saas-finanzas-web

## Commands

| Action | Command | Notes |
|--------|---------|-------|
| Dev server | `npm run dev` | |
| Build | `npm run build` | |
| Lint | `npm run lint` | ESLint flat config (`eslint.config.mjs`) |
| Start (prod) | `npm run start` | |

No `typecheck` script exists — use `npx tsc --noEmit` if needed. **No test framework** is configured (no test deps in `package.json`).

## Architecture

- **Next.js 16** (App Router, `app/` directory)
--**Axios** 
- **Tailwind CSS v4** — no `tailwind.config.*`. Config in `app/globals.css` via `@import "tailwindcss"` + `@theme` directive. Custom finance tokens: `--color-finance-primary`, `--color-success`, `--color-danger`, etc.
- **Path alias**: `@/*` → `./*` (maps to project root, **not** `./src/*`)
- **DDD-lite scaffold**: `src/modules/finance/` with empty `data/`, `domain/`, `presentation/` layers. All module code goes here.
- **Spec**: `SPEC.md` is the API contract — NestJS v11 backend at `http://localhost:3001`, Prisma + PostgreSQL on Supabase.
- **Auth**: 100% Supabase SSR (`@supabase/ssr`) — login via `supabase.auth.signInWithPassword()` from server components/route handlers, tokens stored in httpOnly cookies (never in localStorage). No `POST /auth/login` call to backend.
- **Key libs**: `zod` (validation), `date-fns` (dates), `decimal.js` (precision math), `@supabase/supabase-js` + `@supabase/ssr` (auth)

## Fundamental Rules

1. **Dependency direction:** `presentation` → `application` → `domain` ← `infrastructure`
2. **Prohibitions:**
* ❌ `presentation/` → import from `infrastructure/`
* ❌ `application/` → import from `presentation/` or `infrastructure/`
* ❌ `domain/` → import from any other layer



## Folder Structure

```
src/
├── app/                    # Routing only ("dumb" pages)
│   ├── (public)/          # No login required: login, register
│   └── (private)/         # Login required: dashboard, products
├── presentation/          
│   ├── screens/           # Logical views
│   └── components/        # Reusable UI
├── application/           # Use cases (custom hooks)
├── domain/                # Entities + repository interfaces
├── infrastructure/        # Implementations (API, storage)
└── shared/                # Utils, types, constants

```

## CRITICAL Rule: Modular CSS

> **Every `.tsx` file in `presentation/` MUST have an attached `.css` file with the SAME name.**

```
LoginScreen.tsx  ←→  LoginScreen.css
ProductCard.tsx  ←→  ProductCard.css

```

**CSS Format:**

```css
/* Mandatory BEM */
.product-card { }
.product-card__title { }
.product-card--featured { }

```

**Prohibited:**

* ❌ Inline `style={{}}` (except for simple dynamic values)
* ❌ Importing CSS from another component
* ❌ Global selectors (`div { }`)

## Layers in 1 line

| Layer | Role | Example |
| --- | --- | --- |
| `app/` | Dumb routing | `export default function Page() { return <LoginScreen />; }` |
| `presentation/` | UI + styles | `LoginScreen.tsx` + `LoginScreen.css` |
| `application/` | Use cases | `useGetProductsUseCase.ts` |
| `domain/` | Entities + interfaces | `IProductRepository.ts`, `User.ts` |
| `infrastructure/` | Concrete implementations | `ProductRepositoryImpl.ts` |

## Middleware (authentication)

```typescript
// middleware/auth.middleware.ts
const PUBLIC = ['/login', '/register'];
const PRIVATE = ['/dashboard', ...];

// Logged in + public route → redirect to /dashboard
// Not logged in + private route → redirect to /login

```

## Package manager

npm (`package-lock.json` v3). Do not use pnpm, yarn, or bun.

## Multi-currency

Backend stores both `amountUSD` and `amountBs` simultaneously. Frontend sends `currency` (`DOLARES` | `BOLIVARES`) + `amount` + `dollarRate`; backend calculates the complementary amount. `decimal.js` fields arrive as JSON numbers — parse if needed.

### **Skill Registry**

When the following actions or contexts are detected, refer to and load the corresponding skill file:

*   **Action:** Architecting system layers, defining domain boundaries, or implementing dependency rules.
    *   **Skill Path:** `.agents/skills/clean-architecture/SKILL.md`
    *   **Context:** Use this when ensuring that source code dependencies only point inwards.

*   **Action:** Implementing SEO strategies, metadata management, internationalization, or technical site hardening.
    *   **Skill Path:** `.agents/skills/optimise-seo/SKILL.md`
    *   **Complementary Docs:** Consult `internationalisation.md`, `nextjs-implementation.md`, `seo-checklist.md`, and `technical-hardening.md` within the same directory for specific hardening tasks.

*   **Action:** Styling UI components, managing design tokens, or building responsive layouts using utility classes.
    *   **Skill Path:** `.agents/skills/tailwind/SKILL.md`

*   **Action:** Optimizing React performance, implementing Vercel deployment patterns, or following React-specific coding standards.
    *   **Skill Path:** `.agents/skills/vercel-react-best-practices/SKILL.md`
    *   **Resources:** Refer to the `/rules` subdirectory and `AGENTS.md` for team-specific orchestration rules.


---