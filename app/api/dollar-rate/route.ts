import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');

    if (!res.ok) {
      return NextResponse.json(
        { message: 'Error al obtener la tasa del dólar' },
        { status: res.status },
      );
    }

    const data = await res.json();

    return NextResponse.json({
      compra: data.compra,
      venta: data.venta,
      promedio: data.promedio,
      nombre: data.nombre,
      fechaActualizacion: data.fechaActualizacion,
    });
  } catch {
    return NextResponse.json(
      { message: 'Error de conexión con el servicio de tasa de cambio' },
      { status: 500 },
    );
  }
}
