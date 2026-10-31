import { casaPorSlug, nCasasAtivas } from "@/lib/al/casas";
import { proprietarioPorId } from "@/lib/al/contas";
import { getConfigAl } from "@/lib/al/config";
import { reservaPorId, marcarTransferencia, atualizarPagamento } from "@/lib/al/reservas";
import { percentagemComissao, valorParaProprietario } from "@/lib/al/regras";
import { transferirProprietario, reembolsar } from "@/lib/pagamentos/stripe";

/**
 * Dinheiro que sai da Meridie numa reserva (backoffice):
 * - pagar ao proprietário a parte dele depois da estadia — pelo Stripe
 *   (conta ligada) ou registar uma transferência feita à mão;
 * - reembolsar o hóspede (total ou parcial) pelo Stripe.
 */

/** Contas da reserva para o proprietário: { reserva, casa, dono, valor } ou { erro }. */
export async function contasProprietario(id) {
  const reserva = await reservaPorId(id);
  if (!reserva) return { erro: "Reserva não encontrada." };
  const casa = await casaPorSlug(reserva.casaSlug);
  if (!casa) return { erro: "A casa desta reserva já não existe." };
  const [dono, config, ativas] = await Promise.all([proprietarioPorId(casa.proprietarioId), getConfigAl(), nCasasAtivas(casa.proprietarioId)]);
  const pct = percentagemComissao(casa.plano, { reduzida: casa.comissaoReduzida || ativas >= 2 }, config);
  return { reserva, casa, dono, valor: valorParaProprietario(reserva, pct, casa.plano, config) };
}

/**
 * Paga ao proprietário. `manual: true` só regista (transferência feita fora
 * do site); senão transfere pelo Stripe — exige a reserva paga pelo Stripe e
 * a conta do proprietário ativa. Devolve { ok, valor } ou { erro }.
 */
export async function pagarProprietario(id, { manual = false, nota = "" } = {}) {
  const c = await contasProprietario(id);
  if (c.erro) return c;
  const { reserva, dono, valor } = c;
  if (reserva.transferencia) return { erro: "O proprietário já foi pago nesta reserva." };
  if (!["confirmada", "concluida"].includes(reserva.estado)) return { erro: "Só se paga ao proprietário em reservas confirmadas ou concluídas." };
  if (valor <= 0) return { erro: "Não há valor a pagar ao proprietário." };

  if (manual) {
    const ok = await marcarTransferencia(id, { via: "manual", valor, moeda: reserva.moeda || "EUR", nota: String(nota || "").slice(0, 300) });
    return ok ? { ok: true, valor } : { erro: "O proprietário já foi pago nesta reserva." };
  }

  const pag = reserva.pagamento || {};
  if (pag.fornecedor !== "stripe" || pag.estado !== "pago" || !pag.paymentIntent) return { erro: "Esta reserva não foi paga pelo Stripe — regista a transferência à mão." };
  if (pag.reembolsado) return { erro: "Esta reserva teve um reembolso — confirma o valor e regista a transferência à mão." };
  if (!dono?.stripeConta?.ativa) return { erro: "O proprietário ainda não ligou a conta bancária no Stripe (área do proprietário → Recebimentos)." };
  try {
    const ref = await transferirProprietario({ conta: dono.stripeConta.id, valor, moeda: reserva.moeda, reservaId: id, paymentIntent: pag.paymentIntent });
    await marcarTransferencia(id, { via: "stripe", referencia: ref, valor, moeda: reserva.moeda || "EUR" });
    return { ok: true, valor };
  } catch (e) {
    console.error("transferência proprietário:", e?.message || e);
    return { erro: `O Stripe recusou a transferência: ${e?.message || "erro desconhecido"}` };
  }
}

/** Reembolso pelo Stripe (`valor` vazio = total). O estado final chega pelo webhook. */
export async function reembolsarReserva(id, valor) {
  const reserva = await reservaPorId(id);
  if (!reserva) return { erro: "Reserva não encontrada." };
  const pag = reserva.pagamento || {};
  if (pag.fornecedor !== "stripe" || pag.estado !== "pago" || !pag.paymentIntent) return { erro: "Só se reembolsam aqui reservas pagas pelo Stripe." };
  if (reserva.transferencia?.via === "stripe") return { erro: "O proprietário já recebeu esta reserva — reembolsa no painel do Stripe e acerta com ele." };
  const v = valor ? Math.round(Number(valor) * 100) / 100 : null;
  if (v !== null && !(v > 0)) return { erro: "Valor de reembolso inválido." };
  try {
    await reembolsar({ paymentIntent: pag.paymentIntent, valor: v, reservaId: id });
    // Marca já (o webhook confirma); um reembolso parcial deixa a reserva paga.
    if (!v) await atualizarPagamento(id, { estado: "reembolsado", extra: { reembolsado: pag.valorPago ?? null } });
    return { ok: true };
  } catch (e) {
    console.error("reembolso:", e?.message || e);
    return { erro: `O Stripe recusou o reembolso: ${e?.message || "erro desconhecido"}` };
  }
}
