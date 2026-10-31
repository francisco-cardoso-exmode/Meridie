import { cookies } from "next/headers";
import { NOME_COOKIE, VALIDADE_SEG, validarSessao } from "@/lib/sessoes";

export { NOME_COOKIE };

// Sessão do pedido atual, validada na base: { email, origem, criadoEm, hash }
// ou null. O email vem só do servidor (nunca de um cookie editável).
export async function getSessao() {
  const store = await cookies();
  return validarSessao(store.get(NOME_COOKIE)?.value);
}

// Verifica se o pedido tem sessão de admin válida (para usar nas rotas /api/admin).
export async function isAdmin() {
  return !!(await getSessao());
}

// Email do utilizador com sessão (vazio se entrou com a password global).
export async function utilizadorAtual() {
  return (await getSessao())?.email || "";
}

// Opções do cookie de sessão (8 horas, como a sessão na base).
export const COOKIE_SESSAO = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: VALIDADE_SEG,
};

// Põe o cookie de sessão na resposta e apaga o antigo meridie_user.
export function porCookieSessao(res, token) {
  res.cookies.set(NOME_COOKIE, token, COOKIE_SESSAO);
  res.cookies.set("meridie_user", "", { path: "/", maxAge: 0 });
  return res;
}
