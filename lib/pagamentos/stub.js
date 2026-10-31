/**
 * Fornecedor de pagamentos "vazio": cumpre o contrato de lib/pagamentos mas
 * não cobra nada. Substituir por Stripe Connect (PT) e Mercado Pago (BR).
 */
const stub = {
  nome: "stub",
  disponivel: () => false,
  async criarCheckout() {
    throw new Error("Pagamento online ainda não disponível.");
  },
  async tratarWebhook() {
    return null;
  },
};

export default stub;
