import { cookies } from "next/headers";

// Verifica se o pedido tem sessão de admin válida (para usar nas rotas /api/admin).
export async function isAdmin() {
  const store = await cookies();
  return store.get("meridie_admin")?.value === process.env.ADMIN_SESSION;
}
