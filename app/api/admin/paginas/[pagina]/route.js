import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getConteudo, setConteudo } from "@/lib/conteudo";

export const dynamic = "force-dynamic";

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
  await setConteudo(pagina, campos);
  return NextResponse.json({ ok: true });
}
