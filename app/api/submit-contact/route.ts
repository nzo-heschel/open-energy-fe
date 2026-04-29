import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx2L11x5F890mnUV5MNR45DgfqmjxtlLiu4vnpgMqnahMeZFsrzLNSwZD2kqJQOHg23/exec';

  if (!GOOGLE_APPS_SCRIPT_URL) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const res = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return NextResponse.json({ ok: false }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
