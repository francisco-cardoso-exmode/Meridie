import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { setConfigAl } from "@/lib/al/config";

export const dynamic = "force-dynamic";

// Comissões das OTA e % dos planos (Alojamento → Definições).
export async function PUT(request) {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false, erro: "A tua sessão expirou. Entra noutra janela e volta a guardar." }, { status: 401 });
  const b = await request.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });
  const config = await setConfigAl(b);
  return NextResponse.json({ ok: true, config });
}
