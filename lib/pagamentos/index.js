import { PAISES, PAIS_PADRAO, ORIGENS_OTA } from "@/lib/al/regras";
import stub from "@/lib/pagamentos/stub";
import stripe from "@/lib/pagamentos/stripe";

/**
 * Pagamentos das reservas do Alojamento Local — ponto de ligação
 * independente do fornecedor.
 *
 * Fornecedor por país (lib/al/regras.js → PAISES):
 *   PT → "stripe"      (lib/pagamentos/stripe.js: conta da Meridie + Connect)
 *   BR → "mercadopago" (ainda o stub — falta CNPJ e conta). Com
 *        PAGAMENTOS_BR=stripe, as casas do Brasil também cobram pelo Stripe
 *        português (cartões internacionais; sem Pix nem parcelas).
 * Sem STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET o Stripe fica indisponível e
 * as reservas continuam a funcionar sem pagamento online.
 *
 * Na reserva fica `pagamento: { fornecedor, estado, referencia }`:
 *   estado: "nao_iniciado" | "pendente" | "pago" | "falhado" | "reembolsado" | "externo"
 *   ("externo" = reserva paga na OTA — Airbnb/Booking — não passa por nós).
 *
 * Contrato de cada fornecedor (ver ./stub.js):
 *   criarCheckout({ reserva, urlSucesso, urlCancelar }) → { url, referencia }
 *   tratarWebhook(request) → { reservaId?, paymentIntent?, referencia?, estado, extra? }
 *       | { ignorar: true } (evento que não interessa) | null (fornecedor por configurar)
 *       (verifica a assinatura do fornecedor)
 *   expirarCheckout(referencia) (opcional) → fecha uma sessão antiga
 *   disponivel() → boolean
 * Para ligar um fornecedor real: criar lib/pagamentos/stripe.js (ou
 * mercadopago.js) com este contrato e registá-lo em FORNECEDORES.
 */

export const FORNECEDORES = {
  stripe,
  mercadopago: stub,
};

/** Nome do fornecedor de pagamentos para um país ("PT" | "BR"). */
export function fornecedorDoPais(pais) {
  if (pais === "BR" && process.env.PAGAMENTOS_BR === "stripe") return "stripe";
  return (PAISES[pais] || PAISES[PAIS_PADRAO]).pagamentos;
}

/** Objeto `pagamento` inicial de uma reserva nova. */
export function pagamentoInicial(casa, origem) {
  return {
    fornecedor: fornecedorDoPais(casa?.pais),
    estado: ORIGENS_OTA.includes(origem) ? "externo" : "nao_iniciado",
    referencia: null,
  };
}

const implementacao = (nome) => FORNECEDORES[nome] || stub;

/** Pagamento online disponível para este país? */
export const pagamentoDisponivel = (pais) => implementacao(fornecedorDoPais(pais)).disponivel();

/**
 * Cria a sessão de pagamento de uma reserva confirmada (fornecedor atual do
 * país — uma reserva feita antes de o Stripe estar ligado também paga).
 * Fecha a sessão anterior, se houver. Devolve { url, referencia, fornecedor }.
 */
export async function criarCheckout(reserva, opcoes = {}) {
  const nome = fornecedorDoPais(reserva?.pais);
  const f = implementacao(nome);
  const anterior = reserva?.pagamento?.referencia;
  if (anterior && reserva.pagamento.fornecedor === nome) await f.expirarCheckout?.(anterior);
  return { ...(await f.criarCheckout({ reserva, ...opcoes })), fornecedor: nome };
}

/** Trata o webhook de um fornecedor (ver o contrato acima). */
export async function tratarWebhook(fornecedor, request) {
  if (!FORNECEDORES[fornecedor]) return null;
  return implementacao(fornecedor).tratarWebhook(request);
}
