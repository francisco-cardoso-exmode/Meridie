import { NextResponse, after } from "next/server";
import { traduzirEmFundo } from "@/lib/traducao";
import { isAdmin } from "@/lib/adminAuth";
import { PAGINAS, getConteudo, setConteudo, limpaCampos, migraDoc } from "@/lib/conteudo";
import { getDb } from "@/lib/mongodb";
import { revalidaSite } from "@/lib/revalida";
import { prepararEn } from "@/lib/validar";

export const dynamic = "force-dynamic";
// A tradução para inglês corre em segundo plano depois de responder.
export const maxDuration = 120;

const SESSAO = "A tua sessão expirou. Entra noutra janela e volta a guardar.";
const existe = (pagina) => PAGINAS.some((p) => p.key === pagina);

export async function GET(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, erro: SESSAO }, { status: 401 });
  const { pagina } = await params;
  if (!existe(pagina)) return NextResponse.json({ ok: false, erro: "Página desconhecida." }, { status: 404 });
  return NextResponse.json({ ok: true, campos: await getConteudo(pagina) });
}

export async function POST(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, erro: SESSAO }, { status: 401 });
  const { pagina } = await params;
  if (!existe(pagina)) return NextResponse.json({ ok: false, erro: "Página desconhecida." }, { status: 404 });
  const body = await request.json().catch(() => null);
  const campos = limpaCampos(pagina, body?.campos);
  if (!campos) return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });

  const db = await getDb();
  // Já no formato atual (ex.: os cartões antigos da Tecnologia passam a lista).
  const antes = migraDoc(pagina, await db.collection("paginas").findOne({ _id: pagina }));
  // Só as correções inglesas desta edição, juntas ao inglês ATUAL da base. As
  // chaves válidas são as dos campos gravados agora (as listas têm ids estáveis,
  // e uma lista nova ainda não está no documento antigo).
  const { set, enAntes } = prepararEn("paginas", { ...(antes || {}), campos }, { campos }, body.enEditado);
  await setConteudo(
    pagina,
    campos,
    set.en ?? (antes?.migrado ? antes.en : undefined),
    antes?.migrado ? antes.enFonte : undefined
  );
  revalidaSite();
  after(() => traduzirEmFundo("paginas", pagina, enAntes));
  return NextResponse.json({ ok: true });
}
