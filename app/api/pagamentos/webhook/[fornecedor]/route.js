import { NextResponse } from "next/server";
import { tratarWebhook } from "@/lib/pagamentos";
import { getDb } from "@/lib/mongodb";
import { atualizarPagamento, idValido } from "@/lib/al/reservas";
import { avisarPagamento } from "@/lib/al/avisos";

export const dynamic = "force-dynamic";

/**
 * Webhooks dos fornecedores de pagamento (/api/pagamentos/webhook/stripe,
 * /api/pagamentos/webhook/mercadopago). O fornecedor verifica a assinatura e
 * diz que reserva mudou (pelo id nos metadados ou pelo pagamento); aqui só se
 * atualiza a reserva e se avisa quando fica paga. Fornecedor por configurar → 501.
 */
export async function POST(request, { params }) {
  const { fornecedor } = await params;
  let r = null;
  try {
    r = await tratarWebhook(fornecedor, request);
  } catch (e) {
    console.error(`webhook ${fornecedor}:`, e?.message || e);
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!r) return NextResponse.json({ ok: false, erro: "Fornecedor não configurado." }, { status: 501 });
  if (r.ignorar) return NextResponse.json({ ok: true });

  let id = idValido(r.reservaId) ? r.reservaId : null;
  if (!id && r.paymentIntent) {
    const doc = await (await getDb())
      .collection("al_reservas")
      .findOne({ "pagamento.fornecedor": fornecedor, "pagamento.paymentIntent": r.paymentIntent }, { projection: { _id: 1 } });
    id = doc ? String(doc._id) : null;
  }
  // Pagamento que não é de uma reserva (ex.: feito à mão no painel do Stripe).
  if (!id) return NextResponse.json({ ok: true });

  const res = await atualizarPagamento(id, { referencia: r.referencia, estado: r.estado, extra: r.extra });
  if (res.reserva && (res.duplicado || (res.mudou && ["pago", "reembolsado"].includes(r.estado))))
    await avisarPagamento(res.reserva, { estado: r.estado, duplicado: res.duplicado }).catch((e) =>
      console.error("aviso pagamento:", e?.message || e)
    );
  return NextResponse.json({ ok: true });
}
