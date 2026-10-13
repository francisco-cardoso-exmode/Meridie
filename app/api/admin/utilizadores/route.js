import { NextResponse } from "next/server";
import { isAdmin, utilizadorAtual } from "@/lib/adminAuth";
import { listarUtilizadores, criarUtilizador, apagarUtilizador, normalizaEmail } from "@/lib/utilizadores";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, lista: await listarUtilizadores() });
}

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  try {
    await criarUtilizador(body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, erro: e.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { email } = await request.json().catch(() => ({}));
  if (normalizaEmail(email) === (await utilizadorAtual()))
    return NextResponse.json({ ok: false, erro: "Não podes apagar o teu próprio utilizador." }, { status: 400 });
  try {
    await apagarUtilizador(email);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, erro: e.message }, { status: 400 });
  }
}
