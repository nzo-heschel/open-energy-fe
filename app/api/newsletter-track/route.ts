import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const url = "https://script.google.com/macros/s/AKfycbw1y5Mi6bMFpxvp7qcINcI0YM3AqywXkWq6VWUpfSy6lVowil3x_nz4NSU6TDPe4Obtkg/exec";
  if (!url) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const bodyObj =
    typeof body === 'object' && body !== null && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  const reasonRaw = bodyObj.reason;
  const n =
    typeof reasonRaw === 'number'
      ? reasonRaw
      : typeof reasonRaw === 'string'
        ? parseInt(reasonRaw, 10)
        : NaN;
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payload: Record<string, unknown> = { ...bodyObj, reason: n };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
