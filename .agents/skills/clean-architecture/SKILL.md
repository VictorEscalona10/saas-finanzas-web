
---
name: clean-architecture-nextjs
description: "Clean Architecture principles applied to a Next.js 16 project with App Router, Tailwind CSS v4, and DDD-lite structure."
---

# Clean Architecture for Next.js

## 1. Dependency Rule

**Dependencies point inward.** Outer layers import inner layers, never the opposite.

```
app/ → presentation/ → application/ → domain/ ← infrastructure/
```

| Layer | Can import | Cannot import |
|-------|-----------|----------------|
| `app/` | `presentation/screens/` | any other |
| `presentation/` | `application/`, `shared/` | `infrastructure/` |
| `application/` | `domain/`, `shared/` | `presentation/`, `infrastructure/` |
| `domain/` | `shared/types` | any other |
| `infrastructure/` | `domain/`, `shared/` | `presentation/`, `application/` |

---

## 2. Folder Structure

```
src/
├── app/                    # (public)/(private)/layout.tsx + page.tsx (routing only)
├── presentation/
│   ├── screens/            # *.tsx + *.css (paired)
│   ├── components/         # *.tsx + *.css (paired)
│   └── hooks/              # UI-only hooks
├── application/            # use*UseCase.ts (custom hooks with react-query)
├── domain/
│   ├── entities/           # Product.ts, User.ts
│   └── repositories/       # I*Repository.ts (interfaces only)
├── infrastructure/
│   ├── api/                # httpClient.ts
│   └── repositories/       # *RepositoryImpl.ts (implements domain interfaces)
├── shared/                 # types/, utils/, constants/, hooks/
├── middleware/             # auth.middleware.ts
└── styles/                 # variables.css, globals.css
```

---

## 3. CRITICAL: CSS Module per TSX

> **Every `*.tsx` in `presentation/` MUST have `*.css` with the SAME name.**

```
LoginScreen.tsx ←→ LoginScreen.css
Button.tsx      ←→ Button.css
```

**BEM naming (required):**
```css
.product-card { }           /* Block */
.product-card__title { }    /* Element (__) */
.product-card--featured { } /* Modifier (--) */
```

**Use CSS variables (no hardcoded values):**
```css
:root {
  --primary-500: #3b82f6;
  --gray-100: #f3f4f6;
  --spacing-4: 1rem;
  --radius-lg: 0.5rem;
}
```

**Forbidden:** `style={{}}`, cross-component CSS imports, global selectors.

---

## 4. Layer Templates

### Domain
```ts
// domain/entities/Product.ts
export interface Product { id: string; name: string; price: number; }

// domain/repositories/IProductRepository.ts
export interface IProductRepository {
  getProducts(): Promise<Product[]>;
}
```

### Infrastructure
```ts
// infrastructure/repositories/ProductRepositoryImpl.ts
import { IProductRepository } from '@/domain/repositories/IProductRepository';

export class ProductRepositoryImpl implements IProductRepository {
  async getProducts() { return httpClient.get('/products'); }
}
export const productRepository = new ProductRepositoryImpl();
```

### Application
```ts
// application/products/useGetProductsUseCase.ts
import { useQuery } from '@tanstack/react-query';
import { productRepository } from '@/infrastructure/repositories/ProductRepositoryImpl';

export function useGetProductsUseCase() {
  return useQuery({ queryKey: ['products'], queryFn: () => productRepository.getProducts() });
}
```

### Presentation
```tsx
// presentation/screens/private/products/ProductsListScreen.tsx
import './ProductsListScreen.css';
import { useGetProductsUseCase } from '@/application/products/useGetProductsUseCase';

export function ProductsListScreen() {
  const { data, isLoading, error } = useGetProductsUseCase();
  if (isLoading) return <div className="screen__loading">Loading...</div>;
  if (error) return <div className="screen__error">Error</div>;
  return <div className="screen">{/* render data */}</div>;
}
```

```css
/* ProductsListScreen.css */
.screen { padding: var(--spacing-6); }
.screen__loading { text-align: center; }
```

### App (Routing)
```tsx
// app/(private)/products/page.tsx
import { ProductsListScreen } from '@/presentation/screens/private/products/ProductsListScreen';
export default function Page() { return <ProductsListScreen />; }
```

---

## 5. Middleware (Auth)

```ts
// middleware/auth.middleware.ts
const PUBLIC = ['/login', '/register'];
const PRIVATE = ['/dashboard', '/products'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const isAuth = !!token;
  
  if (isAuth && PUBLIC.some(p => request.nextUrl.pathname.startsWith(p)))
    return NextResponse.redirect(new URL('/dashboard', request.url));
  
  if (!isAuth && PRIVATE.some(p => request.nextUrl.pathname.startsWith(p)))
    return NextResponse.redirect(new URL('/login', request.url));
  
  return NextResponse.next();
}
```

**Route groups:** `app/(public)/` for unauthenticated, `app/(private)/` for authenticated.

---

## 6. Quick Checklist

- [ ] Every `*.tsx` has a paired `*.css` with BEM?
- [ ] `app/` pages only import screens (no logic)?
- [ ] Screens use `application/` hooks, never `infrastructure/` directly?
- [ ] Use cases depend on domain interfaces (not concrete implementations)?
- [ ] CSS uses variables (no hardcoded colors/spacing)?
- [ ] Public routes in `(public)`, private in `(private)`?

---

## 7. Common Mistakes

| Mistake | Fix |
|----------|-----|
| Screen imports `infrastructure/api` directly | Move to `application/` use case |
| CSS without BEM | Rename using BEM |
| Logic inside `app/page.tsx` | Extract to `presentation/screens/` |
| Repository without interface | Create interface in `domain/` |
| `useState` inside `application/` | Move state to `presentation/` |

---

## 8. Commands

```bash
# Create entity + interface + impl + use case + screen
touch src/domain/entities/{Name}.ts
touch src/domain/repositories/I{Name}Repository.ts
touch src/infrastructure/repositories/{Name}RepositoryImpl.ts
touch src/application/{name}/useGet{Name}sUseCase.ts
touch src/presentation/screens/private/{name}/{Name}Screen.tsx
touch src/presentation/screens/private/{name}/{Name}Screen.css
```

