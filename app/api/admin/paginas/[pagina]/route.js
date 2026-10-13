import { NextResponse, after } from "next/server";
import { traduzirEmFundo } from "@/lib/traducao";
import { isAdmin } from "@/lib/adminAuth";
import { getConteudo, setConteudo } from "@/lib/conteudo";
import { getDb } from "@/lib/mongodb";
import { revalidaSite } from "@/lib/revalida";

export const dynamic = "force-dynamic";
// A tradução para inglês corre em segundo plano depois de responder.
export const maxDuration = 120;

export async function GET(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { pagina } = await params;
  return NextResponse.json({ ok: true, campos: await getConteudo(pagina) });
}

export async function POST(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { pagina } = await params;
  const body = await request.json().catch(() => ({}));
  const campos = body.campos || {};
  const db = await getDb();
  const antes = await db.collection("paginas").findOne({ _id: pagina }, { projection: { en: 1 } });
  await setConteudo(pagina, campos, body.en);
  revalidaSite();
  after(() => traduzirEmFundo("paginas", pagina, antes?.en ?? null));
  return NextResponse.json({ ok: true });
}
