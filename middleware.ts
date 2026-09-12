import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/src/infrastructure/supabase/middleware';

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];
const PRIVATE_ROUTES = [
  '/companies',
  '/categories',
  '/products',
  '/transactions',
  '/batches',
  '/cash-flow',
  '/contribution-margin',
  '/balance-point',
  '/gross-profit',
  '/net-profit',
  '/unit-cost',
  '/price-margin',
  '/profile',
  '/settings',
];

const COMPANY_ROUTE_PATTERN = /^\/[^/]+\/(dashboard|categories|products|transactions|batches|cash-flow|contribution-margin|balance-point|gross-profit|net-profit|unit-cost|price-margin)/;

export async function middleware(req: NextRequest) {
  const { supabase, headers } = createClient(req);

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = req.nextUrl.pathname;

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isPrivate = PRIVATE_ROUTES.some((route) => pathname.startsWith(route)) || COMPANY_ROUTE_PATTERN.test(pathname);
  const isRoot = pathname === '/';

  if (!session && isPrivate) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    const response = NextResponse.redirect(url);
    headers.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  if (session && (isPublic || isRoot)) {
    const url = req.nextUrl.clone();
    url.pathname = '/companies';
    const response = NextResponse.redirect(url);
    headers.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  const response = NextResponse.next();
  headers.forEach((value, key) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
