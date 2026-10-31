import { NextResponse } from "next/server";
import { consumirTokenAcesso } from "@/lib/acessoAdmin";
import { criarUtilizador, existeUtilizador, normalizaEmail } from "@/lib/utilizadores";
import { porCookieSessao } from "@/lib/adminAuth";
import { criarSessao } from "@/lib/sessoes";
import { dentroDoLimite, ipDe } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Link do email "Esqueci-me da password". O GET não gasta o token (os
// antivírus do email abrem os links sozinhos): só leva ao ecrã de entrada,
// onde o botão "Entrar" faz o POST abaixo.
export async function GET(request) {
  const t = request.nextUrl.searchParams.get("t") || "";
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  if (/^[a-f0-9]{64}$/.test(t)) url.searchParams.set("acesso", t);
  else url.searchParams.set("link", "invalido");
  return NextResponse.redirect(url);
}

// Gasta o token (uso único) e abre a sessão. Se o email está em ADMIN_EMAILS
// mas ainda não há utilizador, cria-o (sem password — define-a a seguir).
export async function POST(request) {
  if (!(await dentroDoLimite(`acesso-ip:${ipDe(request)}`, 20, 15 * 60)))
    return NextResponse.json({ ok: false, erro: "Demasiadas tentativas. Tenta mais tarde." }, { status: 429 });

  const { t } = (await request.json().catch(() => null)) || {};
  const email = await consumirTokenAcesso(t).catch(() => null);
  const invalido = NextResponse.json(
    { ok: false, erro: "Este link já foi usado ou expirou. Pede um novo." },
    { status: 400 }
  );
  if (!email) return invalido;

  try {
    if (!(await existeUtilizador(email))) {
      const doEnv = (process.env.ADMIN_EMAILS || "").split(",").map(normalizaEmail);
      // Utilizador apagado depois de o link ter sido pedido: não entra.
      if (!doEnv.includes(email)) return invalido;
      await criarUtilizador({ nome: "", email }).catch((e) => {
        if (!/Já existe/.test(e.message)) throw e;
      });
    }
    const token = await criarSessao(email, "link");
    // Vai direto a definir a password (sem pedir a atual, durante 30 min).
    return porCookieSessao(NextResponse.json({ ok: true, destino: "/admin/utilizadores?definir=1" }), token);
  } catch (e) {
    console.error("acesso por link:", e);
    return NextResponse.json({ ok: false, erro: "Erro no servidor. Tenta de novo." }, { status: 500 });
  }
}
