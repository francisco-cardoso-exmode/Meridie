import { NextResponse, after } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { atualizarCasa, mudarEstadoCasa } from "@/lib/al/casas";
import { limparCasa } from "@/lib/al/validacao";
import { traduzirEmFundo } from "@/lib/traducao";
import { revalidaSite } from "@/lib/revalida";

export const dynamic = "force-dynamic";

const erro = (msg, status = 400) => NextResponse.json({ ok: false, erro: msg }, { status });
const SESSAO = "A tua sessão expirou. Entra noutra janela e volta a guardar.";

// Editar uma casa no backoffice (inclui a comissão reduzida).
export async function PUT(request, { params }) {
  if (!(await isAdmin())) return erro(SESSAO, 401);
  const { slug } = await params;
  const dados = limparCasa(await request.json().catch(() => null), { admin: true });
  if (!dados) return erro("Pedido inválido.");
  if ("titulo" in dados && !dados.titulo) return erro("O título é obrigatório.");
  if (!(await atualizarCasa(slug, dados))) return erro("Casa não encontrada.", 404);
  revalidaSite();
  after(() => traduzirEmFundo("al_casas", slug));
  return NextResponse.json({ ok: true });
}

// { acao: "estado", estado } — aprovar, publicar (exige licença AL, fotos,
// preço…), suspender, voltar a rascunho.
export async function POST(request, { params }) {
  if (!(await isAdmin())) return erro(SESSAO, 401);
  const { slug } = await params;
  const b = (await request.json().catch(() => null)) || {};
  if (b.acao !== "estado") return erro("Pedido inválido.");
  const e = await mudarEstadoCasa(slug, b.estado);
  if (e) return erro(e);
  revalidaSite();
  return NextResponse.json({ ok: true });
}
