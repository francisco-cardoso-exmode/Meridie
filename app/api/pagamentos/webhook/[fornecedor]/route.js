import { NextResponse } from "next/server";
import { tratarWebhook } from "@/lib/pagamentos";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

/**
 * Webhooks dos fornecedores de pagamento (/api/pagamentos/webhook/stripe,
 * /api/pagamentos/webhook/mercadopago). O fornecedor verifica a assinatura e
 * devolve { referencia, estado }; aqui só se atualiza a reserva com essa
 * referência. Com o stub, nada é aceite (501).
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
  await (await getDb())
    .collection("al_reservas")
    .updateOne(
      { "pagamento.fornecedor": fornecedor, "pagamento.referencia": r.referencia },
      { $set: { "pagamento.estado": r.estado, "pagamento.atualizadoEm": new Date() } }
    );
  return NextResponse.json({ ok: true });
}
