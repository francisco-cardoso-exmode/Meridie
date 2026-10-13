import { NextResponse } from "next/server";
import { consumirTokenAcesso } from "@/lib/acessoAdmin";
import { listarUtilizadores } from "@/lib/utilizadores";
import { COOKIE_SESSAO } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Link do email "Esqueci-me da password": abre a sessão e entra no backoffice.
// Se o utilizador ainda não tem password, vai direto a definir uma.
export async function GET(request) {
  const t = request.nextUrl.searchParams.get("t");
  const email = await consumirTokenAcesso(t).catch(() => null);
  const url = request.nextUrl.clone();
  url.search = "";
  if (!email || !process.env.ADMIN_SESSION) {
    url.pathname = "/admin/login";
    url.searchParams.set("link", "invalido");
    return NextResponse.redirect(url);
  }
  const u = (await listarUtilizadores()).find((x) => x.email === email);
  url.pathname = "/admin/utilizadores";
  if (!u?.temPassword) url.searchParams.set("definir", "1");
  const res = NextResponse.redirect(url);
  res.cookies.set("meridie_admin", process.env.ADMIN_SESSION, COOKIE_SESSAO);
  res.cookies.set("meridie_user", u ? email : "", COOKIE_SESSAO);
  return res;
}
