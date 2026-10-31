import { NextResponse } from "next/server";
import { getSessao } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const SEM_CACHE = { "Cache-Control": "no-store" };

// Valida a sessão do cookie. Usada pelo middleware (que corre no Edge e não
// consegue falar com o MongoDB) antes de mostrar qualquer página /admin.
export async function GET() {
  const s = await getSessao();
  if (!s) return NextResponse.json({ ok: false }, { status: 401, headers: SEM_CACHE });
  return NextResponse.json({ ok: true, email: s.email, origem: s.origem }, { headers: SEM_CACHE });
}
