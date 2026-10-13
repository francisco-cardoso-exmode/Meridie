import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import { revalidaSite } from "@/lib/revalida";
import { traduzirDocumento, traducaoDisponivel } from "@/lib/traducao";
import { COLECOES_TRADUZIVEIS, pendentes } from "@/lib/traducaoCampos";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const ID = (colecao, d) => (colecao === "paginas" ? d._id : d.slug);
const NOME = (colecao, d) => (colecao === "paginas" ? d._id : d.nome || d.titulo || d.slug);

// Estado: que documentos têm textos por traduzir (novos ou alterados).
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const db = await getDb();
  const estado = {};
  for (const colecao of COLECOES_TRADUZIVEIS) {
    const docs = await db.collection(colecao).find({}).toArray();
    estado[colecao] = docs
      .map((d) => ({ id: ID(colecao, d), nome: NOME(colecao, d), falta: pendentes(colecao, d).length }))
      .filter((d) => d.id);
  }
  return NextResponse.json({ ok: true, chave: traducaoDisponivel(), estado });
}

// Traduz um documento (o backoffice chama isto um a um, com progresso).
export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  if (!traducaoDisponivel())
    return NextResponse.json({ ok: false, erro: "Falta a variável ANTHROPIC_API_KEY." }, { status: 400 });
  const { colecao, id } = await request.json().catch(() => ({}));
  if (!COLECOES_TRADUZIVEIS.includes(colecao) || !id)
    return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });
  try {
    const r = await traduzirDocumento(colecao, id);
    revalidaSite();
    return NextResponse.json(r);
  } catch (e) {
    return NextResponse.json({ ok: false, erro: e?.message || "Erro na tradução." }, { status: 500 });
  }
}
