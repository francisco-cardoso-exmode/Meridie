"use client";

import { useState } from "react";
import L from "@/components/L";
import { useT } from "@/components/LangProvider";
import { carrinho } from "@/lib/pedidoCarrinho";
import { quantidadeValida, MAX_QTD } from "@/lib/pedido";

/**
 * Quantidade + "Adicionar ao pedido" e "Pedir informação" (página do produto).
 * `item`: { tipo, slug, nome, imagem, precoTipo, preco, unidade, minimo, href }.
 */
export default function AdicionarAoPedido({ item, disponivel = true }) {
  const { t } = useT();
  const minimo = Math.max(1, Number(item.minimo) || 1);
  const [qtd, setQtd] = useState(minimo);
  const [feito, setFeito] = useState(false);

  function adicionar() {
    carrinho.juntar({ ...item, quantidade: quantidadeValida(qtd, minimo) });
    setFeito(true);
  }

  const info = `/pedido?item=${item.tipo}:${item.slug}${item.plano ? `:${item.plano}` : ""}&motivo=informacao`;
  return (
    <div className="rep-adicionar">
      {disponivel ? (
        <>
          <div className="qtd" role="group" aria-label={t("Quantidade")}>
            <button type="button" onClick={() => setQtd((q) => quantidadeValida(q - 1, minimo))} aria-label={t("Menos")} disabled={qtd <= minimo}>
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={minimo}
              max={MAX_QTD}
              value={qtd}
              onChange={(e) => setQtd(e.target.value === "" ? "" : Number(e.target.value))}
              onBlur={() => setQtd((q) => quantidadeValida(q, minimo))}
              aria-label={t("Quantidade")}
            />
            <button type="button" onClick={() => setQtd((q) => quantidadeValida(q + 1, minimo))} aria-label={t("Mais")}>
              +
            </button>
          </div>
          <button type="button" className="btn btn-primary" onClick={adicionar}>
            {t("Adicionar ao pedido")}
          </button>
        </>
      ) : (
        <p className="rep-indisponivel-txt">{t("Indisponível de momento — pede-nos informação sobre a próxima disponibilidade.")}</p>
      )}
      <L href={info} className="btn btn-ghost-escuro">
        {t("Pedir informação")}
      </L>
      {feito && (
        <p className="form-msg ok rep-adicionado" role="status">
          {t("Adicionado ao pedido.")} <L href="/pedido">{t("Ver o pedido →")}</L>
        </p>
      )}
    </div>
  );
}
