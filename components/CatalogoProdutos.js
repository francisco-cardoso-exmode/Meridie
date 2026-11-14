"use client";

import { useEffect, useMemo, useState } from "react";
import ProdutoCard from "@/components/ProdutoCard";
import { useT } from "@/components/LangProvider";
import { filtrarProdutos, ordenarProdutos } from "@/lib/catalogo";

/**
 * Catálogo de uma categoria: subcategorias em "chips", características da
 * categoria e da subcategoria escolhida (Tipo, Região…) também em chips, e
 * filtros por marca, disponibilidade, preço e pesquisa. A subcategoria e as
 * características escolhidas ficam no URL (?sub=vinho&tipo=tinto&regiao=douro)
 * para se poder partilhar a ligação.
 * Na página da marca (vários catálogos na mesma página): `sincronizarUrl`
 * false (não lê nem escreve o URL) e `soChips` (sem a barra de pesquisa,
 * disponibilidade, preço e ordem).
 */
export default function CatalogoProdutos({
  produtos,
  subcategorias = [],
  caracteristicas = [],
  marcas = [],
  sincronizarUrl = true,
  soChips = false,
}) {
  const { t, tf } = useT();
  const [f, setF] = useState({ sub: "", marca: "", disp: "", preco: "", q: "", ordem: "", attrs: {} });

  // Se todos os produtos são da mesma subcategoria (ex.: uma marca só de
  // vinhos), as características dela aparecem logo, sem a escolher.
  const subUnica = useMemo(() => {
    const subs = new Set(produtos.map((p) => p.subcategoria || ""));
    const [so] = subs;
    return subs.size === 1 && so ? so : "";
  }, [produtos]);
  // Características visíveis: as da categoria e as da subcategoria escolhida (ou única).
  const caracsDe = (sub) => [
    ...caracteristicas,
    ...(subcategorias.find((s) => s.slug === (sub || subUnica))?.caracteristicas || []),
  ];
  const caracs = caracsDe(f.sub);

  // Escolhas iniciais vindas do URL (?sub=vinho&tipo=tinto).
  useEffect(() => {
    if (!sincronizarUrl) return;
    const q = new URLSearchParams(window.location.search);
    const sub = subcategorias.some((s) => s.slug === q.get("sub")) ? q.get("sub") : "";
    const attrs = {};
    for (const c of caracsDe(sub)) {
      const v = q.get(c.id);
      if (v && c.opcoes.some((o) => o.id === v)) attrs[c.id] = v;
    }
    if (sub || Object.keys(attrs).length) setF((x) => ({ ...x, sub, attrs }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subcategorias, caracteristicas]);

  function poeNoUrl(sub, attrs) {
    if (!sincronizarUrl) return;
    const url = new URL(window.location.href);
    if (sub) url.searchParams.set("sub", sub);
    else url.searchParams.delete("sub");
    for (const c of [...caracteristicas, ...subcategorias.flatMap((s) => s.caracteristicas || [])])
      url.searchParams.delete(c.id);
    for (const [k, v] of Object.entries(attrs)) if (v) url.searchParams.set(k, v);
    window.history.replaceState(null, "", url);
  }

  function escolheSub(sub) {
    // Ao mudar de subcategoria ficam só as escolhas das características que continuam visíveis.
    const visiveis = new Set(caracsDe(sub).map((c) => c.id));
    const attrs = Object.fromEntries(Object.entries(f.attrs).filter(([k]) => visiveis.has(k)));
    setF((x) => ({ ...x, sub, attrs }));
    poeNoUrl(sub, attrs);
  }

  function escolheAttr(id, valor) {
    const attrs = { ...f.attrs, [id]: valor };
    if (!valor) delete attrs[id];
    setF((x) => ({ ...x, attrs }));
    poeNoUrl(f.sub, attrs);
  }

  const lista = useMemo(() => ordenarProdutos(filtrarProdutos(produtos, f), f.ordem), [produtos, f]);
  // Contagem de cada opção com os outros filtros aplicados (menos o da própria característica).
  const contagemAttrs = useMemo(() => {
    const out = {};
    for (const c of caracs) {
      const { [c.id]: _, ...outros } = f.attrs;
      const m = new Map();
      for (const p of filtrarProdutos(produtos, { ...f, attrs: outros })) {
        const v = p.atributos?.[c.id];
        if (v) m.set(v, (m.get(v) || 0) + 1);
      }
      out[c.id] = m;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produtos, f, caracteristicas, subcategorias]);
  // Contagem por subcategoria com os outros filtros aplicados (marca, pesquisa…);
  // as características só contam quando valem para todas (as da categoria).
  const comOutros = useMemo(() => {
    const daCategoria = new Set(caracsDe("").map((c) => c.id));
    const attrs = Object.fromEntries(Object.entries(f.attrs).filter(([k]) => daCategoria.has(k)));
    return filtrarProdutos(produtos, { ...f, sub: "", attrs });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produtos, f, caracteristicas, subUnica]);
  const contagem = useMemo(() => {
    const m = new Map();
    for (const p of comOutros) m.set(p.subcategoria, (m.get(p.subcategoria) || 0) + 1);
    return m;
  }, [comOutros]);
  // Marcas com produtos nos outros filtros escolhidos (subcategoria, Tipo…), com contagem.
  const marcasVisiveis = useMemo(() => {
    const conta = new Map();
    for (const p of filtrarProdutos(produtos, { ...f, marca: "" })) conta.set(p.marca, (conta.get(p.marca) || 0) + 1);
    return marcas
      .filter((m) => conta.get(m.slug) || f.marca === m.slug)
      .map((m) => ({ ...m, n: conta.get(m.slug) || 0 }));
  }, [produtos, marcas, f]);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const temFiltros = f.marca || f.disp || f.preco || f.q || f.ordem || Object.keys(f.attrs).length > 0;

  return (
    <div className="rep-catalogo">
      {(f.sub || subcategorias.filter((x) => contagem.get(x.slug)).length > 1) && (
        <div className="rep-chips" role="group" aria-label={t("Subcategorias")}>
          <button type="button" className={!f.sub ? "on" : undefined} aria-pressed={!f.sub} onClick={() => escolheSub("")}>
            {t("Todos")} <span>{comOutros.length}</span>
          </button>
          {subcategorias
            .filter((s) => contagem.get(s.slug) || f.sub === s.slug)
            .map((s) => (
              <button
                type="button"
                key={s.slug}
                className={f.sub === s.slug ? "on" : undefined}
                aria-pressed={f.sub === s.slug}
                onClick={() => escolheSub(s.slug)}
              >
                {s.nome} <span>{contagem.get(s.slug) || 0}</span>
              </button>
            ))}
        </div>
      )}

      {caracs.map((c) => {
        const conta = contagemAttrs[c.id] || new Map();
        const opcoes = c.opcoes.filter((o) => conta.get(o.id) || f.attrs[c.id] === o.id);
        if (!opcoes.length) return null;
        return (
          <div key={c.id} className="rep-chips rep-chips-carac" role="group" aria-label={c.nome}>
            <span className="rep-chips-rotulo">{c.nome}:</span>
            <button
              type="button"
              className={!f.attrs[c.id] ? "on" : undefined}
              aria-pressed={!f.attrs[c.id]}
              onClick={() => escolheAttr(c.id, "")}
            >
              {t("Todos")}
            </button>
            {opcoes.map((o) => (
              <button
                type="button"
                key={o.id}
                className={f.attrs[c.id] === o.id ? "on" : undefined}
                aria-pressed={f.attrs[c.id] === o.id}
                onClick={() => escolheAttr(c.id, f.attrs[c.id] === o.id ? "" : o.id)}
              >
                {o.nome} <span>{conta.get(o.id) || 0}</span>
              </button>
            ))}
          </div>
        );
      })}

      {!soChips && <div className="rep-filtros">
        <input
          type="search"
          value={f.q}
          onChange={set("q")}
          placeholder={t("Pesquisar por nome, referência ou marca…")}
          aria-label={t("Pesquisar")}
        />
        {(marcasVisiveis.length > 1 || f.marca) && (
          <select value={f.marca} onChange={set("marca")} aria-label={t("Marca")}>
            <option value="">{t("Todas as marcas")}</option>
            {marcasVisiveis.map((m) => (
              <option key={m.slug} value={m.slug}>{m.nome} ({m.n})</option>
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
            onClick={() => {
              setF((x) => ({ ...x, marca: "", disp: "", preco: "", q: "", ordem: "", attrs: {} }));
              poeNoUrl(f.sub, {});
            }}
          >
            {t("Limpar filtros")}
          </button>
        )}
      </div>}

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
