import { cookies } from "next/headers";

// Verifica se o pedido tem sessão de admin válida (para usar nas rotas /api/admin).
export async function isAdmin() {
  const store = await cookies();
  const sessao = process.env.ADMIN_SESSION;
  return !!sessao && store.get("meridie_admin")?.value === sessao;
}

// Email do utilizador com sessão (vazio se entrou com a password global).
export async function utilizadorAtual() {
  const store = await cookies();
  return store.get("meridie_user")?.value || "";
}

// Opções dos cookies de sessão (8 horas).
export const COOKIE_SESSAO = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 8,
};
