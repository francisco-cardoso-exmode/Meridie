import { NextResponse } from "next/server";
import { isAdmin, getSessao } from "@/lib/adminAuth";
import { listarUtilizadores, criarUtilizador, apagarUtilizador, normalizaEmail } from "@/lib/utilizadores";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, lista: await listarUtilizadores() });
}

// Gerir utilizadores exige sessão pessoal (com email): quem entrou com a
// password global (ADMIN_PASSWORD) não cria nem apaga contas.
const SO_PESSOAL = "Entra com o teu email e password para gerir utilizadores.";

export async function POST(request) {
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false }, { status: 401 });
  if (!sessao.email) return NextResponse.json({ ok: false, erro: SO_PESSOAL }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  try {
    await criarUtilizador(body || {});
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, erro: e.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  // O email de quem está a apagar vem da sessão no servidor.
  const sessao = await getSessao();
  if (!sessao) return NextResponse.json({ ok: false }, { status: 401 });
  if (!sessao.email) return NextResponse.json({ ok: false, erro: SO_PESSOAL }, { status: 403 });
  const { email } = (await request.json().catch(() => null)) || {};
  if (sessao.email && normalizaEmail(email) === sessao.email)
    return NextResponse.json({ ok: false, erro: "Não podes apagar o teu próprio utilizador." }, { status: 400 });
  try {
    // Apaga também as sessões abertas desse utilizador.
    await apagarUtilizador(email);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, erro: e.message }, { status: 400 });
  }
}
