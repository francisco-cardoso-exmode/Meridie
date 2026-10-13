import { NextResponse } from "next/server";
import { autenticar } from "@/lib/utilizadores";
import { COOKIE_SESSAO } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Entrar com email + password de um utilizador, ou só com a password global
// (ADMIN_PASSWORD), que continua a funcionar como alternativa.
export async function POST(request) {
  const { email, password } = await request.json().catch(() => ({}));

  let utilizador = null;
  if (email && password) {
    utilizador = await autenticar(email, password).catch(() => null);
  }
  const global = !!password && !!process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD;

  if ((utilizador || global) && process.env.ADMIN_SESSION) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("meridie_admin", process.env.ADMIN_SESSION, COOKIE_SESSAO);
    res.cookies.set("meridie_user", utilizador?.email || "", COOKIE_SESSAO);
    return res;
  }

  return NextResponse.json(
    { ok: false, erro: "Email ou password incorretos." },
    { status: 401 }
  );
}
