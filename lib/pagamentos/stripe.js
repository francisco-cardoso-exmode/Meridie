import Stripe from "stripe";
import { totalHospede } from "@/lib/al/regras";

/**
 * Stripe (conta da Meridie, Portugal) — cumpre o contrato de lib/pagamentos
 * e, à parte, as funções do Stripe Connect para pagar aos proprietários.
 *
 * Modelo "cobrança e transferências separadas": o hóspede paga à Meridie
 * (Checkout do Stripe: cartão, Apple/Google Pay, Multibanco… — os
 * métodos ligam-se no painel do Stripe, não aqui) e, depois da estadia, a
 * Meridie transfere ao proprietário a parte dele. Assim um cancelamento
 * reembolsa-se sem ir buscar dinheiro ao proprietário.
 *
 * Variáveis: STRIPE_SECRET_KEY (sk_live_… / sk_test_…) e
 * STRIPE_WEBHOOK_SECRET (whsec_… do endpoint /api/pagamentos/webhook/stripe).
 */

let cliente = null;
function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY em falta.");
  cliente ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return cliente;
}

// Valores em cêntimos (EUR e BRL têm 2 casas decimais).
const cent = (v) => Math.round(Number(v || 0) * 100);
const TXT = {
  pt: { estadia: (n) => `Estadia — ${n} noite${n === 1 ? "" : "s"}`, limpeza: "Limpeza", taxa: "Taxa de serviço" },
  en: { estadia: (n) => `Stay — ${n} night${n === 1 ? "" : "s"}`, limpeza: "Cleaning", taxa: "Service fee" },
};

async function criarCheckout({ reserva, urlSucesso, urlCancelar }) {
  const x = TXT[reserva.idioma] || TXT.pt;
  const moeda = (reserva.moeda || "EUR").toLowerCase();
  const linha = (nome, valor, descricao) => ({
    quantity: 1,
    price_data: { currency: moeda, unit_amount: cent(valor), product_data: { name: nome, ...(descricao ? { description: descricao } : {}) } },
  });
  const line_items = [linha(x.estadia(reserva.noites), reserva.valor, `${reserva.casaTitulo} · ${reserva.entrada} → ${reserva.saida}`)];
  if (reserva.limpeza > 0) line_items.push(linha(x.limpeza, reserva.limpeza));
  if (reserva.taxaServico > 0) line_items.push(linha(x.taxa, reserva.taxaServico));
  if (cent(totalHospede(reserva)) <= 0) throw new Error("Reserva sem valor a pagar.");

  const metadata = { reservaId: reserva.id };
  const s = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items,
    customer_email: reserva.hospede?.email || undefined,
    client_reference_id: reserva.id,
    metadata,
    payment_intent_data: {
      metadata,
      transfer_group: `reserva_${reserva.id}`,
      description: `${reserva.casaTitulo} ${reserva.entrada} → ${reserva.saida}`,
    },
    locale: reserva.idioma === "en" ? "en" : "pt",
    success_url: urlSucesso,
    cancel_url: urlCancelar,
    // A sessão vale 23 h; depois o hóspede gera outra na página da estadia.
    expires_at: Math.floor(Date.now() / 1000) + 23 * 3600,
  });
  return { url: s.url, referencia: s.id };
}

/** Expira uma sessão antiga (ao criar outra) — evita pagamentos em duplicado. */
async function expirarCheckout(referencia) {
  try {
    await stripe().checkout.sessions.expire(referencia);
  } catch {
    // Já paga, já expirada ou inexistente: não interessa.
  }
}

/**
 * Verifica a assinatura e traduz o evento:
 * { reservaId?, paymentIntent?, referencia, estado, extra } | { ignorar: true }.
 */
