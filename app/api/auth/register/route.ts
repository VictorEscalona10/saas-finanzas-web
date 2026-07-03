import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/src/shared/constants';
import { registerSchema } from '@/src/shared/schemas/auth';

export async function POST(request: Request) {
  const body = await request.json();

  const result = registerSchema.safeParse(body);

  if (!result.success) {
    const message = result.error.issues[0]?.message || 'Datos inválidos';
    return NextResponse.json({ message }, { status: 400 });
  }

  const backendResponse = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.data),
  });

  const backendData = await backendResponse.json();

  return NextResponse.json(backendData, { status: backendResponse.status });
}
