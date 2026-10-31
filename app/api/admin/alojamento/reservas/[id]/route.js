import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { confirmarReserva, cancelarReserva, concluirReserva, novoLinkHospede, reservaPorId, idValido } from "@/lib/al/reservas";
import { avisarConfirmacao, linkEstadia } from "@/lib/al/avisos";
import { revalidaSite } from "@/lib/revalida";
import { pagarProprietario, reembolsarReserva } from "@/lib/al/pagarProprietario";

export const dynamic = "force-dynamic";

const erro = (msg, status = 400) => NextResponse.json({ ok: false, erro: msg }, { status });

/**
 * { acao: "confirmar" | "cancelar" | "concluir" | "link" | "pagar_proprietario"
 *   | "registar_pagamento" | "reembolsar" }.
 * Confirmar: verifica sobreposições, cria as inspeções de entrada/saída e
 * envia ao hóspede o link da estadia. "link" gera um link novo (o anterior
 * deixa de funcionar) — para copiar e mandar por outro canal.
 * Concluir paga logo ao proprietário pelo Stripe quando dá (reserva paga pelo
 * Stripe e conta dele ativa); senão fica o botão para pagar/registar à mão.
 */
export async function POST(request, { params }) {
  if (!(await isAdmin())) return erro("A tua sessão expirou. Entra noutra janela e volta a guardar.", 401);
  const { id } = await params;
  if (!idValido(id)) return erro("Reserva inválida.", 404);
  const b = (await request.json().catch(() => null)) || {};

  if (b.acao === "confirmar") {
    const r = await confirmarReserva(id);
    if (r.erro) return erro(r.erro, 409);
    const aviso = await avisarConfirmacao(await reservaPorId(id), r.token);
    revalidaSite();
    return NextResponse.json({ ok: true, link: aviso.link, emailEnviado: aviso.emailEnviado });
  }
  if (b.acao === "cancelar") {
    const r = await cancelarReserva(id);
    if (r.erro) return erro(r.erro);
    revalidaSite();
    return NextResponse.json({ ok: true });
  }
  if (b.acao === "concluir") {
    const r = await concluirReserva(id);
    if (r.erro) return erro(r.erro);
    const reserva = await reservaPorId(id);
    if (reserva?.pagamento?.fornecedor === "stripe" && reserva.pagamento.estado === "pago") {
      const t = await pagarProprietario(id);
      return NextResponse.json({ ok: true, aviso: t.erro ? `Concluída. Pagamento ao proprietário por fazer: ${t.erro}` : undefined });
    }
    return NextResponse.json({ ok: true });
  }
  if (b.acao === "pagar_proprietario" || b.acao === "registar_pagamento") {
    const r = await pagarProprietario(id, { manual: b.acao === "registar_pagamento", nota: b.nota });
    if (r.erro) return erro(r.erro, 409);
    return NextResponse.json({ ok: true });
  }
  if (b.acao === "reembolsar") {
    const r = await reembolsarReserva(id, b.valor);
    if (r.erro) return erro(r.erro, 409);
    return NextResponse.json({ ok: true });
  }
  if (b.acao === "link") {
    const r = await novoLinkHospede(id);
    if (r.erro) return erro(r.erro);
    return NextResponse.json({ ok: true, link: linkEstadia(r.token, r.reserva.idioma) });
  }
  return erro("Pedido inválido.");
}
