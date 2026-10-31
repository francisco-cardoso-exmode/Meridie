import { NextResponse } from "next/server";
import { getProprietario } from "@/lib/al/auth";
import { linkRecebimentos, recebimentosDisponiveis } from "@/lib/al/recebimentos";
import { SITE_URL } from "@/lib/site";
import { caminho } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const erro = (msg, status = 400) => NextResponse.json({ ok: false, erro: msg }, { status });

/**
 * "Receber pagamentos" na área do proprietário: devolve o endereço do registo
 * no Stripe (ou do painel dele, se já estiver ativo). O GET é o "refresh_url"
 * do Stripe — quando o link expira, gera outro e redireciona.
 */
export async function POST(request) {
  const p = await getProprietario();
  if (!p) return erro("A tua sessão expirou. Entra outra vez.", 401);
  if (!recebimentosDisponiveis()) return erro("Os pagamentos online ainda não estão ligados. Fala connosco.", 503);
  const b = (await request.json().catch(() => null)) || {};
  try {
    return NextResponse.json({ ok: true, url: await linkRecebimentos(p, b.lang === "en" ? "en" : "pt") });
  } catch (e) {
    console.error("recebimentos:", e?.message || e);
    return erro("Não foi possível abrir o Stripe. Tenta novamente.", 500);
  }
}

export async function GET(request) {
  const lang = new URL(request.url).searchParams.get("lang") === "en" ? "en" : "pt";
  const painel = `${SITE_URL}${caminho(lang, "/proprietario")}`;
  const p = await getProprietario();
  if (!p || !recebimentosDisponiveis()) return NextResponse.redirect(painel);
  try {
    return NextResponse.redirect(await linkRecebimentos(p, lang));
  } catch (e) {
    console.error("recebimentos (refazer):", e?.message || e);
    return NextResponse.redirect(painel);
  }
}
