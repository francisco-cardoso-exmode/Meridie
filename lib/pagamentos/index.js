import { PAISES, PAIS_PADRAO, ORIGENS_OTA } from "@/lib/al/regras";
import stub from "@/lib/pagamentos/stub";

/**
 * Pagamentos das reservas do Alojamento Local — ponto de ligação
 * independente do fornecedor. Ainda NÃO há cobrança online: todos os
 * fornecedores apontam para o stub, que não cobra nada.
 *
 * Fornecedor por país (lib/al/regras.js → PAISES):
 *   PT → "stripe"      (Stripe Connect: split proprietário / Meridie)
 *   BR → "mercadopago" (Mercado Pago com split / marketplace)
 *
 * Na reserva fica `pagamento: { fornecedor, estado, referencia }`:
 *   estado: "nao_iniciado" | "pendente" | "pago" | "falhado" | "reembolsado" | "externo"
 *   ("externo" = reserva paga na OTA — Airbnb/Booking — não passa por nós).
 *
 * Contrato de cada fornecedor (ver ./stub.js):
 *   criarCheckout({ reserva, urlSucesso, urlCancelar }) → { url, referencia }
 *   tratarWebhook(request) → { referencia, estado } | null
 *       (verifica a assinatura do fornecedor; null = evento ignorado)
 *   disponivel() → boolean
 * Para ligar um fornecedor real: criar lib/pagamentos/stripe.js (ou
 * mercadopago.js) com este contrato e registá-lo em FORNECEDORES.
 */

export const FORNECEDORES = {
  stripe: stub,
  mercadopago: stub,
};

/** Nome do fornecedor de pagamentos para um país ("PT" | "BR"). */
export function fornecedorDoPais(pais) {
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

/** Pagamento online disponível para este país? (false enquanto só houver o stub). */
export const pagamentoDisponivel = (pais) => implementacao(fornecedorDoPais(pais)).disponivel();

/** Cria a sessão de pagamento de uma reserva confirmada. */
export async function criarCheckout(reserva, opcoes = {}) {
  return implementacao(reserva?.pagamento?.fornecedor || fornecedorDoPais(reserva?.pais)).criarCheckout({ reserva, ...opcoes });
}

/** Trata o webhook de um fornecedor; devolve { referencia, estado } ou null. */
export async function tratarWebhook(fornecedor, request) {
  if (!FORNECEDORES[fornecedor]) return null;
  return implementacao(fornecedor).tratarWebhook(request);
}
