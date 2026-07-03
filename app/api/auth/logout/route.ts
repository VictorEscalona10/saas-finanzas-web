import { NextResponse } from 'next/server';
import { createClient } from '@/src/infrastructure/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'Sesión cerrada exitosamente' });
}
