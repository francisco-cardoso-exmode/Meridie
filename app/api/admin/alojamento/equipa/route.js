import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { criarMembroEquipa, ativarMembroEquipa, definirPasswordAl } from "@/lib/al/contas";

export const dynamic = "force-dynamic";

const erro = (msg, status = 400) => NextResponse.json({ ok: false, erro: msg }, { status });

/**
 * Equipa de terreno (app /equipa):
 * { acao: "criar", nome, email, password } | { acao: "ativo", email, ativo }
 * | { acao: "password", email, password } (termina as sessões abertas).
 */
export async function POST(request) {
  if (!(await isAdmin())) return erro("A tua sessão expirou. Entra noutra janela e volta a guardar.", 401);
  const b = (await request.json().catch(() => null)) || {};
  try {
    if (b.acao === "criar") await criarMembroEquipa(b);
    else if (b.acao === "ativo") await ativarMembroEquipa(b.email, b.ativo === true);
    else if (b.acao === "password") await definirPasswordAl("equipa", b.email, b.password);
    else return erro("Pedido inválido.");
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e?.publico) return erro(e.message);
    console.error("equipa AL:", e);
    return erro("Erro no servidor. Tenta de novo.", 500);
  }
}
