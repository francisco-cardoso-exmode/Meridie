import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getDestinatarios, setDestinatarios } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, destinatarios: await getDestinatarios() });
}

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const lista = (body.destinatarios || [])
    .map((s) => String(s).trim())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
  await setDestinatarios(lista);
  return NextResponse.json({ ok: true, destinatarios: lista });
}
