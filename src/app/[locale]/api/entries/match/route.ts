import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { ids } = await req.json();
  const reference = `LETT-${Date.now()}`;

  return NextResponse.json({
    success: true,
    reference,
    matched: ids?.length || 0,
  });
}
