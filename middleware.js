import { NextResponse } from "next/server";
import { paraInterno, caminho } from "@/lib/i18n";

// Cookie da sessão do backoffice (ver lib/sessoes.js — não se importa aqui
// porque o middleware corre no Edge, sem o driver do MongoDB).
const COOKIE_ADMIN = "meridie_admin";

// Pede à rota /api/admin/sessao (Node) que valide a sessão na base. Se não
// conseguir confirmar, trata como sessão inválida.
async function sessaoValida(request) {
  try {
    const res = await fetch(new URL("/api/admin/sessao", request.url), {
      headers: { cookie: request.headers.get("cookie") || "" },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

function paraLogin(request, { apagarCookie } = {}) {
  const { pathname, search } = request.nextUrl;
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  if (pathname !== "/admin") url.searchParams.set("next", pathname + search);
  const res = NextResponse.redirect(url);
  if (apagarCookie) res.cookies.set(COOKIE_ADMIN, "", { path: "/", maxAge: 0 });
  return res;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protege todas as rotas /admin (exceto o login). O cookie tem de existir e
  // ter o formato certo, e a sessão tem de existir na base. Isto corre em
  // TODOS os pedidos de página, incluindo a navegação interna do Next (RSC),
  // que não volta a passar pelo layout. O layout do painel valida outra vez.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname !== "/admin/login") {
      const cookie = request.cookies.get(COOKIE_ADMIN)?.value;
      if (!cookie || !/^[a-f0-9]{64}$/.test(cookie)) return paraLogin(request);
      if (!(await sessaoValida(request))) return paraLogin(request, { apagarCookie: true });
    }
    return NextResponse.next();
  }

  // App da equipa do Alojamento Local (só PT, layout próprio em app/equipa):
  // não passa pelos idiomas. Cada página valida a sessão no servidor.
  if (pathname === "/equipa" || pathname.startsWith("/equipa/")) return NextResponse.next();

  // Idiomas: "/pt/..." não existe para fora (redireciona para a raiz);
  // "/en/brands" → interno "/en/marcas"; o resto → interno "/pt/...".
  if (pathname === "/pt" || pathname.startsWith("/pt/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }
  const { lang, interno } = paraInterno(pathname);
  // Um caminho inglês escrito com o segmento português (/en/marcas) vai
  // para o endereço certo (/en/brands).
  if (lang === "en") {
    const certo = caminho("en", interno);
    if (certo !== pathname && certo !== pathname.replace(/\/$/, "")) {
      const url = request.nextUrl.clone();
      url.pathname = certo;
      return NextResponse.redirect(url, 308);
    }
  }
  const url = request.nextUrl.clone();
  url.pathname = `/${lang}${interno === "/" ? "" : interno}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Tudo menos API, ficheiros internos do Next e ficheiros estáticos — e
  // todas as rotas /admin, mesmo com um ponto no caminho (ex.: um slug).
  matcher: ["/((?!api|_next|.*\\..*).*)", "/admin", "/admin/:path*"],
};
