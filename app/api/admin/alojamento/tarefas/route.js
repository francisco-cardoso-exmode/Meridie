import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { casaPorSlug } from "@/lib/al/casas";
import { criarTarefa, atribuirTarefa } from "@/lib/al/tarefas";
import { normalizaEmail } from "@/lib/al/contas";

export const dynamic = "force-dynamic";

const erro = (msg, status = 400) => NextResponse.json({ ok: false, erro: msg }, { status });

/**
 * { acao: "criar", tipo, casaSlug, data, atribuidaA } — tarefa avulsa (ex.: limpeza);
 * { acao: "atribuir", id, email } — atribuir/desatribuir ("" = por atribuir).
 */
export async function POST(request) {
  if (!(await isAdmin())) return erro("A tua sessão expirou. Entra noutra janela e volta a guardar.", 401);
  const b = (await request.json().catch(() => null)) || {};
  if (b.acao === "criar") {
    const casa = await casaPorSlug(String(b.casaSlug || ""));
    if (!casa) return erro("Escolhe a casa.");
    const r = await criarTarefa({ tipo: b.tipo, casa, data: b.data, atribuidaA: normalizaEmail(b.atribuidaA) });
    return r.erro ? erro(r.erro) : NextResponse.json({ ok: true, id: r.id });
  }
  if (b.acao === "atribuir") {
    const ok = await atribuirTarefa(String(b.id || ""), normalizaEmail(b.email));
    return ok ? NextResponse.json({ ok: true }) : erro("Tarefa não encontrada.", 404);
  }
  return erro("Pedido inválido.");
}
