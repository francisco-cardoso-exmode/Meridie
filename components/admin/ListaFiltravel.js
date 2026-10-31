"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Lista do backoffice com pesquisa, filtros e ordenação (estado no URL).
 *
 * - itens: [{ id, busca: "texto em minúsculas", facetas: { chave: valor },
 *   ordem: { chave: valorComparável }, node: <linha renderizada no servidor/> }]
 * - facetas: [{ k, label, opcoes: [{ v, label }] }]
 * - ordens: [{ k, label, desc?: bool }]  (desc = ordem decrescente)
 * - ordemPadrao: chave de `ordens` usada por defeito
 * - placeholder: texto da caixa de pesquisa
 */
const semAcentos = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

function compara(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (a instanceof Date || b instanceof Date) return new Date(a) - new Date(b);
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "pt", { numeric: true });
}

export default function ListaFiltravel({
  itens = [],
  facetas = [],
  ordens = [],
  ordemPadrao,
  placeholder = "Pesquisar…",
  vazio = "Nada corresponde à pesquisa.",
}) {
  const padrao = ordemPadrao || ordens[0]?.k || "";
  const [q, setQ] = useState("");
  const [f, setF] = useState({});
  const [ordem, setOrdem] = useState(padrao);

  // Estado inicial vindo do URL (?q=…&f_<faceta>=…&ordem=…).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ(p.get("q") || "");
    const fs = {};
    for (const fc of facetas) {
      const v = p.get(`f_${fc.k}`);
      if (v != null && fc.opcoes.some((o) => String(o.v) === v)) fs[fc.k] = v;
    }
    setF(fs);
    const o = p.get("ordem");
    if (o && ordens.some((x) => x.k === o)) setOrdem(o);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantém o URL igual ao estado (para partilhar / voltar atrás).
  useEffect(() => {
    const url = new URL(window.location.href);
    const p = url.searchParams;
    if (q) p.set("q", q);
    else p.delete("q");
    for (const fc of facetas) {
      if (f[fc.k]) p.set(`f_${fc.k}`, f[fc.k]);
      else p.delete(`f_${fc.k}`);
    }
    if (ordem && ordem !== padrao) p.set("ordem", ordem);
    else p.delete("ordem");
    window.history.replaceState(null, "", url);
  }, [q, f, ordem, facetas, padrao]);

  const lista = useMemo(() => {
    const termos = semAcentos(q).split(/\s+/).filter(Boolean);
    const filtrados = itens.filter((it) => {
      const alvo = semAcentos(it.busca);
      if (!termos.every((t) => alvo.includes(t))) return false;
      return Object.entries(f).every(([k, v]) => !v || String(it.facetas?.[k] ?? "") === v);
    });
    const def = ordens.find((o) => o.k === ordem);
    if (!def) return filtrados;
    return [...filtrados].sort((a, b) => {
      const r = compara(a.ordem?.[def.k], b.ordem?.[def.k]);
      return def.desc ? -r : r;
    });
  }, [itens, q, f, ordem, ordens]);

  const ativos = q || Object.values(f).some(Boolean) || ordem !== padrao;

  return (
    <div className="lista-filtravel">
      <div className="admin-filtros">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label="Pesquisar" />
        {facetas.map((fc) => (
          <select key={fc.k} value={f[fc.k] || ""} onChange={(e) => setF((x) => ({ ...x, [fc.k]: e.target.value }))} aria-label={fc.label}>
            <option value="">{fc.label}: todos</option>
            {fc.opcoes.map((o) => (
              <option key={String(o.v)} value={String(o.v)}>{o.label}</option>
            ))}
          </select>
        ))}
        {ordens.length > 1 && (
          <select value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar">
            {ordens.map((o) => (
              <option key={o.k} value={o.k}>Ordenar: {o.label}</option>
            ))}
          </select>
        )}
        {ativos && (
          <button type="button" className="btn-ghost" onClick={() => { setQ(""); setF({}); setOrdem(padrao); }}>
            Limpar
          </button>
        )}
        <span className="admin-row-sub" aria-live="polite">{lista.length} de {itens.length}</span>
      </div>
      <div className="admin-list">
        {lista.length ? lista.map((it) => <div key={it.id}>{it.node}</div>) : itens.length ? <div className="empty-state"><p>{vazio}</p></div> : null}
      </div>
    </div>
  );
}
