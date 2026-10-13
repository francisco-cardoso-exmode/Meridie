"use client";

import { useCompare } from "@/components/compare/CompareProvider";
import { useT } from "@/components/LangProvider";


export default function CompareBar() {
  const { itens, remover, limpar } = useCompare();
  const { t, href } = useT();
  if (!itens.length) return null;

  const dois = itens.length === 2;
  const mesma = dois && itens[0].zk === itens[1].zk;

  function comparar() {
    if (!mesma) return;
    window.location.href = href(
      `/comparar?a=${encodeURIComponent(itens[0].slug)}&b=${encodeURIComponent(itens[1].slug)}`
    );
  }

  return (
    <div className="compare-bar" role="region" aria-label={t("Comparador")}>
      <div className="cb-inner">
        <div className="cb-itens">
          {itens.map((it, i) => (
            <span className="cb-chip" key={it.slug}>
              {it.imagem && <img src={it.imagem} alt="" />}
              <span className="cb-chip-txt">
                <strong>{it.nome}</strong>
                <small>{[it.cidade, it.zona].filter(Boolean).join(" · ")}</small>
              </span>
              <button
                type="button"
                className="cb-x"
                aria-label={t("Remover")}
                onClick={() => remover(it.slug)}
              >
                ×
              </button>
              {i === 0 && dois && <span className="cb-eq" aria-hidden>=</span>}
            </span>
          ))}
          {itens.length === 1 && (
            <span className="cb-hint">{t("Escolhe um segundo do mesmo país…")}</span>
          )}
          {dois && !mesma && (
            <span className="cb-hint cb-hint-warn">
              {t("Só dá para comparar dois empreendimentos do mesmo país.")}
            </span>
          )}
        </div>
        <div className="cb-acoes">
          <button type="button" className="cb-limpar" onClick={limpar}>
            {t("Limpar")}
          </button>
          <button
            type="button"
            className="btn btn-primary cb-comparar"
            disabled={!mesma}
            onClick={comparar}
          >
            {t("Comparar")}
          </button>
        </div>
      </div>
    </div>
  );
}
