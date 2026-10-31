import crypto from "crypto";
import { NextResponse } from "next/server";
import { autenticar, normalizaEmail, PASSWORD_MAX } from "@/lib/utilizadores";
import { porCookieSessao } from "@/lib/adminAuth";
import { criarSessao } from "@/lib/sessoes";
import { dentroDoLimite, ipDe } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const ERRO = { ok: false, erro: "Email ou password incorretos." };

// Compara com a password global em tempo constante (hash dos dois lados para
// os tamanhos serem iguais).
function eGlobal(password) {
  const global = process.env.ADMIN_PASSWORD;
  if (!global || !password) return false;
  const a = crypto.createHash("sha256").update(password).digest();
  const b = crypto.createHash("sha256").update(global).digest();
  return crypto.timingSafeEqual(a, b);
}

// Entrar com email + password de um utilizador. A password global
// (ADMIN_PASSWORD) fica só como acesso de emergência: a sessão não tem email
// e não pode mudar passwords de ninguém.
// Limite: 10 tentativas em 15 min por IP e por email.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const email = normalizaEmail(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";

  const ip = ipDe(request);
  const okIp = await dentroDoLimite(`login-ip:${ip}`, 10, 15 * 60);
  const okEmail = email ? await dentroDoLimite(`login-email:${email}`, 10, 15 * 60) : true;
  if (!okIp || !okEmail)
    return NextResponse.json(
      { ok: false, erro: "Demasiadas tentativas. Tenta de novo daqui a 15 minutos." },
      { status: 429 }
    );

  if (!password || password.length > PASSWORD_MAX) return NextResponse.json(ERRO, { status: 401 });

  let utilizador = null;
  if (email) utilizador = await autenticar(email, password).catch(() => null);
  const global = !utilizador && eGlobal(password);

  if (!utilizador && !global) return NextResponse.json(ERRO, { status: 401 });

  try {
    const token = utilizador
      ? await criarSessao(utilizador.email, "password")
      : await criarSessao("", "global");
    return porCookieSessao(NextResponse.json({ ok: true }), token);
  } catch (e) {
    console.error("login:", e);
    return NextResponse.json({ ok: false, erro: "Erro no servidor. Tenta de novo." }, { status: 500 });
  }
}
