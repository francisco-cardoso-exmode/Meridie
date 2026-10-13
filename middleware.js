import { NextResponse } from "next/server";
import { paraInterno, caminho } from "@/lib/i18n";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protege todas as rotas /admin (exceto o login). Verifica o cookie de sessão.
  if (pathname.startsWith("/admin")) {
    if (pathname !== "/admin/login") {
      const cookie = request.cookies.get("meridie_admin")?.value;
      if (!cookie || cookie !== process.env.ADMIN_SESSION) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
    }
    return NextResponse.next();
  }

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
  // Tudo menos API, ficheiros internos do Next e ficheiros estáticos.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
