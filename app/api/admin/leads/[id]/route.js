import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { isAdmin, utilizadorAtual } from "@/lib/adminAuth";
import { ESTADOS_LEAD } from "@/lib/lead";
import { idValido } from "@/lib/pedidos";

export const dynamic = "force-dynamic";

const erro = (msg, status) => NextResponse.json({ ok: false, erro: msg }, { status });

// Muda o estado de uma lead e/ou acrescenta uma nota interna (como nos pedidos).
// Corpo: { estado?, nota? }. Cada mudança fica no histórico (quem e quando).
export async function PATCH(request, { params }) {
  if (!(await isAdmin())) return erro("A tua sessão expirou. Entra noutra janela e volta a guardar.", 401);
  const { id } = await params;
  if (!idValido(id)) return erro("Mensagem não encontrada.", 404);
  const corpo = await request.json().catch(() => null);
  const estado = corpo?.estado;
  const nota = typeof corpo?.nota === "string" ? corpo.nota.trim().slice(0, 4000) : "";
  if (estado !== undefined && !Object.hasOwn(ESTADOS_LEAD, estado)) return erro("Estado inválido.", 400);
  if (estado === undefined && !nota) return erro("Nada para gravar.", 400);

  const quem = (await utilizadorAtual()) || "admin";
  const agora = new Date();
  const set = { atualizadoEm: agora };
  const push = {};
  if (estado !== undefined) {
    set.estado = estado;
    push.historico = { em: agora, por: quem, estado };
  }
  if (nota) push.notas = { em: agora, por: quem, texto: nota };
  const r = await (await getDb())
    .collection("contactos")
    .updateOne({ _id: new ObjectId(id) }, { $set: set, $push: push });
  if (!r.matchedCount) return erro("Mensagem não encontrada.", 404);
  return NextResponse.json({ ok: true });
}
