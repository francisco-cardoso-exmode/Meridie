import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { revalidaSite } from "@/lib/revalida";
import { restaurar, apagarDeVez } from "@/lib/lixo";

export const dynamic = "force-dynamic";

const erro = (msg, status) => NextResponse.json({ ok: false, erro: msg }, { status });

// Lixo do backoffice. Corpo: { id, acao: "restaurar" | "apagar" }.
export async function POST(request) {
  if (!(await isAdmin())) return erro("A tua sessão expirou. Entra noutra janela e volta a tentar.", 401);
  const corpo = await request.json().catch(() => null);
  const acao = corpo?.acao;
  if (acao !== "restaurar" && acao !== "apagar") return erro("Ação inválida.", 400);
  const r = acao === "restaurar" ? await restaurar(corpo.id) : await apagarDeVez(corpo.id);
  if (!r.ok) return erro(r.erro, r.status || 400);
  if (acao === "restaurar") revalidaSite();
  return NextResponse.json(r);
}
