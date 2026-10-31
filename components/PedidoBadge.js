"use client";

import L from "@/components/L";
import { useT } from "@/components/LangProvider";
import { useCarrinho } from "@/lib/pedidoCarrinho";

// Atalho para o pedido em curso, no menu — só aparece com itens no pedido.
export default function PedidoBadge({ onClick }) {
  const { t, tf } = useT();
  const itens = useCarrinho();
  if (!itens.length) return null;
  return (
    <L
      href="/pedido"
      className="pedido-badge"
      onClick={onClick}
      aria-label={tf("O meu pedido ({n} artigos)", { n: itens.length })}
    >
      {t("Pedido")} <span className="pedido-badge-n">{itens.length}</span>
    </L>
  );
}
