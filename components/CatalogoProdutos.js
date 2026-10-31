"use client";

import { useEffect, useMemo, useState } from "react";
import ProdutoCard from "@/components/ProdutoCard";
import { useT } from "@/components/LangProvider";
import { filtrarProdutos, ordenarProdutos } from "@/lib/catalogo";

/**
 * Catálogo de uma categoria: subcategorias em "chips" e filtros por marca,
 * disponibilidade, preço e pesquisa. A subcategoria escolhida fica no URL
 * (?sub=…) para se poder partilhar a ligação.
 */
export default function CatalogoProdutos({ produtos, subcategorias = [], marcas = [] }) {
  const { t, tf } = useT();
  const [f, setF] = useState({ sub: "", marca: "", disp: "", preco: "", q: "", ordem: "" });

  // Subcategoria inicial vinda do URL (?sub=vinho).
  useEffect(() => {
    const sub = new URLSearchParams(window.location.search).get("sub") || "";
    if (sub && subcategorias.some((s) => s.slug === sub)) setF((x) => ({ ...x, sub }));
  }, [subcategorias]);

  function escolheSub(sub) {
    setF((x) => ({ ...x, sub }));
    const url = new URL(window.location.href);
    if (sub) url.searchParams.set("sub", sub);
    else url.searchParams.delete("sub");
    window.history.replaceState(null, "", url);
  }

  const lista = useMemo(() => ordenarProdutos(filtrarProdutos(produtos, f), f.ordem), [produtos, f]);
  const contagem = useMemo(() => {
    const m = new Map();
    for (const p of produtos) m.set(p.subcategoria, (m.get(p.subcategoria) || 0) + 1);
    return m;
  }, [produtos]);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const temFiltros = f.marca || f.disp || f.preco || f.q || f.ordem;

  return (
    <div className="rep-catalogo">
      {subcategorias.length > 0 && (
        <div className="rep-chips" role="group" aria-label={t("Subcategorias")}>
          <button type="button" className={!f.sub ? "on" : undefined} aria-pressed={!f.sub} onClick={() => escolheSub("")}>
            {t("Todos")} <span>{produtos.length}</span>
          </button>
          {subcategorias
            .filter((s) => contagem.get(s.slug))
            .map((s) => (
              <button
                type="button"
                key={s.slug}
                className={f.sub === s.slug ? "on" : undefined}
                aria-pressed={f.sub === s.slug}
                onClick={() => escolheSub(s.slug)}
              >
                {s.nome} <span>{contagem.get(s.slug)}</span>
              </button>
            ))}
        </div>
      )}

      <div className="rep-filtros">
        <input
          type="search"
          value={f.q}
          onChange={set("q")}
          placeholder={t("Pesquisar por nome, referência ou marca…")}
          aria-label={t("Pesquisar")}
        />
        {marcas.length > 1 && (
          <select value={f.marca} onChange={set("marca")} aria-label={t("Marca")}>
            <option value="">{t("Todas as marcas")}</option>
            {marcas.map((m) => (
              <option key={m.slug} value={m.slug}>{m.nome}</option>
            ))}
          </select>
        )}
        <select value={f.disp} onChange={set("disp")} aria-label={t("Disponibilidade")}>
          <option value="">{t("Disponíveis e indisponíveis")}</option>
          <option value="disponivel">{t("Só disponíveis")}</option>
        </select>
        <select value={f.preco} onChange={set("preco")} aria-label={t("Preço")}>
          <option value="">{t("Com preço e sob consulta")}</option>
          <option value="valor">{t("Com preço")}</option>
          <option value="consulta">{t("Preço sob consulta")}</option>
        </select>
        <select value={f.ordem} onChange={set("ordem")} aria-label={t("Ordenar")}>
          <option value="">{t("Ordenar: destaques")}</option>
          <option value="nome">{t("Ordenar: nome")}</option>
          <option value="preco">{t("Ordenar: preço (mais baixo)")}</option>
          <option value="preco-desc">{t("Ordenar: preço (mais alto)")}</option>
        </select>
        {temFiltros && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setF((x) => ({ ...x, marca: "", disp: "", preco: "", q: "", ordem: "" }))}
          >
            {t("Limpar filtros")}
          </button>
        )}
      </div>

      <p className="rep-contagem" aria-live="polite">
        {lista.length === 1 ? t("1 produto") : tf("{n} produtos", { n: lista.length })}
      </p>
      {lista.length ? (
        <div className="produto-grid">
          {lista.map((p) => (
            <ProdutoCard key={p.slug} p={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>{t("Nenhum produto corresponde aos filtros escolhidos.")}</p>
        </div>
      )}
    </div>
  );
}
