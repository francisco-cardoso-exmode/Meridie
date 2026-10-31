import { NextResponse } from "next/server";
import { reservaPorToken, marcarCheckout } from "@/lib/al/reservas";
import { criarCheckout, pagamentoDisponivel } from "@/lib/pagamentos";
import { podePagarOnline } from "@/lib/al/regras";
import { linkEstadia } from "@/lib/al/avisos";
import { dentroDoLimite, ipDe } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const erro = (msg, status = 400) => NextResponse.json({ ok: false, erro: msg }, { status });

/**
 * "Pagar" na página da estadia (token do link no corpo, não no URL): cria a
 * sessão de pagamento e devolve o endereço para onde o browser vai. O
 * estado "pago" só chega pelo webhook — nunca pelo regresso do browser.
 */
export async function POST(request) {
  const b = (await request.json().catch(() => null)) || {};
  if (!(await dentroDoLimite(`al-pagar:${ipDe(request)}`, 10, 60 * 60)))
    return erro("Demasiados pedidos. Tenta novamente daqui a alguns minutos.", 429);
  const r = await reservaPorToken(b.token);
  if (!r) return erro("Este link já não é válido.", 404);
  if (!podePagarOnline(r)) return erro("Esta reserva não tem pagamento pendente.", 409);
  if (!pagamentoDisponivel(r.pais)) return erro("O pagamento online ainda não está disponível. Fala connosco.", 503);
  try {
    const voltar = linkEstadia(b.token, r.idioma);
    const s = await criarCheckout(r, { urlSucesso: `${voltar}?pagamento=ok`, urlCancelar: voltar });
    await marcarCheckout(r.id, { referencia: s.referencia, fornecedor: s.fornecedor });
    return NextResponse.json({ ok: true, url: s.url });
  } catch (e) {
    console.error("checkout:", e?.message || e);
    return erro("Não foi possível abrir o pagamento. Tenta novamente.", 500);
  }
}
