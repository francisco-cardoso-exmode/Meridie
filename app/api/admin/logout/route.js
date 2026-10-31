import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { NOME_COOKIE, apagarSessao } from "@/lib/sessoes";

export const dynamic = "force-dynamic";

// Termina a sessão na base (não basta apagar o cookie).
export async function POST() {
  const store = await cookies();
  await apagarSessao(store.get(NOME_COOKIE)?.value).catch((e) => console.error("logout:", e));
  const res = NextResponse.json({ ok: true });
  res.cookies.set(NOME_COOKIE, "", { path: "/", maxAge: 0 });
  res.cookies.set("meridie_user", "", { path: "/", maxAge: 0 });
  return res;
}
