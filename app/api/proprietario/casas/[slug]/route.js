import { NextResponse, after } from "next/server";
import { getProprietario } from "@/lib/al/auth";
import { casaDoProprietario, atualizarCasa, mudarEstadoCasa } from "@/lib/al/casas";
import { criarReservaManual, cancelarReserva } from "@/lib/al/reservas";
import { limparCasa, texto } from "@/lib/al/validacao";
import { avisarEquipa } from "@/lib/al/emails";
import { traduzirEmFundo } from "@/lib/traducao";
import { revalidaSite } from "@/lib/revalida";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const erro = (msg, status = 400) => NextResponse.json({ ok: false, erro: msg }, { status });
const SESSAO = "A tua sessão expirou. Entra de novo.";

// Editar a casa (só as do próprio proprietário).
export async function PUT(request, { params }) {
  const p = await getProprietario();
  if (!p) return erro(SESSAO, 401);
  const { slug } = await params;
  const dados = limparCasa(await request.json().catch(() => null));
  if (!dados) return erro("Pedido inválido.");
  if ("titulo" in dados && !dados.titulo) return erro("Dá um título à casa.");
  if (!(await atualizarCasa(slug, dados, { proprietarioId: p.id }))) return erro("Casa não encontrada.", 404);
  revalidaSite();
  after(() => traduzirEmFundo("al_casas", slug));
  return NextResponse.json({ ok: true });
}

/**
 * Ações do proprietário numa casa:
 * - { acao: "enviar" } → envia para análise (rascunho → em_analise);
 * - { acao: "bloquear", entrada, saida, nota } → bloqueia datas;
 * - { acao: "desbloquear", id } → retira um bloqueio.
 */
export async function POST(request, { params }) {
  const p = await getProprietario();
  if (!p) return erro(SESSAO, 401);
  const { slug } = await params;
  const casa = await casaDoProprietario(slug, p.id);
  if (!casa) return erro("Casa não encontrada.", 404);
  const b = (await request.json().catch(() => null)) || {};

  if (b.acao === "enviar") {
    const e = await mudarEstadoCasa(slug, "em_analise", { porProprietario: p.id });
    if (e) return erro(e);
    avisarEquipa({
      assunto: `Casa para análise — ${casa.titulo}`,
      titulo: "Casa enviada para análise",
      campos: [["Casa", casa.titulo], ["Cidade", casa.cidade], ["Proprietário", `${p.nome} <${p.email}>`]],
      link: `${SITE_URL}/admin/alojamento/casas/${slug}`,
    }).catch((x) => console.error("aviso análise:", x?.message || x));
    return NextResponse.json({ ok: true });
  }

  if (b.acao === "bloquear") {
    const r = await criarReservaManual({
      casa,
      entrada: b.entrada,
      saida: b.saida,
      bloqueio: true,
      nota: texto(b.nota, 200),
      criadoPor: `proprietario:${p.email}`,
    });
    if (r.erro) return erro(r.erro);
    revalidaSite();
    return NextResponse.json({ ok: true, id: r.id });
  }

  if (b.acao === "desbloquear") {
    const r = await cancelarReserva(String(b.id || ""), { casaSlug: slug, bloqueio: true });
    if (r.erro) return erro(r.erro);
    revalidaSite();
    return NextResponse.json({ ok: true });
  }

  return erro("Pedido inválido.");
}
