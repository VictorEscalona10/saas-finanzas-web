import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import type { NextRequest } from 'next/server';

export function createClient(req: NextRequest) {
  const headers = new Headers();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(req.headers.get('Cookie') ?? '').filter(
            (c): c is { name: string; value: string } => c.value !== undefined
          );
        },
        setAll(cookiesToSet, setHeaders) {
          cookiesToSet.forEach(({ name, value, options }) => {
            headers.append('Set-Cookie', serializeCookieHeader(name, value, options));
          });
          Object.entries(setHeaders).forEach(([key, value]) => {
            headers.set(key, value);
          });
        },
      },
    }
  );

  return { supabase, headers };
}
