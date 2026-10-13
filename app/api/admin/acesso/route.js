import { NextResponse } from "next/server";
import { consumirTokenAcesso } from "@/lib/acessoAdmin";

export const dynamic = "force-dynamic";

// Link do email "Esqueci-me da password": abre a sessão e entra no backoffice.
export async function GET(request) {
  const t = request.nextUrl.searchParams.get("t");
  const valido = await consumirTokenAcesso(t).catch(() => false);
  const url = request.nextUrl.clone();
  url.search = "";
  if (!valido) {
    url.pathname = "/admin/login";
    url.searchParams.set("link", "invalido");
    return NextResponse.redirect(url);
  }
  url.pathname = "/admin";
  const res = NextResponse.redirect(url);
  res.cookies.set("meridie_admin", process.env.ADMIN_SESSION || "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 horas, como no login normal
  });
  return res;
}
