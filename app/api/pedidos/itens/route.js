import { NextResponse } from "next/server";
import { normalizarItens } from "@/lib/pedido";
import { resolverItens } from "@/lib/pedidos";
import { dentroDoLimite, ipDe } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

// Dados atuais dos itens do pedido guardado no browser (nome, preço,
// unidade, disponibilidade) — a página do pedido mostra sempre o que vale
// agora, não a cópia do momento em que o item foi acrescentado.
export async function POST(request) {
  if (!(await dentroDoLimite(`pedido-itens:${ipDe(request)}`, 60, 10 * 60)))
    return NextResponse.json({ ok: false, erro: "Demasiados pedidos." }, { status: 429 });
  const corpo = await request.json().catch(() => null);
  const itens = normalizarItens(corpo?.itens);
  if (!itens.length) return NextResponse.json({ ok: true, itens: [] });
  try {
    return NextResponse.json({ ok: true, itens: await resolverItens(itens, { lang: corpo?.lang === "en" ? "en" : "pt" }) });
  } catch {
    return NextResponse.json({ ok: false, erro: "Indisponível." }, { status: 503 });
  }
}
