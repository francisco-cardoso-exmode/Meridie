import { NextResponse } from "next/server";

// Protege todas as rotas /admin (exceto o login). Verifica o cookie de sessão.
export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const cookie = request.cookies.get("meridie_admin")?.value;
    if (!cookie || cookie !== process.env.ADMIN_SESSION) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