async function tratarWebhook(request) {
  const segredo = process.env.STRIPE_WEBHOOK_SECRET;
  if (!segredo) return null;
  const corpo = await request.text();
  const ev = await stripe().webhooks.constructEventAsync(corpo, request.headers.get("stripe-signature") || "", segredo);
  const o = ev.data.object;
  const daSessao = (estado, extra = {}) => ({
    reservaId: o.metadata?.reservaId || o.client_reference_id,
    referencia: o.id,
    estado,
    extra: { paymentIntent: o.payment_intent || null, ...extra },
  });
  switch (ev.type) {
    case "checkout.session.completed":
      // Multibanco e outros métodos "assíncronos" ficam pendentes até chegar o dinheiro.
      return o.payment_status === "paid" ? daSessao("pago", { valorPago: o.amount_total / 100 }) : daSessao("pendente");
    case "checkout.session.async_payment_succeeded":
      return daSessao("pago", { valorPago: o.amount_total / 100 });
    case "checkout.session.async_payment_failed":
      return daSessao("falhado");
    case "checkout.session.expired":
      return daSessao("nao_iniciado");
    case "charge.refunded": {
      const total = o.amount_refunded >= o.amount;
      return {
        paymentIntent: o.payment_intent,
        estado: total ? "reembolsado" : "pago",
        extra: { reembolsado: o.amount_refunded / 100 },
      };
    }
    default:
      return { ignorar: true };
  }
}

const disponivel = () => !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);

export default { nome: "stripe", disponivel, criarCheckout, expirarCheckout, tratarWebhook };

// ───────── Connect (proprietários) ─────────

/**
 * Cria a conta Express do proprietário. Só recebe transferências da Meridie
 * (acordo "recipient" — fora dos EUA é o que permite pedir só "transfers");
 * não cobra nada diretamente. Devolve o id.
 */
export async function criarContaProprietario({ email, pais = "PT" }) {
  const a = await stripe().accounts.create({
    type: "express",
    country: pais,
    email,
    capabilities: { transfers: { requested: true } },
    tos_acceptance: { service_agreement: "recipient" },
  });
  return a.id;
}

/** Link para o proprietário preencher os dados (identidade, IBAN) no Stripe. */
export async function linkDadosProprietario(conta, { retorno, refazer }) {
  const l = await stripe().accountLinks.create({ account: conta, type: "account_onboarding", return_url: retorno, refresh_url: refazer });
  return l.url;
}

/** Estado da conta do proprietário: pode receber transferências? */
export async function estadoContaProprietario(conta) {
  const a = await stripe().accounts.retrieve(conta);
  return {
    ativa: a.capabilities?.transfers === "active" && !!a.payouts_enabled,
    dadosEnviados: !!a.details_submitted,
  };
}

/** Link para o painel Express do proprietário (ver transferências e alterar o IBAN). */
export async function linkPainelProprietario(conta) {
  return (await stripe().accounts.createLoginLink(conta)).url;
}

/**
 * Transfere ao proprietário a parte dele de uma reserva paga. Liga a
 * transferência ao pagamento (source_transaction): pode fazer-se mesmo antes
 * de o dinheiro do hóspede ficar disponível na conta da Meridie.
 */
export async function transferirProprietario({ conta, valor, moeda, reservaId, paymentIntent }) {
  const pi = await stripe().paymentIntents.retrieve(paymentIntent);
  const t = await stripe().transfers.create(
    {
      amount: cent(valor),
      currency: (moeda || "EUR").toLowerCase(),
      destination: conta,
      transfer_group: `reserva_${reservaId}`,
      source_transaction: typeof pi.latest_charge === "string" ? pi.latest_charge : pi.latest_charge?.id,
      metadata: { reservaId },
    },
    { idempotencyKey: `transferencia-${reservaId}` }
  );
  return t.id;
}

/** Reembolso total (sem `valor`) ou parcial. */
export async function reembolsar({ paymentIntent, valor, reservaId }) {
  const r = await stripe().refunds.create(
    { payment_intent: paymentIntent, ...(valor ? { amount: cent(valor) } : {}), metadata: { reservaId } },
    { idempotencyKey: `reembolso-${reservaId}-${valor ? cent(valor) : "total"}` }
  );
  return r.id;
}
