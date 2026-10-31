"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Lista com pesquisa, filtros e ordenação (no browser), sincronizada com o URL
 * (replaceState: q, f_<faceta>, ordem). As linhas vêm já desenhadas do servidor.
 *
 * Props:
 *  - itens: [{ id, busca: "texto em minúsculas", facetas: { k: v }, ordem: { k: valor }, node }]
 *  - facetas: [{ k, label, opcoes: [{ v, label }] }]
 *  - ordens: [{ k, label, desc?: bool }]
 *  - ordemPadrao: k de uma das ordens
 *  - placeholder
 *
 * (Versão provisória do ramo do Alojamento Local — o coordenador reconcilia
 * com a de main, que tem a mesma API.)
 */
const norm = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export default function ListaFiltravel({ itens = [], facetas = [], ordens = [], ordemPadrao, placeholder = "Pesquisar…" }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState({});
  const [ordem, setOrdem] = useState(ordemPadrao || ordens[0]?.k || "");

  // Estado inicial a partir do URL.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ(p.get("q") || "");
    const ini = {};
    for (const fc of facetas) if (p.get(`f_${fc.k}`)) ini[fc.k] = p.get(`f_${fc.k}`);
    setF(ini);
    if (p.get("ordem") && ordens.some((o) => o.k === p.get("ordem"))) setOrdem(p.get("ordem"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    q ? p.set("q", q) : p.delete("q");
    for (const fc of facetas) (f[fc.k] ? p.set(`f_${fc.k}`, f[fc.k]) : p.delete(`f_${fc.k}`));
    ordem && ordem !== (ordemPadrao || ordens[0]?.k) ? p.set("ordem", ordem) : p.delete("ordem");
    const s = p.toString();
    window.history.replaceState(null, "", window.location.pathname + (s ? `?${s}` : ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, f, ordem]);

  const visiveis = useMemo(() => {
    const termos = norm(q).split(/\s+/).filter(Boolean);
    const o = ordens.find((x) => x.k === ordem);
    const l = itens.filter(
      (it) =>
        termos.every((t) => norm(it.busca).includes(t)) &&
        Object.entries(f).every(([k, v]) => !v || String(it.facetas?.[k] ?? "") === v)
    );
    if (o)
      l.sort((a, b) => {
        const x = a.ordem?.[o.k];
        const y = b.ordem?.[o.k];
        const c = x == null ? 1 : y == null ? -1 : typeof x === "string" ? x.localeCompare(y, "pt") : x - y;
        return o.desc ? -c : c;
      });
    return l;
  }, [itens, q, f, ordem, ordens]);

  return (
    <div className="lista-filtravel">
      <div className="lf-barra">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
        {facetas.map((fc) => (
          <select key={fc.k} value={f[fc.k] || ""} onChange={(e) => setF((x) => ({ ...x, [fc.k]: e.target.value }))} aria-label={fc.label}>
            <option value="">{fc.label}: todos</option>
            {fc.opcoes.map((o) => (
              <option key={o.v} value={o.v}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
        {ordens.length > 1 && (
          <select value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar">
            {ordens.map((o) => (
              <option key={o.k} value={o.k}>
                {o.label}
              </option>
            ))}
          </select>
        )}
        <span className="lf-contagem">
          {visiveis.length} de {itens.length}
        </span>
      </div>
      <div className="admin-list">
        {visiveis.map((it) => (
          <div key={it.id}>{it.node}</div>
        ))}
      </div>
    </div>
  );
}
